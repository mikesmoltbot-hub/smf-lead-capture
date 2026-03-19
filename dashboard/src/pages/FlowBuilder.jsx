import React, { useState, useCallback, useEffect } from 'react'
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Panel
} from 'reactflow'
import 'reactflow/dist/style.css'
import { Play, Save, Download, Upload, Trash2, MessageSquare, HelpCircle, Send, GitBranch } from 'lucide-react'

// Custom node components
const nodeTypes = {
  greeting: GreetingNode,
  question: QuestionNode,
  message: MessageNode,
  condition: ConditionNode,
  action: ActionNode
}

function GreetingNode({ data, selected }) {
  return (
    <div style={{
      padding: '16px 20px',
      background: '#0066CC',
      color: 'white',
      borderRadius: '12px',
      border: selected ? '3px solid #fff' : '3px solid transparent',
      boxShadow: '0 4px 12px rgba(0,102,204,0.3)',
      minWidth: '200px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
        <MessageSquare size={16} />
        <span style={{ fontWeight: 600, fontSize: '14px' }}>Greeting</span>
      </div>
      <p style={{ fontSize: '13px', opacity: 0.9 }}>{data.message || 'Hi! How can I help?'}</p>
    </div>
  )
}

function QuestionNode({ data, selected }) {
  return (
    <div style={{
      padding: '16px 20px',
      background: '#fff',
      border: selected ? '3px solid #0066CC' : '2px solid #e0e0e0',
      borderRadius: '12px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      minWidth: '220px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: '#f39c12' }}>
        <HelpCircle size={16} />
        <span style={{ fontWeight: 600, fontSize: '14px' }}>Question</span>
      </div>
      <p style={{ fontSize: '13px', color: '#333' }}>{data.text || 'Ask something...'}</p>
      {data.options && (
        <div style={{ marginTop: '8px', display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
          {data.options.map((opt, i) => (
            <span key={i} style={{
              fontSize: '11px',
              padding: '2px 8px',
              background: '#f0f0f0',
              borderRadius: '4px',
              color: '#666'
            }}>{opt}</span>
          ))}
        </div>
      )}
    </div>
  )
}

function MessageNode({ data, selected }) {
  return (
    <div style={{
      padding: '16px 20px',
      background: '#fff',
      border: selected ? '3px solid #27ae60' : '2px solid #e0e0e0',
      borderRadius: '12px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      minWidth: '200px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: '#27ae60' }}>
        <MessageSquare size={16} />
        <span style={{ fontWeight: 600, fontSize: '14px' }}>Message</span>
      </div>
      <p style={{ fontSize: '13px', color: '#333' }}>{data.text || 'Message text...'}</p>
    </div>
  )
}

function ConditionNode({ data, selected }) {
  return (
    <div style={{
      padding: '16px 20px',
      background: '#fff',
      border: selected ? '3px solid #9b59b6' : '2px solid #e0e0e0',
      borderRadius: '12px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      minWidth: '180px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: '#9b59b6' }}>
        <GitBranch size={16} />
        <span style={{ fontWeight: 600, fontSize: '14px' }}>Condition</span>
      </div>
      <p style={{ fontSize: '13px', color: '#333' }}>{data.condition || 'If...'}</p>
    </div>
  )
}

function ActionNode({ data, selected }) {
  return (
    <div style={{
      padding: '16px 20px',
      background: '#fff',
      border: selected ? '3px solid #e74c3c' : '2px solid #e0e0e0',
      borderRadius: '12px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      minWidth: '200px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: '#e74c3c' }}>
        <Send size={16} />
        <span style={{ fontWeight: 600, fontSize: '14px' }}>Action</span>
      </div>
      <p style={{ fontSize: '13px', color: '#333' }}>{data.action || 'Send notification'}</p>
    </div>
  )
}

function FlowBuilder() {
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [selectedNode, setSelectedNode] = useState(null)
  const [flowName, setFlowName] = useState('New Flow')
  const [isTesting, setIsTesting] = useState(false)
  const [testMessages, setTestMessages] = useState([])

  // Load initial flow
  useEffect(() => {
    fetchFlow()
  }, [])

  const fetchFlow = async () => {
    try {
      const response = await fetch('/api/v1/flows/default')
      if (response.ok) {
        const data = await response.json()
        setNodes(data.nodes || [])
        setEdges(data.edges || [])
        if (data.name) setFlowName(data.name)
      } else {
        // Create default flow
        setDefaultFlow()
      }
    } catch (error) {
      console.error('Failed to fetch flow:', error)
      setDefaultFlow()
    }
  }

  const setDefaultFlow = () => {
    setNodes([
      {
        id: '1',
        type: 'greeting',
        position: { x: 250, y: 50 },
        data: { message: 'Hi! How can I help you today?' }
      },
      {
        id: '2',
        type: 'question',
        position: { x: 250, y: 200 },
        data: { 
          text: "What's your timeline?",
          field: 'timeline',
          options: ['ASAP', 'This month', 'Later']
        }
      },
      {
        id: '3',
        type: 'question',
        position: { x: 250, y: 380 },
        data: {
          text: "What's your budget?",
          field: 'budget',
          options: ['Under $5K', '$5K-$10K', '$10K+']
        }
      },
      {
        id: '4',
        type: 'message',
        position: { x: 250, y: 550 },
        data: { text: "Thanks! We'll get back to you soon." }
      }
    ])
    setEdges([
      { id: 'e1-2', source: '1', target: '2' },
      { id: 'e2-3', source: '2', target: '3' },
      { id: 'e3-4', source: '3', target: '4' }
    ])
  }

  const onConnect = useCallback((connection) => {
    setEdges((eds) => addEdge(connection, eds))
  }, [setEdges])

  const onNodeClick = (event, node) => {
    setSelectedNode(node)
  }

  const addNode = (type) => {
    const newNode = {
      id: `${nodes.length + 1}`,
      type: type,
      position: { x: 250, y: nodes.length * 150 + 50 },
      data: getDefaultData(type)
    }
    setNodes([...nodes, newNode])
  }

  const getDefaultData = (type) => {
    switch (type) {
      case 'greeting':
        return { message: 'Hi! How can I help?' }
      case 'question':
        return { text: 'Ask a question...', field: 'question_1', options: [] }
      case 'message':
        return { text: 'Your message here...' }
      case 'condition':
        return { condition: 'score > 50' }
      case 'action':
        return { action: 'notify_email' }
      default:
        return {}
    }
  }

  const updateNodeData = (key, value) => {
    if (!selectedNode) return
    
    setNodes(nodes.map(node => {
      if (node.id === selectedNode.id) {
        return {
          ...node,
          data: { ...node.data, [key]: value }
        }
      }
      return node
    }))
    
    setSelectedNode({
      ...selectedNode,
      data: { ...selectedNode.data, [key]: value }
    })
  }

  const saveFlow = async () => {
    try {
      const flowData = {
        name: flowName,
        nodes,
        edges,
        updated_at: new Date().toISOString()
      }
      
      const response = await fetch('/api/v1/flows/default', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(flowData)
      })
      
      if (response.ok) {
        alert('Flow saved successfully!')
      } else {
        throw new Error('Failed to save')
      }
    } catch (error) {
      console.error('Save error:', error)
      alert('Failed to save flow')
    }
  }

  const exportFlow = () => {
    const flowData = { name: flowName, nodes, edges }
    const blob = new Blob([JSON.stringify(flowData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${flowName.replace(/\s+/g, '_')}.json`
    a.click()
  }

  const importFlow = (event) => {
    const file = event.target.files[0]
    if (!file) return
    
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result)
        setNodes(data.nodes || [])
        setEdges(data.edges || [])
        if (data.name) setFlowName(data.name)
      } catch (error) {
        alert('Invalid flow file')
      }
    }
    reader.readAsText(file)
  }

  const startTest = () => {
    setIsTesting(true)
    setTestMessages([{ role: 'bot', text: nodes[0]?.data?.message || 'Hello!' }])
  }

  const sendTestMessage = (text) => {
    setTestMessages([...testMessages, { role: 'user', text }])
    // Simulate bot response
    setTimeout(() => {
      setTestMessages(prev => [...prev, { 
        role: 'bot', 
        text: 'Thanks for your response! Is there anything else?' 
      }])
    }, 1000)
  }

  const deleteNode = () => {
    if (!selectedNode) return
    setNodes(nodes.filter(n => n.id !== selectedNode.id))
    setEdges(edges.filter(e => e.source !== selectedNode.id && e.target !== selectedNode.id))
    setSelectedNode(null)
  }

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      {/* Main Canvas */}
      <div style={{ flex: 1, position: 'relative' }}>
        {/* Toolbar */}
        <div style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          right: '20px',
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'white',
          padding: '16px 24px',
          borderRadius: '12px',
          boxShadow: '0 2px 12px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <input
              type="text"
              value={flowName}
              onChange={(e) => setFlowName(e.target.value)}
              style={{
                fontSize: '18px',
                fontWeight: 600,
                border: 'none',
                borderBottom: '2px solid #e0e0e0',
                padding: '4px 0',
                outline: 'none',
                minWidth: '200px'
              }}
            />
          </div>
          
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={startTest} style={toolbarButtonStyle}>
              <Play size={18} />
              Test
            </button>
            <button onClick={saveFlow} style={{ ...toolbarButtonStyle, background: '#0066CC', color: 'white' }}>
              <Save size={18} />
              Save
            </button>
            <button onClick={exportFlow} style={toolbarButtonStyle}>
              <Download size={18} />
              Export
            </button>
            <label style={toolbarButtonStyle}>
              <Upload size={18} />
              Import
              <input type="file" accept=".json" onChange={importFlow} style={{ display: 'none' }} />
            </label>
          </div>
        </div>

        {/* React Flow Canvas */}
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          fitView
        >
          <Background color="#e0e0e0" gap={20} />
          <Controls />
          <MiniMap 
            nodeStrokeColor={(n) => {
              if (n.type === 'greeting') return '#0066CC'
              if (n.type === 'question') return '#f39c12'
              if (n.type === 'message') return '#27ae60'
              if (n.type === 'condition') return '#9b59b6'
              if (n.type === 'action') return '#e74c3c'
              return '#999'
            }}
            nodeColor={(n) => {
              if (n.type === 'greeting') return '#0066CC'
              if (n.type === 'question') return '#f39c12'
              if (n.type === 'message') return '#27ae60'
              if (n.type === 'condition') return '#9b59b6'
              if (n.type === 'action') return '#e74c3c'
              return '#fff'
            }}
          />
          
          {/* Add Node Panel */}
          <Panel position="top-left" style={{ marginTop: '80px', marginLeft: '20px' }}>
            <div style={{
              background: 'white',
              borderRadius: '12px',
              padding: '16px',
              boxShadow: '0 2px 12px rgba(0,0,0,0.1)'
            }}>
              <p style={{ fontWeight: 600, marginBottom: '12px', fontSize: '14px' }}>Add Node</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button onClick={() => addNode('greeting')} style={nodeButtonStyle('#0066CC')}>
                  <MessageSquare size={14} /> Greeting
                </button>
                <button onClick={() => addNode('question')} style={nodeButtonStyle('#f39c12')}>
                  <HelpCircle size={14} /> Question
                </button>
                <button onClick={() => addNode('message')} style={nodeButtonStyle('#27ae60')}>
                  <MessageSquare size={14} /> Message
                </button>
                <button onClick={() => addNode('condition')} style={nodeButtonStyle('#9b59b6')}>
                  <GitBranch size={14} /> Condition
                </button>
                <button onClick={() => addNode('action')} style={nodeButtonStyle('#e74c3c')}>
                  <Send size={14} /> Action
                </button>
              </div>
            </div>
          </Panel>
        </ReactFlow>
      </div>

      {/* Properties Panel */}
      <div style={{
        width: '320px',
        background: 'white',
        borderLeft: '1px solid #e0e0e0',
        padding: '24px',
        overflowY: 'auto'
      }}>
        <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '20px' }}>Properties</h2>
        
        {selectedNode ? (
          <div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: '#666', marginBottom: '6px', textTransform: 'uppercase' }}>
                Node Type
              </label>
              <p style={{ fontWeight: 600, textTransform: 'capitalize' }}>{selectedNode.type}</p>
            </div>

            {selectedNode.type === 'greeting' && (
              <div style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>Greeting Message</label>
                <textarea
                  value={selectedNode.data.message || ''}
                  onChange={(e) => updateNodeData('message', e.target.value)}
                  style={textareaStyle}
                  rows={3}
                />
              </div>
            )}

            {selectedNode.type === 'question' && (
              <>
                <div style={{ marginBottom: '16px' }}>
                  <label style={labelStyle}>Question Text</label>
                  <textarea
                    value={selectedNode.data.text || ''}
                    onChange={(e) => updateNodeData('text', e.target.value)}
                    style={textareaStyle}
                    rows={2}
                  />
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <label style={labelStyle}>Field Name</label>
                  <input
                    type="text"
                    value={selectedNode.data.field || ''}
                    onChange={(e) => updateNodeData('field', e.target.value)}
                    style={inputStyle}
                  />
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <label style={labelStyle}>Options (comma-separated)</label>
                  <input
                    type="text"
                    value={(selectedNode.data.options || []).join(', ')}
                    onChange={(e) => updateNodeData('options', e.target.value.split(',').map(s => s.trim()))}
                    style={inputStyle}
                    placeholder="Option 1, Option 2, Option 3"
                  />
                </div>
              </>
            )}

            {selectedNode.type === 'message' && (
              <div style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>Message Text</label>
                <textarea
                  value={selectedNode.data.text || ''}
                  onChange={(e) => updateNodeData('text', e.target.value)}
                  style={textareaStyle}
                  rows={4}
                />
              </div>
            )}

            {selectedNode.type === 'condition' && (
              <div style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>Condition</label>
                <input
                  type="text"
                  value={selectedNode.data.condition || ''}
                  onChange={(e) => updateNodeData('condition', e.target.value)}
                  style={inputStyle}
                  placeholder="score > 50"
                />
                <p style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>
                  Use JavaScript expressions
                </p>
              </div>
            )}

            {selectedNode.type === 'action' && (
              <div style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>Action Type</label>
                <select
                  value={selectedNode.data.action || ''}
                  onChange={(e) => updateNodeData('action', e.target.value)}
                  style={inputStyle}
                >
                  <option value="">Select action...</option>
                  <option value="notify_email">Send Email</option>
                  <option value="notify_sms">Send SMS</option>
                  <option value="create_crm">Create CRM Entry</option>
                  <option value="add_sequence">Add to Sequence</option>
                </select>
              </div>
            )}

            <button
              onClick={deleteNode}
              style={{
                width: '100%',
                padding: '12px',
                background: '#fee',
                color: '#c33',
                border: '1px solid #fcc',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                marginTop: '20px'
              }}
            >
              <Trash2 size={16} />
              Delete Node
            </button>
          </div>
        ) : (
          <p style={{ color: '#888', textAlign: 'center', paddingTop: '40px' }}>
            Select a node to edit its properties
          </p>
        )}
      </div>

      {/* Test Panel */}
      {isTesting && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          right: '340px',
          width: '350px',
          height: '500px',
          background: 'white',
          borderRadius: '16px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 100
        }}>
          <div style={{
            padding: '16px 20px',
            background: '#0066CC',
            color: 'white',
            borderRadius: '16px 16px 0 0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span style={{ fontWeight: 600 }}>Test Chat</span>
            <button 
              onClick={() => setIsTesting(false)}
              style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '20px' }}
            >
              ×
            </button>
          </div>
          
          <div style={{ flex: 1, padding: '16px', overflowY: 'auto' }}>
            {testMessages.map((msg, i) => (
              <div key={i} style={{
                marginBottom: '12px',
                textAlign: msg.role === 'user' ? 'right' : 'left'
              }}>
                <span style={{
                  display: 'inline-block',
                  padding: '10px 14px',
                  borderRadius: '12px',
                  background: msg.role === 'user' ? '#0066CC' : '#f0f0f0',
                  color: msg.role === 'user' ? 'white' : '#333',
                  maxWidth: '80%'
                }}>
                  {msg.text}
                </span>
              </div>
            ))}
          </div>
          
          <div style={{ padding: '16px', borderTop: '1px solid #eee', display: 'flex', gap: '8px' }}>
            <input
              type="text"
              placeholder="Type a message..."
              onKeyPress={(e) => {
                if (e.key === 'Enter' && e.target.value) {
                  sendTestMessage(e.target.value)
                  e.target.value = ''
                }
              }}
              style={{
                flex: 1,
                padding: '10px 14px',
                border: '1px solid #ddd',
                borderRadius: '24px',
                outline: 'none'
              }}
            />
            <button
              onClick={() => {
                const input = document.querySelector('input[placeholder="Type a message..."]')
                if (input && input.value) {
                  sendTestMessage(input.value)
                  input.value = ''
                }
              }}
              style={{
                padding: '10px 16px',
                background: '#0066CC',
                color: 'white',
                border: 'none',
                borderRadius: '24px',
                cursor: 'pointer'
              }}
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

const toolbarButtonStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  padding: '8px 16px',
  background: '#f5f5f5',
  border: '1px solid #ddd',
  borderRadius: '8px',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: 500
}

const nodeButtonStyle = (color) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '10px 14px',
  background: 'white',
  border: `2px solid ${color}`,
  borderRadius: '8px',
  cursor: 'pointer',
  fontSize: '13px',
  fontWeight: 500,
  color: color,
  transition: 'all 0.2s'
})

const labelStyle = {
  display: 'block',
  fontSize: '12px',
  color: '#666',
  marginBottom: '6px',
  textTransform: 'uppercase',
  fontWeight: 600
}

const inputStyle = {
  width: '100%',
  padding: '10px 12px',
  border: '1px solid #ddd',
  borderRadius: '8px',
  fontSize: '14px',
  outline: 'none'
}

const textareaStyle = {
  ...inputStyle,
  resize: 'vertical',
  fontFamily: 'inherit'
}

export default FlowBuilder