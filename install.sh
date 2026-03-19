#!/bin/bash
# SMF Lead Capture - Production Installation Script
# For SMF Works customer zero deployment

set -e

echo "🚀 SMF Lead Capture - Production Setup"
echo "========================================"

# Configuration
APP_NAME="smf-lead-capture"
APP_DIR="/opt/smf-lead-capture"
USER="smf-lead"
SERVICE_NAME="smf-lead-capture"

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo "Please run as root or with sudo"
    exit 1
fi

# Create user
echo "Creating service user..."
if ! id "$USER" &>/dev/null; then
    useradd -r -s /bin/false -d "$APP_DIR" "$USER"
fi

# Create directories
echo "Creating application directories..."
mkdir -p "$APP_DIR"
mkdir -p "$APP_DIR/data"
mkdir -p "$APP_DIR/models"
mkdir -p "$APP_DIR/logs"

# Install dependencies
echo "Installing Python dependencies..."
apt-get update
apt-get install -y python3 python3-pip python3-venv python3-dev
apt-get install -y libpq-dev  # For PostgreSQL support

# Create virtual environment
echo "Setting up Python virtual environment..."
python3 -m venv "$APP_DIR/venv"
source "$APP_DIR/venv/bin/activate"

# Install Python packages
echo "Installing Python packages..."
pip install --upgrade pip
pip install -r requirements.txt

# Set permissions
echo "Setting permissions..."
chown -R "$USER:$USER" "$APP_DIR"
chmod 750 "$APP_DIR"
chmod 770 "$APP_DIR/data"
chmod 770 "$APP_DIR/logs"

# Create systemd service file
echo "Creating systemd service..."
cat > "/etc/systemd/system/$SERVICE_NAME.service" << EOF
[Unit]
Description=SMF Lead Capture Service
After=network.target

[Service]
Type=simple
User=$USER
Group=$USER
WorkingDirectory=$APP_DIR
Environment=PYTHONPATH=$APP_DIR
Environment=FLASK_ENV=production
EnvironmentFile=$APP_DIR/.env
ExecStart=$APP_DIR/venv/bin/python -m smf_lead_capture server
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# Create environment file template
echo "Creating environment file template..."
cat > "$APP_DIR/.env.example" << 'EOF'
# SMF Lead Capture - Environment Variables
# Copy this to .env and fill in real values

# Server
SECRET_KEY=change-this-to-a-secure-random-string
API_KEY=your-secure-api-key-here

# Database
DATABASE_URL=sqlite:///data/smf_leads.db

# Notifications (SendGrid)
SENDGRID_API_KEY=SG.xxxxxx
OWNER_EMAIL=michael@smfworks.com

# SMS (Twilio)
TWILIO_ACCOUNT_SID=ACxxxxx
TWILIO_AUTH_TOKEN=xxxxx
TWILIO_PHONE_NUMBER=+1xxxxxxxxxx
OWNER_PHONE=+19194494107

# CRM (HubSpot)
HUBSPOT_API_KEY=pat-na1-xxxxx

# Webhook Security
WEBHOOK_SECRET=your-webhook-secret-here
EOF

# Create startup script
cat > "$APP_DIR/start.sh" << 'EOF'
#!/bin/bash
source venv/bin/activate
python -m smf_lead_capture server
EOF
chmod +x "$APP_DIR/start.sh"

# Create systemd service
echo "Enabling service..."
systemctl daemon-reload
systemctl enable "$SERVICE_NAME"

echo ""
echo "✅ Installation complete!"
echo ""
echo "Next steps:"
echo "1. Copy your application code to $APP_DIR"
echo "2. Copy config.production.yaml to $APP_DIR/config.yaml"
echo "3. Create $APP_DIR/.env with your real credentials"
echo "4. Start the service: sudo systemctl start $SERVICE_NAME"
echo "5. Check status: sudo systemctl status $SERVICE_NAME"
echo ""
echo "Logs: journalctl -u $SERVICE_NAME -f"
echo ""
