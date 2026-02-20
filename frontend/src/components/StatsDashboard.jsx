import { TrendingUp, Ticket, AlertCircle, Clock } from 'lucide-react'
import { StatsSkeleton } from './Skeletons.jsx'
import { PRIORITY_SCHEME, CATEGORY_SCHEME } from './UI.jsx'

const PRIORITY_COLORS = { low: '#10b981', medium: '#f59e0b', high: '#ef4444', critical: '#dc2626' }
const CATEGORY_COLORS = { billing: '#6366f1', technical: '#06b6d4', account: '#8b5cf6', general: '#64748b' }
const STATUS_COLORS = { open: '#6366f1', in_progress: '#f59e0b', resolved: '#10b981', closed: '#475569' }

function StatCard({ icon, label, value, sub, accent }) {
  return (
    <div style={{
      background: '#13151f', border: '1px solid #2a2d45', borderRadius: '16px',
      padding: '22px 24px', transition: 'border-color 0.2s',
      borderTop: `3px solid ${accent || '#6366f1'}`,
    }}
      onMouseEnter={e => e.currentTarget.style.borderColor = accent || '#6366f1'}
      onMouseLeave={e => e.currentTarget.style.borderColor = '#2a2d45'}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px' }}>{label}</div>
          <div style={{ fontSize: '34px', fontWeight: 800, color: '#e2e8f0', lineHeight: 1 }}>{value}</div>
          {sub && <div style={{ fontSize: '12px', color: '#475569', marginTop: '6px' }}>{sub}</div>}
        </div>
        <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: `${accent}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: accent, flexShrink: 0 }}>
          {icon}
        </div>
      </div>
    </div>
  )
}

function BarBreakdown({ title, data, colors, total }) {
  return (
    <div style={{ background: '#13151f', border: '1px solid #2a2d45', borderRadius: '16px', padding: '22px 24px' }}>
      <div style={{ fontSize: '13px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '18px' }}>{title}</div>
      {Object.entries(data || {}).map(([key, val]) => {
        const pct = total ? Math.round((val / total) * 100) : 0
        return (
          <div key={key} style={{ marginBottom: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
              <span style={{ fontSize: '13px', color: '#94a3b8', textTransform: 'capitalize', fontWeight: 500 }}>
                {key.replace('_', ' ')}
              </span>
              <span style={{ fontSize: '13px', color: '#e2e8f0', fontWeight: 600 }}>{val} <span style={{ color: '#475569', fontWeight: 400 }}>({pct}%)</span></span>
            </div>
            <div style={{ height: '7px', borderRadius: '4px', background: '#1a1d2e', overflow: 'hidden' }}>
              <div style={{
                height: '100%', width: `${pct}%`, background: colors[key] || '#6366f1',
                borderRadius: '4px', transition: 'width 0.8s cubic-bezier(0.4,0,0.2,1)',
                boxShadow: `0 0 8px ${colors[key]}60`,
              }} />
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default function StatsDashboard({ stats, loading }) {
  if (loading) return <StatsSkeleton />
  if (!stats) return null

  const resolutionRate = stats.total_tickets
    ? Math.round(((stats.total_tickets - stats.open_tickets) / stats.total_tickets) * 100)
    : 0

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '20px' }}>
        <StatCard icon={<Ticket size={18}/>} label="Total Tickets" value={stats.total_tickets} sub="All time" accent="#6366f1" />
        <StatCard icon={<AlertCircle size={18}/>} label="Open Tickets" value={stats.open_tickets} sub="Awaiting response" accent="#f59e0b" />
        <StatCard icon={<Clock size={18}/>} label="Overdue" value={stats.overdue_tickets || 0} sub="Past due date" accent="#ef4444" />
        <StatCard icon={<TrendingUp size={18}/>} label="Resolution Rate" value={`${resolutionRate}%`} sub={`${stats.avg_tickets_per_day}/day avg`} accent="#10b981" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
        <BarBreakdown title="By Priority" data={stats.priority_breakdown} colors={PRIORITY_COLORS} total={stats.total_tickets} />
        <BarBreakdown title="By Category" data={stats.category_breakdown} colors={CATEGORY_COLORS} total={stats.total_tickets} />
        <BarBreakdown title="By Status" data={stats.status_breakdown} colors={STATUS_COLORS} total={stats.total_tickets} />
      </div>
    </div>
  )
}
