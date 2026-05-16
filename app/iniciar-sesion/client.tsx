'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import AuthGuard from '@/components/auth/AuthGuard';
import '../auth.css';

const EyeOpen = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
);
const EyeClosed = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);

function mapFirebaseError(code: string): string {
  const map: Record<string, string> = {
    'auth/invalid-email':         'El correo electrónico no es válido.',
    'auth/user-not-found':        'No existe una cuenta con este correo.',
    'auth/wrong-password':        'Contraseña incorrecta.',
    'auth/invalid-credential':    'Correo o contraseña incorrectos.',
    'auth/too-many-requests':     'Demasiados intentos. Esperá unos minutos.',
    'auth/user-disabled':         'Esta cuenta fue deshabilitada.',
    'auth/network-request-failed':'Sin conexión. Revisá tu internet.',
  };
  return map[code] ?? 'Ocurrió un error. Intentá de nuevo.';
}

function LoginForm() {
  const router = useRouter();
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [showPw, setShowPw]       = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [lastResetTime, setLastResetTime] = useState<number>(0);
  const emailRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    if (error || resetSent) {
      timeoutId = setTimeout(() => {
        setError('');
        setResetSent(false);
      }, 8000);
    }
    return () => clearTimeout(timeoutId);
  }, [error, resetSent]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const persistence = rememberMe ? browserLocalPersistence : browserSessionPersistence;
      await setPersistence(auth, persistence);
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/mi-espacio');
    } catch (err: any) {
      setError(mapFirebaseError(err.code));
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    const target = email.trim();
    if (!target) { emailRef.current?.focus(); setError('Ingresá tu correo primero.'); return; }
    
    const now = Date.now();
    const COOLDOWN_MS = 2 * 60 * 1000; // 2 minutos
    if (now - lastResetTime < COOLDOWN_MS) {
      const remainingSeconds = Math.ceil((COOLDOWN_MS - (now - lastResetTime)) / 1000);
      const mins = Math.floor(remainingSeconds / 60);
      const secs = remainingSeconds % 60;
      setError(`Por favor, esperá ${mins > 0 ? mins + ' min y ' : ''}${secs} seg antes de volver a solicitarlo.`);
      return;
    }

    setError(''); setLoading(true);
    try {
      await sendPasswordResetEmail(auth, target);
      setResetSent(true);
      setLastResetTime(Date.now());
    } catch (err: any) {
      setError(mapFirebaseError(err.code));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <div className="auth-card">
        {/* Left panel */}
        <aside className="auth-left" aria-hidden="true">
          <div className="auth-left-noise" />
          <div className="auth-left-flowers">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/assets/images/hero/flor.webp"   className="auth-flower auth-flower--left"  alt="" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/assets/images/hero/flores.webp" className="auth-flower auth-flower--right" alt="" />
          </div>
          <div className="auth-left-logo">
            <Link href="/">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/assets/images/ui/vitalia-logo.svg" alt="Vitalia — inicio" />
            </Link>
          </div>
          <div className="auth-left-copy">
            <p className="auth-left-quote">Tu espacio de bienestar</p>
            <h2 className="auth-left-headline">Bienvenido de vuelta.<br /><em>Seguí cuidándote</em>.</h2>
            <div className="auth-left-badges">
              <span className="wellness-badge">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                Bienestar emocional
              </span>
              <span className="wellness-badge">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M17 8C8 10 5.9 16.17 3.82 22c-.36 1 .53 1.93 1.46 1.54C13 21 17.5 16.5 17 8z"/></svg>
                Hábitos saludables
              </span>
              <span className="wellness-badge">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                Planes personalizados
              </span>
            </div>
          </div>
        </aside>

        {/* Right panel */}
        <section className="auth-right" aria-label="Formulario de inicio de sesión" style={{ justifyContent: 'center' }}>
          <div className="auth-eyebrow"><span className="auth-eyebrow-dot" />Acceso seguro</div>
          <h1 className="auth-title">Bienvenido de nuevo</h1>
          <p className="auth-subtitle">Iniciá sesión para continuar tu transformación<br />hacia el bienestar integral.</p>

          {error && (
            <div className="auth-error" role="alert" style={{ display: 'flex', alignItems: 'center', gap: '8px', lineHeight: 1.4 }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ width: '18px', height: '18px', flexShrink: 0 }}>
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              <span style={{ flex: 1 }}>{error}</span>
              <button type="button" onClick={() => setError('')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', opacity: 0.7, padding: '4px' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ width: '16px', height: '16px' }}><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
          )}
          {resetSent && (
            <div className="auth-success" role="status" style={{ display: 'flex', alignItems: 'center', gap: '8px', lineHeight: 1.4 }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ width: '18px', height: '18px', flexShrink: 0 }}>
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
              <span style={{ flex: 1 }}>Revisá tu bandeja de entrada para restablecer tu contraseña.</span>
              <button type="button" onClick={() => setResetSent(false)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', opacity: 0.7, padding: '4px' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ width: '16px', height: '16px' }}><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
          )}

          <form id="loginForm" onSubmit={handleLogin} noValidate>
            <div className="auth-field">
              <input ref={emailRef} id="loginEmail" type="email" className="auth-input" placeholder=" "
                autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} />
              <label htmlFor="loginEmail">Correo electrónico</label>
            </div>
            <div className="auth-field">
              <div className="auth-input-wrap">
                <input id="loginPassword" type={showPw ? 'text' : 'password'} className="auth-input" placeholder=" "
                  autoComplete="current-password" required value={password} onChange={e => setPassword(e.target.value)} />
                <label htmlFor="loginPassword">Contraseña</label>
                <button type="button" className="auth-toggle-pw" onClick={() => setShowPw(p => !p)}
                  aria-label={showPw ? 'Ocultar contraseña' : 'Mostrar contraseña'}>
                  {showPw ? <EyeClosed /> : <EyeOpen />}
                </button>
              </div>
            </div>
            <div className="auth-options" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '4px 0 24px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: 'var(--text-muted)', cursor: 'pointer', userSelect: 'none' }}>
                <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} style={{ accentColor: 'var(--purple)', width: '16px', height: '16px', cursor: 'pointer' }} />
                Recuérdame
              </label>
              <button type="button" style={{ all: 'unset', cursor: 'pointer', fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 500 }} onClick={handleForgotPassword}>
                ¿Olvidaste tu contraseña?
              </button>
            </div>
            <button type="submit" id="loginBtn" className="auth-btn" disabled={loading}>
              {loading ? <><span className="btn-spinner" />Iniciando...</> : 'Iniciar sesión'}
            </button>
          </form>
          <div className="auth-divider">o</div>
          <p className="auth-footer-row">¿No tenés cuenta?&nbsp;<Link href="/crear-cuenta">Registrate gratis</Link></p>
        </section>
      </div>
    </main>
  );
}

export default function IniciarSesionClient() {
  return (
    <AuthGuard redirectIfAuthenticated>
      <LoginForm />
    </AuthGuard>
  );
}
