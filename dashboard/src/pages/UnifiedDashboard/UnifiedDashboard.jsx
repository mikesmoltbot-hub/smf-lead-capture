import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Layers, Users, Database, TrendingUp, ArrowRight, Activity, CheckCircle, Clock } from 'lucide-react'

function UnifiedDashboard() {
  const [metrics, setMetrics] = useState({
    leadCapture: { total: 0, hot: 0, newThisWeek: 0 },
    simpleCMS: { total: 0, pending: 0, newThisWeek: 0 },
    combined: { totalLeads: 0, activeTasks: 0, conversionRate: 0 }
  })

  useEffect(() => {
    // Fetch combined metrics from both systems
    fetchMetrics()
  }, [])

  const fetchMetrics = async () => {
    // In production, this would call both APIs and combine
    // For now, using mock data
    setMetrics({
      leadCapture: { total: 124, hot: 15, newThisWeek: 23 },
      simpleCMS: { total: 47, pending: 8, newThisWeek: 12 },
      combined: { totalLeads: 171, activeTasks: 8, conversionRate: 12.5 }
    })
  }

  return (
    <div>
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 600, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Layers size={32} color="#9b59b6" />
          Unified Dashboard
        </h1>
        <p style={{ color: '#666' }}>Your central hub for the SMF Business Suite</p>
      </div>

      {/* System Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '24px',
        marginBottom: '30px'
      }}>
        {/* Lead Capture Card */}
        <Link to="/lead-capture" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div style={{
            background: 'linear-gradient(135deg, #0066CC 0%, #0052a3 100%)',
            borderRadius: '16px',
            padding: '28px',
            color: 'white',
            boxShadow: '0 4px 12px rgba(0,102,204,0.3)',
            transition: 'transform 0.2s',
            cursor: 'pointer'
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  <Users size={24} />
                  <h2 style={{ fontSize: '22px', fontWeight: 600 }}>Lead Capture</h2>
                </div>
                <p style={{ opacity: 0.9, fontSize: '14px' }}>AI-powered lead capture with ML scoring</p>
              </div>
              
              <ArrowRight size={24} opacity={0.7} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
              <div>
                <p style={{ fontSize: '12px', opacity: 0.8, marginBottom: '4px' }}>Total Leads</p>
                <p style={{ fontSize: '32px', fontWeight: 700 }}>{metrics.leadCapture.total}</p>
              </div>
              
              <div>
                <p style={{ fontSize: '12px', opacity: 0.8, marginBottom: '4px' }}>Hot Leads</p>
                <p style={{ fontSize: '32px', fontWeight: 700, color: '#ff6b6b' }}>{metrics.leadCapture.hot}</p>
              </div>
              
              <div>
                <p style={{ fontSize: '12px', opacity: 0.8, marginBottom: '4px' }}>New This Week</p>
                <p style={{ fontSize: '32px', fontWeight: 700 }}>+{metrics.leadCapture.newThisWeek}</p>
              </div>
            </div>
          </div>
        </Link>

        {/* Simple CMS Card */}
        <Link to="/simple-cms" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div style={{
            background: 'linear-gradient(135deg, #27ae60 0%, #1e8449 100%)',
            borderRadius: '16px',
            padding: '28px',
            color: 'white',
            boxShadow: '0 4px 12px rgba(39,174,96,0.3)',
            transition: 'transform 0.2s',
            cursor: 'pointer'
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  <Database size={24} />
                  <h2 style={{ fontSize: '22px', fontWeight: 600 }}>Simple CRM</h2>
                </div>
                <p style={{ opacity: 0.9, fontSize: '14px' }}>Lightweight lead management for small business</p>
              </div>
              
              <ArrowRight size={24} opacity={0.7} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
              <div>
                <p style={{ fontSize: '12px', opacity: 0.8, marginBottom: '4px' }}>Total Leads</p>
                <p style={{ fontSize: '32px', fontWeight: 700 }}>{metrics.simpleCMS.total}</p>
              </div>
              
              <div>
                <p style={{ fontSize: '12px', opacity: 0.8, marginBottom: '4px' }}>Pending Tasks</p>
                <p style={{ fontSize: '32px', fontWeight: 700, color: '#feca57' }}>{metrics.simpleCMS.pending}</p>
              </div>
              
              <div>
                <p style={{ fontSize: '12px', opacity: 0.8, marginBottom: '4px' }}>New This Week</p>
                <p style={{ fontSize: '32px', fontWeight: 700 }}>+{metrics.simpleCMS.newThisWeek}</p>
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* Combined Metrics */}
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '24px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        marginBottom: '30px'
      }}>
        <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <TrendingUp size={20} color="#9b59b6" />
          Combined Metrics
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
          <MetricItem icon={<Users size={20} />} label="Total Leads Across Systems" value={metrics.combined.totalLeads} color="#9b59b6" />
          <MetricItem icon={<Clock size={20} />} label="Active Tasks" value={metrics.combined.activeTasks} color="#f39c12" />
          <MetricItem icon={<CheckCircle size={20} />} label="Conversion Rate" value={`${metrics.combined.conversionRate}%`} color="#27ae60" />
          <MetricItem icon={<Activity size={20} />} label="Systems Active" value="2/2" color="#3498db" />
        </div>
      </div>

      {/* Quick Links */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '16px'
      }}>
        <QuickLinkCard 
          title="Integration Hub"
          description="Manage connections between systems"
          to="/integration"
          color="#9b59b6"
          icon={<Layers size={20} />}
        />
        
        <QuickLinkCard 
          title="Flow Builder"
          description="Customize lead capture flows"
          to="/lead-capture/flows"
          color="#0066CC"
          icon={<Activity size={20} />}
        />
        
        <QuickLinkCard 
          title="Tasks"
          description="View pending follow-ups"
          to="/simple-cms/tasks"
          color="#f39c12"
          icon={<Clock size={20} />}
        />
      </div>
    </div>
  )
}

function MetricItem({ icon, label, value, color }) {
  return (
    <div style={{
      padding: '20px',
      background: '#f8f9fa',
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      gap: '16px'
    }}>
      <div style={{
        width: '48px',
        height: '48px',
        borderRadius: '12px',
        background: `${color}20`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: color
      }}>
        {icon}
      </div>
      
      <div>
        <p style={{ color: '#666', fontSize: '13px', marginBottom: '4px' }}>{label}</p>
        <p style={{ fontSize: '24px', fontWeight: 700, color }}>{value}</p>
      </div>
    </div>
  )
}

function QuickLinkCard({ title, description, to, color, icon }) {
  return (
    <Link to={to} style={{ textDecoration: 'none', color: 'inherit' }}>
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '20px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        borderLeft: `4px solid ${color}`,
        transition: 'transform 0.2s',
        cursor: 'pointer'
      }}
      onMouseEnter={e => e.currentTarget.style.transform = 'translateX(4px)'}
      onMouseLeave={e => e.currentTarget.style.transform = 'translateX(0)'}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <span style={{ color }}>{icon}</span>
          <h4 style={{ fontWeight: 600 }}>{title}</h4>
        </div>
        
        <p style={{ fontSize: '14px', color: '#666' }}>{description}</p>
      </div>
    </Link>
  )
}

export default UnifiedDashboard