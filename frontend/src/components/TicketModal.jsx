import { useState, useEffect } from 'react'
import api from '../utils/api.js'
import { Chip, PRIORITY_SCHEME, STATUS_SCHEME, CATEGORY_SCHEME, PRIORITY_LEFT_BORDER } from './UI.jsx'
import { X, Send, Sparkles, Loader, User, Shield, Paperclip, Calendar } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

const STATUS_FLOW = { open: 'in_progress', in_progress: 'resolved', resolved: 'closed' }
const STATUS_LABELS = { open: 'Start Progress', in_progress: 'Mark Resolved', resolved: 'Close Ticket' }
const PRIORITIES = ['low', 'medium', 'high', 'critical']
const CATEGORIES = ['billing', 'technical', 'account', 'general']
const STATUSES = ['open', 'in_progress', 'resolved', 'closed']

export default function TicketModal({ ticket, onClose, onUpdate, toast, isStaff, staffList }) {
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [isInternal, setIsInternal] = useState(false)
  const [submittingComment, setSubmittingComment] = useState(false)
  const [aiReply, setAiReply] = useState('')
  const [loadingReply, setLoadingReply] = useState(false)
  const [editing, setEditing] = useState({})

  useEffect(() => {
    fetchComments()
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [ticket.id])

  const fetchComments = async () => {
    try {
      const res = await api.get(`/tickets/${ticket.id}/comments/`)
      setComments(res.data)
    } catch {}
  }

  const handleFieldUpdate = async (field, value) => {
    try {
      const res = await api.patch(`/tickets/${ticket.id}/`, { [field]: value })
      onUpdate(res.data)
      toast(`Updated ${field}`, 'success')
    } catch { toast('Update failed', 'error') }
  }

  const advanceStatus = async () => {
    const next = STATUS_FLOW[ticket.status]
    if (!next) return
    await handleFieldUpdate('status', next)
  }

  const submitComment = async e => {
    e.preventDefault()
    if (!newComment.trim()) return
    setSubmittingComment(true)
    try {
      const res = await api.post(`/tickets/${ticket.id}/comments/`, { content: newComment, is_internal: isInternal })
      setComments(prev => [...prev, res.data])
      setNewComment('')
      toast('Comment added', 'success')
    } catch { toast('Failed to add comment', 'error') }
    finally { setSubmittingComment(false) }
  }

  const getSuggestedReply = async () => {
    setLoadingReply(true)
    try {
      const res = await api.get(`/tickets/${ticket.id}/suggest_reply/`)
      setAiReply(res.data.suggested_reply)
    } catch { toast('AI suggestion unavailable', 'warning') }
    finally { setLoadingReply(false) }
  }

  const borderColor = PRIORITY_LEFT_BORDER[ticket.priority] || '#6366f1'

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-content" style={{ borderLeft: `4px solid ${borderColor}` }}>
        {/* Header */}
        <div style={{ padding: '24px 28px 20px', borderBottom: '1px solid #2a2d45', display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '10px', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', color: '#475569', fontWeight: 600 }}>#{ticket.id}</span>
              <Chip label={ticket.category} scheme={CATEGORY_SCHEME[ticket.category]} />
              <Chip label={ticket.priority} scheme={PRIORITY_SCHEME[ticket.priority]} />
              <Chip label={ticket.status} scheme={STATUS_SCHEME[ticket.status]} />
              {ticket.is_overdue && (
                <span style={{ background: 'rgba(220,38,38,0.15)', color: '#ef4444', border: '1px solid rgba(220,38,38,0.3)', borderRadius: '20px', padding: '3px 10px', fontSize: '11px', fontWeight: 600 }}>
                  ⚠ OVERDUE
                </span>
              )}
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#e2e8f0', lineHeight: 1.3 }}>{ticket.title}</h2>
            <div style={{ fontSize: '12px', color: '#475569', marginTop: '6px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <span>By <strong style={{ color: '#94a3b8' }}>{ticket.owner_username}</strong></span>
              <span>{formatDistanceToNow(new Date(ticket.created_at), { addSuffix: true })}</span>
              {ticket.due_date && <span style={{ color: ticket.is_overdue ? '#ef4444' : '#94a3b8' }}><Calendar size={11} style={{ display: 'inline' }} /> Due: {ticket.due_date}</span>}
            </div>
          </div>
          <button onClick={onClose} style={{ background: '#1a1d2e', border: '1px solid #2a2d45', borderRadius: '8px', color: '#64748b', cursor: 'pointer', padding: '6px', display: 'flex', flexShrink: 0 }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Description */}
          <div>
            <SectionLabel>Description</SectionLabel>
            <p style={{ color: '#94a3b8', lineHeight: '1.7', fontSize: '14px', whiteSpace: 'pre-wrap' }}>{ticket.description}</p>
            {ticket.attachment && (
              <a href={ticket.attachment} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginTop: '12px', color: '#818cf8', fontSize: '13px', textDecoration: 'none' }}>
                <Paperclip size={13} /> View Attachment
              </a>
            )}
          </div>

          {/* Quick Actions */}
          <div>
            <SectionLabel>Quick Actions</SectionLabel>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
              {STATUS_FLOW[ticket.status] && (
                <button onClick={advanceStatus} style={{
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white', border: 'none',
                  borderRadius: '8px', padding: '8px 16px', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(99,102,241,0.3)',
                }}>
                  {STATUS_LABELS[ticket.status]}
                </button>
              )}
              {/* Inline editable dropdowns */}
              {[
                { field: 'status', options: STATUSES, label: 'Status' },
                { field: 'priority', options: PRIORITIES, label: 'Priority' },
                { field: 'category', options: CATEGORIES, label: 'Category' },
              ].map(({ field, options, label }) => (
                <div key={field} style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  <span style={{ fontSize: '10px', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
                  <select value={ticket[field]} onChange={e => handleFieldUpdate(field, e.target.value)} style={{
                    background: '#1a1d2e', border: '1px solid #2a2d45', borderRadius: '8px',
                    padding: '6px 10px', color: '#e2e8f0', fontSize: '12px', cursor: 'pointer', outline: 'none',
                  }}>
                    {options.map(o => <option key={o} value={o}>{o.replace('_', ' ')}</option>)}
                  </select>
                </div>
              ))}
              {/* Assign (staff only) */}
              {isStaff && staffList?.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  <span style={{ fontSize: '10px', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Assign To</span>
                  <select value={ticket.assigned_to || ''} onChange={e => handleFieldUpdate('assigned_to', e.target.value || null)} style={{
                    background: '#1a1d2e', border: '1px solid #2a2d45', borderRadius: '8px',
                    padding: '6px 10px', color: '#e2e8f0', fontSize: '12px', cursor: 'pointer', outline: 'none',
                  }}>
                    <option value="">Unassigned</option>
                    {staffList.map(s => <option key={s.id} value={s.id}>{s.username}</option>)}
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* AI Suggested Reply (staff only) */}
          {isStaff && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <SectionLabel>AI Suggested Reply</SectionLabel>
                <button onClick={getSuggestedReply} disabled={loadingReply} style={{
                  display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(99,102,241,0.1)',
                  border: '1px solid rgba(99,102,241,0.25)', borderRadius: '8px', color: '#818cf8',
                  padding: '6px 12px', fontSize: '12px', cursor: loadingReply ? 'not-allowed' : 'pointer', fontWeight: 500,
                }}>
                  {loadingReply ? <Loader size={12} style={{ animation: 'spin 1s linear infinite' }} /> : <Sparkles size={12} />}
                  Generate Reply
                </button>
              </div>
              {aiReply && (
                <div style={{ background: 'rgba(99,102,241,0.07)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '12px', padding: '14px 16px' }}>
                  <p style={{ color: '#c7d2fe', fontSize: '13px', lineHeight: '1.7', whiteSpace: 'pre-wrap' }}>{aiReply}</p>
                  <button onClick={() => setNewComment(aiReply)} style={{
                    marginTop: '10px', background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)',
                    borderRadius: '6px', color: '#818cf8', padding: '5px 12px', fontSize: '12px', cursor: 'pointer',
                  }}>Use as comment</button>
                </div>
              )}
            </div>
          )}

          {/* Comments */}
          <div>
            <SectionLabel>Activity ({comments.length})</SectionLabel>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
              {comments.length === 0 && (
                <p style={{ color: '#475569', fontSize: '13px', textAlign: 'center', padding: '20px 0' }}>No comments yet. Be the first to respond!</p>
              )}
              {comments.map(c => (
                <div key={c.id} style={{
                  background: c.is_internal ? 'rgba(245,158,11,0.05)' : '#1a1d2e',
                  border: `1px solid ${c.is_internal ? 'rgba(245,158,11,0.2)' : '#2a2d45'}`,
                  borderRadius: '12px', padding: '14px 16px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: c.author_is_staff ? 'rgba(99,102,241,0.2)' : 'rgba(100,116,139,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {c.author_is_staff ? <Shield size={13} color="#818cf8" /> : <User size={13} color="#64748b" />}
                    </div>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: c.author_is_staff ? '#818cf8' : '#94a3b8' }}>{c.author_username}</span>
                    {c.is_internal && <span style={{ fontSize: '10px', background: 'rgba(245,158,11,0.15)', color: '#fbbf24', borderRadius: '4px', padding: '1px 6px', fontWeight: 600 }}>INTERNAL</span>}
                    <span style={{ fontSize: '11px', color: '#475569', marginLeft: 'auto' }}>{formatDistanceToNow(new Date(c.created_at), { addSuffix: true })}</span>
                  </div>
                  <p style={{ color: '#94a3b8', fontSize: '13px', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>{c.content}</p>
                </div>
              ))}
            </div>

            {/* Add comment */}
            <form onSubmit={submitComment}>
              <textarea value={newComment} onChange={e => setNewComment(e.target.value)}
                placeholder="Add a comment..." rows={3}
                style={{ width: '100%', background: '#0a0c12', border: '1px solid #2a2d45', borderRadius: '10px', padding: '11px 14px', color: '#e2e8f0', fontSize: '13px', resize: 'none', outline: 'none', fontFamily: 'Inter, sans-serif', marginBottom: '10px', transition: 'border 0.2s' }} />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                {isStaff && (
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '12px', color: '#64748b' }}>
                    <input type="checkbox" checked={isInternal} onChange={e => setIsInternal(e.target.checked)} style={{ accentColor: '#f59e0b' }} />
                    Internal note (staff only)
                  </label>
                )}
                <div style={{ marginLeft: 'auto' }}>
                  <button type="submit" disabled={submittingComment || !newComment.trim()} style={{
                    display: 'flex', alignItems: 'center', gap: '6px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    border: 'none', borderRadius: '8px', color: 'white', padding: '8px 16px',
                    fontSize: '13px', fontWeight: 600, cursor: submittingComment ? 'not-allowed' : 'pointer',
                    opacity: !newComment.trim() ? 0.5 : 1,
                  }}>
                    {submittingComment ? <span className="spinner" style={{ width: '12px', height: '12px' }} /> : <Send size={13} />}
                    Post
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

function SectionLabel({ children }) {
  return <div style={{ fontSize: '11px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '10px' }}>{children}</div>
}
