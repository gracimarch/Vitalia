'use client';

import type { Metadata } from 'next';

export default function NotFound() {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', minHeight: '60vh', textAlign: 'center',
      padding: '2rem', fontFamily: 'var(--font-primary)',
    }}>
      <p style={{ fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--purple)', marginBottom: '0.5rem' }}>
        Error 404
      </p>
      <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 700, color: 'var(--black)', marginBottom: '1rem', lineHeight: 1.2 }}>
        Página no encontrada
      </h1>
      <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', maxWidth: '500px', marginBottom: '2rem', lineHeight: 1.6 }}>
        La página que buscás no existe o fue movida. Revisá la URL o volvé atrás.
      </p>
      <button
        onClick={() => window.history.back()}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
          background: 'var(--purple)', color: '#fff',
          padding: '0.75rem 2rem', borderRadius: '50px',
          fontWeight: 600, fontSize: '1rem', textDecoration: 'none',
          border: 'none', cursor: 'pointer',
          transition: 'background 0.2s ease',
        }}
      >
        Volver atrás
      </button>
    </div>
  );
}
