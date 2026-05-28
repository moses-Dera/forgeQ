import React, { useEffect, useState } from 'react';

export function Dashboard() {
  const [status, setStatus] = useState({
    queue: {},
    database: {},
    workers: [],
    recentTasks: [],
  });
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    // Connect directly to the backend WebSocket server on port 3000
    const ws = new WebSocket(`${wsProtocol}//${window.location.hostname}:3000`);

    ws.onopen = () => setIsConnected(true);
    ws.onclose = () => setIsConnected(false);

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'status_update') {
        setStatus(data);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setIsConnected(false);
    };

    return () => ws.close();
  }, []);

  const totalQueued = status.queue.queued || 0;
  const totalProcessing = status.queue.active || 0;
  const totalCompleted = status.queue.completed || 0;
  const totalFailed = status.queue.failed || 0;

  const isHealthy = totalProcessing > 0 || status.workers.length > 0;

  return (
    <div style={{ padding: '40px', maxWidth: '1400px', margin: '0 auto' }}>
      <header style={{ marginBottom: '40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '36px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '40px' }}>⚡</span> ForgeQ
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '18px' }}>Distributed Task Processing Engine</p>
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <div className="glass-panel" style={{ padding: '12px 24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span className={`status-dot ${isConnected ? 'healthy' : 'idle'}`} style={{ backgroundColor: isConnected ? 'var(--accent-green)' : 'var(--accent-red)' }}></span>
            <span style={{ fontWeight: 500 }}>{isConnected ? 'Connected' : 'Disconnected'}</span>
          </div>
          <div className="glass-panel" style={{ padding: '12px 24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span className={`status-dot ${isHealthy ? 'healthy' : 'idle'}`}></span>
            <span style={{ fontWeight: 500 }}>System {isHealthy ? 'Healthy' : 'Idle'}</span>
          </div>
        </div>
      </header>

      {/* Status Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginBottom: '40px' }}>
        <StatusCard title="Queued" value={totalQueued} type="queued" icon="⏳" />
        <StatusCard title="Processing" value={totalProcessing} type="processing" icon="⚙️" />
        <StatusCard title="Completed" value={totalCompleted} type="completed" icon="✅" />
        <StatusCard title="Failed" value={totalFailed} type="failed" icon="❌" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}>
        {/* Worker Panel */}
        <div className="glass-panel" style={{ maxHeight: '500px', overflowY: 'auto' }}>
          <h2 style={{ marginBottom: '20px', fontSize: '20px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '12px' }}>
            Active Workers ({status.workers.length})
          </h2>
          {status.workers.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '40px 0' }}>
              <span style={{ fontSize: '32px', display: 'block', marginBottom: '12px' }}>💤</span>
              No workers connected
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {status.workers.map(worker => (
                <div key={worker.worker_id} style={{ 
                  background: 'rgba(255,255,255,0.03)', 
                  padding: '16px', 
                  borderRadius: '12px',
                  border: '1px solid var(--glass-border)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontFamily: 'monospace', color: 'var(--text-secondary)' }}>
                      {worker.worker_id.slice(0, 13)}...
                    </span>
                    <span className={`badge ${worker.status === 'alive' ? 'completed' : 'failed'}`}>
                      {worker.status === 'alive' ? 'LIVE' : 'DOWN'}
                    </span>
                  </div>
                  <div style={{ fontSize: '14px' }}>
                    <strong style={{ color: 'var(--text-primary)' }}>{worker.processed_count}</strong> tasks processed
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Tasks */}
        <div className="glass-panel" style={{ maxHeight: '500px', display: 'flex', flexDirection: 'column' }}>
          <h2 style={{ marginBottom: '20px', fontSize: '20px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '12px' }}>
            Recent Activity
          </h2>
          <div style={{ overflowY: 'auto', flex: 1, paddingRight: '8px' }}>
            {status.recentTasks.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '40px 0' }}>
                <span style={{ fontSize: '32px', display: 'block', marginBottom: '12px' }}>📋</span>
                No tasks in the queue yet
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {status.recentTasks.map(task => (
                  <div key={task.task_id} style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    padding: '16px',
                    background: 'rgba(255,255,255,0.02)',
                    borderRadius: '12px',
                    transition: 'background 0.2s ease',
                  }}
                  onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                  onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <span style={{ fontFamily: 'monospace', color: 'var(--text-secondary)', fontSize: '14px' }}>
                        {task.task_id.slice(0, 8)}
                      </span>
                      <span className={`badge ${task.status}`}>
                        {task.status.toUpperCase()}
                      </span>
                    </div>
                    <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                      {new Date(task.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second:'2-digit' })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusCard({ title, value, type, icon }) {
  const getGlowColor = () => {
    switch(type) {
      case 'queued': return 'var(--accent-yellow)';
      case 'processing': return 'var(--accent-blue)';
      case 'completed': return 'var(--accent-green)';
      case 'failed': return 'var(--accent-red)';
      default: return 'transparent';
    }
  };

  return (
    <div className="glass-panel" style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      position: 'relative',
      overflow: 'hidden'
    }}
    onMouseOver={(e) => {
      e.currentTarget.style.transform = 'translateY(-4px)';
      e.currentTarget.style.boxShadow = `0 12px 40px 0 ${getGlowColor()}33`;
    }}
    onMouseOut={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = 'var(--glass-shadow)';
    }}
    >
      <div style={{ 
        position: 'absolute', 
        top: 0, 
        left: 0, 
        width: '100%', 
        height: '4px', 
        background: getGlowColor() 
      }}></div>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <span style={{ color: 'var(--text-secondary)', fontSize: '15px', fontWeight: 500 }}>{title}</span>
        <span style={{ fontSize: '20px', opacity: 0.8 }}>{icon}</span>
      </div>
      
      <div style={{ fontSize: '42px', fontWeight: 700, color: 'var(--text-primary)' }}>
        {value.toLocaleString()}
      </div>
    </div>
  );
}
