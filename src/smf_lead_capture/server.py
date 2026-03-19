"""Flask webhook server for SMF Lead Capture."""

import logging
import os
from datetime import datetime

from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

from .config import Config
from .database import Database
from .lead_capture import LeadCapture

logger = logging.getLogger(__name__)


def create_app(config_path: str = "config.yaml") -> Flask:
    """Create Flask application."""
    app = Flask(__name__)
    
    # Load configuration
    config = Config(config_path)
    app.config["SMF_CONFIG"] = config
    
    # Setup Flask config
    app.config["SECRET_KEY"] = config.get("server.secret_key", os.urandom(32).hex())
    app.config["DEBUG"] = config.get("server.debug", False)
    
    # Initialize components
    app.lead_capture = LeadCapture(config_path)
    
    # Setup CORS
    CORS(app, origins=config.get("server.cors_origins", ["*"]))
    
    # Setup rate limiting
    rate_limit_config = config.get("security.rate_limit", {})
    if rate_limit_config.get("enabled", True):
        Limiter(
            app=app,
            key_func=get_remote_address,
            default_limits=[
                f"{rate_limit_config.get('requests_per_minute', 60)}/minute",
                f"{rate_limit_config.get('requests_per_hour', 1000)}/hour"
            ]
        )
    
    # Register routes
    register_routes(app)
    
    return app


def require_api_key(f):
    """Decorator to require API key."""
    def decorated_function(*args, **kwargs):
        config = request.app.config["SMF_CONFIG"]
        api_keys = config.get("security.api_keys", [])
        
        # Get API key from header
        api_key = request.headers.get("X-API-Key") or request.args.get("api_key")
        
        if not api_key:
            return jsonify({"error": "API key required"}), 401
        
        if api_key not in api_keys:
            return jsonify({"error": "Invalid API key"}), 401
        
        return f(*args, **kwargs)
    
    decorated_function.__name__ = f.__name__
    return decorated_function


def register_routes(app: Flask):
    """Register API routes."""
    
    # Health check
    @app.route("/health", methods=["GET"])
    def health_check():
        """Health check endpoint."""
        return jsonify({
            "status": "healthy",
            "version": "1.0.0",
            "timestamp": datetime.utcnow().isoformat()
        })
    
    # Create lead
    @app.route("/api/v1/leads", methods=["POST"])
    @require_api_key
    def create_lead():
        """Create new lead."""
        try:
            data = request.get_json()
            if not data:
                return jsonify({"error": "JSON body required"}), 400
            
            # Validate required fields
            if not data.get("email"):
                return jsonify({"error": "email is required"}), 400
            
            # Add metadata
            data["metadata"] = {
                **data.get("metadata", {}),
                "ip_address": request.remote_addr,
                "user_agent": request.headers.get("User-Agent"),
                "referrer": request.headers.get("Referer"),
                "timestamp": datetime.utcnow().isoformat()
            }
            
            # Process lead
            result = app.lead_capture.process_lead(data)
            
            return jsonify(result), 201
            
        except Exception as e:
            logger.error(f"Error creating lead: {e}")
            return jsonify({"error": str(e)}), 500
    
    # Get lead
    @app.route("/api/v1/leads/<lead_id>", methods=["GET"])
    @require_api_key
    def get_lead(lead_id: str):
        """Get lead by ID."""
        try:
            lead = app.lead_capture.get_lead(lead_id)
            if not lead:
                return jsonify({"error": "Lead not found"}), 404
            
            return jsonify(lead)
            
        except Exception as e:
            logger.error(f"Error getting lead: {e}")
            return jsonify({"error": str(e)}), 500
    
    # List leads
    @app.route("/api/v1/leads", methods=["GET"])
    @require_api_key
    def list_leads():
        """List leads with filters."""
        try:
            # Parse query parameters
            filters = {
                "status": request.args.get("status"),
                "source": request.args.get("source"),
                "category": request.args.get("category"),
                "from_date": request.args.get("from_date"),
                "to_date": request.args.get("to_date"),
                "limit": int(request.args.get("limit", 20)),
                "offset": int(request.args.get("offset", 0))
            }
            
            # Remove None values
            filters = {k: v for k, v in filters.items() if v is not None}
            
            leads, total = app.lead_capture.list_leads(**filters)
            
            return jsonify({
                "leads": leads,
                "total": total,
                "limit": filters.get("limit", 20),
                "offset": filters.get("offset", 0)
            })
            
        except Exception as e:
            logger.error(f"Error listing leads: {e}")
            return jsonify({"error": str(e)}), 500
    
    # Update lead
    @app.route("/api/v1/leads/<lead_id>", methods=["PUT"])
    @require_api_key
    def update_lead(lead_id: str):
        """Update lead."""
        try:
            data = request.get_json()
            if not data:
                return jsonify({"error": "JSON body required"}), 400
            
            lead = app.lead_capture.update_lead(lead_id, data)
            if not lead:
                return jsonify({"error": "Lead not found"}), 404
            
            return jsonify(lead)
            
        except Exception as e:
            logger.error(f"Error updating lead: {e}")
            return jsonify({"error": str(e)}), 500
    
    # Delete lead
    @app.route("/api/v1/leads/<lead_id>", methods=["DELETE"])
    @require_api_key
    def delete_lead(lead_id: str):
        """Delete lead."""
        try:
            success = app.lead_capture.delete_lead(lead_id)
            if not success:
                return jsonify({"error": "Lead not found"}), 404
            
            return jsonify({"message": "Lead deleted"}), 200
            
        except Exception as e:
            logger.error(f"Error deleting lead: {e}")
            return jsonify({"error": str(e)}), 500
    
    # Chat endpoint
    @app.route("/api/v1/chat", methods=["POST"])
    def chat():
        """Process chat message."""
        try:
            data = request.get_json()
            if not data:
                return jsonify({"error": "JSON body required"}), 400
            
            session_id = data.get("session_id")
            message = data.get("message")
            
            if not session_id or not message:
                return jsonify({"error": "session_id and message required"}), 400
            
            result = app.lead_capture.get_chat_response(session_id, message)
            
            return jsonify(result)
            
        except Exception as e:
            logger.error(f"Error in chat: {e}")
            return jsonify({"error": str(e)}), 500
    
    # Get chat session
    @app.route("/api/v1/chat/<session_id>", methods=["GET"])
    @require_api_key
    def get_chat_session(session_id: str):
        """Get chat session."""
        try:
            session = app.lead_capture.db.get_chat_session(session_id)
            if not session:
                return jsonify({"error": "Session not found"}), 404
            
            return jsonify(session.to_dict())
            
        except Exception as e:
            logger.error(f"Error getting chat session: {e}")
            return jsonify({"error": str(e)}), 500
    
    # Webhook for external systems
    @app.route("/webhook/lead", methods=["POST"])
    def webhook_lead():
        """Webhook for lead submission from external systems."""
        try:
            data = request.get_json()
            if not data:
                return jsonify({"error": "JSON body required"}), 400
            
            # Map webhook data to lead format
            lead_data = {
                "name": data.get("name", ""),
                "email": data.get("email", ""),
                "phone": data.get("phone", ""),
                "message": data.get("message", ""),
                "source": data.get("source", "webhook"),
                "metadata": data.get("metadata", {}),
                "qualification_data": data.get("qualification_data", {})
            }
            
            # Verify webhook signature if configured
            config = app.config["SMF_CONFIG"]
            webhook_secret = config.get("security.webhook_secret")
            if webhook_secret:
                signature = request.headers.get("X-Webhook-Signature")
                # Implement signature verification here
                pass
            
            result = app.lead_capture.process_lead(lead_data)
            
            return jsonify(result), 201
            
        except Exception as e:
            logger.error(f"Error in webhook: {e}")
            return jsonify({"error": str(e)}), 500
    
    # Metrics endpoint
    @app.route("/api/v1/metrics", methods=["GET"])
    @require_api_key
    def get_metrics():
        """Get lead capture metrics."""
        try:
            from_date = request.args.get("from_date")
            to_date = request.args.get("to_date")
            
            params = {}
            if from_date:
                params["from_date"] = datetime.fromisoformat(from_date)
            if to_date:
                params["to_date"] = datetime.fromisoformat(to_date)
            
            metrics = app.lead_capture.get_metrics(**params)
            
            return jsonify(metrics)
            
        except Exception as e:
            logger.error(f"Error getting metrics: {e}")
            return jsonify({"error": str(e)}), 500
    
    # Widget serving
    @app.route("/widget.js", methods=["GET"])
    def serve_widget():
        """Serve chat widget JavaScript."""
        from flask import send_from_directory
        import os
        
        widget_dir = os.path.join(os.path.dirname(__file__), "..", "assets")
        return send_from_directory(widget_dir, "widget.js")


def run_server(config_path: str = "config.yaml", host: str = None, port: int = None):
    """Run the Flask server."""
    app = create_app(config_path)
    config = app.config["SMF_CONFIG"]
    
    host = host or config.get("server.host", "0.0.0.0")
    port = port or config.get("server.port", 5000)
    debug = config.get("server.debug", False)
    
    logger.info(f"Starting SMF Lead Capture server on {host}:{port}")
    app.run(host=host, port=port, debug=debug)