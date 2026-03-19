import React, { useState } from 'react'
import { Routes, Route, NavLink } from 'react-router-dom'
import { LayoutDashboard, GitBranch, Users, Brain, Database, Layers, ArrowLeftRight, Settings, Menu, X } from 'lucide-react'
import LeadCaptureDashboard from './pages/LeadCapture/Dashboard'
import FlowBuilder from './pages/LeadCapture/FlowBuilder'
import Leads from './pages/LeadCapture/Leads'
import MLInsights from './pages/LeadCapture/MLInsights'
import UnifiedDashboard from './pages/UnifiedDashboard/UnifiedDashboard'
import SimpleCMSDashboard from './pages/SimpleCMS/Dashboard'
import SimpleCMSLeads from './pages/SimpleCMS/Leads'
import SimpleCMSTasks from './pages/SimpleCMS/Tasks'
import IntegrationHub from './pages/IntegrationHub/IntegrationHub'

function App() {
  const [activeSystem, setActiveSystem] = useState('unified') // 'unified', 'lead-capture', 'simple-cms'
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#f5f5f5' }}>
      {/* Sidebar */}
      <nav style={{
        width: '260px',
        background: '#1a1a2e',
        color: 'white',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'auto'
      }}>
        {/* Header */}
        <div style={{ marginBottom: '30px' }}>
          <h1 style={{ fontSize: '20px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Layers size={24} color="#0066CC" />
            SMF Business Central
          </h1>
          <p style={{ fontSize: '12px', opacity: 0.6, marginTop: '5px' }}>
            {activeSystem === 'unified' && 'Unified Business Hub'}
            {activeSystem === 'lead-capture' && 'Lead Capture System'}
            {activeSystem === 'simple-cms' && 'Simple CRM'}
          </p>
        </div>

        {/* System Switcher */}
        <div style={{ marginBottom: '24px' }}>
          <p style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.5, marginBottom: '10px' }}>
            Select System
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <NavLink
              to="/"
              onClick={() => setActiveSystem('unified')}
              style={{ textDecoration: 'none' }}
            >
              <SystemButton 
                active={activeSystem === 'unified'} 
                onClick={() => {}}
                icon={<Layers size={16} />}
                label="Unified View"
                color="#9b59b6"
              />
            </NavLink>
            
            <NavLink
              to="/lead-capture"
              onClick={() => setActiveSystem('lead-capture')}
              style={{ textDecoration: 'none' }}
            >
              <SystemButton 
                active={activeSystem === 'lead-capture'} 
                onClick={() => {}}
                icon={<Users size={16} />}
                label="Lead Capture"
                color="#0066CC"
              />
            </NavLink>
            
            <NavLink
              to="/simple-cms"
              onClick={() => setActiveSystem('simple-cms')}
              style={{ textDecoration: 'none' }}
            >
              <SystemButton 
                active={activeSystem === 'simple-cms'} 
                onClick={() => {}}
                icon={<Database size={16} />}
                label="Simple CRM"
                color="#27ae60"
              />
            </NavLink>
          </div>
        </div>

        {/* Navigation based on active system */}
        <div style={{ flex: 1 }}>
          {activeSystem === 'unified' && <UnifiedNav />}
          {activeSystem === 'lead-capture' && <LeadCaptureNav />}
          {activeSystem === 'simple-cms' && <SimpleCMSNav />}
        </div>

        {/* Footer */}
        <div style={{ marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <NavLink
            to="/integration"
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              borderRadius: '8px',
              textDecoration: 'none',
              color: isActive ? '#fff' : '#888',
              background: isActive ? '#0066CC' : 'transparent',
              fontSize: '14px'
            })}
          >
            <ArrowLeftRight size={18} />
            Integration Hub
          </NavLink>
          
          <a
            href="http://localhost:3000"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              borderRadius: '8px',
              textDecoration: 'none',
              color: '#888',
              fontSize: '14px',
              marginTop: '8px'
            }}
          >
            <LayoutDashboard size={18} />
            SMF Dashboard
          </a>
          
          <NavLink
            to="/settings"
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              borderRadius: '8px',
              textDecoration: 'none',
              color: isActive ? '#fff' : '#888',
              background: isActive ? '#0066CC' : 'transparent',
              fontSize: '14px',
              marginTop: '8px'
            })}
          >
            <Settings size={18} />
            Settings
          </NavLink>
        </div>
      </nav>

      {/* Main Content */}
      <main style={{ flex: 1, overflow: 'auto', padding: '30px' }}>
        <Routes>
          {/* Unified */}
          <Route path="/" element={<UnifiedDashboard />} />
          
          {/* Lead Capture */}
          <Route path="/lead-capture" element={<LeadCaptureDashboard />} />
          <Route path="/lead-capture/flows" element={<FlowBuilder />} />
          <Route path="/lead-capture/leads" element={<Leads />} />
          <Route path="/lead-capture/ml" element={<MLInsights />} />
          
          {/* Simple CMS */}
          <Route path="/simple-cms" element={<SimpleCMSDashboard />} />
          <Route path="/simple-cms/leads" element={<SimpleCMSLeads />} />
          <Route path="/simple-cms/tasks" element={<SimpleCMSTasks />} />
          
          {/* Integration */}
          <Route path="/integration" element={<IntegrationHub />} />
          
          {/* Settings */}
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </main>
    </div>
  )
}

function SystemButton({ active, icon, label, color }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '10px 14px',
        borderRadius: '8px',
        background: active ? color : 'transparent',
        color: active ? '#fff' : '#888',
        fontSize: '14px',
        fontWeight: active ? 600 : 400,
        transition: 'all 0.2s',
        width: '100%',
        textAlign: 'left'
      }}
    >
      {icon}
      {label}
    </div>
  )
}

function UnifiedNav() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <p style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.5, marginBottom: '6px' }}>
        Overview
      </p>
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
          background: isActive ? '#9b59b6' : 'transparent',
          fontSize: '14px'
        })}
      >
        <LayoutDashboard size={18} />
        Biz Central
      </NavLink>
    </div>
  )
}

function LeadCaptureNav() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <p style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.5, marginBottom: '6px' }}>
        Lead Capture
      </p>
      <NavLink
        to="/lead-capture"
        style={({ isActive }) => ({
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '12px 16px',
          borderRadius: '8px',
          textDecoration: 'none',
          color: isActive ? '#fff' : '#888',
          background: isActive ? '#0066CC' : 'transparent',
          fontSize: '14px'
        })}
      >
        <LayoutDashboard size={18} />
        Dashboard
      </NavLink>

      <NavLink
        to="/lead-capture/flows"
        style={({ isActive }) => ({
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '12px 16px',
          borderRadius: '8px',
          textDecoration: 'none',
          color: isActive ? '#fff' : '#888',
          background: isActive ? '#0066CC' : 'transparent',
          fontSize: '14px'
        })}
      >
        <GitBranch size={18} />
        Flow Builder
      </NavLink>

      <NavLink
        to="/lead-capture/leads"
        style={({ isActive }) => ({
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '12px 16px',
          borderRadius: '8px',
          textDecoration: 'none',
          color: isActive ? '#fff' : '#888',
          background: isActive ? '#0066CC' : 'transparent',
          fontSize: '14px'
        })}
      >
        <Users size={18} />
        Leads
      </NavLink>

      <NavLink
        to="/lead-capture/ml"
        style={({ isActive }) => ({
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '12px 16px',
          borderRadius: '8px',
          textDecoration: 'none',
          color: isActive ? '#fff' : '#888',
          background: isActive ? '#0066CC' : 'transparent',
          fontSize: '14px'
        })}
      >
        <Brain size={18} />
        ML Insights
      </NavLink>
    </div>
  )
}

function SimpleCMSNav() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <p style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.5, marginBottom: '6px' }}>
        Simple CRM
      </p>
      <NavLink
        to="/simple-cms"
        style={({ isActive }) => ({
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '12px 16px',
          borderRadius: '8px',
          textDecoration: 'none',
          color: isActive ? '#fff' : '#888',
          background: isActive ? '#27ae60' : 'transparent',
          fontSize: '14px'
        })}
      >
        <LayoutDashboard size={18} />
        Dashboard
      </NavLink>

      <NavLink
        to="/simple-cms/leads"
        style={({ isActive }) => ({
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '12px 16px',
          borderRadius: '8px',
          textDecoration: 'none',
          color: isActive ? '#fff' : '#888',
          background: isActive ? '#27ae60' : 'transparent',
          fontSize: '14px'
        })}
      >
        <Users size={18} />
        Leads
      </NavLink>

      <NavLink
        to="/simple-cms/tasks"
        style={({ isActive }) => ({
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '12px 16px',
          borderRadius: '8px',
          textDecoration: 'none',
          color: isActive ? '#fff' : '#888',
          background: isActive ? '#27ae60' : 'transparent',
          fontSize: '14px'
        })}
      >
        <GitBranch size={18} />
        Tasks
      </NavLink>
    </div>
  )
}

function SettingsPage() {
  return (
    <div>
      <h1 style={{ fontSize: '28px', fontWeight: 600, marginBottom: '8px' }}>Settings</h1>
      <p style={{ color: '#666' }}>Configure your SMF Dashboard</p>
      
      <div style={{ 
        background: 'white', 
        borderRadius: '12px', 
        padding: '24px',
        marginTop: '30px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
      }}>
        <h3 style={{ marginBottom: '20px' }}>System Configuration</h3>
        <p style={{ color: '#666' }}>Settings will be configured here...</p>
      </div>
    </div>
  )
}

export default App