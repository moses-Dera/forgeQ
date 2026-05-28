import React, { useState } from 'react';
import axios from 'axios';

export function ControlPanel() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const api = axios.create({
    // Changed baseURL to just /api to utilize Vite's proxy and avoid CORS
    baseURL: `/api`,
  });

  const handleAction = async (action, payload = {}) => {
    try {
      setLoading(true);
      setMessage('');
      const response = await api.post(`/actions/${action}`, payload);
      setMessage(`✅ ${action}: ${response.data.message || 'Success'}`);
    } catch (error) {
      setMessage(`❌ Error: ${error.response?.data?.error || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel" style={{
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      padding: '24px',
      minWidth: '320px',
      zIndex: 1000,
    }}>
      <h3 style={{ marginTop: 0, marginBottom: '20px', fontSize: '18px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
        ⚙️ Control Panel
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <button
          onClick={() => handleAction('load-test', { count: 100 })}
          disabled={loading}
          style={buttonStyle('var(--accent-blue)')}
          onMouseOver={(e) => !loading && (e.currentTarget.style.transform = 'translateY(-2px)')}
          onMouseOut={(e) => !loading && (e.currentTarget.style.transform = 'translateY(0)')}
        >
          <span>🔥</span> Load Test (100)
        </button>

        <button
          onClick={() => handleAction('pause-queue')}
          disabled={loading}
          style={buttonStyle('var(--accent-yellow)')}
          onMouseOver={(e) => !loading && (e.currentTarget.style.transform = 'translateY(-2px)')}
          onMouseOut={(e) => !loading && (e.currentTarget.style.transform = 'translateY(0)')}
        >
          <span>⏸️</span> Pause Queue
        </button>

        <button
          onClick={() => handleAction('resume-queue')}
          disabled={loading}
          style={buttonStyle('var(--accent-green)')}
          onMouseOver={(e) => !loading && (e.currentTarget.style.transform = 'translateY(-2px)')}
          onMouseOut={(e) => !loading && (e.currentTarget.style.transform = 'translateY(0)')}
        >
          <span>▶️</span> Resume Queue
        </button>

        <button
          onClick={() => handleAction('clear-failed')}
          disabled={loading}
          style={buttonStyle('var(--accent-red)')}
          onMouseOver={(e) => !loading && (e.currentTarget.style.transform = 'translateY(-2px)')}
          onMouseOut={(e) => !loading && (e.currentTarget.style.transform = 'translateY(0)')}
        >
          <span>🗑️</span> Clear Failed
        </button>
      </div>

      {message && (
        <div style={{
          marginTop: '20px',
          padding: '12px',
          background: message.includes('✅') ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
          color: message.includes('✅') ? 'var(--accent-green)' : 'var(--accent-red)',
          border: `1px solid ${message.includes('✅') ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
          borderRadius: '8px',
          fontSize: '13px',
          wordBreak: 'break-word',
          animation: 'pulse 0.3s ease-out'
        }}>
          {message}
        </div>
      )}
    </div>
  );
}

function buttonStyle(color) {
  return {
    padding: '12px 16px',
    background: 'rgba(255, 255, 255, 0.03)',
    color: 'var(--text-primary)',
    border: `1px solid rgba(255, 255, 255, 0.1)`,
    borderLeft: `4px solid ${color}`,
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    transition: 'all 0.2s ease',
    outline: 'none',
  };
}
