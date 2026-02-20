import { useState } from 'react'
import api from '../utils/api.js'
import TicketCard from './TicketCard.jsx'
import TicketModal from './TicketModal.jsx'
import { TicketSkeleton } from './Skeletons.jsx'
import { Search, SlidersHorizontal, Download, CheckSquare, X } from 'lucide-react'

const selStyle = {
  background: '#13151f', border: '1px solid #2a2d45', borderRadius: '10px',
  padding: '9px 13px', color: '#e2e8f0', fontSize: '13px', outline: 'none', cursor: 'pointer',
}

export default function TicketList({ tickets, loading, onFilter, onUpdate, toast, isStaff, staffList }) {
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState({ category: '', priority: '', status: '', sort: '' })
  const [selectedModal, setSelectedModal] = useState(null)
  const [selected, setSelected] = useState(new Set())
  const [bulkAction, setBulkAction] = useState('')
  const [showBulk, setShowBulk] = useState(false)

  const apply = (overrides = {}) => {
    const params = { search, ...filters, ...overrides }
    const cleaned = Object.fromEntries(Object.entries(params).filter(([, v]) => v))
    onFilter(cleaned)
  }

  const setFilter = (key, val) => {
    const next = { ...filters, [key]: val }
    setFilters(next)
    apply(next)
  }

  const handleSearch = val => { setSearch(val); apply({ search: val }) }

  const clearFilters = () => {
    setSearch(''); setFilters({ category: '', priority: '', status: '', sort: '' })
    onFilter({})
  }

  const hasFilters = search || Object.values(filters).some(Boolean)

  const toggleSelect = id => {
    setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })
  }
  const selectAll = () => setSelected(new Set(tickets.map(t => t.id)))
  const clearSelected = () => setSelected(new Set())

  const applyBulkAction = async () => {
    if (!bulkAction || selected.size === 0) return
    const [field, value] = bulkAction.split(':')
    try {
      await api.post('/tickets/bulk_update/', { ids: [...selected], updates: { [field]: value } })
      toast(`Updated ${selected.size} ticket(s)`, 'success')
      clearSelected(); setBulkAction('')
      onFilter({})
    } catch { toast('Bulk update failed', 'error') }
  }

  const exportCSV = async () => {
    try {
      const res = await api.get('/tickets/export_csv/', { responseType: 'blob' })
      const url = URL.createObjectURL(res.data)
      const a = document.createElement('a'); a.href = url; a.download = 'tickets.csv'; a.click()
      URL.revokeObjectURL(url)
      toast('CSV exported!', 'success')
    } catch { toast('Export failed', 'error') }
  }

  return (
    <div>
      {/* Filter bar */}
      <div style={{ background: '#13151f', border: '1px solid #2a2d45', borderRadius: '14px', padding: '16px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Search */}
          <div style={{ position: 'relative', flex: '1', minWidth: '200px' }}>
            <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#475569', pointerEvents: 'none' }} />
            <input value={search} onChange={e => handleSearch(e.target.value)} placeholder="Search tickets..."
              style={{ ...selStyle, paddingLeft: '36px', width: '100%' }} />
          </div>
          <select style={selStyle} value={filters.category} onChange={e => setFilter('category', e.target.value)}>
            <option value="">All Categories</option>
            {['billing','technical','account','general'].map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select style={selStyle} value={filters.priority} onChange={e => setFilter('priority', e.target.value)}>
            <option value="">All Priorities</option>
            {['low','medium','high','critical'].map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          <select style={selStyle} value={filters.status} onChange={e => setFilter('status', e.target.value)}>
            <option value="">All Statuses</option>
            {['open','in_progress','resolved','closed'].map(s => <option key={s} value={s}>{s.replace('_',' ')}</option>)}
          </select>
          <select style={selStyle} value={filters.sort} onChange={e => setFilter('sort', e.target.value)}>
            <option value="">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="priority">By Priority</option>
            <option value="due_date">By Due Date</option>
          </select>
          {hasFilters && (
            <button onClick={clearFilters} style={{ ...selStyle, color: '#f87171', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <X size={13} /> Clear
            </button>
          )}
          <button onClick={exportCSV} style={{ ...selStyle, color: '#34d399', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Download size={13} /> Export
          </button>
          <button onClick={() => setShowBulk(s => !s)} style={{ ...selStyle, color: '#818cf8', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <CheckSquare size={13} /> Bulk
          </button>
        </div>

        {/* Bulk actions bar */}
        {showBulk && (
          <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #2a2d45', display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '12px', color: '#64748b' }}>{selected.size} selected</span>
            <button onClick={selectAll} style={{ fontSize: '12px', color: '#818cf8', background: 'none', border: 'none', cursor: 'pointer' }}>Select All</button>
            <button onClick={clearSelected} style={{ fontSize: '12px', color: '#64748b', background: 'none', border: 'none', cursor: 'pointer' }}>Clear</button>
            <select style={{ ...selStyle, fontSize: '12px' }} value={bulkAction} onChange={e => setBulkAction(e.target.value)}>
              <option value="">Bulk Action...</option>
              <optgroup label="Change Status">
                {['open','in_progress','resolved','closed'].map(s => <option key={s} value={`status:${s}`}>→ {s.replace('_',' ')}</option>)}
              </optgroup>
              <optgroup label="Change Priority">
                {['low','medium','high','critical'].map(p => <option key={p} value={`priority:${p}`}>Priority: {p}</option>)}
              </optgroup>
            </select>
            <button onClick={applyBulkAction} disabled={!bulkAction || selected.size === 0} style={{
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white', border: 'none',
              borderRadius: '8px', padding: '8px 14px', fontSize: '12px', cursor: 'pointer', fontWeight: 600,
              opacity: (!bulkAction || selected.size === 0) ? 0.5 : 1,
            }}>Apply</button>
          </div>
        )}
      </div>

      {/* Count */}
      <div style={{ fontSize: '13px', color: '#475569', marginBottom: '12px' }}>
        {loading ? 'Loading...' : `${tickets.length} ticket${tickets.length !== 1 ? 's' : ''}`}
      </div>

      {/* List */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {[1,2,3].map(i => <TicketSkeleton key={i} />)}
        </div>
      ) : tickets.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 20px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎉</div>
          <div style={{ fontSize: '18px', fontWeight: 600, color: '#e2e8f0', marginBottom: '8px' }}>No tickets found</div>
          <div style={{ color: '#475569', fontSize: '14px' }}>
            {hasFilters ? 'Try adjusting your filters' : 'No tickets have been submitted yet'}
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {tickets.map(t => (
            <TicketCard key={t.id} ticket={t}
              onClick={() => setSelectedModal(t)}
              selected={selected.has(t.id)}
              onSelect={toggleSelect}
              showCheckbox={showBulk}
            />
          ))}
        </div>
      )}

      {selectedModal && (
        <TicketModal
          ticket={tickets.find(t => t.id === selectedModal.id) || selectedModal}
          onClose={() => setSelectedModal(null)}
          onUpdate={t => { onUpdate(t); setSelectedModal(t) }}
          toast={toast}
          isStaff={isStaff}
          staffList={staffList}
        />
      )}
    </div>
  )
}
