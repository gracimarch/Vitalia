'use client';

import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', minHeight: '60vh', textAlign: 'center',
      padding: '2rem', fontFamily: 'var(--font-primary)',
    }}>
      <p style={{ fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-error)', marginBottom: '0.5rem' }}>
        Algo salió mal
      </p>
      <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', fontWeight: 700, color: 'var(--black)', marginBottom: '1rem' }}>
        Se produjo un error inesperado
      </h2>
      <p style={{ fontSize: '1rem', color: 'var(--text-muted)', maxWidth: '480px', marginBottom: '2rem', lineHeight: 1.6 }}>
        Podés intentar recargar la página o volver al inicio.
      </p>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <button
          onClick={reset}
          style={{
            background: 'var(--purple)', color: '#fff',
            padding: '0.75rem 2rem', borderRadius: '50px',
            fontWeight: 600, fontSize: '1rem', border: 'none',
            cursor: 'pointer', fontFamily: 'var(--font-primary)',
          }}
        >
          Intentar de nuevo
        </button>
        <Link
          href="/"
          style={{
            border: '1.5px solid var(--border-color)', color: 'var(--text-color)',
            padding: '0.75rem 2rem', borderRadius: '50px',
            fontWeight: 600, fontSize: '1rem', textDecoration: 'none',
          }}
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
