import { useState } from 'react'
import api from '../utils/api.js'
import { Eye, EyeOff, Zap } from 'lucide-react'

export default function AuthPage({ onAuth }) {
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ username: '', email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const submit = async e => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const url = mode === 'login' ? '/auth/login/' : '/auth/register/'
      const res = await api.post(url, form)
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('username', res.data.username)
      localStorage.setItem('is_staff', res.data.is_staff)
      localStorage.setItem('user_id', res.data.user_id)
      onAuth(res.data)
    } catch (e) {
      const data = e.response?.data
      setError(data?.error || Object.values(data || {})?.[0]?.[0] || 'Something went wrong')
    } finally { setLoading(false) }
  }

  return (
    <div style={{
      minHeight: '100vh', background: 'radial-gradient(ellipse at 50% 0%, rgba(99,102,241,0.15) 0%, transparent 60%), #0a0c12',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
    }}>
      {/* Glowing orbs */}
      <div style={{ position: 'fixed', top: '-200px', left: '-200px', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', bottom: '-200px', right: '-200px', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: '420px', animation: 'fadeInScale 0.4s ease' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: '56px', height: '56px', borderRadius: '16px', marginBottom: '16px',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            boxShadow: '0 8px 32px rgba(99,102,241,0.4)',
          }}>
            <Zap size={28} color="white" fill="white" />
          </div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, background: 'linear-gradient(135deg, #e2e8f0, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            SupportDesk
          </h1>
          <p style={{ color: '#475569', fontSize: '14px', marginTop: '4px' }}>AI-powered support ticket system</p>
        </div>

        {/* Card */}
        <div style={{
          background: 'rgba(19,21,31,0.8)', border: '1px solid rgba(42,45,69,0.8)',
          borderRadius: '24px', padding: '32px', backdropFilter: 'blur(20px)',
          boxShadow: '0 32px 64px rgba(0,0,0,0.4)',
        }}>
          {/* Tabs */}
          <div style={{ display: 'flex', background: '#0a0c12', borderRadius: '12px', padding: '4px', marginBottom: '28px' }}>
            {['login', 'register'].map(m => (
              <button key={m} onClick={() => { setMode(m); setError('') }} style={{
                flex: 1, padding: '10px', border: 'none', borderRadius: '9px', cursor: 'pointer',
                fontSize: '14px', fontWeight: 600, transition: 'all 0.2s',
                background: mode === m ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'transparent',
                color: mode === m ? 'white' : '#64748b',
                boxShadow: mode === m ? '0 4px 12px rgba(99,102,241,0.3)' : 'none',
              }}>
                {m === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            ))}
          </div>

          {error && (
            <div style={{
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)',
              borderRadius: '10px', padding: '12px 14px', color: '#f87171',
              fontSize: '13px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px'
            }}>
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={submit}>
            <Field label="Username">
              <input name="username" required value={form.username} onChange={handle}
                placeholder="your_username" style={inputStyle} />
            </Field>

            {mode === 'register' && (
              <Field label="Email (optional)">
                <input name="email" type="email" value={form.email} onChange={handle}
                  placeholder="you@example.com" style={inputStyle} />
              </Field>
            )}

            <Field label="Password">
              <div style={{ position: 'relative' }}>
                <input name="password" type={showPass ? 'text' : 'password'} required
                  value={form.password} onChange={handle} placeholder="••••••••"
                  style={{ ...inputStyle, paddingRight: '44px' }} />
                <button type="button" onClick={() => setShowPass(p => !p)} style={{
                  position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: '#475569',
                  display: 'flex', alignItems: 'center',
                }}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </Field>

            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '13px', border: 'none', borderRadius: '12px', cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '15px', fontWeight: 700, marginTop: '8px', transition: 'all 0.2s',
              background: loading ? '#374151' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              color: 'white', boxShadow: loading ? 'none' : '0 4px 20px rgba(99,102,241,0.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            }}>
              {loading ? <><span className="spinner" /> Please wait...</> : mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

const inputStyle = {
  width: '100%', background: '#0a0c12', border: '1px solid #2a2d45',
  borderRadius: '10px', padding: '11px 14px', color: '#e2e8f0',
  fontSize: '14px', outline: 'none', fontFamily: 'Inter, sans-serif',
  transition: 'border 0.2s, box-shadow 0.2s',
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: '16px' }}>
      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#64748b', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {label}
      </label>
      {children}
    </div>
  )
}
