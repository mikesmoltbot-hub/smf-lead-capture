# Website Integration Guide - SMF Works

This guide shows how to integrate SMF Lead Capture into the smfworks.com website.

## Quick Integration

Add this code to the `<head>` of your website:

```html
<!-- SMF Lead Capture Widget -->
<script>
  (function() {
    // Configuration
    window.SMFLeadCapture = {
      apiUrl: 'https://api.smfworks.com', // Update with your actual API endpoint
      apiKey: 'YOUR_API_KEY_HERE', // Get from your .env file
      widgetConfig: {
        position: 'bottom-right',
        primaryColor: '#0066CC',
        greeting: "👋 Hi! How can we help you today?",
        placeholder: "Type your message..."
      }
    };
    
    // Load widget script
    var script = document.createElement('script');
    script.src = window.SMFLeadCapture.apiUrl + '/widget.js';
    script.async = true;
    document.head.appendChild(script);
  })();
</script>
```

## Installation Options

### Option 1: Direct Script (Recommended for testing)

1. Add the script above to your website's `<head>` section
2. Replace `YOUR_API_KEY_HERE` with the actual API key
3. Update `apiUrl` to your server URL

### Option 2: Next.js Integration

For Next.js sites (like smfworks.com):

```tsx
// components/SMFLeadCaptureWidget.tsx
import { useEffect } from 'react';

export default function SMFLeadCaptureWidget() {
  useEffect(() => {
    // Only load on client side
    if (typeof window === 'undefined') return;
    
    window.SMFLeadCapture = {
      apiUrl: process.env.NEXT_PUBLIC_SMF_API_URL || 'http://localhost:5000',
      apiKey: process.env.NEXT_PUBLIC_SMF_API_KEY,
      widgetConfig: {
        position: 'bottom-right',
        primaryColor: '#0066CC',
        greeting: "👋 Hi! How can we help you today?"
      }
    };
    
    const script = document.createElement('script');
    script.src = `${window.SMFLeadCapture.apiUrl}/widget.js`;
    script.async = true;
    document.body.appendChild(script);
    
    return () => {
      // Cleanup
      const existing = document.querySelector('script[src*="widget.js"]');
      if (existing) existing.remove();
    };
  }, []);
  
  return null;
}
```

Then add to your `_app.tsx` or layout:

```tsx
import SMFLeadCaptureWidget from '@/components/SMFLeadCaptureWidget';

export default function Layout({ children }) {
  return (
    <>
      {children}
      <SMFLeadCaptureWidget />
    </>
  );
}
```

## Environment Variables

Add to your `.env.local`:

```
NEXT_PUBLIC_SMF_API_URL=https://api.smfworks.com
NEXT_PUBLIC_SMF_API_KEY=your-api-key-here
```

## Testing the Integration

1. Start the SMF Lead Capture server locally:
   ```bash
   cd /path/to/smf-lead-capture
   python -m smf_lead_capture server
   ```

2. Update your `.env.local` to point to localhost:
   ```
   NEXT_PUBLIC_SMF_API_URL=http://localhost:5000
   ```

3. Visit your website and test the chat widget

4. Check the dashboard at `http://localhost:5000`

## Deployment Checklist

Before going live:

- [ ] Server deployed and accessible
- [ ] SSL certificate configured (HTTPS required for production)
- [ ] Database initialized and backed up
- [ ] API keys configured in `.env`
- [ ] Email/SMS notifications tested
- [ ] CRM integration configured
- [ ] Rate limiting tested
- [ ] Domain added to CORS origins
- [ ] Webhook URLs configured (for WhatsApp/Telegram later)

## Troubleshooting

### Widget not loading

1. Check browser console for errors
2. Verify API URL is accessible
3. Check CORS settings in server config

### CORS errors

Add your domain to `config.yaml`:

```yaml
server:
  cors_origins:
    - "https://smfworks.com"
    - "https://www.smfworks.com"
```

### API authentication errors

Verify API key is correct and passed in requests.

## Next Steps

After widget is working:

1. **Test lead flow** - Submit test leads, verify notifications
2. **Customize qualification** - Adjust questions for your services
3. **Set up CRM** - Connect HubSpot, test lead sync
4. **Enable multi-channel** - Add WhatsApp/Telegram when ready
5. **Train ML model** - After 100+ leads, train scoring model

## Support

Issues? Check:
- Server logs: `journalctl -u smf-lead-capture -f`
- Dashboard: View leads at `/api/v1/leads`
- Documentation: `/docs/API.md` for full API reference
