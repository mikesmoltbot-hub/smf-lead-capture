import React from 'react'
import { Routes, Route, NavLink } from 'react-router-dom'
import { LayoutDashboard, GitBranch, Users, Settings } from 'lucide-react'
import Dashboard from './pages/Dashboard'
import FlowBuilder from './pages/FlowBuilder'
import Leads from './pages/Leads'

function App() {
  return (
    <div style={{ display: 'flex', height: '100vh', background: '#f5f5f5' }}>
      {/* Sidebar */}
      <nav style={{
        width: '240px',
        background: '#1a1a2e',
        color: 'white',
        padding: '20px'
      }}>
        <div style={{ marginBottom: '30px' }}>
          <h1 style={{ fontSize: '20px', fontWeight: 600 }}>SMF Lead Capture</h1>
          <p style={{ fontSize: '12px', opacity: 0.6, marginTop: '5px' }}>Visual Dashboard</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <NavLink
            to="/"
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              borderRadius: '8px',
              textDecoration: 'none',
              color: isActive ? '#fff' : '#888',
              background: isActive ? '#0066CC' : 'transparent'
            })}
          >
            <LayoutDashboard size={20} />
            Dashboard
          </NavLink>

          <NavLink
            to="/flows"
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              borderRadius: '8px',
              textDecoration: 'none',
              color: isActive ? '#fff' : '#888',
              background: isActive ? '#0066CC' : 'transparent'
            })}
          >
            <GitBranch size={20} />
            Flow Builder
          </NavLink>

          <NavLink
            to="/leads"
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              borderRadius: '8px',
              textDecoration: 'none',
              color: isActive ? '#fff' : '#888',
              background: isActive ? '#0066CC' : 'transparent'
            })}
          >
            <Users size={20} />
            Leads
          </NavLink>
        </div>
      </nav>

      {/* Main Content */}
      <main style={{ flex: 1, overflow: 'auto', padding: '30px' }}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/flows" element={<FlowBuilder />} />
          <Route path="/leads" element={<Leads />} />
        </Routes>
      </main>
    </div>
  )
}

export default App