"""
SMF Lead Capture - Production Lead Capture System

A complete lead capture and qualification system with:
- Database persistence (SQLite/PostgreSQL)
- Real API integrations (HubSpot, Twilio, SendGrid)
- Flask webhook server
- Embeddable chat widget
"""

__version__ = "1.0.0"
__author__ = "SMF Works"
__email__ = "michael@smfworks.com"

from .lead_capture import LeadCapture
from .database import Database
from .config import Config

__all__ = ["LeadCapture", "Database", "Config"]