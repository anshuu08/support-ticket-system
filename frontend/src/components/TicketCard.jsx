import { Chip, PRIORITY_SCHEME, STATUS_SCHEME, CATEGORY_SCHEME, PRIORITY_LEFT_BORDER } from './UI.jsx'
import { MessageSquare, Paperclip, Calendar, AlertTriangle } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

export default function TicketCard({ ticket, onClick, selected, onSelect, showCheckbox }) {
  const borderColor = PRIORITY_LEFT_BORDER[ticket.priority] || '#6366f1'

  return (
    <div onClick={onClick} style={{
      background: selected ? 'rgba(99,102,241,0.05)' : '#13151f',
      border: `1px solid ${selected ? '#6366f1' : '#2a2d45'}`,
      borderLeft: `4px solid ${borderColor}`,
      borderRadius: '14px', padding: '18px 20px',
      cursor: 'pointer', transition: 'all 0.2s',
      position: 'relative',
    }}
      onMouseEnter={e => { if (!selected) e.currentTarget.style.borderColor = '#353858'; e.currentTarget.style.transform = 'translateY(-1px)' }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = selected ? '#6366f1' : '#2a2d45'; e.currentTarget.style.transform = 'translateY(0)' }}
    >
      {showCheckbox && (
        <div onClick={e => { e.stopPropagation(); onSelect(ticket.id) }} style={{ position: 'absolute', top: '16px', right: '16px' }}>
          <input type="checkbox" checked={selected} onChange={() => {}} style={{ accentColor: '#6366f1', width: '15px', height: '15px', cursor: 'pointer' }} />
        </div>
      )}

      {/* Top row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '11px', color: '#475569', fontWeight: 600 }}>#{ticket.id}</span>
        <Chip label={ticket.category} scheme={CATEGORY_SCHEME[ticket.category]} />
        {ticket.is_overdue && (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', background: 'rgba(220,38,38,0.1)', color: '#ef4444', border: '1px solid rgba(220,38,38,0.3)', borderRadius: '20px', padding: '2px 8px', fontSize: '10px', fontWeight: 700 }}>
            <AlertTriangle size={9} /> OVERDUE
          </span>
        )}
      </div>

      {/* Title */}
      <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#e2e8f0', marginBottom: '6px', lineHeight: 1.4 }}>
        {ticket.title}
      </h3>

      {/* Description */}
      <p style={{ fontSize: '13px', color: '#64748b', lineHeight: '1.5', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', marginBottom: '14px' }}>
        {ticket.description}
      </p>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          <Chip label={ticket.priority} scheme={PRIORITY_SCHEME[ticket.priority]} />
          <Chip label={ticket.status} scheme={STATUS_SCHEME[ticket.status]} />
        </div>
        <div style={{ display: 'flex', align: 'center', gap: '12px', fontSize: '11px', color: '#475569' }}>
          {ticket.comment_count > 0 && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
              <MessageSquare size={11} /> {ticket.comment_count}
            </span>
          )}
          {ticket.attachment && <Paperclip size={11} />}
          {ticket.due_date && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '3px', color: ticket.is_overdue ? '#ef4444' : '#475569' }}>
              <Calendar size={11} /> {ticket.due_date}
            </span>
          )}
          <span>{formatDistanceToNow(new Date(ticket.created_at), { addSuffix: true })}</span>
        </div>
      </div>
    </div>
  )
}
