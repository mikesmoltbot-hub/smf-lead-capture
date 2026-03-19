import React, { useState, useEffect } from 'react'
import { Search, Filter, Download, Mail, Phone, Flame, Snowflake, TrendingUp, Calendar, MoreVertical, ChevronLeft, ChevronRight } from 'lucide-react'

function Leads() {
  const [leads, setLeads] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    source: '',
    search: ''
  })
  const [pagination, setPagination] = useState({
    limit: 20,
    offset: 0
  })
  const [selectedLead, setSelectedLead] = useState(null)

  useEffect(() => {
    fetchLeads()
  }, [filters, pagination])

  const fetchLeads = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        limit: pagination.limit,
        offset: pagination.offset,
        ...filters
      })
      
      const response = await fetch(`/api/v1/leads?${params}`)
      const data = await response.json()
      
      setLeads(data.leads || [])
      setTotal(data.total || 0)
    } catch (error) {
      console.error('Failed to fetch leads:', error)
    } finally {
      setLoading(false)
    }
  }

  const exportLeads = async (format) => {
    try {
      const response = await fetch(`/api/v1/leads/export?format=${format}`)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `leads.${format}`
      a.click()
    } catch (error) {
      console.error('Export failed:', error)
    }
  }

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'hot':
        return <Flame size={16} color="#ff6b6b" />
      case 'warm':
        return <TrendingUp size={16} color="#feca57" />
      case 'cold':
        return <Snowflake size={16} color="#48dbfb" />
      default:
        return null
    }
  }

  const getCategoryColor = (category) => {
    switch (category) {
      case 'hot':
        return '#ff6b6b'
      case 'warm':
        return '#feca57'
      case 'cold':
        return '#48dbfb'
      default:
        return '#888'
    }
  }

  const totalPages = Math.ceil(total / pagination.limit)
  const currentPage = Math.floor(pagination.offset / pagination.limit) + 1

  return (
    <div>
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 600, marginBottom: '8px' }}>Leads</h1>
        <p style={{ color: '#666' }}>Manage and track all captured leads</p>
      </div>

      {/* Filters */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '20px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
      }}>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Search */}
          <div style={{ position: 'relative', flex: 1, minWidth: '250px' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#888' }} />
            <input
              type="text"
              placeholder="Search leads..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              style={{
                width: '100%',
                padding: '10px 12px 10px 40px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                fontSize: '14px'
              }}
            />
          </div>

          {/* Category Filter */}
          <select
            value={filters.category}
            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            style={{ padding: '10px 14px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px' }}
          >
            <option value="">All Categories</option>
            <option value="hot">Hot Leads</option>
            <option value="warm">Warm Leads</option>
            <option value="cold">Cold Leads</option>
          </select>

          {/* Status Filter */}
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            style={{ padding: '10px 14px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px' }}
          >
            <option value="">All Statuses</option>
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="qualified">Qualified</option>
            <option value="converted">Converted</option>
            <option value="lost">Lost</option>
          </select>

          {/* Export */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => exportLeads('csv')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '10px 16px',
                background: '#f5f5f5',
                border: '1px solid #ddd',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              <Download size={16} />
              CSV
            </button>
            <button
              onClick={() => exportLeads('json')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '10px 16px',
                background: '#f5f5f5',
                border: '1px solid #ddd',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              <Download size={16} />
              JSON
            </button>
          </div>
        </div>
      </div>

      {/* Leads Table */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        overflow: 'hidden'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8f9fa', borderBottom: '1px solid #e0e0e0' }}>
              <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#666', textTransform: 'uppercase' }}>Lead</th>
              <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#666', textTransform: 'uppercase' }}>Category</th>
              <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#666', textTransform: 'uppercase' }}>Source</th>
              <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#666', textTransform: 'uppercase' }}>Date</th>
              <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#666', textTransform: 'uppercase' }}>Status</th>
              <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#666', textTransform: 'uppercase' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: '#888' }}>
                  Loading leads...
                </td>
              </tr>
            ) : leads.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: '#888' }}>
                  No leads found. Install the widget to start capturing.
                </td>
              </tr>
            ) : (
              leads.map((lead) => (
                <tr
                  key={lead.id}
                  style={{ borderBottom: '1px solid #e0e0e0', cursor: 'pointer' }}
                  onClick={() => setSelectedLead(lead)}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#f8f9fa'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          background: getCategoryColor(lead.score_category) + '20',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 600,
                          color: getCategoryColor(lead.score_category)
                        }}
                      >
                        {(lead.name || '?').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p style={{ fontWeight: 600 }}>{lead.name || 'Anonymous'}</p>
                        <p style={{ fontSize: '13px', color: '#666' }}>{lead.email}</p>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {getCategoryIcon(lead.score_category)}
                      <span
                        style={{
                          padding: '4px 12px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: 600,
                          textTransform: 'uppercase',
                          background: getCategoryColor(lead.score_category) + '20',
                          color: getCategoryColor(lead.score_category)
                        }}
                      >
                        {lead.score_category}
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: '16px', fontSize: '14px', color: '#333' }}>
                    {lead.source || 'Unknown'}
                  </td>
                  <td style={{ padding: '16px', fontSize: '14px', color: '#666' }}>
                    {new Date(lead.created_at).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '16px' }}>
                    <span
                      style={{
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: 600,
                        textTransform: 'capitalize',
                        background:
                          lead.status === 'converted' ? '#27ae6020' :
                          lead.status === 'contacted' ? '#0066CC20' :
                          lead.status === 'lost' ? '#e74c3c20' : '#feca5720',
                        color:
                          lead.status === 'converted' ? '#27ae60' :
                          lead.status === 'contacted' ? '#0066CC' :
                          lead.status === 'lost' ? '#e74c3c' : '#f39c12'
                      }}
                    >
                      {lead.status}
                    </span>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          window.location.href = `mailto:${lead.email}`
                        }}
                        style={{
                          padding: '8px',
                          background: '#f5f5f5',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer'
                        }}
                        title="Send email"
                      >
                        <Mail size={16} />
                      </button>
                      {lead.phone && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            window.location.href = `tel:${lead.phone}`
                          }}
                          style={{
                            padding: '8px',
                            background: '#f5f5f5',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer'
                          }}
                          title="Call"
                        >
                          <Phone size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 20px',
          borderTop: '1px solid #e0e0e0'
        }}>
          <p style={{ fontSize: '14px', color: '#666' }}>
            Showing {pagination.offset + 1} to {Math.min(pagination.offset + pagination.limit, total)} of {total} leads
          </p>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setPagination({ ...pagination, offset: Math.max(0, pagination.offset - pagination.limit) })}
              disabled={pagination.offset === 0}
              style={{
                padding: '8px 12px',
                background: pagination.offset === 0 ? '#f5f5f5' : 'white',
                border: '1px solid #ddd',
                borderRadius: '6px',
                cursor: pagination.offset === 0 ? 'not-allowed' : 'pointer',
                opacity: pagination.offset === 0 ? 0.5 : 1
              }}
            >
              <ChevronLeft size={16} />
            </button>
            <span style={{ padding: '8px 12px', fontSize: '14px' }}>
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setPagination({ ...pagination, offset: pagination.offset + pagination.limit })}
              disabled={pagination.offset + pagination.limit >= total}
              style={{
                padding: '8px 12px',
                background: pagination.offset + pagination.limit >= total ? '#f5f5f5' : 'white',
                border: '1px solid #ddd',
                borderRadius: '6px',
                cursor: pagination.offset + pagination.limit >= total ? 'not-allowed' : 'pointer',
                opacity: pagination.offset + pagination.limit >= total ? 0.5 : 1
              }}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Lead Detail Modal */}
      {selectedLead && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}
          onClick={() => setSelectedLead(null)}
        >
          <div
            style={{
              background: 'white',
              borderRadius: '16px',
              width: '90%',
              maxWidth: '600px',
              maxHeight: '80vh',
              overflow: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ padding: '24px', borderBottom: '1px solid #e0e0e0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 600 }}>Lead Details</h2>
                <button
                  onClick={() => setSelectedLead(null)}
                  style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}
                >
                  ×
                </button>
              </div>
            </div>
            <div style={{ padding: '24px' }}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ fontSize: '12px', color: '#666', textTransform: 'uppercase' }}>Name</label>
                <p style={{ fontSize: '16px', fontWeight: 600 }}>{selectedLead.name || 'Anonymous'}</p>
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ fontSize: '12px', color: '#666', textTransform: 'uppercase' }}>Email</label>
                <p style={{ fontSize: '16px' }}>{selectedLead.email}</p>
              </div>
              {selectedLead.phone && (
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ fontSize: '12px', color: '#666', textTransform: 'uppercase' }}>Phone</label>
                  <p style={{ fontSize: '16px' }}>{selectedLead.phone}</p>
                </div>
              )}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ fontSize: '12px', color: '#666', textTransform: 'uppercase' }}>Score</label>
                <p style={{ fontSize: '16px' }}>{selectedLead.score} ({selectedLead.score_category})</p>
              </div>
              {selectedLead.message && (
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ fontSize: '12px', color: '#666', textTransform: 'uppercase' }}>Message</label>
                  <p style={{ fontSize: '14px', padding: '12px', background: '#f5f5f5', borderRadius: '8px' }}>
                    {selectedLead.message}
                  </p>
                </div>
              )}
              {selectedLead.qualification_data && Object.keys(selectedLead.qualification_data).length > 0 && (
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ fontSize: '12px', color: '#666', textTransform: 'uppercase' }}>Qualification Data</label>
                  <pre style={{ fontSize: '13px', padding: '12px', background: '#f5f5f5', borderRadius: '8px', overflow: 'auto' }}>
                    {JSON.stringify(selectedLead.qualification_data, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Leads