export function TicketSkeleton() {
  return (
    <div style={{
      background: '#13151f', border: '1px solid #2a2d45', borderRadius: '14px', padding: '20px',
    }}>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
        <div className="skeleton" style={{ width: '40px', height: '18px' }} />
        <div className="skeleton" style={{ width: '70px', height: '18px' }} />
      </div>
      <div className="skeleton" style={{ width: '65%', height: '20px', marginBottom: '10px' }} />
      <div className="skeleton" style={{ width: '100%', height: '14px', marginBottom: '6px' }} />
      <div className="skeleton" style={{ width: '80%', height: '14px', marginBottom: '16px' }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <div className="skeleton" style={{ width: '60px', height: '22px', borderRadius: '20px' }} />
          <div className="skeleton" style={{ width: '60px', height: '22px', borderRadius: '20px' }} />
        </div>
        <div className="skeleton" style={{ width: '80px', height: '22px', borderRadius: '20px' }} />
      </div>
    </div>
  )
}

export function StatsSkeleton() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
      {[1,2,3,4].map(i => (
        <div key={i} style={{ background: '#13151f', border: '1px solid #2a2d45', borderRadius: '14px', padding: '22px' }}>
          <div className="skeleton" style={{ width: '60%', height: '12px', marginBottom: '12px' }} />
          <div className="skeleton" style={{ width: '40%', height: '32px', marginBottom: '8px' }} />
          <div className="skeleton" style={{ width: '50%', height: '12px' }} />
        </div>
      ))}
    </div>
  )
}
