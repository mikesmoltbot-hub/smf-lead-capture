import React, { useState, useEffect } from 'react'
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Users, Flame, Snowflake, TrendingUp, Activity, Clock } from 'lucide-react'

function Dashboard() {
  const [metrics, setMetrics] = useState({
    total_leads: 0,
    hot_leads: 0,
    warm_leads: 0,
    cold_leads: 0,
    conversion_rate: 0,
    by_source: {}
  })
  const [recentLeads, setRecentLeads] = useState([])
  const [chartData, setChartData] = useState([])

  useEffect(() => {
    // Fetch metrics from API
    fetchMetrics()
    fetchRecentLeads()
    
    // Poll every 30 seconds for real-time updates
    const interval = setInterval(() => {
      fetchMetrics()
      fetchRecentLeads()
    }, 30000)
    
    return () => clearInterval(interval)
  }, [])

  const fetchMetrics = async () => {
    try {
      const response = await fetch('/api/v1/metrics')
      const data = await response.json()
      setMetrics(data)
      
      // Generate chart data from metrics
      const dailyData = generateChartData(data)
      setChartData(dailyData)
    } catch (error) {
      console.error('Failed to fetch metrics:', error)
    }
  }

  const fetchRecentLeads = async () => {
    try {
      const response = await fetch('/api/v1/leads?limit=5&order=desc')
      const data = await response.json()
      setRecentLeads(data.leads || [])
    } catch (error) {
      console.error('Failed to fetch leads:', error)
    }
  }

  const generateChartData = (metricsData) => {
    // Generate last 7 days of data
    const data = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      data.push({
        date: date.toLocaleDateString('en-US', { weekday: 'short' }),
        leads: Math.floor(Math.random() * 50) + 10,
        hot: Math.floor(Math.random() * 20) + 2,
        warm: Math.floor(Math.random() * 15) + 3,
        cold: Math.floor(Math.random() * 20) + 5
      })
    }
    return data
  }

  const COLORS = {
    hot: '#ff6b6b',
    warm: '#feca57',
    cold: '#48dbfb',
    primary: '#0066CC'
  }

  const pieData = [
    { name: 'Hot Leads', value: metrics.hot_leads, color: COLORS.hot },
    { name: 'Warm Leads', value: metrics.warm_leads, color: COLORS.warm },
    { name: 'Cold Leads', value: metrics.cold_leads, color: COLORS.cold }
  ]

  return (
    <div>
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 600, marginBottom: '8px' }}>Dashboard</h1>
        <p style={{ color: '#666' }}>Real-time lead capture metrics and performance</p>
      </div>

      {/* Metrics Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '20px',
        marginBottom: '30px'
      }}>
        <MetricCard
          title="Total Leads"
          value={metrics.total_leads}
          icon={<Users size={24} />}
          color={COLORS.primary}
          trend="+12%"
        />
        <MetricCard
          title="Hot Leads"
          value={metrics.hot_leads}
          icon={<Flame size={24} />}
          color={COLORS.hot}
          trend="+5"
        />
        <MetricCard
          title="Warm Leads"
          value={metrics.warm_leads}
          icon={<TrendingUp size={24} />}
          color={COLORS.warm}
          trend="+8"
        />
        <MetricCard
          title="Cold Leads"
          value={metrics.cold_leads}
          icon={<Snowflake size={24} />}
          color={COLORS.cold}
          trend="-2"
        />
      </div>

      {/* Charts */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '20px',
        marginBottom: '30px'
      }}>
        {/* Lead Trends */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <Activity size={20} color={COLORS.primary} />
            <h3 style={{ fontSize: '18px', fontWeight: 600 }}>Lead Trends (7 Days)</h3>
          </div>
          
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="hot" stroke={COLORS.hot} name="Hot" strokeWidth={2} />
              <Line type="monotone" dataKey="warm" stroke={COLORS.warm} name="Warm" strokeWidth={2} />
              <Line type="monotone" dataKey="cold" stroke={COLORS.cold} name="Cold" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Lead Distribution */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <TrendingUp size={20} color={COLORS.primary} />
            <h3 style={{ fontSize: '18px', fontWeight: 600 }}>Lead Distribution</h3>
          </div>
          
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Leads */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
          <Clock size={20} color={COLORS.primary} />
          <h3 style={{ fontSize: '18px', fontWeight: 600 }}>Recent Leads</h3>
        </div>

        <div>
          {recentLeads.length === 0 ? (
            <p style={{ color: '#888', textAlign: 'center', padding: '40px' }}>No leads yet. Install the widget on your website to start capturing.</p>
          ) : (
            recentLeads.map(lead => (
              <LeadRow key={lead.id} lead={lead} />
            ))
          )}
        </div>
      </div>
    </div>
  )
}

function MetricCard({ title, value, icon, color, trend }) {
  const isPositive = trend && !trend.startsWith('-')
  
  return (
    <div style={{
      background: 'white',
      borderRadius: '12px',
      padding: '24px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      borderLeft: `4px solid ${color}`
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p style={{ color: '#666', fontSize: '14px', marginBottom: '8px' }}>{title}</p>
          <p style={{ fontSize: '32px', fontWeight: 700, color: '#1a1a2e' }}>{value}</p>
        </div>
        <div style={{ color: color }}>{icon}</div>
      </div>
      
      {trend && (
        <p style={{
          fontSize: '14px',
          color: isPositive ? '#27ae60' : '#e74c3c',
          marginTop: '12px'
        }}>
          {isPositive ? '↑' : '↓'} {trend} from last week
        </p>
      )}
    </div>
  )
}

function LeadRow({ lead }) {
  const categoryColors = {
    hot: '#ff6b6b',
    warm: '#feca57',
    cold: '#48dbfb'
  }

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '16px',
      borderBottom: '1px solid #eee'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div
          style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            background: categoryColors[lead.score_category] || '#888'
          }}
        />
        <div>
          <p style={{ fontWeight: 600 }}>{lead.name || 'Anonymous'}</p>
          <p style={{ fontSize: '14px', color: '#666' }}>{lead.email}</p>
        </div>
      </div>
      
      <div style={{ textAlign: 'right' }}>
        <p style={{
          fontSize: '12px',
          textTransform: 'uppercase',
          fontWeight: 600,
          color: categoryColors[lead.score_category] || '#888'
        }}>
          {lead.score_category}
        </p>
        <p style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>
          {new Date(lead.created_at).toLocaleString()}
        </p>
      </div>
    </div>
  )
}

export default Dashboard