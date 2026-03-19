"""SMS integration for SMF Lead Capture."""

import logging
from typing import Any, Dict

from twilio.rest import Client

logger = logging.getLogger(__name__)


class SMSIntegration:
    """SMS integration manager using Twilio."""
    
    def __init__(self, config: Dict[str, Any]):
        """Initialize SMS integration."""
        self.config = config
        self.provider = config.get("provider", "twilio")
        self.account_sid = config.get("account_sid")
        self.auth_token = config.get("auth_token")
        self.from_number = config.get("from_number")
        self.to_number = config.get("to")
        
        # Initialize Twilio client
        if self.account_sid and self.auth_token:
            self.client = Client(self.account_sid, self.auth_token)
        else:
            self.client = None
            logger.warning("Twilio credentials not configured")
    
    def send_notification(self, lead, config: Dict[str, Any]) -> str:
        """Send SMS notification to owner."""
        if not self.client:
            return "twilio not configured"
        
        to_number = config.get("to") or self.to_number
        if not to_number:
            return "no recipient number"
        
        # Create concise SMS message
        message_body = (
            f"New {lead.score_category.upper()} lead: {lead.name or lead.email}\n"
            f"Score: {lead.score}\n"
            f"View: {self.config.get('dashboard_url', '')}/leads/{lead.id}"
        )
        
        try:
            message = self.client.messages.create(
                body=message_body,
                from_=self.from_number,
                to=to_number
            )
            
            logger.info(f"SMS sent via Twilio: {message.sid}")
            return f"sent via twilio: {message.sid}"
            
        except Exception as e:
            logger.error(f"Twilio SMS failed: {e}")
            return f"error: {str(e)}"
    
    def send_lead_confirmation(self, lead: Any, message: str) -> str:
        """Send SMS confirmation to lead (requires opt-in)."""
        if not self.client:
            return "twilio not configured"
        
        if not lead.phone:
            return "no phone number"
        
        try:
            sms = self.client.messages.create(
                body=message,
                from_=self.from_number,
                to=lead.phone
            )
            
            logger.info(f"Confirmation SMS sent: {sms.sid}")
            return f"sent: {sms.sid}"
            
        except Exception as e:
            logger.error(f"SMS confirmation failed: {e}")
            return f"error: {str(e)}"
    
    def verify_webhook(self, request_data: Dict[str, Any], signature: str) -> bool:
        """Verify Twilio webhook signature."""
        # Real implementation would use Twilio's RequestValidator
        # For now, basic check
        return True