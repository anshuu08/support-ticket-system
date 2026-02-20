import { useState, useRef } from 'react'
import api from '../utils/api.js'
import { Sparkles, Send, Paperclip, X, Calendar } from 'lucide-react'

const CATEGORIES = ['billing', 'technical', 'account', 'general']
const PRIORITIES = ['low', 'medium', 'high', 'critical']

const inp = {
  width: '100%', background: '#0a0c12', border: '1px solid #2a2d45',
  borderRadius: '10px', padding: '11px 14px', color: '#e2e8f0',
  fontSize: '14px', outline: 'none', fontFamily: 'Inter, sans-serif',
  transition: 'border 0.2s, box-shadow 0.2s',
}

export default function TicketForm({ onCreated, toast }) {
  const [form, setForm] = useState({ title: '', description: '', category: 'general', priority: 'medium', due_date: '' })
  const [file, setFile] = useState(null)
  const [classifying, setClassifying] = useState(false)
  const [suggestion, setSuggestion] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const classifyTimer = useRef(null)
  const fileRef = useRef(null)

  const handleDescription = e => {
    const val = e.target.value
    setForm(f => ({ ...f, description: val }))
    clearTimeout(classifyTimer.current)
    if (val.trim().length > 30) {
      setClassifying(true)
      classifyTimer.current = setTimeout(async () => {
        try {
          const res = await api.post('/tickets/classify/', { description: val })
          setSuggestion(res.data)
          setForm(f => ({ ...f, category: res.data.suggested_category, priority: res.data.suggested_priority }))
        } catch { setSuggestion(null) }
        finally { setClassifying(false) }
      }, 800)
    } else { setClassifying(false) }
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const data = new FormData()
      Object.entries(form).forEach(([k, v]) => { if (v) data.append(k, v) })
      if (file) data.append('attachment', file)
      const res = await api.post('/tickets/', data, { headers: { 'Content-Type': 'multipart/form-data' } })
      toast(`Ticket #${res.data.id} submitted successfully!`, 'success')
      setForm({ title: '', description: '', category: 'general', priority: 'medium', due_date: '' })
      setFile(null); setSuggestion(null)
      onCreated(res.data)
    } catch { toast('Failed to submit ticket. Please try again.', 'error') }
    finally { setSubmitting(false) }
  }

  return (
    <div style={{
      background: '#13151f', border: '1px solid #2a2d45', borderRadius: '20px',
      padding: '32px', maxWidth: '700px', animation: 'fadeInScale 0.3s ease',
    }}>
      <form onSubmit={handleSubmit}>
        {/* Title */}
        <Field label="Title *">
          <input style={inp} maxLength={200} required placeholder="Brief summary of the issue"
            value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
          <div style={{ textAlign: 'right', fontSize: '11px', color: '#475569', marginTop: '4px' }}>{form.title.length}/200</div>
        </Field>

        {/* Description */}
        <Field label={
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            Description *
            {classifying && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#818cf8', fontSize: '11px', fontWeight: 500 }}>
                <span className="spinner" style={{ width: '10px', height: '10px', borderWidth: '1.5px' }} />
                AI analyzing...
              </span>
            )}
          </span>
        }>
          <textarea style={{ ...inp, minHeight: '130px', resize: 'vertical' }} required
            placeholder="Describe your issue in detail. The more context, the better our AI can help classify and suggest a response."
            value={form.description} onChange={handleDescription} />
          {suggestion && !classifying && (
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px', marginTop: '8px',
              background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)',
              borderRadius: '8px', padding: '7px 12px', fontSize: '12px', color: '#a5b4fc',
            }}>
              <Sparkles size={13} />
              <span>AI suggested: <strong style={{ color: '#e2e8f0' }}>{suggestion.suggested_category}</strong> · <strong style={{ color: '#e2e8f0' }}>{suggestion.suggested_priority}</strong> priority</span>
              <button type="button" onClick={() => setSuggestion(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#475569', display: 'flex', padding: 0 }}>
                <X size={12} />
              </button>
            </div>
          )}
        </Field>

        {/* Category + Priority */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <Field label="Category">
            <select style={{ ...inp, cursor: 'pointer' }} value={form.category}
              onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
            </select>
          </Field>
          <Field label="Priority">
            <select style={{ ...inp, cursor: 'pointer' }} value={form.priority}
              onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}>
              {PRIORITIES.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
            </select>
          </Field>
        </div>

        {/* Due date + Attachment */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <Field label="Due Date (optional)">
            <div style={{ position: 'relative' }}>
              <input type="date" style={{ ...inp, paddingRight: '40px' }} value={form.due_date}
                onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))} />
              <Calendar size={15} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#475569', pointerEvents: 'none' }} />
            </div>
          </Field>
          <Field label="Attachment (optional)">
            <div>
              <input ref={fileRef} type="file" style={{ display: 'none' }} onChange={e => setFile(e.target.files[0])} />
              <button type="button" onClick={() => fileRef.current.click()} style={{
                ...inp, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer',
                color: file ? '#a5b4fc' : '#475569', background: '#0a0c12',
              }}>
                <Paperclip size={14} /> {file ? file.name.slice(0, 20) + (file.name.length > 20 ? '...' : '') : 'Choose file'}
              </button>
              {file && <button type="button" onClick={() => setFile(null)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '11px', marginTop: '4px' }}>✕ Remove</button>}
            </div>
          </Field>
        </div>

        <button type="submit" disabled={submitting} style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
          width: '100%', padding: '13px', border: 'none', borderRadius: '12px',
          fontSize: '15px', fontWeight: 700, marginTop: '8px', cursor: submitting ? 'not-allowed' : 'pointer',
          background: submitting ? '#374151' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          color: 'white', boxShadow: submitting ? 'none' : '0 4px 20px rgba(99,102,241,0.35)',
          transition: 'all 0.2s',
        }}>
          {submitting ? <><span className="spinner" /> Submitting...</> : <><Send size={16} /> Submit Ticket</>}
        </button>
      </form>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: '18px' }}>
      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#64748b', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {label}
      </label>
      {children}
    </div>
  )
}
