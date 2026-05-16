'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  createUserWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import AuthGuard from '@/components/auth/AuthGuard';
import '../auth.css';

/* ── Types ──────────────────────────────────────────────────── */
interface FormData {
  email: string;
  password: string;
  confirmPassword: string;
  terms: boolean;
  firstName: string;
  lastName: string;
  country: string;
  age: string;
  gender: string;
  disability: string;
  physicalActivity: string;
  diet: string;
  restrictions: string[];
  otherRestriction: string;
  objetivos: string[];
  obstaculos: string[];
  sleepQuality: string;
  stress: string;
  dailyRoutine: string;
  lifestyle: string;
}

const INITIAL: FormData = {
  email: '', password: '', confirmPassword: '', terms: false,
  firstName: '', lastName: '', country: '', age: '', gender: '',
  disability: '', physicalActivity: '', diet: '', restrictions: [],
  otherRestriction: '', objetivos: [], obstaculos: [], sleepQuality: '',
  stress: '', dailyRoutine: '', lifestyle: '',
};

const TOTAL_STEPS = 5;

/* ── Firebase error → Spanish ──────────────────────────────── */
function mapError(code: string): string {
  const map: Record<string, string> = {
    'auth/email-already-in-use': 'Ya existe una cuenta con este correo.',
    'auth/invalid-email':        'El correo no es válido.',
    'auth/weak-password':        'La contraseña debe tener al menos 6 caracteres.',
    'auth/network-request-failed': 'Sin conexión. Revisá tu internet.',
  };
  return map[code] ?? 'Ocurrió un error. Intentá de nuevo.';
}

/* ── Eye icon ───────────────────────────────────────────────── */
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

/* ── Checkbox helper ────────────────────────────────────────── */
function toggleArr(arr: string[], val: string): string[] {
  return arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val];
}

/* ── Choice component ───────────────────────────────────────── */
function Choice({ type, name, id, value, label, checked, onChange }: {
  type: 'radio' | 'checkbox'; name: string; id: string; value: string;
  label: string; checked: boolean; onChange: () => void;
}) {
  return (
    <label className="reg-choice" htmlFor={id}>
      <input type={type} id={id} name={name} value={value} checked={checked}
        onChange={onChange} />
      {label}
    </label>
  );
}

/* ══════════════════════════════════════════════════════════════
   REGISTER FORM
   ══════════════════════════════════════════════════════════════ */
function RegisterForm() {
  const router   = useRouter();
  const [step, setStep]   = useState(0);   // 0-indexed: 0..4
  const [data, setData]   = useState<FormData>(INITIAL);
  const [showPw, setShowPw]   = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const rightRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    if (error) {
      timeoutId = setTimeout(() => setError(''), 8000);
    }
    return () => clearTimeout(timeoutId);
  }, [error]);

  const set = useCallback(<K extends keyof FormData>(key: K, val: FormData[K]) => {
    setData(d => ({ ...d, [key]: val }));
    setError('');
  }, []);

  /* ── Validation per step ──────────────────────────────────── */
  const validate = (): string => {
    if (step === 0) {
      if (!data.email.trim()) return 'El correo es obligatorio.';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) return 'Ingresá un correo válido.';
      if (data.password.length < 8) return 'La contraseña debe tener al menos 8 caracteres.';
      if (data.password !== data.confirmPassword) return 'Las contraseñas no coinciden.';
      if (!data.terms) return 'Debés aceptar los términos y condiciones.';
    }
    if (step === 1) {
      if (!data.firstName.trim()) return 'El nombre es obligatorio.';
      if (!data.lastName.trim())  return 'El apellido es obligatorio.';
      if (!data.country)          return 'Seleccioná tu país.';
      if (!data.age || +data.age < 13) return 'Ingresá una edad válida (mínimo 13 años).';
      if (!data.gender)           return 'Seleccioná cómo te identificás.';
    }
    if (step === 2) {
      if (!data.disability)       return 'Respondé sobre tu discapacidad.';
      if (!data.physicalActivity) return 'Seleccioná tu nivel de actividad.';
      if (!data.diet)             return 'Describí tu dieta.';
      if (data.restrictions.length === 0) return 'Indicá tus restricciones alimentarias (o elegí "Ninguna restricción").';
      if (data.restrictions.includes('Otros') && !data.otherRestriction.trim()) return 'Por favor, especificá tu otra restricción alimentaria.';
    }
    if (step === 3) {
      if (data.objetivos.length === 0) return 'Seleccioná al menos una meta de bienestar.';
      if (data.obstaculos.length === 0) return 'Seleccioná al menos un obstáculo.';
      if (!data.sleepQuality)     return 'Indicá tu calidad de sueño.';
    }
    if (step === 4) {
      if (!data.stress)           return 'Indicá si sentís estrés con frecuencia.';
      if (!data.dailyRoutine)     return 'Describí tu rutina diaria.';
      if (!data.lifestyle)        return 'Describí tu estilo de vida.';
    }
    return '';
  };

  const next = () => {
    const err = validate();
    if (err) { setError(err); return; }
    setError('');
    setStep(s => s + 1);
    rightRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const prev = () => { 
    setError(''); 
    setStep(s => s - 1); 
    rightRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /* ── Submit ─────────────────────────────────────────────── */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validate();
    if (err) { setError(err); return; }
    setLoading(true); setError('');
    try {
      const { user } = await createUserWithEmailAndPassword(auth, data.email, data.password);
      await updateProfile(user, { displayName: `${data.firstName} ${data.lastName}` });
      await setDoc(doc(db, 'users', user.uid), {
        email:          data.email,
        firstName:      data.firstName,
        lastName:       data.lastName,
        country:        data.country,
        age:            +data.age,
        gender:         data.gender,
        disability:     data.disability,
        physicalActivity: data.physicalActivity,
        diet:           data.diet,
        restrictions:   data.restrictions,
        otherRestriction: data.otherRestriction,
        objetivos:      data.objetivos,
        obstaculos:     data.obstaculos,
        sleepQuality:   data.sleepQuality,
        stress:         data.stress,
        dailyRoutine:   data.dailyRoutine,
        lifestyle:      data.lifestyle,
        createdAt:      serverTimestamp(),
        plan:           'free',
      });
      router.push('/mi-espacio');
    } catch (err: any) {
      setError(mapError(err.code));
      setStep(0); // volver al paso de credenciales si hay error de auth
    } finally {
      setLoading(false);
    }
  };

  /* ── Countries list (abbreviated for DX, full list from original) ─── */
  const countries = [
    'Argentina','Bolivia','Brasil','Chile','Colombia','Costa Rica','Cuba',
    'Ecuador','El Salvador','España','Estados Unidos','Guatemala','Honduras',
    'México','Nicaragua','Panamá','Paraguay','Perú','República Dominicana',
    'Uruguay','Venezuela',
    // Add more as needed — complete list is in form.html
  ];

  /* ── Left panel step dots ─────────────────────────────── */
  const dots = Array.from({ length: TOTAL_STEPS }, (_, i) => (
    <div
      key={i}
      className={`auth-left-step-dot${i === step ? ' current' : i < step ? ' done' : ''}`}
    />
  ));

  /* ═══════════════════════════════════════════════════════
     STEP CONTENT
     ═══════════════════════════════════════════════════════ */
  const stepContent = [
    /* Step 0 — Credentials */
    <>
      <div className="reg-section-header">
        <div className="reg-eyebrow"><span className="reg-eyebrow-dot"/>Paso 1</div>
        <h1 className="reg-title">Creá tu cuenta</h1>
        <p className="reg-subtitle">Tus datos están protegidos con cifrado de extremo a extremo.</p>
      </div>
      <div className="auth-field">
        <input id="email" type="email" className="auth-input" placeholder=" " autoComplete="email" required
          value={data.email} onChange={e => set('email', e.target.value)} />
        <label htmlFor="email">Correo electrónico</label>
      </div>
      <div className="auth-field">
        <div className="auth-input-wrap">
          <input id="password" type={showPw ? 'text' : 'password'} className="auth-input" placeholder=" "
            autoComplete="new-password" required value={data.password}
            onChange={e => set('password', e.target.value)} />
          <label htmlFor="password">Contraseña (mínimo 8 caracteres)</label>
          <button type="button" className="auth-toggle-pw" onClick={() => setShowPw(p => !p)}
            aria-label={showPw ? 'Ocultar contraseña' : 'Mostrar contraseña'}>
            {showPw ? <EyeClosed /> : <EyeOpen />}
          </button>
        </div>
      </div>
      <div className="auth-field">
        <input id="confirmPassword" type="password" className="auth-input" placeholder=" "
          autoComplete="new-password" required value={data.confirmPassword}
          onChange={e => set('confirmPassword', e.target.value)} />
        <label htmlFor="confirmPassword">Repetir contraseña</label>
      </div>
      <label className="reg-terms">
        <input type="checkbox" id="terms" checked={data.terms} onChange={e => set('terms', e.target.checked)} />
        <span>He leído y acepto los{' '}
          <a href="/terminos" target="_blank">Términos y Condiciones</a>{' '}
          y la{' '}
          <a href="/privacidad" target="_blank">Política de Privacidad</a>
        </span>
      </label>
    </>,

    /* Step 1 — Personal data */
    <>
      <div className="reg-section-header">
        <div className="reg-eyebrow"><span className="reg-eyebrow-dot"/>Paso 2</div>
        <h2 className="reg-title">Contanos sobre vos</h2>
        <p className="reg-subtitle">Usamos esta información para personalizar tu experiencia.</p>
      </div>
      <div className="reg-row">
        <div className="auth-field">
          <input id="firstName" type="text" className="auth-input" placeholder=" " autoComplete="given-name" required
            value={data.firstName} onChange={e => set('firstName', e.target.value)} />
          <label htmlFor="firstName">Nombre</label>
        </div>
        <div className="auth-field">
          <input id="lastName" type="text" className="auth-input" placeholder=" " autoComplete="family-name" required
            value={data.lastName} onChange={e => set('lastName', e.target.value)} />
          <label htmlFor="lastName">Apellido</label>
        </div>
      </div>
      <div className="reg-row">
        <div className="auth-field">
          <select id="country" className={`auth-input${data.country ? ' has-value' : ''}`} required
            value={data.country} onChange={e => set('country', e.target.value)}>
            <option value="" disabled />
            {countries.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <label htmlFor="country">País</label>
        </div>
        <div className="auth-field">
          <input id="age" type="number" className="auth-input" placeholder=" " min={13} max={100} required
            value={data.age} onChange={e => set('age', e.target.value)} />
          <label htmlFor="age">Edad</label>
        </div>
      </div>
      <p className="reg-question">¿Cómo te identificás?</p>
      <div className="reg-choices inline">
        {['Masculino','Femenino','No binario'].map(g => (
          <Choice key={g} type="radio" name="gender" id={`gender-${g}`} value={g} label={g}
            checked={data.gender === g} onChange={() => set('gender', g)} />
        ))}
      </div>
    </>,

    /* Step 2 — Health */
    <>
      <div className="reg-section-header">
        <div className="reg-eyebrow"><span className="reg-eyebrow-dot"/>Paso 3</div>
        <h2 className="reg-title">Salud y actividad</h2>
        <p className="reg-subtitle">Adaptamos tu plan a tu situación física actual.</p>
      </div>
      <p className="reg-question">¿Tenés algún tipo de discapacidad que te impida realizar actividad física?</p>
      <div className="reg-choices inline">
        {['Sí','No'].map(v => (
          <Choice key={v} type="radio" name="disability" id={`disability-${v}`} value={v} label={v}
            checked={data.disability === v} onChange={() => set('disability', v)} />
        ))}
      </div>
      <p className="reg-question">¿Cuál es tu nivel de actividad física actual?</p>
      <div className="reg-choices">
        {[
          ['Sedentario',  'Sedentario (muy poco o nada de ejercicio)'],
          ['En transición', 'En transición (busco mejorar mi condición física)'],
          ['Moderado',    'Moderado (ejercicio ocasional)'],
          ['Activo',      'Activo (ejercicio regular)'],
        ].map(([v, l]) => (
          <Choice key={v} type="radio" name="physicalActivity" id={`pa-${v}`} value={v} label={l}
            checked={data.physicalActivity === v} onChange={() => set('physicalActivity', v)} />
        ))}
      </div>
      <p className="reg-question">¿Cómo describirías tu dieta?</p>
      <div className="reg-choices inline">
        {[['Vegetariana','Vegetariana o vegana'],['Omnívora','Omnívora']].map(([v, l]) => (
          <Choice key={v} type="radio" name="diet" id={`diet-${v}`} value={v} label={l}
            checked={data.diet === v} onChange={() => set('diet', v)} />
        ))}
      </div>
      <p className="reg-question">¿Tenés alguna restricción alimentaria?</p>
      <div className="reg-choices">
        {[
          'Ninguna restricción',
          'Intolerancia a la lactosa',
          'Celiaquía (intolerancia al gluten)',
          'Otros',
        ].map(r => (
          <Choice key={r} type="checkbox" name="restrictions" id={`rest-${r}`} value={r} label={r}
            checked={data.restrictions.includes(r)}
            onChange={() => set('restrictions', toggleArr(data.restrictions, r))} />
        ))}
      </div>
      {data.restrictions.includes('Otros') && (
        <input type="text" className="reg-other-input" placeholder="Especificá tu restricción..."
          value={data.otherRestriction} onChange={e => set('otherRestriction', e.target.value)} />
      )}
    </>,

    /* Step 3 — Mental wellness */
    <>
      <div className="reg-section-header">
        <div className="reg-eyebrow"><span className="reg-eyebrow-dot"/>Paso 4</div>
        <h2 className="reg-title">Metas y obstáculos</h2>
        <p className="reg-subtitle">Entendemos qué te motiva y qué te frena.</p>
      </div>
      <p className="reg-question">¿Cuáles son tus metas de bienestar?</p>
      <div className="reg-choices">
        {[
          'Reducir el estrés',
          'Mejorar el sueño',
          'Aumentar mi calidad de vida',
          'Conectar más con mi lado espiritual',
        ].map(o => (
          <Choice key={o} type="checkbox" name="objetivos" id={`obj-${o}`} value={o} label={o}
            checked={data.objetivos.includes(o)}
            onChange={() => set('objetivos', toggleArr(data.objetivos, o))} />
        ))}
      </div>
      <p className="reg-question">¿Qué obstáculos enfrentás para mantener una rutina?</p>
      <div className="reg-choices">
        {[
          'Falta de tiempo',
          'Cansancio o fatiga',
          'Niveles altos de autoexigencia',
          'Problemas físicos (movilidad reducida)',
          'Las limitaciones propias de mi edad',
        ].map(o => (
          <Choice key={o} type="checkbox" name="obstaculos" id={`obs-${o}`} value={o} label={o}
            checked={data.obstaculos.includes(o)}
            onChange={() => set('obstaculos', toggleArr(data.obstaculos, o))} />
        ))}
      </div>
      <p className="reg-question">¿Cómo es tu calidad del sueño?</p>
      <div className="reg-choices">
        {[
          ['Duermo entre 5 y 7 horas por noche', 'Duermo entre 5 y 7 horas por noche'],
          ['Duermo más de 7 horas por noche',    'Duermo más de 7 horas por noche'],
          ['Duermo menos de 5 horas por noche',  'Duermo menos de 5 horas por noche'],
        ].map(([v, l]) => (
          <Choice key={v} type="radio" name="sleepQuality" id={`sleep-${v}`} value={v} label={l}
            checked={data.sleepQuality === v} onChange={() => set('sleepQuality', v)} />
        ))}
      </div>
    </>,

    /* Step 4 — Lifestyle */
    <>
      <div className="reg-section-header">
        <div className="reg-eyebrow"><span className="reg-eyebrow-dot"/>Paso 5</div>
        <h2 className="reg-title">Tu estilo de vida</h2>
        <p className="reg-subtitle">El último paso para personalizar tu plan de bienestar.</p>
      </div>
      <p className="reg-question">¿Sentís estrés y/o ansiedad de forma frecuente?</p>
      <div className="reg-choices inline">
        {[['Alto','Sí'],['Bajo','No']].map(([v, l]) => (
          <Choice key={v} type="radio" name="stress" id={`stress-${v}`} value={v} label={l}
            checked={data.stress === v} onChange={() => set('stress', v)} />
        ))}
      </div>
      <p className="reg-question">¿Cómo describirías tu rutina diaria?</p>
      <div className="reg-choices">
        {[
          'Tengo mucho tiempo libre y puedo organizar mi día con flexibilidad',
          'Tengo tiempo libre moderado',
          'Soy una persona ocupada con un horario ajustado',
        ].map(v => (
          <Choice key={v} type="radio" name="dailyRoutine" id={`dr-${v.substring(0,10)}`} value={v} label={v}
            checked={data.dailyRoutine === v} onChange={() => set('dailyRoutine', v)} />
        ))}
      </div>
      <p className="reg-question">¿Cómo definirías tu estilo de vida?</p>
      <div className="reg-choices">
        {[
          'Soy una persona espiritual',
          'Soy entusiasta del fitness y la vida saludable',
          'Soy una persona centrada en el equilibrio personal',
          'Soy una persona enfocada en un estilo de vida ecológico',
          'Soy una persona con una vida laboral intensa',
        ].map(v => (
          <Choice key={v} type="radio" name="lifestyle" id={`ls-${v.substring(0,10)}`} value={v} label={v}
            checked={data.lifestyle === v} onChange={() => set('lifestyle', v)} />
        ))}
      </div>
    </>,
  ];

  /* ── Render ──────────────────────────────────────────────── */
  return (
    <main className="auth-page">
      <div className="auth-card auth-card--wide">

        {/* ── Left panel ────────────────────────────────────── */}
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
            <h2 className="auth-left-headline">
              Empezá hoy.<br />
              <em>Tu mejor versión te espera.</em>
            </h2>
            <div className="auth-left-steps">{dots}</div>
          </div>
        </aside>

        {/* ── Right panel ───────────────────────────────────── */}
        <section className="auth-right" aria-label="Formulario de registro">
          
          <div className="auth-right-header">
            {/* Progress bar */}
            <div className="reg-progress-bar" role="progressbar" aria-valuenow={step + 1} aria-valuemin={1} aria-valuemax={TOTAL_STEPS}>
              {Array.from({ length: TOTAL_STEPS }, (_, i) => (
                <div key={i} className={`reg-progress-step${i <= step ? (i < step ? ' done' : ' active') : ''}`} />
              ))}
            </div>
            <p className="reg-progress-label">Paso {step + 1} de {TOTAL_STEPS}</p>

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
          </div>

          <form id="registerForm" onSubmit={handleSubmit} noValidate className="auth-right-form">
            <div className="auth-right-scroll-area" ref={rightRef}>
              {stepContent[step]}
            </div>

            <div className="auth-right-footer">
              {/* Nav buttons */}
              <nav className="reg-nav" aria-label="Navegación del formulario">
                {step > 0 && (
                  <button type="button" className="auth-btn auth-btn--secondary" onClick={prev} style={{ flex: 1, width: 'auto', margin: 0 }}>
                    ← Atrás
                  </button>
                )}
                {step < TOTAL_STEPS - 1 ? (
                  <button type="button" className="auth-btn" onClick={next} style={{ flex: 1, width: 'auto', margin: 0 }}>
                    Continuar →
                  </button>
                ) : (
                  <button type="submit" className="auth-btn" disabled={loading} style={{ flex: 1, width: 'auto', margin: 0 }}>
                    {loading ? <><span className="btn-spinner" />Creando cuenta...</> : 'Crear mi cuenta ✓'}
                  </button>
                )}
              </nav>

              <p className="reg-login-row">
                ¿Ya tenés una cuenta? <Link href="/iniciar-sesion">Iniciar sesión</Link>
              </p>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}

/* ── Page export ──────────────────────────────────────────── */
export default function CrearCuentaClient() {
  return (
    <AuthGuard redirectIfAuthenticated>
      <RegisterForm />
    </AuthGuard>
  );
}
