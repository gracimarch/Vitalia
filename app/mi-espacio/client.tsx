'use client';

import type { ReactNode } from 'react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/auth-context';
import { markActiveDay } from '@/lib/progress';
import AuthGuard from '@/components/auth/AuthGuard';
import GradientAvatar from '@/components/ui/GradientAvatar';
import '@/app/blog/blog.css';
import './espacio.css';

/* ──────────────────────────────────────────────────────────────
   TYPES
   ────────────────────────────────────────────────────────────── */
interface ScoreData {
  articulos?: string[];
  rutinas?: string[];
  planes_alimenticios?: string[];
}

type ScoreState = 'loading' | 'empty' | 'loaded';

/* ──────────────────────────────────────────────────────────────
   DAILY ROTATION HELPER
   Given a pool of slugs, picks one based on the day of the year.
   This way the "Del día" recommendation changes every day but is
   deterministic (same for all users on the same day).
   ────────────────────────────────────────────────────────────── */
function getDailyPick<T>(pool: T[]): T | null {
  if (!pool.length) return null;
  const today = new Date();
  const start = new Date(today.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((today.getTime() - start.getTime()) / 86_400_000);
  return pool[dayOfYear % pool.length];
}

/* ──────────────────────────────────────────────────────────────
   WELLNESS PHRASES (for the daily reflection card)
   ────────────────────────────────────────────────────────────── */
const PHRASES = [
  'No todo pensamiento merece atención; elige cuáles alimentar conscientemente.',
  'Descansar también es avanzar, aunque no produzca resultados visibles hoy.',
  'Escucha tu cuerpo: el cansancio también es una forma de información.',
  'Respira profundo antes de responder; ese segundo puede cambiar toda la conversación.',
  'Decir que no a tiempo evita resentimientos innecesarios después.',
  'Cambia el juicio por curiosidad y la ansiedad baja de volumen.',
  'Pequeños hábitos diarios moldean más tu vida que grandes decisiones aisladas.',
  'Hacer pausas conscientes previene errores que el apuro fabrica.',
  'Tu valor no se mide por productividad constante.',
  'El progreso real suele ser silencioso.',
  'La calma se construye, no aparece de golpe.',
  'Sentirte suficiente no depende de cumplirlo todo.',
  'Ser constante importa más que estar motivado.',
  'Avanzar lento también es avanzar.',
];

function getDailyPhrase(): string {
  const today = new Date();
  const start = new Date(today.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((today.getTime() - start.getTime()) / 86_400_000);
  return PHRASES[dayOfYear % PHRASES.length];
}

/* ──────────────────────────────────────────────────────────────
   CHECKLIST ITEMS
   ────────────────────────────────────────────────────────────── */
const MORNING = [
  'Tomar un vaso de agua al despertar',
  'Realizar 5 minutos de estiramientos',
  'Meditar durante 10 minutos',
  'Agradecer por 3 cosas antes de levantarte',
  'Desayunar sin pantallas',
];
const DAY = [
  'Leer 10 páginas de un libro',
  'Dar una caminata de 15 minutos',
  'Hacer 3 respiraciones profundas',
  'Corregir tu postura corporal',
  'Beber agua conscientemente',
];
const EVENING = [
  'Dejar pantallas 30 min antes de dormir',
  'Escribir una reflexión del día',
  'Tomar una infusión relajante',
  'Leer algo inspirador antes de dormir',
];

function getDailyChecklist() {
  const today = new Date();
  const start = new Date(today.getFullYear(), 0, 0);
  const d = Math.floor((today.getTime() - start.getTime()) / 86_400_000);
  return [
    MORNING[d % MORNING.length],
    MORNING[(d + 2) % MORNING.length],
    DAY[d % DAY.length],
    DAY[(d + 1) % DAY.length],
    EVENING[d % EVENING.length],
  ].map((text, i) => ({ id: i, text, checked: false }));
}

/* ──────────────────────────────────────────────────────────────
   MOOD CHECK-IN
   ────────────────────────────────────────────────────────────── */
const MOODS = [
  { emoji: '😄', label: 'Excelente', value: 'excelente' },
  { emoji: '🙂', label: 'Bien', value: 'bien' },
  { emoji: '😐', label: 'Regular', value: 'regular' },
  { emoji: '😔', label: 'Cansada', value: 'cansada' },
  { emoji: '😣', label: 'Difícil', value: 'dificil' },
];
const MOOD_FEEDBACK: Record<string, string> = {
  excelente: '¡Qué hermoso comienzo! Aprovechá esa energía. 🌟',
  bien: 'Un buen día es un regalo. Seguí así. 💚',
  regular: 'Está bien no estar perfecta. Respira profundo. 🌿',
  cansada: 'Tu cuerpo habla. Permítete descansar hoy. 🌙',
  dificil: 'Los días difíciles también pasan. Estás bien. 🤍',
};

/* ──────────────────────────────────────────────────────────────
   CALENDAR HELPERS
   ────────────────────────────────────────────────────────────── */
const MONTH_NAMES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
const DAY_NAMES = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do'];

function simpleHash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

type CalTag = { label: string; type: 'diet' | 'routine' | 'meditation'; href: string };

function buildCalendarActivities(
  dietas: any[], rutinas: any[], meditaciones: any[],
  year: number, month: number
): Map<number, CalTag[]> {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const map = new Map<number, CalTag[]>();
  const assign = (items: any[], type: CalTag['type'], hrefFn: (item: any) => string) => {
    items.slice(0, 10).forEach(item => {
      const key = String(item.slug ?? item.id ?? item.title ?? '');
      const day = (simpleHash(key + month + year) % daysInMonth) + 1;
      const tags = map.get(day) ?? [];
      tags.push({ label: item.title, type, href: hrefFn(item) });
      map.set(day, tags);
    });
  };
  assign(dietas, 'diet', d => `/dietas/${d.slug}`);
  assign(rutinas, 'routine', r => `/rutinas/${r.slug}`);
  assign(meditaciones, 'meditation', () => '/meditaciones');
  return map;
}

/* ──────────────────────────────────────────────────────────────
   GREETING
   ────────────────────────────────────────────────────────────── */
function greeting(name: string) {
  const h = new Date().getHours();
  if (h < 12) return `¡Buenos días, ${name}!`;
  if (h < 19) return `¡Buenas tardes, ${name}!`;
  return `¡Buenas noches, ${name}!`;
}

/* ──────────────────────────────────────────────────────────────
   TABS
   ────────────────────────────────────────────────────────────── */
type TabId = 'inicio' | 'rutinas' | 'meditacion' | 'dietas' | 'progreso';

const TABS: { id: TabId; label: string; icon: ReactNode }[] = [
  { id: 'inicio', label: 'Inicio', icon: <i className="fa-solid fa-house" /> },
  { id: 'rutinas', label: 'Rutinas', icon: <i className="fa-solid fa-person-running" /> },
  { id: 'meditacion', label: 'Meditaciones', icon: <i className="fa-solid fa-leaf" /> },
  { id: 'dietas', label: 'Dietas', icon: <i className="fa-solid fa-bowl-food" /> },
  { id: 'progreso', label: 'Progreso', icon: <i className="fa-solid fa-chart-simple" /> },
];

/* ──────────────────────────────────────────────────────────────
   PROGRESS STATS
   ────────────────────────────────────────────────────────────── */
// We now compute these dynamically in the component.

/* ──────────────────────────────────────────────────────────────
   SKELETON CARD
   ────────────────────────────────────────────────────────────── */
function SkeletonCard() {
  return (
    <article className="blog-card blog-skeleton" style={{ height: '320px', borderRadius: 'var(--radius-xl, 20px)' }} aria-hidden />
  );
}

/* ──────────────────────────────────────────────────────────────
   RECOMMEND CARD
   ────────────────────────────────────────────────────────────── */
function stripHtml(html: string) {
  if (!html) return '';
  return html.replace(/<[^>]+>/g, '').slice(0, 140);
}

function normalizeImg(raw: string): string {
  if (!raw) return '';
  if (raw.startsWith('http') || raw.startsWith('/')) return raw;
  const clean = raw.replace(/^\.\.\//, '');
  return `/${clean}`;
}

function RecommendCard({
  title, excerpt, image, hideImage, label, color, icon, meta, href, index
}: {
  title: string; excerpt?: string; image?: string; hideImage?: boolean; label?: string; color: string; icon: ReactNode; meta: string; href: string; index: number;
}) {
  const [imgErr, setImgErr] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const preview = stripHtml(excerpt || '');

  const getFallbackImage = () => {
    if (href.includes('dietas')) return 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=600&auto=format&fit=crop';
    if (href.includes('rutinas')) return 'https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=600&auto=format&fit=crop';
    if (href.includes('meditaciones')) return 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=600&auto=format&fit=crop';
    return 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?q=80&w=600&auto=format&fit=crop';
  };

  const finalImage = (!image || imgErr) ? getFallbackImage() : normalizeImg(image);

  return (
    <article
      className="blog-card"
      style={{ '--card-accent': color, animationDelay: `${index * 0.06}s` } as React.CSSProperties}
    >
      {!hideImage && (
        <div className={`blog-card-thumb ${!imgLoaded ? 'blog-skeleton' : ''}`}>
          <img
            src={finalImage}
            alt={title}
            loading="lazy"
            onLoad={() => setImgLoaded(true)}
            onError={() => { if (!imgErr) setImgErr(true); setImgLoaded(true); }}
            style={{ opacity: imgLoaded ? 1 : 0, transition: 'opacity 0.3s ease, transform 0.4s ease' }}
          />
          {label && <span className="blog-card-category" style={{ background: color }}>{label}</span>}
        </div>
      )}
      {hideImage && label && (
        <div style={{ padding: '16px 20px 0 20px' }}>
          <span className="blog-card-category" style={{ background: color, position: 'relative', top: 0, left: 0, display: 'inline-block' }}>{label}</span>
        </div>
      )}
      <div className="blog-card-body">
        <h2 className="blog-card-title">{title}</h2>
        {preview && <p className="blog-card-excerpt">{preview}…</p>}
        <footer className="blog-card-footer">
          <span className="blog-card-time">
            {icon}
            {meta}
          </span>
          <Link href={href} className="blog-card-link">
            Ver más
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={14} height={14} style={{ marginLeft: '4px' }}><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
          </Link>
        </footer>
      </div>
    </article>
  );
}

/* ──────────────────────────────────────────────────────────────
   EMPTY STATE
   ────────────────────────────────────────────────────────────── */
function EmptyScoreState({ onGenerate, generating }: { onGenerate: () => void; generating: boolean }) {
  return (
    <div className="espacio-empty-state">
      <span className="espacio-empty-icon"><i className="fa-solid fa-sparkles" /></span>
      <h3>Aún no tenés recomendaciones</h3>
      <p>Generá tus recomendaciones personalizadas basadas en tu perfil de bienestar.</p>
      <button
        className="espacio-generate-btn"
        onClick={onGenerate}
        disabled={generating}
        id="btn-generate-recommendations"
      >
        {generating ? (
          <><i className="fa-solid fa-spinner fa-spin" /> Generando…</>
        ) : (
          <><i className="fa-solid fa-wand-magic-sparkles" /> Generar mis recomendaciones</>
        )}
      </button>
      {generating && (
        <p className="espacio-empty-note">
          El servidor se está activando. Esto puede tardar hasta 60 segundos la primera vez.
        </p>
      )}
    </div>
  );
}



/* ══════════════════════════════════════════════════════════════
   MOOD CHECK-IN WIDGET
   ══════════════════════════════════════════════════════════════ */
function MoodWidget({ mood, onSelect }: { mood: string | null; onSelect: (v: string) => void }) {
  return (
    <div className="espacio-mood-widget">
      <div className="espacio-mood-header">
        <span className="espacio-mood-icon-title"><i className="fa-solid fa-face-smile-beam" /></span>
        <div>
          <h3 className="espacio-mood-title">¿Cómo te sentís hoy?</h3>
          <p className="espacio-mood-sub">Tu energía del día</p>
        </div>
      </div>
      <div className="espacio-mood-options" role="group" aria-label="Seleccioná tu estado de ánimo">
        {MOODS.map(m => (
          <button
            key={m.value}
            id={`mood-btn-${m.value}`}
            aria-pressed={mood === m.value}
            aria-label={m.label}
            className={`espacio-mood-btn${mood === m.value ? ' selected' : mood ? ' dimmed' : ''}`}
            onClick={() => onSelect(m.value)}
          >
            <span className="espacio-mood-emoji">{m.emoji}</span>
            <span className="espacio-mood-label">{m.label}</span>
          </button>
        ))}
      </div>
      {mood && (
        <p className="espacio-mood-feedback">{MOOD_FEEDBACK[mood]}</p>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   GRATITUDE WIDGET
   ══════════════════════════════════════════════════════════════ */
function GratitudeWidget({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="espacio-gratitude-card">
      <span className="espacio-gratitude-icon"><i className="fa-solid fa-heart" /></span>
      <div className="espacio-gratitude-body">
        <h3>Gratitud de hoy</h3>
        <input
          id="gratitude-input"
          className="espacio-gratitude-input"
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="¿Por qué estás agradecida hoy?"
          maxLength={120}
        />
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   WELLNESS CALENDAR WIDGET
   ══════════════════════════════════════════════════════════════ */
function WellnessCalendar({
  year, month, onPrev, onNext, dietas, rutinas, meditaciones,
}: {
  year: number; month: number;
  onPrev: () => void; onNext: () => void;
  dietas: any[]; rutinas: any[]; meditaciones: any[];
}) {
  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;
  const activities = buildCalendarActivities(dietas, rutinas, meditaciones, year, month);

  const firstDayRaw = new Date(year, month, 1).getDay();
  const adjustedFirst = firstDayRaw === 0 ? 6 : firstDayRaw - 1;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevDays = new Date(year, month, 0).getDate();

  const cells: { day: number; current: boolean; isToday: boolean }[] = [];
  for (let i = 0; i < adjustedFirst; i++)
    cells.push({ day: prevDays - adjustedFirst + 1 + i, current: false, isToday: false });
  for (let d = 1; d <= daysInMonth; d++)
    cells.push({ day: d, current: true, isToday: isCurrentMonth && d === today.getDate() });
  const trail = cells.length % 7 === 0 ? 0 : 7 - (cells.length % 7);
  for (let i = 1; i <= trail; i++)
    cells.push({ day: i, current: false, isToday: false });

  return (
    <div className="espacio-cal-widget">
      <div className="espacio-cal-header">
        <div>
          <h3 className="espacio-cal-title">Calendario de bienestar</h3>
          <p className="espacio-cal-sub">Tus actividades del mes</p>
        </div>
        <div className="espacio-cal-controls">
          <div className="espacio-cal-legend">
            <span className="espacio-cal-legend-item espacio-cal-legend-item--diet"><i className="fa-solid fa-bowl-food" /> Dietas</span>
            <span className="espacio-cal-legend-item espacio-cal-legend-item--routine"><i className="fa-solid fa-person-running" /> Rutinas</span>
            <span className="espacio-cal-legend-item espacio-cal-legend-item--meditation"><i className="fa-solid fa-leaf" /> Meditación</span>
          </div>
          <div className="espacio-cal-nav">
            <button className="espacio-cal-nav-btn" onClick={onPrev} aria-label="Mes anterior" id="cal-btn-prev">
              <i className="fa-solid fa-chevron-left" />
            </button>
            <span className="espacio-cal-month-label">{MONTH_NAMES[month]} {year}</span>
            <button className="espacio-cal-nav-btn" onClick={onNext} aria-label="Mes siguiente" id="cal-btn-next">
              <i className="fa-solid fa-chevron-right" />
            </button>
          </div>
        </div>
      </div>
      <div className="espacio-cal-grid">
        {DAY_NAMES.map(d => (
          <div key={d} className="espacio-cal-day-name">{d}</div>
        ))}
        {cells.map((cell, idx) => {
          const tags = cell.current ? (activities.get(cell.day) ?? []) : [];
          return (
            <div
              key={idx}
              className={`espacio-cal-cell${!cell.current ? ' other-month' : ''}${cell.isToday ? ' today' : ''}`}
            >
              <span className="espacio-cal-day-num">{cell.day}</span>
              <div className="espacio-cal-tags">
                {tags.slice(0, 2).map((tag, ti) => (
                  <Link key={ti} href={tag.href} className={`espacio-cal-tag espacio-cal-tag--${tag.type}`}>
                    {tag.label.length > 11 ? tag.label.slice(0, 11) + '…' : tag.label}
                  </Link>
                ))}
                {tags.length > 2 && (
                  <span className="espacio-cal-tag espacio-cal-tag--more">+{tags.length - 2}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   DASHBOARD COMPONENT
   ══════════════════════════════════════════════════════════════ */

interface DashboardProps {
  rutinas: any[];
  dietas: any[];
  meditaciones: any[];
  lecturas: any[];
}

function Dashboard({ rutinas, dietas, meditaciones, lecturas }: DashboardProps) {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<TabId>('inicio');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [checklist, setChecklist] = useState<{ id: number; text: string; checked: boolean }[]>([]);

  // Score state
  const [scoreState, setScoreState] = useState<ScoreState>('loading');
  const [scoreData, setScoreData] = useState<ScoreData>({});
  const [generating, setGenerating] = useState(false);

  // Derived: filtered items based on score slugs
  const [recLecturas, setRecLecturas] = useState<any[]>([]);
  const [recRutinas, setRecRutinas] = useState<any[]>([]);
  const [recDietas, setRecDietas] = useState<any[]>([]);

  // Daily picks (rotate through the recommended pool each day)
  const [dailyLectura, setDailyLectura] = useState<any | null>(null);
  const [dailyRutina, setDailyRutina] = useState<any | null>(null);
  const [dailyDieta, setDailyDieta] = useState<any | null>(null);

  // Mood & gratitude
  const [mood, setMood] = useState<string | null>(null);
  const [gratitude, setGratitude] = useState('');

  // Calendar
  const [calYear, setCalYear] = useState(() => new Date().getFullYear());
  const [calMonth, setCalMonth] = useState(() => new Date().getMonth());

  // Progress
  const [progress, setProgress] = useState({ diasActivos: 0, sesionesTotales: 0, minutosTotales: 0 });

  const firstName = user?.displayName?.split(' ')[0] ?? user?.email?.split('@')[0] ?? 'Bienestar';

  /* ── Checklist ─────────────────────────────────────── */
  const todayKey = (() => {
    const d = new Date();
    return `vitalia-checklist-${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
  })();

  useEffect(() => {
    const base = getDailyChecklist();
    try {
      const saved = localStorage.getItem(todayKey);
      if (saved) {
        const checkedIds: number[] = JSON.parse(saved);
        setChecklist(base.map(item => ({ ...item, checked: checkedIds.includes(item.id) })));
        return;
      }
    } catch { /* ignore parse errors */ }
    setChecklist(base);
  }, [todayKey]);

  const toggleChecklist = (id: number) => {
    setChecklist(prev => {
      const next = prev.map(item => item.id === id ? { ...item, checked: !item.checked } : item);

      const newlyChecked = next.find(i => i.id === id)?.checked;
      if (newlyChecked) {
        markActiveDay();
      }

      try {
        const checkedIds = next.filter(i => i.checked).map(i => i.id);
        localStorage.setItem(todayKey, JSON.stringify(checkedIds));
      } catch { /* storage unavailable */ }
      return next;
    });
  };

  /* ── Mood & Gratitude ───────────────────────────────── */
  const todayMoodKey = (() => { const d = new Date(); return `vitalia-mood-${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`; })();
  const todayGratKey = (() => { const d = new Date(); return `vitalia-grat-${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`; })();

  useEffect(() => {
    try { const m = localStorage.getItem(todayMoodKey); if (m) setMood(m); } catch { }
    try { const g = localStorage.getItem(todayGratKey); if (g) setGratitude(g); } catch { }
  }, [todayMoodKey, todayGratKey]);

  const handleMoodSelect = (v: string) => {
    setMood(v);
    try { localStorage.setItem(todayMoodKey, v); } catch { }
  };

  const handleGratitudeChange = (v: string) => {
    setGratitude(v);
    try { localStorage.setItem(todayGratKey, v); } catch { }
  };

  /* ── Calendar navigation ────────────────────────────── */
  const handleCalPrev = () => {
    if (calMonth === 0) { setCalYear(y => y - 1); setCalMonth(11); }
    else setCalMonth(m => m - 1);
  };
  const handleCalNext = () => {
    if (calMonth === 11) { setCalYear(y => y + 1); setCalMonth(0); }
    else setCalMonth(m => m + 1);
  };

  /* ── Load Firestore Scores ─────────────────────────── */
  useEffect(() => {
    if (!user) return;

    let cancelled = false;

    (async () => {
      try {
        const snap = await getDoc(doc(db, 'scores', user.uid));

        if (cancelled) return;

        if (!snap.exists() || !snap.data()) {
          setScoreState('empty');
          return;
        }

        const data = snap.data() as ScoreData;
        const hasSomeData =
          (data.articulos?.length ?? 0) > 0 ||
          (data.rutinas?.length ?? 0) > 0 ||
          (data.planes_alimenticios?.length ?? 0) > 0;

        if (!hasSomeData) {
          setScoreState('empty');
          return;
        }

        setScoreData(data);

        // Resolve slugs to full objects
        const filteredLecturas = (data.articulos ?? [])
          .slice(0, 6)
          .map((slug: string) => lecturas.find((l: any) => l.slug === slug))
          .filter(Boolean);

        const filteredRutinas = (data.rutinas ?? [])
          .slice(0, 6)
          .map((slug: string) => rutinas.find((r: any) => r.slug === slug))
          .filter(Boolean);

        const filteredDietas = (data.planes_alimenticios ?? [])
          .slice(0, 6)
          .map((slug: string) => dietas.find((d: any) => d.slug === slug))
          .filter(Boolean);

        setRecLecturas(filteredLecturas);
        setRecRutinas(filteredRutinas);
        setRecDietas(filteredDietas);

        // Daily picks: one from each pool, rotating by day
        setDailyLectura(getDailyPick(filteredLecturas));
        setDailyRutina(getDailyPick(filteredRutinas));
        setDailyDieta(getDailyPick(filteredDietas));

        setScoreState('loaded');
      } catch (err) {
        console.error('[Mi Espacio] Error loading scores:', err);
        if (!cancelled) setScoreState('empty');
      }
    })();

    return () => { cancelled = true; };
  }, [user, lecturas, rutinas, dietas]);

  /* ── Load Progress from localStorage ─────────────── */
  useEffect(() => {
    const loadProgress = () => {
      import('@/lib/progress').then(({ getProgress }) => {
        const p = getProgress();
        setProgress({
          diasActivos: p.diasActivos.length,
          sesionesTotales: p.sesionesTotales,
          minutosTotales: p.minutosTotales
        });
      });
    };

    loadProgress();
    window.addEventListener('vitalia-progress-updated', loadProgress);
    return () => window.removeEventListener('vitalia-progress-updated', loadProgress);
  }, []);

  /* ── Generate recommendations via API ─────────────── */
  const handleGenerateRecs = async () => {
    if (!user) return;
    setGenerating(true);

    try {
      const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';
      const res = await fetch(`${apiBase}/api/v1/scores/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: user.uid }),
      });

      if (!res.ok) throw new Error(`API error: ${res.status}`);

      // Poll Firestore until the document appears (max ~40s)
      let attempts = 0;
      const poll = setInterval(async () => {
        attempts++;
        try {
          const snap = await getDoc(doc(db, 'scores', user.uid));
          if (snap.exists() || attempts >= 10) {
            clearInterval(poll);
            window.location.reload();
          }
        } catch {
          clearInterval(poll);
          window.location.reload();
        }
      }, 4000);

    } catch (err) {
      console.error('[Mi Espacio] Error generating recs:', err);
      setGenerating(false);
    }
  };

  /* ──────────────────────────────────────────────────── */
  const renderTab = () => {
    switch (activeTab) {

      /* ── INICIO ──────────────────────────────────── */
      case 'inicio': return (
        <div className="espacio-home">
          {/* Header */}
          <div className="espacio-home-header">
            <h2 className="espacio-greeting">{greeting(firstName)}</h2>
            <p className="espacio-greeting-sub">Estás a un paso de transformar tu bienestar.</p>
          </div>

          {/* Mood check-in — full width */}
          <MoodWidget mood={mood} onSelect={handleMoodSelect} />

          {/* Top row: reflection + gratitude */}
          <div className="espacio-home-top-row">
            <div className="espacio-reflection-card">
              <span className="espacio-reflection-icon"><i className="fa-solid fa-quote-left" /></span>
              <div>
                <h3>Reflexión del día</h3>
                <p className="espacio-phrase-text">"{getDailyPhrase()}"</p>
              </div>
            </div>
            <GratitudeWidget value={gratitude} onChange={handleGratitudeChange} />
          </div>

          {/* Checklist */}
          <div className="espacio-miniplan-card">
            <h3>Pequeñas acciones de hoy</h3>
            <ul className="espacio-miniplan-list">
              {checklist.map(item => (
                <li
                  key={item.id}
                  onClick={() => toggleChecklist(item.id)}
                  className={item.checked ? 'checked' : ''}
                >
                  <div className={`espacio-checkbox ${item.checked ? 'checked' : ''}`}>
                    {item.checked && <i className="fa-solid fa-check" />}
                  </div>
                  <span className="espacio-checklist-text">{item.text}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Recommendations of the day */}
          <div className="espacio-section-header" style={{ marginTop: '24px' }}>
            <h3 className="espacio-section-title">Para ti hoy</h3>
            <p className="espacio-section-sub">Tu selección personalizada del día, basada en tu perfil de bienestar.</p>
          </div>

          {scoreState === 'loading' && (
            <div className="blog-grid" style={{ marginTop: '16px' }}>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </div>
          )}

          {scoreState === 'empty' && (
            <EmptyScoreState onGenerate={handleGenerateRecs} generating={generating} />
          )}

          {scoreState === 'loaded' && (
            <div className="blog-grid" style={{ marginTop: '16px', marginBottom: '32px' }}>
              {dailyLectura && (
                <RecommendCard
                  title={dailyLectura.title}
                  excerpt={dailyLectura.introduction || dailyLectura.excerpt}
                  image={dailyLectura.image}
                  label="Lectura del día"
                  color="#80CACD"
                  icon={<i className="fa-solid fa-book-open" style={{ marginRight: '6px' }} />}
                  meta={dailyLectura.readingTime ?? dailyLectura.category ?? 'Lectura'}
                  href={`/blog/${dailyLectura.slug}`}
                  index={0}
                />
              )}
              {dailyRutina && (
                <RecommendCard
                  title={dailyRutina.title}
                  excerpt={dailyRutina.introduction}
                  image={dailyRutina.image}
                  label="Rutina del día"
                  color="#B571DE"
                  icon={<i className="fa-solid fa-person-running" style={{ marginRight: '6px' }} />}
                  meta={`${dailyRutina.duration?.split(' ')[0] ?? ''} min`}
                  href={`/rutinas/${dailyRutina.slug}`}
                  index={1}
                />
              )}
              {dailyDieta && (
                <RecommendCard
                  title={dailyDieta.title}
                  excerpt={dailyDieta.introduction}
                  image={dailyDieta.image}
                  label="Dieta del día"
                  color="#E1947F"
                  icon={<i className="fa-solid fa-bowl-food" style={{ marginRight: '6px' }} />}
                  meta={dailyDieta.duration ?? 'Plan alimenticio'}
                  href={`/dietas/${dailyDieta.slug}`}
                  index={2}
                />
              )}
            </div>
          )}

          {/* Wellness Calendar — always visible */}
          <WellnessCalendar
            year={calYear}
            month={calMonth}
            onPrev={handleCalPrev}
            onNext={handleCalNext}
            dietas={dietas}
            rutinas={rutinas}
            meditaciones={meditaciones}
          />

          {/* Blog promo */}
          <div className="espacio-blog-promo">
            <h3 className="espacio-section-title">Lecturas para el alma</h3>
            <p className="espacio-section-sub">Explorá artículos sobre hábitos, nutrición y bienestar mental.</p>
            <Link href="/blog" className="espacio-blog-link">
              Explorar el blog →
            </Link>
          </div>
        </div>
      );

      /* ── RUTINAS ──────────────────────────────────── */
      case 'rutinas': return (
        <div className="espacio-section-content">
          <h2 className="espacio-tab-title">Rutinas recomendadas</h2>
          <p className="espacio-tab-sub">Movimientos adaptados a tu perfil. Escucha a tu cuerpo.</p>

          {scoreState === 'loading' && (
            <div className="blog-grid" style={{ marginTop: '24px' }}>
              {[1, 2, 3, 4].map(i => <SkeletonCard key={i} />)}
            </div>
          )}

          {scoreState === 'empty' && (
            <EmptyScoreState onGenerate={handleGenerateRecs} generating={generating} />
          )}

          {scoreState === 'loaded' && (
            recRutinas.length > 0 ? (
              <div className="blog-grid" style={{ marginTop: '24px' }}>
                {recRutinas.map((r: any, i: number) => (
                  <RecommendCard
                    key={r.slug}
                    title={r.title}
                    excerpt={r.introduction}
                    image={r.image}
                    label={r.level ?? 'Rutina'}
                    color="#B571DE"
                    icon={<i className="fa-solid fa-person-running" style={{ marginRight: '6px' }} />}
                    meta={`${r.duration?.split(' ')[0] ?? ''} min`}
                    href={`/rutinas/${r.slug}`}
                    index={i}
                  />
                ))}
              </div>
            ) : (
              <div className="espacio-empty-section">
                <i className="fa-solid fa-magnifying-glass" />
                <p>No encontramos rutinas para tus recomendaciones actuales.</p>
              </div>
            )
          )}
        </div>
      );

      /* ── MEDITACIÓN ───────────────────────────────── */
      case 'meditacion': return (
        <div className="espacio-section-content">
          <h2 className="espacio-tab-title">Meditación y mindfulness</h2>
          <p className="espacio-tab-sub">Un espacio de silencio y calma para tu mente.</p>
          <div className="blog-grid" style={{ marginTop: '24px' }}>
            {meditaciones.map((m: any, i: number) => (
              <RecommendCard
                key={m.id}
                title={m.title}
                excerpt={m.description}
                image={m.image}
                color="#80CACD"
                icon={<i className="fa-solid fa-headphones" style={{ marginRight: '6px' }} />}
                meta={m.duration ?? 'Meditación guiada'}
                href={`/meditaciones?play=${m.id}`}
                index={i}
                hideImage={true}
              />
            ))}
          </div>
        </div>
      );

      /* ── DIETAS ───────────────────────────────────── */
      case 'dietas': return (
        <div className="espacio-section-content">
          <h2 className="espacio-tab-title">Planes de dieta recomendados</h2>
          <p className="espacio-tab-sub">Alimentá tu cuerpo con amor y consciencia.</p>

          {scoreState === 'loading' && (
            <div className="blog-grid" style={{ marginTop: '24px' }}>
              {[1, 2, 3, 4].map(i => <SkeletonCard key={i} />)}
            </div>
          )}

          {scoreState === 'empty' && (
            <EmptyScoreState onGenerate={handleGenerateRecs} generating={generating} />
          )}

          {scoreState === 'loaded' && (
            recDietas.length > 0 ? (
              <div className="blog-grid" style={{ marginTop: '24px' }}>
                {recDietas.map((n: any, i: number) => (
                  <RecommendCard
                    key={n.slug}
                    title={n.title}
                    excerpt={n.introduction}
                    image={n.image}
                    label={n.duration ?? 'Plan'}
                    color="#E1947F"
                    icon={<i className="fa-solid fa-bowl-food" style={{ marginRight: '6px' }} />}
                    meta={n.duration ?? 'Plan alimenticio'}
                    href={`/dietas/${n.slug}`}
                    index={i}
                  />
                ))}
              </div>
            ) : (
              <div className="espacio-empty-section">
                <i className="fa-solid fa-magnifying-glass" />
                <p>No encontramos planes para tus recomendaciones actuales.</p>
              </div>
            )
          )}
        </div>
      );

      /* ── PROGRESO ─────────────────────────────────── */
      case 'progreso': return (
        <div className="espacio-section-content">
          <h2 className="espacio-tab-title">Tu progreso</h2>
          <p className="espacio-tab-sub">Cada pequeño paso cuenta. Celebrá tus logros.</p>

          {progress.sesionesTotales === 0 ? (
            <div className="espacio-progress-empty">
              <span className="espacio-progress-icon"><i className="fa-solid fa-seedling" /></span>
              <h3>¡Es el comienzo de algo hermoso!</h3>
              <p>Completá sesiones de ejercicio, meditación o nutrición para ver florecer tus estadísticas aquí.</p>
              <button
                className="espacio-generate-btn"
                style={{ maxWidth: '240px', marginTop: '8px' }}
                onClick={() => setActiveTab('rutinas')}
              >
                Empezar mi primera rutina
              </button>
            </div>
          ) : null}

          <div className="espacio-stats-row">
            <div className="espacio-stat-card espacio-stat-card--lg">
              <span className="espacio-stat-icon" style={{ color: '#E1947F' }}><i className="fa-solid fa-fire" /></span>
              <span className="espacio-stat-value espacio-stat-value--lg" style={{ color: '#E1947F' }}>{progress.diasActivos}</span>
              <span className="espacio-stat-unit">días</span>
              <span className="espacio-stat-label">Días activos</span>
            </div>
            <div className="espacio-stat-card espacio-stat-card--lg">
              <span className="espacio-stat-icon" style={{ color: '#B571DE' }}><i className="fa-solid fa-bolt" /></span>
              <span className="espacio-stat-value espacio-stat-value--lg" style={{ color: '#B571DE' }}>{progress.sesionesTotales}</span>
              <span className="espacio-stat-unit">sesiones</span>
              <span className="espacio-stat-label">Sesiones totales</span>
            </div>
            <div className="espacio-stat-card espacio-stat-card--lg">
              <span className="espacio-stat-icon" style={{ color: '#80CACD' }}><i className="fa-solid fa-stopwatch" /></span>
              <span className="espacio-stat-value espacio-stat-value--lg" style={{ color: '#80CACD' }}>{progress.minutosTotales}</span>
              <span className="espacio-stat-unit">min</span>
              <span className="espacio-stat-label">Minutos totales</span>
            </div>
          </div>
        </div>
      );
    }
  };

  return (
    <div className={`espacio-page ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      {/* ── Sidebar ─────────────────────────────────────── */}
      <aside className="espacio-sidebar">
        {/* Toggle button */}
        <button
          className="espacio-sidebar-toggle"
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          aria-label={isSidebarCollapsed ? "Expandir menú" : "Contraer menú"}
        >
          <i className={`fa-solid ${isSidebarCollapsed ? 'fa-chevron-right' : 'fa-chevron-left'}`} />
        </button>

        <div className="espacio-sidebar-content">
          {/* User info */}
          <div className="espacio-user-card">
            <div className="espacio-avatar-wrap" aria-hidden="true">
              <GradientAvatar uid={user?.uid ?? 'guest'} size={44} className="espacio-avatar" />
            </div>
            <div className="espacio-user-details">
              <p className="espacio-user-name">{user?.displayName ?? firstName}</p>
              <p className="espacio-user-email">{user?.email}</p>
            </div>
          </div>

          {/* Nav */}
          <nav className="espacio-nav" aria-label="Navegación del panel">
            {TABS.map(tab => (
              <button
                key={tab.id}
                className={`espacio-nav-btn${activeTab === tab.id ? ' active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
                aria-current={activeTab === tab.id ? 'page' : undefined}
                id={`tab-btn-${tab.id}`}
              >
                <span className="espacio-nav-icon">{tab.icon}</span>
                <span className="espacio-nav-label">{tab.label}</span>
              </button>
            ))}
          </nav>

          {/* Logout */}
          <button
            className="espacio-logout-btn"
            onClick={logout}
            aria-label="Cerrar sesión"
            id="btn-logout"
          >
            <svg className="espacio-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={16} height={16} aria-hidden>
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <span className="espacio-nav-label">Cerrar sesión</span>
          </button>
        </div>
      </aside>

      {/* ── Main content ─────────────────────────────────── */}
      <div className="espacio-main" aria-label="Panel de bienestar">
        {renderTab()}
      </div>
    </div>
  );
}

/* ── Page export (protected) ──────────────────────────────────── */
export default function MiEspacioClient(props: DashboardProps) {
  return (
    <AuthGuard>
      <Dashboard {...props} />
    </AuthGuard>
  );
}
