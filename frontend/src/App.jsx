import { useState, useEffect, useCallback } from 'react'
import api from './utils/api.js'
import AuthPage from './components/AuthPage.jsx'
import TicketForm from './components/TicketForm.jsx'
import TicketList from './components/TicketList.jsx'
import StatsDashboard from './components/StatsDashboard.jsx'
import ToastContainer from './components/Toast.jsx'
import { Badge } from './components/UI.jsx'
import { useToast } from './hooks/useToast.js'
import { LayoutDashboard, Ticket, PlusCircle, LogOut, User, Zap, Shield } from 'lucide-react'

export default function App() {
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem('token')
    if (!token) return null
    return {
      token,
      username: localStorage.getItem('username'),
      is_staff: localStorage.getItem('is_staff') === 'true',
      user_id: localStorage.getItem('user_id'),
    }
  })
  const [tab, setTab] = useState('dashboard')
  const [tickets, setTickets] = useState([])
  const [stats, setStats] = useState(null)
  const [loadingTickets, setLoadingTickets] = useState(false)
  const [loadingStats, setLoadingStats] = useState(false)
  const [staffList, setStaffList] = useState([])
  const [openCount, setOpenCount] = useState(0)
  const { toasts, toast, removeToast } = useToast()

  const fetchTickets = useCallback(async (params = {}) => {
    setLoadingTickets(true)
    try {
      const res = await api.get('/tickets/', { params })
      setTickets(res.data)
      setOpenCount(res.data.filter(t => t.status === 'open').length)
    } catch (e) {
      if (e.response?.status !== 401) toast('Failed to load tickets', 'error')
    } finally { setLoadingTickets(false) }
  }, [])

  const fetchStats = useCallback(async () => {
    setLoadingStats(true)
    try {
      const res = await api.get('/tickets/stats/')
      setStats(res.data)
    } catch {} finally { setLoadingStats(false) }
  }, [])

  const fetchStaff = useCallback(async () => {
    try {
      const res = await api.get('/staff/')
      setStaffList(res.data)
    } catch {}
  }, [])

  useEffect(() => {
    if (user) { fetchTickets(); fetchStats(); fetchStaff() }
  }, [user])

  const handleAuth = data => {
    localStorage.setItem('token', data.token)
    localStorage.setItem('username', data.username)
    localStorage.setItem('is_staff', data.is_staff)
    localStorage.setItem('user_id', data.user_id)
    setUser(data)
  }

  const handleLogout = async () => {
    try { await api.post('/auth/logout/') } catch {}
    ['token','username','is_staff','user_id'].forEach(k => localStorage.removeItem(k))
    setUser(null); setTickets([]); setStats(null)
  }

  const handleCreated = ticket => {
    setTickets(prev => [ticket, ...prev])
    setOpenCount(c => c + 1)
    fetchStats()
    toast(`Ticket #${ticket.id} created!`, 'success')
  }

  const handleUpdated = updated => {
    setTickets(prev => prev.map(t => t.id === updated.id ? updated : t))
    fetchStats()
  }

  if (!user) return <><AuthPage onAuth={handleAuth} /><ToastContainer toasts={toasts} onRemove={removeToast} /></>

  const navItems = [
    { key: 'dashboard', icon: <LayoutDashboard size={16}/>, label: 'Dashboard' },
    { key: 'tickets', icon: <Ticket size={16}/>, label: 'Tickets', badge: openCount },
    { key: 'new', icon: <PlusCircle size={16}/>, label: 'New Ticket' },
  ]

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <nav style={{
        width: '220px', background: '#0d0f1a', borderRight: '1px solid #1e2035',
        padding: '0', display: 'flex', flexDirection: 'column', flexShrink: 0,
        position: 'sticky', top: 0, height: '100vh',
      }}>
        {/* Logo */}
        <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid #1e2035' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(99,102,241,0.3)', flexShrink: 0 }}>
              <Zap size={18} color="white" fill="white" />
            </div>
            <span style={{ fontSize: '17px', fontWeight: 800, background: 'linear-gradient(135deg, #e2e8f0, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              SupportDesk
            </span>
          </div>
        </div>

        {/* Nav */}
        <div style={{ flex: 1, padding: '12px 8px' }}>
          {navItems.map(({ key, icon, label, badge }) => (
            <button key={key} onClick={() => setTab(key)} style={{
              display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px',
              background: tab === key ? 'rgba(99,102,241,0.12)' : 'transparent',
              borderRadius: '10px',
              border: 'none', color: tab === key ? '#a5b4fc' : '#64748b',
              cursor: 'pointer', width: '100%', fontSize: '14px', fontWeight: tab === key ? 600 : 400,
              transition: 'all 0.15s', marginBottom: '2px',
              boxShadow: tab === key ? 'inset 0 0 0 1px rgba(99,102,241,0.2)' : 'none',
            }}
              onMouseEnter={e => { if (tab !== key) e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
              onMouseLeave={e => { if (tab !== key) e.currentTarget.style.background = 'transparent' }}
            >
              {icon}
              <span style={{ flex: 1, textAlign: 'left' }}>{label}</span>
              {badge > 0 && <Badge count={badge} color="#ef4444" />}
            </button>
          ))}
        </div>

        {/* User */}
        <div style={{ padding: '12px 8px 16px', borderTop: '1px solid #1e2035' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', marginBottom: '4px' }}>
            <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: user.is_staff ? 'rgba(99,102,241,0.2)' : 'rgba(100,116,139,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {user.is_staff ? <Shield size={14} color="#818cf8" /> : <User size={14} color="#64748b" />}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.username}</div>
              <div style={{ fontSize: '11px', color: user.is_staff ? '#818cf8' : '#475569' }}>{user.is_staff ? 'Admin' : 'User'}</div>
            </div>
          </div>
          <button onClick={handleLogout} style={{
            display: 'flex', alignItems: 'center', gap: '8px', width: '100%',
            background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)',
            borderRadius: '8px', color: '#f87171', padding: '8px 12px',
            cursor: 'pointer', fontSize: '13px', fontWeight: 500,
          }}>
            <LogOut size={13} /> Sign Out
          </button>
        </div>
      </nav>

      {/* Main */}
      <main style={{ flex: 1, overflow: 'auto', padding: '32px', background: 'radial-gradient(ellipse at 100% 0%, rgba(99,102,241,0.04) 0%, transparent 50%)' }}>
        <div style={{ maxWidth: '1100px' }}>
          {tab === 'dashboard' && (
            <div className="animate-fade-in">
              <PageHeader title="Dashboard" sub="Overview of support activity" />
              <StatsDashboard stats={stats} loading={loadingStats} />
            </div>
          )}
          {tab === 'tickets' && (
            <div className="animate-fade-in">
              <PageHeader title="All Tickets" sub={user.is_staff ? 'Viewing all tickets as admin' : 'Your submitted tickets'} />
              <TicketList tickets={tickets} loading={loadingTickets} onFilter={fetchTickets}
                onUpdate={handleUpdated} toast={toast} isStaff={user.is_staff} staffList={staffList} />
            </div>
          )}
          {tab === 'new' && (
            <div className="animate-fade-in">
              <PageHeader title="New Ticket" sub="AI will auto-suggest category and priority" />
              <TicketForm onCreated={t => { handleCreated(t); setTab('tickets') }} toast={toast} />
            </div>
          )}
        </div>
      </main>

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  )
}

function PageHeader({ title, sub }) {
  return (
    <div style={{ marginBottom: '28px' }}>
      <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#e2e8f0' }}>{title}</h1>
      <p style={{ color: '#475569', marginTop: '4px', fontSize: '14px' }}>{sub}</p>
    </div>
  )
}
