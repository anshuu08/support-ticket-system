import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react'

const ICONS = {
  success: <CheckCircle size={16} />,
  error: <XCircle size={16} />,
  warning: <AlertTriangle size={16} />,
  info: <Info size={16} />,
}

const COLORS = {
  success: { bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.3)', color: '#34d399' },
  error: { bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.3)', color: '#f87171' },
  warning: { bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.3)', color: '#fbbf24' },
  info: { bg: 'rgba(99,102,241,0.12)', border: 'rgba(99,102,241,0.3)', color: '#818cf8' },
}

export default function ToastContainer({ toasts, onRemove }) {
  return (
    <div style={{
      position: 'fixed', bottom: '24px', right: '24px',
      display: 'flex', flexDirection: 'column', gap: '10px', zIndex: 9999,
    }}>
      {toasts.map(t => {
        const c = COLORS[t.type] || COLORS.info
        return (
          <div key={t.id} style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            background: c.bg, border: `1px solid ${c.border}`,
            borderRadius: '12px', padding: '12px 16px', minWidth: '280px', maxWidth: '380px',
            color: c.color, fontSize: '14px', fontWeight: 500,
            animation: 'slideIn 0.3s ease',
            backdropFilter: 'blur(8px)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          }}>
            {ICONS[t.type]}
            <span style={{ flex: 1, color: '#e2e8f0' }}>{t.message}</span>
            <button onClick={() => onRemove(t.id)} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#64748b', padding: '2px', display: 'flex',
            }}><X size={14} /></button>
          </div>
        )
      })}
    </div>
  )
}
