"""AI integration for SMF Lead Capture using Ollama and OpenAI."""

import logging
from typing import Any, Dict, List, Optional

import requests

logger = logging.getLogger(__name__)


class AIIntegration:
    """AI integration for natural language chat responses."""
    
    def __init__(self, config: Dict[str, Any]):
        """Initialize AI integration."""
        self.config = config
        self.provider = config.get("provider", "ollama")
        self.model = config.get("model", "qwen3.5:9b")
        self.temperature = config.get("temperature", 0.7)
        self.max_tokens = config.get("max_tokens", 500)
        
        # Ollama settings
        self.ollama_url = config.get("ollama_url", "http://localhost:11434")
        
        # OpenAI fallback settings
        self.openai_api_key = config.get("openai_api_key")
        self.openai_model = config.get("openai_model", "gpt-3.5-turbo")
    
    def generate_response(self, message: str, context: List[Dict[str, str]], 
                         system_prompt: Optional[str] = None) -> str:
        """Generate AI response to user message."""
        try:
            if self.provider == "ollama":
                return self._generate_ollama(message, context, system_prompt)
            elif self.provider == "openai":
                return self._generate_openai(message, context, system_prompt)
            else:
                return self._generate_rule_based(message, context)
        except Exception as e:
            logger.error(f"AI generation failed: {e}")
            return self._generate_rule_based(message, context)
    
    def _generate_ollama(self, message: str, context: List[Dict[str, str]], 
                        system_prompt: Optional[str] = None) -> str:
        """Generate response using Ollama."""
        try:
            url = f"{self.ollama_url}/api/chat"
            
            messages = []
            if system_prompt:
                messages.append({"role": "system", "content": system_prompt})
            
            # Add context
            for msg in context[-5:]:  # Last 5 messages
                messages.append(msg)
            
            messages.append({"role": "user", "content": message})
            
            data = {
                "model": self.model,
                "messages": messages,
                "stream": False,
                "options": {
                    "temperature": self.temperature,
                    "num_predict": self.max_tokens
                }
            }
            
            response = requests.post(url, json=data, timeout=30)
            response.raise_for_status()
            
            result = response.json()
            return result.get("message", {}).get("content", "I'm not sure how to respond to that.")
            
        except requests.exceptions.ConnectionError:
            logger.warning("Ollama not available, falling back to rule-based")
            return self._generate_rule_based(message, context)
        except Exception as e:
            logger.error(f"Ollama error: {e}")
            return self._generate_rule_based(message, context)
    
    def _generate_openai(self, message: str, context: List[Dict[str, str]], 
                        system_prompt: Optional[str] = None) -> str:
        """Generate response using OpenAI as fallback."""
        if not self.openai_api_key:
            return self._generate_rule_based(message, context)
        
        try:
            import openai
            openai.api_key = self.openai_api_key
            
            messages = []
            if system_prompt:
                messages.append({"role": "system", "content": system_prompt})
            
            for msg in context[-5:]:
                messages.append(msg)
            
            messages.append({"role": "user", "content": message})
            
            response = openai.ChatCompletion.create(
                model=self.openai_model,
                messages=messages,
                temperature=self.temperature,
                max_tokens=self.max_tokens
            )
            
            return response.choices[0].message.content
            
        except Exception as e:
            logger.error(f"OpenAI error: {e}")
            return self._generate_rule_based(message, context)
    
    def _generate_rule_based(self, message: str, context: List[Dict[str, str]]) -> str:
        """Generate rule-based response when AI is unavailable."""
        message_lower = message.lower()
        
        # Simple pattern matching
        if any(word in message_lower for word in ["hello", "hi", "hey"]):
            return "Hello! How can I help you today?"
        
        if any(word in message_lower for word in ["price", "cost", "how much"]):
            return "I'd be happy to discuss pricing. Could you tell me more about your project so I can give you an accurate estimate?"
        
        if any(word in message_lower for word in ["services", "what do you do", "offer"]):
            return "We offer a range of services. What specific problem are you trying to solve?"
        
        if any(word in message_lower for word in ["book", "schedule", "appointment", "meeting"]):
            return "I'd love to schedule a time to chat. What's your email so I can send you some options?"
        
        if any(word in message_lower for word in ["thank", "thanks"]):
            return "You're welcome! Is there anything else I can help with?"
        
        if any(word in message_lower for word in ["bye", "goodbye"]):
            return "Thanks for chatting! Feel free to reach out anytime."
        
        # Default response
        return "Thanks for that! Could you tell me a bit more about what you're looking for?"
    
    def analyze_sentiment(self, message: str) -> float:
        """Analyze sentiment of message (-1 to 1)."""
        message_lower = message.lower()
        
        positive_words = ["good", "great", "excellent", "love", "happy", "thanks", "awesome"]
        negative_words = ["bad", "terrible", "hate", "angry", "frustrated", "problem", "issue", "complaint"]
        
        score = 0
        for word in positive_words:
            if word in message_lower:
                score += 0.2
        
        for word in negative_words:
            if word in message_lower:
                score -= 0.3
        
        return max(-1, min(1, score))
    
    def extract_entities(self, message: str) -> Dict[str, Any]:
        """Extract entities from message (email, phone, etc)."""
        import re
        
        entities = {}
        
        # Extract email
        email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
        emails = re.findall(email_pattern, message)
        if emails:
            entities["email"] = emails[0]
        
        # Extract phone
        phone_pattern = r'(\+?1[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}'
        phones = re.findall(phone_pattern, message)
        if phones:
            entities["phone"] = phones[0]
        
        return entities