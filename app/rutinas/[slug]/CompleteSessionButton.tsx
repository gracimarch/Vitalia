'use client';

import { useState } from 'react';
import { logSession } from '@/lib/progress';

export default function CompleteSessionButton({ durationStr }: { durationStr: string }) {
  const [completed, setCompleted] = useState(false);

  const handleComplete = () => {
    if (completed) return;
    const minutes = parseInt(durationStr, 10) || 20;
    logSession(minutes);
    setCompleted(true);
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '40px' }}>
      <button 
        className="espacio-generate-btn" 
        style={{ 
          maxWidth: '300px', 
          margin: '0 auto', 
          background: completed ? '#80CACD' : '#B571DE', 
          borderColor: 'transparent', 
          color: 'white',
          padding: '16px 24px',
          borderRadius: 'var(--radius-full)',
          fontSize: '1.1rem',
          fontWeight: 600,
          cursor: completed ? 'default' : 'pointer',
          transition: 'all 0.3s ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px'
        }}
        onClick={handleComplete}
        disabled={completed}
      >
        <i className={`fa-solid ${completed ? 'fa-check' : 'fa-trophy'}`}></i>
        {completed ? '¡Rutina Completada!' : 'Marcar como completada'}
      </button>
    </div>
  );
}
