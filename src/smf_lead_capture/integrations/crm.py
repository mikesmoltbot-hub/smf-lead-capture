"""CRM integrations for SMF Lead Capture."""

import logging
from typing import Any, Dict, Optional

import requests

logger = logging.getLogger(__name__)


class CRMIntegration:
    """CRM integration manager."""
    
    def __init__(self, config: Dict[str, Any]):
        """Initialize CRM integration."""
        self.config = config
        self.provider = config.get("provider", "hubspot")
        self.api_key = config.get("api_key")
        
    def create_contact(self, lead, contact_config: Dict[str, Any]) -> Optional[str]:
        """Create contact in CRM."""
        if not self.api_key:
            logger.warning("No CRM API key configured")
            return None
        
        try:
            if self.provider == "hubspot":
                return self._create_hubspot_contact(lead, contact_config)
            elif self.provider == "pipedrive":
                return self._create_pipedrive_contact(lead, contact_config)
            elif self.provider == "salesforce":
                return self._create_salesforce_contact(lead, contact_config)
            else:
                logger.warning(f"Unknown CRM provider: {self.provider}")
                return None
        except Exception as e:
            logger.error(f"CRM creation failed: {e}")
            return None
    
    def _create_hubspot_contact(self, lead, config: Dict[str, Any]) -> Optional[str]:
        """Create contact in HubSpot."""
        url = "https://api.hubapi.com/crm/v3/objects/contacts"
        
        mappings = config.get("mappings", {})
        custom_properties = config.get("custom_properties", [])
        
        properties = {
            "email": lead.email,
            "firstname": lead.name.split()[0] if lead.name else "",
            "lastname": " ".join(lead.name.split()[1:]) if lead.name and len(lead.name.split()) > 1 else "",
            "phone": lead.phone or "",
        }
        
        # Add custom mappings
        for prop in custom_properties:
            name = prop.get("name")
            value_template = prop.get("value", "")
            # Simple template substitution
            value = value_template.replace("{{email}}", lead.email or "")
            value = value.replace("{{name}}", lead.name or "")
            value = value.replace("{{message}}", lead.message or "")
            if name:
                properties[name] = value
        
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.api_key}"
        }
        
        data = {"properties": properties}
        
        try:
            response = requests.post(url, json=data, headers=headers, timeout=10)
            response.raise_for_status()
            result = response.json()
            crm_id = result.get("id")
            logger.info(f"Created HubSpot contact: {crm_id}")
            return crm_id
        except requests.exceptions.RequestException as e:
            logger.error(f"HubSpot API error: {e}")
            return None
    
    def _create_pipedrive_contact(self, lead, config: Dict[str, Any]) -> Optional[str]:
        """Create contact in Pipedrive."""
        url = "https://api.pipedrive.com/v1/persons"
        
        params = {"api_token": self.api_key}
        data = {
            "name": lead.name or lead.email,
            "email": lead.email,
            "phone": lead.phone or "",
        }
        
        try:
            response = requests.post(url, json=data, params=params, timeout=10)
            response.raise_for_status()
            result = response.json()
            crm_id = str(result.get("data", {}).get("id"))
            logger.info(f"Created Pipedrive person: {crm_id}")
            return crm_id
        except requests.exceptions.RequestException as e:
            logger.error(f"Pipedrive API error: {e}")
            return None
    
    def _create_salesforce_contact(self, lead, config: Dict[str, Any]) -> Optional[str]:
        """Create contact in Salesforce."""
        # Simplified - real implementation needs OAuth flow
        logger.warning("Salesforce integration requires OAuth implementation")
        return None
    
    def update_contact(self, crm_id: str, updates: Dict[str, Any]) -> bool:
        """Update existing contact in CRM."""
        if not self.api_key:
            return False
        
        try:
            if self.provider == "hubspot":
                url = f"https://api.hubapi.com/crm/v3/objects/contacts/{crm_id}"
                headers = {
                    "Content-Type": "application/json",
                    "Authorization": f"Bearer {self.api_key}"
                }
                response = requests.patch(url, json={"properties": updates}, headers=headers, timeout=10)
                return response.status_code == 200
            return False
        except Exception as e:
            logger.error(f"CRM update failed: {e}")
            return False