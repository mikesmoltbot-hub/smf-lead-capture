"""Database models and operations for SMF Lead Capture."""

import json
import logging
from datetime import datetime
from typing import Any, Dict, List, Optional
from uuid import uuid4

from sqlalchemy import (
    JSON, Column, DateTime, ForeignKey, Integer, String, Text, create_engine
)
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import Session, relationship, sessionmaker

logger = logging.getLogger(__name__)
Base = declarative_base()


class LeadModel(Base):
    """Database model for leads."""
    __tablename__ = "leads"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid4()))
    name = Column(String(255))
    email = Column(String(255), nullable=False, index=True)
    phone = Column(String(50))
    message = Column(Text)
    source = Column(String(100), index=True)
    score = Column(Integer, default=0)
    score_category = Column(String(20), default="cold", index=True)
    status = Column(String(50), default="new", index=True)
    qualification_data = Column(JSON)
    metadata = Column(JSON)
    crm_id = Column(String(255))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    chat_sessions = relationship("ChatSessionModel", back_populates="lead")
    actions = relationship("ActionLogModel", back_populates="lead")
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary."""
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "phone": self.phone,
            "message": self.message,
            "source": self.source,
            "score": self.score,
            "score_category": self.score_category,
            "status": self.status,
            "qualification_data": self.qualification_data,
            "metadata": self.metadata,
            "crm_id": self.crm_id,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }


class ChatSessionModel(Base):
    """Database model for chat sessions."""
    __tablename__ = "chat_sessions"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid4()))
    lead_id = Column(String(36), ForeignKey("leads.id"), nullable=True)
    messages = Column(JSON, default=list)
    qualification_answers = Column(JSON, default=dict)
    current_question = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    last_activity = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    lead = relationship("LeadModel", back_populates="chat_sessions")
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary."""
        return {
            "id": self.id,
            "lead_id": self.lead_id,
            "messages": self.messages,
            "qualification_answers": self.qualification_answers,
            "current_question": self.current_question,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "last_activity": self.last_activity.isoformat() if self.last_activity else None
        }


class ActionLogModel(Base):
    """Database model for action execution log."""
    __tablename__ = "actions_log"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    lead_id = Column(String(36), ForeignKey("leads.id"), nullable=False, index=True)
    action_type = Column(String(100), nullable=False)
    action_config = Column(JSON)
    result = Column(Text)
    error = Column(Text)
    executed_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    lead = relationship("LeadModel", back_populates="actions")
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary."""
        return {
            "id": self.id,
            "lead_id": self.lead_id,
            "action_type": self.action_type,
            "action_config": self.action_config,
            "result": self.result,
            "error": self.error,
            "executed_at": self.executed_at.isoformat() if self.executed_at else None
        }


class Database:
    """Database manager for SMF Lead Capture."""
    
    def __init__(self, database_url: str):
        """Initialize database connection."""
        self.engine = create_engine(database_url)
        self.SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=self.engine)
        
        # Create tables
        Base.metadata.create_all(bind=self.engine)
        logger.info(f"Database initialized: {database_url}")
    
    def get_session(self) -> Session:
        """Get database session."""
        return self.SessionLocal()
    
    # Lead operations
    def create_lead(self, lead_data: Dict[str, Any]) -> LeadModel:
        """Create a new lead."""
        session = self.get_session()
        try:
            lead = LeadModel(**lead_data)
            session.add(lead)
            session.commit()
            session.refresh(lead)
            logger.info(f"Created lead: {lead.id}")
            return lead
        finally:
            session.close()
    
    def get_lead(self, lead_id: str) -> Optional[LeadModel]:
        """Get lead by ID."""
        session = self.get_session()
        try:
            return session.query(LeadModel).filter(LeadModel.id == lead_id).first()
        finally:
            session.close()
    
    def get_lead_by_email(self, email: str) -> Optional[LeadModel]:
        """Get lead by email."""
        session = self.get_session()
        try:
            return session.query(LeadModel).filter(LeadModel.email == email).first()
        finally:
            session.close()
    
    def update_lead(self, lead_id: str, updates: Dict[str, Any]) -> Optional[LeadModel]:
        """Update lead fields."""
        session = self.get_session()
        try:
            lead = session.query(LeadModel).filter(LeadModel.id == lead_id).first()
            if lead:
                for key, value in updates.items():
                    if hasattr(lead, key):
                        setattr(lead, key, value)
                lead.updated_at = datetime.utcnow()
                session.commit()
                session.refresh(lead)
                logger.info(f"Updated lead: {lead_id}")
            return lead
        finally:
            session.close()
    
    def list_leads(
        self,
        status: Optional[str] = None,
        source: Optional[str] = None,
        category: Optional[str] = None,
        from_date: Optional[datetime] = None,
        to_date: Optional[datetime] = None,
        limit: int = 20,
        offset: int = 0
    ) -> tuple:
        """List leads with filters."""
        session = self.get_session()
        try:
            query = session.query(LeadModel)
            
            if status:
                query = query.filter(LeadModel.status == status)
            if source:
                query = query.filter(LeadModel.source == source)
            if category:
                query = query.filter(LeadModel.score_category == category)
            if from_date:
                query = query.filter(LeadModel.created_at >= from_date)
            if to_date:
                query = query.filter(LeadModel.created_at <= to_date)
            
            # Get total count
            total = query.count()
            
            # Get paginated results
            leads = query.order_by(LeadModel.created_at.desc()).offset(offset).limit(limit).all()
            
            return leads, total
        finally:
            session.close()
    
    def delete_lead(self, lead_id: str) -> bool:
        """Delete lead by ID."""
        session = self.get_session()
        try:
            lead = session.query(LeadModel).filter(LeadModel.id == lead_id).first()
            if lead:
                session.delete(lead)
                session.commit()
                logger.info(f"Deleted lead: {lead_id}")
                return True
            return False
        finally:
            session.close()
    
    # Chat session operations
    def create_chat_session(self, session_data: Dict[str, Any]) -> ChatSessionModel:
        """Create a new chat session."""
        session = self.get_session()
        try:
            chat_session = ChatSessionModel(**session_data)
            session.add(chat_session)
            session.commit()
            session.refresh(chat_session)
            return chat_session
        finally:
            session.close()
    
    def get_chat_session(self, session_id: str) -> Optional[ChatSessionModel]:
        """Get chat session by ID."""
        session = self.get_session()
        try:
            return session.query(ChatSessionModel).filter(ChatSessionModel.id == session_id).first()
        finally:
            session.close()
    
    def update_chat_session(self, session_id: str, updates: Dict[str, Any]) -> Optional[ChatSessionModel]:
        """Update chat session."""
        session = self.get_session()
        try:
            chat_session = session.query(ChatSessionModel).filter(ChatSessionModel.id == session_id).first()
            if chat_session:
                for key, value in updates.items():
                    if hasattr(chat_session, key):
                        setattr(chat_session, key, value)
                chat_session.last_activity = datetime.utcnow()
                session.commit()
                session.refresh(chat_session)
            return chat_session
        finally:
            session.close()
    
    # Action log operations
    def log_action(
        self,
        lead_id: str,
        action_type: str,
        action_config: Dict[str, Any],
        result: Optional[str] = None,
        error: Optional[str] = None
    ) -> ActionLogModel:
        """Log an action execution."""
        session = self.get_session()
        try:
            log_entry = ActionLogModel(
                lead_id=lead_id,
                action_type=action_type,
                action_config=action_config,
                result=result,
                error=error
            )
            session.add(log_entry)
            session.commit()
            session.refresh(log_entry)
            return log_entry
        finally:
            session.close()
    
    def get_lead_actions(self, lead_id: str) -> List[ActionLogModel]:
        """Get action log for a lead."""
        session = self.get_session()
        try:
            return session.query(ActionLogModel).filter(
                ActionLogModel.lead_id == lead_id
            ).order_by(ActionLogModel.executed_at.desc()).all()
        finally:
            session.close()
    
    # Metrics
    def get_metrics(self, from_date: Optional[datetime] = None, to_date: Optional[datetime] = None) -> Dict[str, Any]:
        """Get lead capture metrics."""
        session = self.get_session()
        try:
            query = session.query(LeadModel)
            
            if from_date:
                query = query.filter(LeadModel.created_at >= from_date)
            if to_date:
                query = query.filter(LeadModel.created_at <= to_date)
            
            total = query.count()
            hot = query.filter(LeadModel.score_category == "hot").count()
            warm = query.filter(LeadModel.score_category == "warm").count()
            cold = query.filter(LeadModel.score_category == "cold").count()
            
            # Source breakdown
            sources = session.query(LeadModel.source, LeadModel.id).all()
            source_counts = {}
            for source, _ in sources:
                source_counts[source] = source_counts.get(source, 0) + 1
            
            return {
                "total_leads": total,
                "hot_leads": hot,
                "warm_leads": warm,
                "cold_leads": cold,
                "conversion_rate": (hot / total * 100) if total > 0 else 0,
                "by_source": source_counts
            }
        finally:
            session.close()
    
    def export_leads(self, format: str = "json") -> str:
        """Export all leads to file."""
        session = self.get_session()
        try:
            leads = session.query(LeadModel).all()
            
            if format == "json":
                data = [lead.to_dict() for lead in leads]
                return json.dumps(data, indent=2, default=str)
            elif format == "csv":
                import csv
                import io
                
                output = io.StringIO()
                if leads:
                    fieldnames = leads[0].to_dict().keys()
                    writer = csv.DictWriter(output, fieldnames=fieldnames)
                    writer.writeheader()
                    for lead in leads:
                        writer.writerow(lead.to_dict())
                return output.getvalue()
            else:
                raise ValueError(f"Unsupported format: {format}")
        finally:
            session.close()