# SMF Works Customer Zero Setup

This document outlines the setup for SMF Works as the first customer using SMF Lead Capture.

## What's Been Set Up

### 1. Production Configuration
- **File**: `config.production.yaml`
- **Purpose**: Production-ready configuration for smfworks.com
- **Features**:
  - 4 qualification questions (service, timeline, budget, team size)
  - Hot/warm/cold lead routing
  - After-hours auto-reply (9am-6pm ET)
  - Placeholder credentials for HubSpot, SendGrid, Twilio

### 2. Website Integration
- **Component**: `smfworks-site/components/SMFLeadCaptureWidget.tsx`
- **Integration**: Added to `app/layout.tsx`
- **Features**:
  - Dynamic script loading
  - Client-side only rendering
  - Configurable via environment variables

### 3. Installation Script
- **File**: `install.sh`
- **Purpose**: Automated Ubuntu server deployment
- **Features**:
  - Systemd service setup
  - Virtual environment
  - User creation
  - Environment file template

## Deployment Steps

### Step 1: Deploy Backend Server

```bash
# On your Ubuntu server
cd /opt
sudo git clone https://github.com/smfworks/smf-lead-capture.git
cd smf-lead-capture

# Copy production config
sudo cp config.production.yaml config.yaml

# Create environment file
sudo nano .env
```

Add to `.env`:
```
SECRET_KEY=your-secure-random-key
API_KEY=your-api-key-for-website
DATABASE_URL=sqlite:///data/smf_leads.db
SENDGRID_API_KEY=your-sendgrid-key
OWNER_EMAIL=michael@smfworks.com
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
TWILIO_PHONE_NUMBER=your-twilio-number
OWNER_PHONE=+19194494107
HUBSPOT_API_KEY=your-hubspot-key
WEBHOOK_SECRET=your-webhook-secret
```

```bash
# Run installer
sudo bash install.sh

# Start service
sudo systemctl start smf-lead-capture
sudo systemctl status smf-lead-capture
```

### Step 2: Configure Website

Update `smfworks-site/.env.local`:
```
NEXT_PUBLIC_SMF_API_URL=https://api.smfworks.com  # or your server URL
NEXT_PUBLIC_SMF_API_KEY=your-api-key-from-above
```

Deploy website changes:
```bash
cd /path/to/smfworks-site
vercel deploy
```

### Step 3: Test Integration

1. Visit smfworks.com
2. Look for chat widget in bottom-right corner
3. Submit a test lead
4. Check dashboard at `https://api.smfworks.com`
5. Verify email notification received

## Testing Checklist

### Basic Functionality
- [ ] Widget loads on website
- [ ] Greeting message displays correctly
- [ ] Can type and send messages
- [ ] Qualification questions work
- [ ] Lead appears in dashboard
- [ ] Email notification sent

### Lead Qualification
- [ ] All 4 questions work correctly
- [ ] Scoring calculates properly
- [ ] Hot leads trigger immediate notification
- [ ] Warm leads enter nurture sequence
- [ ] Cold leads handled appropriately

### Time-Based Features
- [ ] After-hours auto-reply works (test after 6pm ET)
- [ ] Business hours detection correct
- [ ] Weekend handling works

### API Endpoints
- [ ] POST /api/v1/leads works
- [ ] GET /api/v1/leads returns data
- [ ] POST /api/v1/chat responds
- [ ] Dashboard accessible

## WhatsApp/Telegram Setup (Phase 2)

Once basic widget is working:

### WhatsApp Business API

1. Create Meta Business account: https://business.facebook.com
2. Apply for WhatsApp Business API access
3. Get phone number approved
4. Update `config.yaml`:

```yaml
channels:
  whatsapp:
    enabled: true
    access_token: "your-access-token"
    phone_number_id: "your-phone-number-id"
    verify_token: "your-verify-token"
```

5. Configure webhook in Meta dashboard to point to `https://api.smfworks.com/webhooks/whatsapp`

### Telegram Bot

1. Create bot with BotFather: https://t.me/botfather
2. Get bot token
3. Update `config.yaml`:

```yaml
channels:
  telegram:
    enabled: true
    bot_token: "your-bot-token"
    webhook_secret: "your-webhook-secret"
```

4. Set webhook: `https://api.telegram.org/bot<token>/setWebhook?url=https://api.smfworks.com/webhooks/telegram`

## ML Model Training (Phase 3)

After collecting 100+ leads:

1. Export lead data from dashboard
2. Label leads (1 = converted, 0 = not)
3. Train model via API:

```bash
curl -X POST https://api.smfworks.com/api/v1/ml/train \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"leads": [...], "labels": [...]}'
```

## Troubleshooting

### Widget Not Loading
- Check browser console for errors
- Verify CORS settings include your domain
- Ensure API server is running and accessible

### CORS Errors
Add domain to `config.yaml`:
```yaml
server:
  cors_origins:
    - "https://smfworks.com"
```

### Email Not Sending
- Verify SendGrid API key
- Check spam folders
- Review server logs: `sudo journalctl -u smf-lead-capture -f`

### Leads Not Appearing
- Check database connection
- Verify API key is correct
- Review server logs for errors

## Monitoring

### Server Health
```bash
# Check service status
sudo systemctl status smf-lead-capture

# View logs
sudo journalctl -u smf-lead-capture -f

# Check resource usage
htop
```

### Database
```bash
# SQLite
sqlite3 /opt/smf-lead-capture/data/smf_leads.db "SELECT COUNT(*) FROM leads;"
```

### Metrics
Visit dashboard at `https://api.smfworks.com/api/v1/metrics`

## Next Steps

1. **Test thoroughly** - Run through entire user journey
2. **Fix any issues** - Document bugs and fixes
3. **Add integrations** - Connect HubSpot, send test leads
4. **Enable multi-channel** - Add WhatsApp/Telegram
5. **Train ML** - After 100+ leads collected
6. **Production ready** - Security audit, performance tuning

## Support

For issues:
1. Check logs: `sudo journalctl -u smf-lead-capture -f`
2. Test API directly with curl/postman
3. Review config.yaml for errors
4. Check environment variables are loaded
