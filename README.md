# SMF Lead Capture

A production-ready lead capture and qualification system for small businesses. Built as an OpenClaw skill with real API integrations, database persistence, and a Flask webhook server.

## What It Is

SMF Lead Capture is an intelligent lead management system that:

- **Captures leads** from website chat widgets, contact forms, and API calls
- **Qualifies leads** through AI-powered conversations and scoring
- **Routes leads** to the right place (CRM, email, SMS) based on quality
- **Tracks everything** in a persistent database with full audit trail

Think of it as a 24/7 digital receptionist that never sleeps, never forgets to follow up, and instantly sorts your leads so you focus on the hot prospects first.

## Why Use It

**The Problem:**
- 35% of leads never get contacted
- Average response time: 42 minutes (leads go cold in 5)
- Manual lead sorting wastes hours
- Hot leads slip through cracks

**The Solution:**
- Instant response (under 5 seconds)
- Automatic qualification and scoring
- Hot leads notify you immediately via SMS
- Warm leads enter nurture sequences
- Everything logged and tracked

## Features

### Lead Capture
- **Chat Widget** - Embeddable JavaScript for your website
- **Contact Forms** - API endpoint for form submissions
- **Direct API** - REST API for custom integrations
- **Multi-source** - Track where leads come from

### Lead Qualification
- **Smart Questions** - Ask the right questions to qualify
- **AI Scoring** - Algorithm scores leads 0-100
- **Categories** - Hot (buy now), Warm (interested), Cold (browsing)
- **Custom Rules** - Configure scoring for your business
- **AI Chat** - Natural language responses via Ollama or OpenAI

### Visual Dashboard
- **Flow Builder** - Drag-and-drop conversation designer
- **Real-time Metrics** - Live lead tracking and analytics
- **Lead Management** - View, filter, and export leads
- **A/B Testing** - Test conversation variations (coming soon)

### Integrations
- **CRM:** HubSpot, Pipedrive, Salesforce, Zoho
- **Email:** Gmail, SendGrid, Resend, AWS SES
- **SMS:** Twilio
- **Calendar:** Google Calendar, Calendly
- **Analytics:** Google Analytics, Mixpanel

### Database
- **SQLite** - Default, zero-config
- **PostgreSQL** - Production scale
- **Full History** - Every interaction tracked
- **Export** - CSV, JSON, or API

## Quick Start

### Installation

```bash
# Clone the repository
git clone https://github.com/mikesmoltbot-hub/smf-lead-capture.git
cd smf-lead-capture

# Install dependencies
pip install -r requirements.txt

# Copy example config
cp config.example.yaml config.yaml

# Edit configuration
nano config.yaml

# Initialize database
python -m smf_lead_capture init-db

# Start the server
python -m smf_lead_capture server
```

### Docker Installation

```bash
# Run with Docker
docker run -d \
  -p 5000:5000 \
  -v $(pwd)/config.yaml:/app/config.yaml \
  -v $(pwd)/data:/app/data \
  ghcr.io/mikesmoltbot-hub/smf-lead-capture:latest
```

### OpenClaw Skill Installation

```bash
# Install as OpenClaw skill
clawhub install smf-lead-capture

# Or from GitHub
clawhub install https://github.com/mikesmoltbot-hub/smf-lead-capture
```

## Configuration

### Minimal Config

```yaml
# config.yaml
server:
  host: "0.0.0.0"
  port: 5000

widget:
  greeting: "Hi! How can I help you today?"

qualification:
  questions:
    - text: "What's your timeline?"
      field: "timeline"
      options:
        - value: "asap"
          label: "ASAP"
          score: 10
        - value: "later"
          label: "Later"
          score: 3

actions:
  hot_lead:
    - notify:
        channels: ["email"]
        to: "you@yourbusiness.com"

database:
  url: "sqlite:///data/leads.db"
```

### Full Config

See `config.example.yaml` for complete configuration with all options.

## Usage

### Website Chat Widget

Add to your website HTML:

```html
<script src="https://your-server.com/widget.js"></script>
<script>
  SMFLeadCapture.init({
    serverUrl: 'https://your-server.com',
    apiKey: 'your-api-key',
    position: 'bottom-right',
    primaryColor: '#0066CC'
  });
</script>
```

### API Usage

```bash
# Submit a lead
curl -X POST https://your-server.com/api/v1/leads \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "message": "Interested in your services",
    "source": "website"
  }'

# Get lead status
curl https://your-server.com/api/v1/leads/{lead-id} \
  -H "X-API-Key: your-api-key"

# List all leads
curl "https://your-server.com/api/v1/leads?status=hot&limit=10" \
  -H "X-API-Key: your-api-key"
```

### Python SDK

```python
from smf_lead_capture import LeadCapture

# Initialize
capture = LeadCapture(config_path="config.yaml")

# Process a lead
result = capture.process_lead({
    "name": "Jane Smith",
    "email": "jane@company.com",
    "message": "Need help with automation",
    "source": "landing_page",
    "qualification_data": {
        "timeline": "asap",
        "budget": "over_10k"
    }
})

print(f"Lead ID: {result['lead_id']}")
print(f"Score: {result['score_category']}")
print(f"CRM ID: {result['crm_id']}")
```

## API Reference

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/leads` | Create new lead |
| GET | `/api/v1/leads/{id}` | Get lead details |
| GET | `/api/v1/leads` | List leads (paginated) |
| PUT | `/api/v1/leads/{id}` | Update lead |
| DELETE | `/api/v1/leads/{id}` | Delete lead |
| POST | `/api/v1/chat` | Send chat message |
| GET | `/api/v1/chat/{session}` | Get chat history |
| GET | `/api/v1/metrics` | Get metrics |
| POST | `/webhook/lead` | Webhook for external systems |

### Query Parameters

**List Leads:**
- `status` - Filter by status (new, hot, warm, cold, converted, lost)
- `source` - Filter by source
- `from_date` - Start date (ISO 8601)
- `to_date` - End date (ISO 8601)
- `limit` - Results per page (default: 20)
- `offset` - Pagination offset

## Database Schema

### Leads Table
```sql
CREATE TABLE leads (
    id TEXT PRIMARY KEY,
    name TEXT,
    email TEXT NOT NULL,
    phone TEXT,
    message TEXT,
    source TEXT,
    score INTEGER DEFAULT 0,
    score_category TEXT DEFAULT 'cold',
    status TEXT DEFAULT 'new',
    qualification_data JSON,
    metadata JSON,
    crm_id TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Chat Sessions Table
```sql
CREATE TABLE chat_sessions (
    id TEXT PRIMARY KEY,
    lead_id TEXT REFERENCES leads(id),
    messages JSON,
    qualification_answers JSON,
    current_question INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Actions Log Table
```sql
CREATE TABLE actions_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    lead_id TEXT REFERENCES leads(id),
    action_type TEXT,
    action_config JSON,
    result TEXT,
    executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Environment Variables

```bash
# Required
DATABASE_URL=sqlite:///data/leads.db

# Optional - API Keys
HUBSPOT_API_KEY=xxx
SALESFORCE_CLIENT_ID=xxx
SALESFORCE_CLIENT_SECRET=xxx
TWILIO_ACCOUNT_SID=xxx
TWILIO_AUTH_TOKEN=xxx
SENDGRID_API_KEY=xxx

# Optional - Server
PORT=5000
HOST=0.0.0.0
DEBUG=false
SECRET_KEY=your-secret-key

# Optional - OpenClaw
OPENCLAW_GATEWAY_URL=ws://localhost:18789
OPENCLAW_AGENT_ID=smf-lead-capture
```

## Development

### Setup

```bash
# Clone repo
git clone https://github.com/mikesmoltbot-hub/smf-lead-capture.git
cd smf-lead-capture

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dev dependencies
pip install -r requirements-dev.txt

# Run tests
pytest

# Run with hot reload
python -m smf_lead_capture server --reload
```

### Project Structure

```
smf-lead-capture/
├── src/
│   └── smf_lead_capture/
│       ├── __init__.py
│       ├── config.py          # Configuration management
│       ├── database.py        # Database models & operations
│       ├── lead_capture.py    # Core lead capture logic
│       ├── integrations/      # API integrations
│       │   ├── __init__.py
│       │   ├── crm.py         # CRM connectors
│       │   ├── email.py       # Email providers
│       │   ├── sms.py         # SMS providers
│       │   └── calendar.py    # Calendar integrations
│       ├── server.py          # Flask webhook server
│       └── widget.py          # Widget serving
├── tests/
│   ├── test_lead_capture.py
│   ├── test_integrations.py
│   └── test_api.py
├── docs/
│   ├── api.md
│   ├── configuration.md
│   └── deployment.md
├── scripts/
│   └── migrate.py
├── assets/
│   └── widget.js
├── config.example.yaml
├── requirements.txt
├── requirements-dev.txt
├── Dockerfile
├── docker-compose.yml
└── README.md
```

## Deployment

### Railway

```bash
# Deploy to Railway
railway login
railway init
railway up
```

### Heroku

```bash
# Deploy to Heroku
heroku create your-lead-capture
heroku config:set DATABASE_URL=your-db-url
heroku config:set HUBSPOT_API_KEY=your-key
git push heroku main
```

### VPS / Self-Hosted

```bash
# Install
pip install smf-lead-capture

# Create systemd service
sudo tee /etc/systemd/system/smf-lead-capture.service > /dev/null <<EOF
[Unit]
Description=SMF Lead Capture
After=network.target

[Service]
User=smf
WorkingDirectory=/opt/smf-lead-capture
Environment=DATABASE_URL=sqlite:///data/leads.db
ExecStart=/usr/local/bin/smf-lead-capture server
Restart=always

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl enable smf-lead-capture
sudo systemctl start smf-lead-capture
```

## Security

- **API Key Authentication** - All endpoints require valid API key
- **Rate Limiting** - Configurable limits per IP/email
- **Input Validation** - SQL injection and XSS protection
- **Webhook Signatures** - Verify webhook authenticity
- **Data Encryption** - Sensitive data encrypted at rest

## Troubleshooting

### Widget Not Appearing

1. Check browser console for errors
2. Verify `serverUrl` is correct and accessible
3. Check CORS settings in config
4. Ensure API key is valid

### Leads Not Scoring

1. Check qualification questions are configured
2. Verify scoring thresholds in config
3. Check logs for scoring errors

### CRM Sync Failing

1. Verify API credentials
2. Check field mappings match CRM
3. Review rate limits
4. Check CRM API status

## Support

- **Documentation:** https://docs.smfworks.com/smf-lead-capture
- **Issues:** https://github.com/mikesmoltbot-hub/smf-lead-capture/issues
- **Email:** michael@smfworks.com

## License

MIT License - See LICENSE file

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

---

**Built by SMF Works** | https://smfworks.com