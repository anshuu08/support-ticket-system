export const PRIORITY_SCHEME = {
  low:      { bg: 'rgba(16,185,129,0.1)',  color: '#34d399', border: 'rgba(16,185,129,0.3)',  dot: '#10b981' },
  medium:   { bg: 'rgba(245,158,11,0.1)',  color: '#fbbf24', border: 'rgba(245,158,11,0.3)',  dot: '#f59e0b' },
  high:     { bg: 'rgba(239,68,68,0.1)',   color: '#f87171', border: 'rgba(239,68,68,0.3)',   dot: '#ef4444' },
  critical: { bg: 'rgba(220,38,38,0.15)',  color: '#ef4444', border: 'rgba(220,38,38,0.4)',   dot: '#dc2626' },
}
export const STATUS_SCHEME = {
  open:        { bg: 'rgba(99,102,241,0.1)',  color: '#818cf8', border: 'rgba(99,102,241,0.3)'  },
  in_progress: { bg: 'rgba(245,158,11,0.1)',  color: '#fbbf24', border: 'rgba(245,158,11,0.3)' },
  resolved:    { bg: 'rgba(16,185,129,0.1)',  color: '#34d399', border: 'rgba(16,185,129,0.3)' },
  closed:      { bg: 'rgba(71,85,105,0.15)',  color: '#64748b', border: 'rgba(71,85,105,0.3)'  },
}
export const CATEGORY_SCHEME = {
  billing:   { bg: 'rgba(99,102,241,0.1)',  color: '#a78bfa', border: 'rgba(99,102,241,0.25)' },
  technical: { bg: 'rgba(6,182,212,0.1)',   color: '#22d3ee', border: 'rgba(6,182,212,0.25)'  },
  account:   { bg: 'rgba(139,92,246,0.1)',  color: '#c084fc', border: 'rgba(139,92,246,0.25)' },
  general:   { bg: 'rgba(100,116,139,0.1)', color: '#94a3b8', border: 'rgba(100,116,139,0.25)'},
}

export const PRIORITY_LEFT_BORDER = {
  low: '#10b981', medium: '#f59e0b', high: '#ef4444', critical: '#dc2626',
}

export function Chip({ label, scheme, size = 'sm' }) {
  const s = scheme || {}
  return (
    <span style={{
      background: s.bg, color: s.color, border: `1px solid ${s.border}`,
      borderRadius: '20px',
      padding: size === 'sm' ? '3px 10px' : '5px 14px',
      fontSize: size === 'sm' ? '11px' : '13px',
      fontWeight: 600, textTransform: 'capitalize', whiteSpace: 'nowrap',
      display: 'inline-flex', alignItems: 'center', gap: '5px',
    }}>
      {s.dot && <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: s.dot, flexShrink: 0 }} />}
      {label?.replace('_', ' ')}
    </span>
  )
}

export function Badge({ count, color = '#6366f1' }) {
  if (!count) return null
  return (
    <span style={{
      background: color, color: 'white', borderRadius: '20px',
      padding: '1px 7px', fontSize: '11px', fontWeight: 700, minWidth: '20px', textAlign: 'center',
    }}>{count > 99 ? '99+' : count}</span>
  )
}
