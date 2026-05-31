'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="not-found-page">
      {/* Decorative blobs */}
      <div className="nf-blob nf-blob--1" aria-hidden="true" />
      <div className="nf-blob nf-blob--2" aria-hidden="true" />
      <div className="nf-blob nf-blob--3" aria-hidden="true" />

      <div className="nf-content">
        {/* Badge */}
        <p className="nf-badge">Página no encontrada</p>

        {/* Big 404 number */}
        <div className="nf-number" aria-hidden="true">404</div>

        {/* Headline */}
        <h1 className="nf-title">
          Ups, parece que te{' '}
          <span>perdiste</span>
        </h1>

        {/* Description */}
        <p className="nf-description">
          La página que estás buscando no existe o fue movida a otra
          dirección. No te preocupes, podés volver a donde estabas o ir
          al inicio.
        </p>

        {/* Actions */}
        <div className="nf-actions">
          <button
            id="nf-btn-back"
            className="nf-btn nf-btn--ghost"
            onClick={() => router.back()}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
            Volver atrás
          </button>

          <Link id="nf-btn-home" href="/" className="nf-btn nf-btn--primary">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            Ir al inicio
          </Link>
        </div>
      </div>

      <style>{`
        .not-found-page {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          margin-top: -64px;
          padding: calc(64px + 3rem) 1.5rem 3rem;
          overflow: hidden;
          text-align: center;
          font-family: var(--font-primary);
        }

        /* ── Decorative blobs ── */
        .nf-blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          pointer-events: none;
          z-index: 0;
          animation: nfFloat 8s ease-in-out infinite;
        }
        .nf-blob--1 {
          width: 520px; height: 520px;
          top: -140px; left: -160px;
          background: radial-gradient(circle, rgba(181,113,222,0.22) 0%, transparent 70%);
          animation-delay: 0s;
        }
        .nf-blob--2 {
          width: 400px; height: 400px;
          bottom: -100px; right: -120px;
          background: radial-gradient(circle, rgba(43,196,188,0.18) 0%, transparent 70%);
          animation-delay: -3s;
        }
        .nf-blob--3 {
          width: 280px; height: 280px;
          top: 40%; left: 55%;
          background: radial-gradient(circle, rgba(225,148,127,0.14) 0%, transparent 70%);
          animation-delay: -5s;
        }
        @keyframes nfFloat {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-20px) scale(1.04); }
        }

        /* ── Content ── */
        .nf-content {
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          max-width: 560px;
          width: 100%;
          gap: 0;
        }

        /* ── Big 404 ── */
        .nf-number {
          font-size: clamp(7rem, 22vw, 14rem);
          font-weight: 900;
          line-height: 1;
          letter-spacing: -0.04em;
          background: linear-gradient(
            135deg,
            rgba(181,113,222,0.18) 0%,
            rgba(43,196,188,0.12) 100%
          );
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          -webkit-text-stroke: 2px rgba(181,113,222,0.35);
          user-select: none;
          margin-bottom: 1rem;
          animation: nfPulseNum 4s ease-in-out infinite;
        }
        @keyframes nfPulseNum {
          0%, 100% { -webkit-text-stroke-color: rgba(181,113,222,0.35); }
          50%       { -webkit-text-stroke-color: rgba(181,113,222,0.65); }
        }

        /* ── Badge ── */
        .nf-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--purple);
          background: rgba(181,113,222,0.1);
          border: 1px solid rgba(181,113,222,0.25);
          padding: 0.3rem 0.9rem;
          border-radius: var(--radius-full);
          margin-bottom: 1.1rem;
        }

        /* ── Title ── */
        .nf-title {
          font-family: var(--font-secondary);
          font-size: clamp(1.85rem, 5vw, 3rem);
          font-weight: 700;
          color: var(--black);
          line-height: 1.2;
          margin-bottom: 1rem;
        }
        .nf-title--highlight {
          background: linear-gradient(135deg, var(--purple), var(--teal));
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        /* ── Description ── */
        .nf-description {
          font-size: 1rem;
          color: var(--text-muted);
          line-height: 1.7;
          max-width: 440px;
          margin-bottom: 2.25rem;
        }

        /* ── Actions ── */
        .nf-actions {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex-wrap: wrap;
          justify-content: center;
        }

        .nf-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.6rem;
          border-radius: var(--radius-full);
          font-family: var(--font-primary);
          font-size: 0.925rem;
          font-weight: 600;
          cursor: pointer;
          text-decoration: none;
          border: none;
          transition:
            background 0.2s ease,
            color 0.2s ease,
            border-color 0.2s ease,
            transform 0.2s ease,
            box-shadow 0.2s ease;
        }

        .nf-btn--primary {
          background: var(--purple);
          color: #fff;
          box-shadow: var(--shadow-purple);
        }
        .nf-btn--primary:hover {
          background: var(--purple-hover);
          transform: translateY(-2px);
          box-shadow: 0 8px 28px rgba(181,113,222,0.45);
        }

        .nf-btn--ghost {
          background: transparent;
          color: var(--text-color);
          border: 1.5px solid var(--border-color);
        }
        .nf-btn--ghost:hover {
          border-color: var(--purple);
          color: var(--purple);
          background: rgba(181,113,222,0.06);
          transform: translateY(-2px);
        }

        /* ── Responsive ── */
        @media (max-width: 480px) {
          .nf-actions { flex-direction: column; width: 100%; }
          .nf-btn { width: 100%; justify-content: center; }
        }
      `}</style>
    </div>
  );
}
