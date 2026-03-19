import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeftRight, Mail, MessageSquare, Database, CheckCircle, AlertCircle, RefreshCw, Settings } from 'lucide-react'

function IntegrationHub() {
  const [integrations, setIntegrations] = useState([
    {
      id: 'gmail',
      name: 'Gmail SMTP',
      description: 'Email notifications via Gmail/Google Workspace',
      icon: <Mail size={24} />,
      color: '#ea4335',
      status: 'connected',
      connected: true
    },
    {
      id: 'whatsapp',
      name: 'WhatsApp Business',
      description: 'Receive hot lead alerts on WhatsApp',
      icon: <MessageSquare size={24} />,
      color: '#25d366',
      status: 'not_configured',
      connected: false
    },
    {
      id: 'telegram',
      name: 'Telegram Bot',
      description: 'Get notifications via Telegram',
      icon: <MessageSquare size={24} />,
      color: '#0088cc',
      status: 'not_configured',
      connected: false
    },
    {
      id: 'hubspot',
      name: 'HubSpot CRM',
      description: 'Sync leads to HubSpot automatically',
      icon: <Database size={24} />,
      color: '#ff7a59',
      status: 'not_configured',
      connected: false
    }
  ])

  const toggleIntegration = (id) => {
    setIntegrations(integrations.map(int => 
      int.id === id 
        ? { ...int, connected: !int.connected, status: !int.connected ? 'connected' : 'not_configured' }
        : int
    ))
  }

  const testConnection = (id) => {
    alert(`Testing ${id} connection...`)
  }

  return (
    <div>
      <div style={{ marginBottom: '30px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <ArrowLeftRight size={32} color="#9b59b6" />
          <h1 style={{ fontSize: '28px', fontWeight: 600 }}>Integration Hub</h1>
        </div>
        <p style={{ color: '#666' }}>Connect your tools and services to SMF Dashboard</p>
      </div>

      {/* Active Connections Summary */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px',
        marginBottom: '30px'
      }}>
        <SummaryCard 
          title="Active Connections"
          value={integrations.filter(i => i.connected).length}
          total={integrations.length}
          color="#27ae60"
        />
        
        <SummaryCard 
          title="Available"
          value={integrations.filter(i => !i.connected).length}
          total={integrations.length}
          color="#3498db"
        />
        
        <SummaryCard 
          title="Last Sync"
          value="Just now"
          color="#9b59b6"
        />
      </div>

      {/* Integrations List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {integrations.map(integration => (
          <IntegrationCard 
            key={integration.id}
            integration={integration}
            onToggle={() => toggleIntegration(integration.id)}
            onTest={() => testConnection(integration.id)}
          />
        ))}
      </div>

      {/* Settings Section */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '24px',
        marginTop: '30px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
          <Settings size={20} color="#666" />
          <h3 style={{ fontSize: '18px', fontWeight: 600 }}>Global Settings</h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          <SettingRow 
            label="Auto-sync new leads"
            description="Automatically sync all leads to connected CRMs"
            enabled={true}
          />
          
          <SettingRow 
            label="Email notifications"
            description="Send email alerts for hot leads"
            enabled={true}
          />
          
          <SettingRow 
            label="Daily summary"
            description="Send daily activity summary"
            enabled={false}
          />
        </div>
      </div>
    </div>
  )
}

function SummaryCard({ title, value, total, color }) {
  return (
    <div style={{
      background: 'white',
      borderRadius: '12px',
      padding: '24px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      borderLeft: `4px solid ${color}`
    }}>
      <p style={{ color: '#666', fontSize: '14px', marginBottom: '8px' }}>{title}</p>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
        <p style={{ fontSize: '32px', fontWeight: 700 }}>{value}</p>
        {total && <span style={{ color: '#888' }}>/ {total}</span>}
      </div>
    </div>
  )
}

function IntegrationCard({ integration, onToggle, onTest }) {
  return (
    <div style={{
      background: 'white',
      borderRadius: '12px',
      padding: '24px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      display: 'flex',
      alignItems: 'center',
      gap: '20px'
    }}>
      {/* Icon */}
      <div style={{
        width: '56px',
        height: '56px',
        borderRadius: '12px',
        background: `${integration.color}20`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: integration.color,
        flexShrink: 0
      }}>
        {integration.icon}
      </div>

      {/* Info */}
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 600 }}>{integration.name}</h3>
          
          {integration.connected ? (
            <span style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 10px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: 600,
              background: '#27ae6020',
              color: '#27ae60'
            }}>
              <CheckCircle size={12} /> Connected
            </span>
          ) : (
            <span style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 10px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: 600,
              background: '#95a5a620',
              color: '#95a5a6'
            }}>
              <AlertCircle size={12} /> Not configured
            </span>
          )}
        </div>
        
        <p style={{ color: '#666', fontSize: '14px' }}>{integration.description}</p>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '10px' }}>
        {integration.connected && (
          <button
            onClick={onTest}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              border: '1px solid #ddd',
              borderRadius: '8px',
              background: 'white',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            <RefreshCw size={14} /> Test
          </button>
        )}
        
        <button
          onClick={onToggle}
          style={{
            padding: '8px 20px',
            border: 'none',
            borderRadius: '8px',
            background: integration.connected ? '#e74c3c' : '#27ae60',
            color: 'white',
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          {integration.connected ? 'Disconnect' : 'Connect'}
        </button>
      </div>
    </div>
  )
}

function SettingRow({ label, description, enabled }) {
  const [isEnabled, setIsEnabled] = useState(enabled)

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div>
        <p style={{ fontWeight: 600, marginBottom: '2px' }}>{label}</p>
        <p style={{ fontSize: '14px', color: '#888' }}>{description}</p>
      </div>

      <button
        onClick={() => setIsEnabled(!isEnabled)}
        style={{
          width: '48px',
          height: '28px',
          borderRadius: '14px',
          border: 'none',
          background: isEnabled ? '#27ae60' : '#ddd',
          cursor: 'pointer',
          position: 'relative',
          transition: 'background 0.2s'
        }}
      >
        <span style={{
          position: 'absolute',
          top: '4px',
          left: isEnabled ? '26px' : '4px',
          width: '20px',
          height: '20px',
          borderRadius: '50%',
          background: 'white',
          transition: 'left 0.2s'
        }} />
      </button>
    </div>
  )
}

export default IntegrationHub