"""Configuration management for SMF Lead Capture."""

import os
import re
from pathlib import Path
from typing import Any, Dict, Optional

import yaml
from dotenv import load_dotenv


class Config:
    """Configuration manager with environment variable substitution."""
    
    def __init__(self, config_path: str = "config.yaml"):
        """Initialize configuration from YAML file."""
        load_dotenv()
        self.config_path = Path(config_path)
        self._config = self._load_config()
    
    def _load_config(self) -> Dict[str, Any]:
        """Load and process configuration file."""
        if not self.config_path.exists():
            return self._default_config()
        
        with open(self.config_path, 'r') as f:
            raw_config = yaml.safe_load(f)
        
        # Substitute environment variables
        return self._substitute_env_vars(raw_config)
    
    def _substitute_env_vars(self, obj: Any) -> Any:
        """Recursively substitute environment variables."""
        if isinstance(obj, dict):
            return {k: self._substitute_env_vars(v) for k, v in obj.items()}
        elif isinstance(obj, list):
            return [self._substitute_env_vars(item) for item in obj]
        elif isinstance(obj, str):
            return self._replace_env_vars(obj)
        return obj
    
    def _replace_env_vars(self, value: str) -> str:
        """Replace ${VAR} or ${VAR:default} with environment variable values."""
        pattern = r'\$\{([^}]+)\}'
        
        def replace(match):
            var_spec = match.group(1)
            if ':' in var_spec:
                var_name, default = var_spec.split(':', 1)
            else:
                var_name, default = var_spec, ''
            return os.getenv(var_name, default)
        
        return re.sub(pattern, replace, value)
    
    def _default_config(self) -> Dict[str, Any]:
        """Return default configuration."""
        return {
            "server": {
                "host": "0.0.0.0",
                "port": int(os.getenv("PORT", 5000)),
                "debug": False,
                "secret_key": os.getenv("SECRET_KEY", "dev-secret-key-change-in-production")
            },
            "database": {
                "url": os.getenv("DATABASE_URL", "sqlite:///data/leads.db")
            },
            "widget": {
                "greeting": "Hi! How can I help you today?",
                "position": "bottom-right",
                "primary_color": "#0066CC"
            },
            "qualification": {
                "questions": [],
                "scoring": {
                    "thresholds": {"hot": 25, "warm": 15, "cold": 0}
                }
            },
            "actions": {
                "hot_lead": [],
                "warm_lead": [],
                "cold_lead": [],
                "all_leads": []
            },
            "integrations": {},
            "security": {
                "api_keys": [os.getenv("API_KEY", "dev-key-change-in-production")],
                "rate_limit": {
                    "enabled": True,
                    "requests_per_minute": 60,
                    "requests_per_hour": 1000
                }
            }
        }
    
    def get(self, key: str, default: Any = None) -> Any:
        """Get configuration value by dot-notation key."""
        keys = key.split('.')
        value = self._config
        
        for k in keys:
            if isinstance(value, dict) and k in value:
                value = value[k]
            else:
                return default
        
        return value
    
    def __getitem__(self, key: str) -> Any:
        """Allow dict-style access."""
        return self._config[key]
    
    def __contains__(self, key: str) -> bool:
        """Check if key exists."""
        return key in self._config
    
    def to_dict(self) -> Dict[str, Any]:
        """Return configuration as dictionary."""
        return self._config.copy()
    
    def validate(self) -> list:
        """Validate configuration and return list of errors."""
        errors = []
        
        # Check required sections
        required = ["server", "database", "qualification", "actions"]
        for section in required:
            if section not in self._config:
                errors.append(f"Missing required section: {section}")
        
        # Check database URL
        db_url = self.get("database.url", "")
        if not db_url:
            errors.append("Database URL is required")
        
        # Check API keys in production
        if not self.get("server.debug", False):
            api_keys = self.get("security.api_keys", [])
            if not api_keys or api_keys == ["dev-key-change-in-production"]:
                errors.append("Production API key required (not dev-key)")
        
        # Check qualification thresholds
        thresholds = self.get("qualification.scoring.thresholds", {})
        if not thresholds:
            errors.append("Qualification scoring thresholds required")
        
        return errors