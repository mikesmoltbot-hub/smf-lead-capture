"""Email integration for SMF Lead Capture."""

import logging
from typing import Any, Dict

import requests
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail

logger = logging.getLogger(__name__)


class EmailIntegration:
    """Email integration manager."""
    
    def __init__(self, config: Dict[str, Any]):
        """Initialize email integration."""
        self.config = config
        self.provider = config.get("provider", "sendgrid")
        self.from_email = config.get("from_email")
        self.from_name = config.get("from_name", "SMF Lead Capture")
        
        # Provider-specific setup
        if self.provider == "sendgrid":
            self.api_key = config.get("api_key")
            self.client = SendGridAPIClient(self.api_key) if self.api_key else None
        elif self.provider == "gmail":
            self.credentials = config.get("credentials")
        elif self.provider == "resend":
            self.api_key = config.get("api_key")
    
    def send_notification(self, lead, config: Dict[str, Any]) -> str:
        """Send lead notification to owner."""
        to_email = config.get("to") or self.config.get("to")
        template = config.get("template", "default")
        
        subject = f"New {lead.score_category.upper()} Lead: {lead.name or lead.email}"
        
        body = f"""
New lead captured!

Name: {lead.name or "N/A"}
Email: {lead.email}
Phone: {lead.phone or "N/A"}
Source: {lead.source}
Score: {lead.score} ({lead.score_category})

Message:
{lead.message or "N/A"}

Qualification Data:
{lead.qualification_data or {}}

View in dashboard: {self.config.get("dashboard_url", "")}/leads/{lead.id}
        """.strip()
        
        return self._send_email(to_email, subject, body)
    
    def send_confirmation(self, lead, template: str = "default") -> str:
        """Send confirmation email to lead."""
        subject = "Thanks for reaching out!"
        
        body = f"""
Hi {lead.name or "there"},

Thanks for contacting us! We've received your message and will get back to you soon.

What happens next:
1. Our team reviews your inquiry
2. We'll contact you within 24 hours
3. We'll discuss how we can help

If you have any urgent questions, feel free to reply to this email.

Best regards,
The Team
        """.strip()
        
        return self._send_email(lead.email, subject, body)
    
    def _send_email(self, to_email: str, subject: str, body: str) -> str:
        """Send email via configured provider."""
        if not to_email:
            return "no recipient"
        
        try:
            if self.provider == "sendgrid":
                return self._send_via_sendgrid(to_email, subject, body)
            elif self.provider == "resend":
                return self._send_via_resend(to_email, subject, body)
            elif self.provider == "gmail":
                return self._send_via_gmail(to_email, subject, body)
            else:
                logger.warning(f"Unknown email provider: {self.provider}")
                return "provider not configured"
        except Exception as e:
            logger.error(f"Email send failed: {e}")
            return f"error: {str(e)}"
    
    def _send_via_sendgrid(self, to_email: str, subject: str, body: str) -> str:
        """Send via SendGrid."""
        if not self.client:
            return "sendgrid not configured"
        
        message = Mail(
            from_email=f"{self.from_name} <{self.from_email}>",
            to_emails=to_email,
            subject=subject,
            plain_text_content=body
        )
        
        response = self.client.send(message)
        
        if response.status_code in [200, 201, 202]:
            logger.info(f"Email sent via SendGrid to {to_email}")
            return "sent via sendgrid"
        else:
            logger.error(f"SendGrid error: {response.status_code}")
            return f"sendgrid error: {response.status_code}"
    
    def _send_via_resend(self, to_email: str, subject: str, body: str) -> str:
        """Send via Resend."""
        if not self.api_key:
            return "resend not configured"
        
        url = "https://api.resend.com/emails"
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        data = {
            "from": f"{self.from_name} <{self.from_email}>",
            "to": [to_email],
            "subject": subject,
            "text": body
        }
        
        response = requests.post(url, json=data, headers=headers, timeout=10)
        
        if response.status_code == 200:
            logger.info(f"Email sent via Resend to {to_email}")
            return "sent via resend"
        else:
            logger.error(f"Resend error: {response.status_code}")
            return f"resend error: {response.status_code}"
    
    def _send_via_gmail(self, to_email: str, subject: str, body: str) -> str:
        """Send via Gmail API (simplified - real implementation needs OAuth)."""
        logger.warning("Gmail integration requires OAuth implementation")
        return "gmail not fully implemented"