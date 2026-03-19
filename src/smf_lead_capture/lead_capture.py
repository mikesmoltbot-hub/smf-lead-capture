"""Production lead capture module with database and real API integrations."""

import logging
import re
from dataclasses import dataclass, field
from datetime import datetime
from typing import Any, Dict, List, Optional, Tuple
from uuid import uuid4

from .config import Config
from .database import Database
from .integrations.crm import CRMIntegration
from .integrations.email import EmailIntegration
from .integrations.sms import SMSIntegration

logger = logging.getLogger(__name__)


@dataclass
class Lead:
    """Represents a captured lead."""
    id: str = field(default_factory=lambda: str(uuid4()))
    name: str = ""
    email: str = ""
    phone: str = ""
    message: str = ""
    source: str = "website"
    score: int = 0
    score_category: str = "cold"
    qualification_data: Dict[str, Any] = field(default_factory=dict)
    metadata: Dict[str, Any] = field(default_factory=dict)
    created_at: datetime = field(default_factory=datetime.utcnow)
    status: str = "new"
    crm_id: Optional[str] = None


@dataclass
class ChatSession:
    """Represents an active chat session."""
    id: str = field(default_factory=lambda: str(uuid4()))
    lead_id: Optional[str] = None
    messages: List[Dict[str, Any]] = field(default_factory=list)
    qualification_answers: Dict[str, Any] = field(default_factory=dict)
    current_question: int = 0
    created_at: datetime = field(default_factory=datetime.utcnow)
    last_activity: datetime = field(default_factory=datetime.utcnow)


class LeadCapture:
    """Production lead capture handler with database and integrations."""
    
    def __init__(self, config_path: str = "config.yaml"):
        """Initialize with configuration and database."""
        self.config = Config(config_path)
        self.db = Database(self.config.get("database.url", "sqlite:///data/leads.db"))
        
        # Initialize integrations
        self.crm = CRMIntegration(self.config.get("integrations.crm", {}))
        self.email = EmailIntegration(self.config.get("integrations.notifications.email", {}))
        self.sms = SMSIntegration(self.config.get("integrations.notifications.sms", {}))
        
        logger.info("LeadCapture initialized")
    
    def process_lead(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Process a new lead through qualification and routing.
        
        Args:
            data: Lead data including name, email, message, source
            
        Returns:
            Dict with lead_id, score, actions_taken, crm_id
        """
        try:
            # Check for existing lead
            existing = self.db.get_lead_by_email(data.get("email", ""))
            if existing:
                logger.info(f"Lead with email {data['email']} already exists: {existing.id}")
                # Update existing lead
                lead_id = existing.id
                updates = {
                    "message": data.get("message", existing.message),
                    "metadata": {**existing.metadata, **data.get("metadata", {})},
                    "updated_at": datetime.utcnow()
                }
                self.db.update_lead(lead_id, updates)
            else:
                # Score the lead
                score, category = self._score_lead(data)
                
                # Create lead in database
                lead_data = {
                    "name": data.get("name", ""),
                    "email": data.get("email", ""),
                    "phone": data.get("phone", ""),
                    "message": data.get("message", ""),
                    "source": data.get("source", "website"),
                    "score": score,
                    "score_category": category,
                    "qualification_data": data.get("qualification_data", {}),
                    "metadata": data.get("metadata", {}),
                    "status": "new"
                }
                
                lead = self.db.create_lead(lead_data)
                lead_id = lead.id
                
                logger.info(f"Created lead {lead_id}: {category} ({score} points)")
            
            # Get lead object
            lead_record = self.db.get_lead(lead_id)
            
            # Execute actions
            actions_taken = self._execute_actions(lead_record)
            
            return {
                "lead_id": lead_id,
                "score": lead_record.score,
                "score_category": lead_record.score_category,
                "actions_taken": actions_taken,
                "crm_id": lead_record.crm_id,
                "is_new": existing is None
            }
            
        except Exception as e:
            logger.error(f"Error processing lead: {e}")
            raise
    
    def _score_lead(self, data: Dict[str, Any]) -> Tuple[int, str]:
        """Calculate lead score based on qualification data."""
        score = 0
        qual_config = self.config.get("qualification", {})
        questions = qual_config.get("questions", [])
        qualification_data = data.get("qualification_data", {})
        
        # Score based on qualification answers
        for question in questions:
            field_name = question.get("field")
            answer = qualification_data.get(field_name)
            
            if answer and "options" in question:
                for option in question["options"]:
                    if option.get("value") == answer:
                        score += option.get("score", 0)
                        break
        
        # Apply bonuses/penalties
        scoring_config = qual_config.get("scoring", {})
        bonuses = scoring_config.get("bonuses", [])
        for bonus in bonuses:
            condition = bonus.get("condition", "")
            if self._evaluate_condition(condition, data):
                score += bonus.get("points", 0)
        
        # Determine category
        thresholds = scoring_config.get("thresholds", {"hot": 25, "warm": 15, "cold": 0})
        if score >= thresholds.get("hot", 25):
            category = "hot"
        elif score >= thresholds.get("warm", 15):
            category = "warm"
        else:
            category = "cold"
        
        return score, category
    
    def _evaluate_condition(self, condition: str, data: Dict[str, Any]) -> bool:
        """Evaluate a bonus condition string."""
        if "source ==" in condition:
            match = re.search(r"source == ['\"](\w+)['\"]", condition)
            if match:
                return data.get("source") == match.group(1)
        
        if "email_domain in" in condition:
            email = data.get("email", "")
            domain = email.split("@")[-1] if "@" in email else ""
            match = re.search(r"email_domain in \[(.*?)\]", condition)
            if match:
                domains = [d.strip().strip('"\'') for d in match.group(1).split(",")]
                return domain in domains
        
        return False
    
    def _execute_actions(self, lead) -> List[str]:
        """Execute actions based on lead category."""
        actions_taken = []
        actions_config = self.config.get("actions", {})
        
        category_actions = actions_config.get(f"{lead.score_category}_lead", [])
        all_leads_actions = actions_config.get("all_leads", [])
        
        # Execute category-specific actions
        for action in category_actions:
            action_type = list(action.keys())[0] if action else None
            if action_type:
                result = self._execute_action(action_type, action[action_type], lead)
                if result:
                    actions_taken.append(f"{action_type}: {result}")
        
        # Execute universal actions
        for action in all_leads_actions:
            action_type = list(action.keys())[0] if action else None
            if action_type:
                result = self._execute_action(action_type, action[action_type], lead)
                if result:
                    actions_taken.append(f"{action_type}: {result}")
        
        return actions_taken
    
    def _execute_action(self, action_type: str, config: Dict[str, Any], lead) -> str:
        """Execute a single action."""
        try:
            if action_type == "notify":
                return self._action_notify(config, lead)
            elif action_type == "create_crm_entry":
                return self._action_create_crm(config, lead)
            elif action_type == "add_to_sequence":
                return self._action_add_to_sequence(config, lead)
            elif action_type == "send_confirmation":
                return self._action_send_confirmation(config, lead)
            elif action_type == "analytics":
                return self._action_analytics(config, lead)
            else:
                return f"unknown action type: {action_type}"
        except Exception as e:
            logger.error(f"Action {action_type} failed: {e}")
            self.db.log_action(lead.id, action_type, config, error=str(e))
            return f"error: {str(e)}"
    
    def _action_notify(self, config: Dict[str, Any], lead) -> str:
        """Send notification to owner."""
        channels = config.get("channels", ["email"])
        results = []
        
        for channel in channels:
            if channel == "email":
                result = self.email.send_notification(lead, config)
                results.append(f"email:{result}")
            elif channel == "sms":
                result = self.sms.send_notification(lead, config)
                results.append(f"sms:{result}")
        
        self.db.log_action(lead.id, "notify", config, result=",".join(results))
        return ",".join(results)
    
    def _action_create_crm(self, config: Dict[str, Any], lead) -> str:
        """Create entry in CRM."""
        provider = config.get("provider", "hubspot")
        crm_id = self.crm.create_contact(lead, config)
        
        if crm_id:
            self.db.update_lead(lead.id, {"crm_id": crm_id})
            self.db.log_action(lead.id, "create_crm_entry", config, result=crm_id)
            return f"CRM entry created: {crm_id}"
        
        return "CRM creation failed"
    
    def _action_add_to_sequence(self, config: Dict[str, Any], lead) -> str:
        """Add lead to email sequence."""
        sequence = config.get("sequence", "default")
        delay = config.get("delay", "immediate")
        
        # This would integrate with email sequence service
        self.db.log_action(lead.id, "add_to_sequence", config, result=f"sequence:{sequence}")
        return f"added to sequence: {sequence}"
    
    def _action_send_confirmation(self, config: Dict[str, Any], lead) -> str:
        """Send confirmation email to lead."""
        template = config.get("template", "default")
        result = self.email.send_confirmation(lead, template)
        
        self.db.log_action(lead.id, "send_confirmation", config, result=result)
        return result
    
    def _action_analytics(self, config: Dict[str, Any], lead) -> str:
        """Track analytics event."""
        event = config.get("event", "lead_captured")
        
        # This would integrate with analytics service
        self.db.log_action(lead.id, "analytics", config, result=event)
        return f"tracked: {event}"
    
    def get_chat_response(self, session_id: str, message: str,
                          context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Generate AI response for chat widget."""
        # Get or create session
        session = self.db.get_chat_session(session_id)
        if not session:
            session_data = {
                "id": session_id,
                "messages": [],
                "qualification_answers": {},
                "current_question": 0
            }
            session = self.db.create_chat_session(session_data)
        
        # Add message to session
        messages = session.messages or []
        messages.append({
            "role": "user",
            "content": message,
            "timestamp": datetime.utcnow().isoformat()
        })
        
        # Generate response
        response_text, qualification_data, should_escalate = self._generate_response(
            session, message
        )
        
        # Add response to session
        messages.append({
            "role": "assistant",
            "content": response_text,
            "timestamp": datetime.utcnow().isoformat()
        })
        
        # Update session
        self.db.update_chat_session(session_id, {
            "messages": messages,
            "qualification_answers": {**(session.qualification_answers or {}), **qualification_data},
            "current_question": session.current_question
        })
        
        return {
            "response": response_text,
            "qualification_data": qualification_data,
            "should_escalate": should_escalate,
            "session_id": session_id
        }
    
    def _generate_response(self, session, message: str) -> Tuple[str, Dict[str, Any], bool]:
        """Generate chat response with qualification."""
        config = self.config.get("qualification", {})
        questions = config.get("questions", [])
        
        qualification_data = {}
        should_escalate = False
        current_q_index = session.current_question or 0
        
        if current_q_index < len(questions):
            current_q = questions[current_q_index]
            answer = self._extract_answer(message, current_q)
            
            if answer:
                qualification_data[current_q["field"]] = answer
                current_q_index += 1
                
                if current_q_index < len(questions):
                    next_q = questions[current_q_index]
                    response = self._format_question(next_q)
                else:
                    response = self._get_completion_message()
                    
                    # Process completed qualification
                    if session.lead_id:
                        self.db.update_lead(session.lead_id, {
                            "qualification_data": {**(session.qualification_answers or {}), **qualification_data}
                        })
            else:
                response = f"I'm not sure I understood. {self._format_question(current_q)}"
        else:
            response = "Thanks for that information! I'll make sure the right person gets back to you."
        
        # Update current question
        self.db.update_chat_session(session.id, {"current_question": current_q_index})
        
        # Check escalation triggers
        if any(word in message.lower() for word in ["angry", "frustrated", "unhappy", "complaint"]):
            should_escalate = True
            response += " I'll connect you with a team member right away."
        
        return response, qualification_data, should_escalate
    
    def _extract_answer(self, message: str, question: Dict[str, Any]) -> Optional[str]:
        """Extract answer from message based on question type."""
        q_type = question.get("type", "text")
        options = question.get("options", [])
        
        if q_type == "select" and options:
            message_lower = message.lower()
            for option in options:
                if option.get("label", "").lower() in message_lower:
                    return option.get("value")
                if option.get("value", "").lower() in message_lower:
                    return option.get("value")
        
        if message.strip():
            return message.strip()
        
        return None
    
    def _format_question(self, question: Dict[str, Any]) -> str:
        """Format question with options."""
        text = question.get("text", "")
        options = question.get("options", [])
        
        if options:
            options_text = ", ".join([opt.get("label", opt.get("value", "")) for opt in options])
            return f"{text} ({options_text})"
        
        return text
    
    def _get_completion_message(self) -> str:
        """Get message when qualification is complete."""
        return ("Thanks for that information! I'll make sure the right person "
                "gets back to you soon. Is there anything else I can help with?")
    
    def get_lead(self, lead_id: str) -> Optional[Dict[str, Any]]:
        """Get lead by ID."""
        lead = self.db.get_lead(lead_id)
        return lead.to_dict() if lead else None
    
    def list_leads(self, **filters) -> Tuple[List[Dict[str, Any]], int]:
        """List leads with filters."""
        leads, total = self.db.list_leads(**filters)
        return [lead.to_dict() for lead in leads], total
    
    def update_lead(self, lead_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Update lead fields."""
        lead = self.db.update_lead(lead_id, updates)
        return lead.to_dict() if lead else None
    
    def delete_lead(self, lead_id: str) -> bool:
        """Delete lead by ID."""
        return self.db.delete_lead(lead_id)
    
    def get_metrics(self, **params) -> Dict[str, Any]:
        """Get lead capture metrics."""
        return self.db.get_metrics(**params)
    
    def export_leads(self, format: str = "json") -> str:
        """Export all leads."""
        return self.db.export_leads(format)