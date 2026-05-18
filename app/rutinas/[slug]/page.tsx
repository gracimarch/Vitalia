import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import rutinaData from '@/public/data/rutina.json';
import ejerciciosData from '@/public/data/ejercicios.json';
import '@/app/blog/[slug]/article.css';
import './rutina.css'; // specific styles for the routine view
import CompleteSessionButton from './CompleteSessionButton';
import RoutinePlayer from './RoutinePlayer';
import AuthWrapper from './AuthWrapper';

interface Props {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return rutinaData.rutinas.map((r) => ({
    slug: r.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const rutina = rutinaData.rutinas.find(r => r.slug === resolvedParams.slug);
  if (!rutina) return { title: 'Rutina no encontrada' };

  return {
    title: `${rutina.title} | Vitalia`,
    description: `Rutina de ${rutina.level} - ${rutina.duration}.`,
  };
}

function getExerciseDetails(exerciseId: string) {
  return ejerciciosData.exercises.find(e => e.id === exerciseId);
}

export default async function RutinaPage({ params }: Props) {
  const resolvedParams = await params;
  const rutina = rutinaData.rutinas.find(r => r.slug === resolvedParams.slug);

  if (!rutina) {
    notFound();
  }

  // Normalize image URL
  const imgUrl = rutina.image.startsWith('http') || rutina.image.startsWith('/') 
    ? rutina.image 
    : `/${rutina.image.replace(/^\.\.\//, '')}`;

  return (
    <AuthWrapper>
    <div className="article-page">
      <header className="article-hero">
        <img src={imgUrl} alt={rutina.title} className="article-hero-img" />
        <div className="article-hero-overlay" style={{ background: `linear-gradient(to top, rgba(10,6,20,0.82) 0%, rgba(10,6,20,0.3) 60%, transparent 100%)` }}></div>
        <div className="article-hero-content">
          <nav className="article-breadcrumb" aria-label="Ruta de navegación">
            <Link href="/rutinas">← Rutinas</Link>
            <span>/</span>
            <span className="article-bc-cat" style={{ color: '#B571DE' }}>{rutina.level}</span>
          </nav>
          <h1 className="article-hero-title">{rutina.title}</h1>
          <div className="article-hero-meta">
            <span className="article-cat-badge" style={{ background: '#B571DE' }}>
              {rutina.level}
            </span>
            <span className="article-meta-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={14} height={14} aria-hidden><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              {rutina.duration}
            </span>
          </div>
        </div>
      </header>

      <div className="article-body" style={{ gridTemplateColumns: '1fr' }}>
        <article className="article-content article-prose" id="article-main">
          <div dangerouslySetInnerHTML={{ __html: rutina.introduction }} />
          
          <div className="rutina-prep-box">
            <h3><i className="fa-solid fa-clipboard-list" style={{marginRight: '8px', color: '#B571DE'}}></i>Preparación</h3>
            <div dangerouslySetInnerHTML={{ __html: rutina.preparation }} />
          </div>

          <div className="rutina-warmup-box">
            <h3><i className="fa-solid fa-fire" style={{marginRight: '8px', color: '#E1947F'}}></i>Calentamiento</h3>
            <p>{rutina.warmup_text}</p>
          </div>

          <RoutinePlayer routine={rutina as any} exerciseDetails={ejerciciosData.exercises as any} />

          <h2 className="article-section-title mt-8 mb-4">Ejercicios de la sesión</h2>
          <div className="rutina-exercises-list">
            {rutina.exercises.map((exItem, index) => {
              const details = getExerciseDetails(exItem.exerciseId);
              if (!details) return null;

              return (
                <div key={`${exItem.exerciseId}-${index}`} className="rutina-exercise-card">
                  <div className="rutina-exercise-number">{index + 1}</div>
                  <div className="rutina-exercise-content">
                    <div className="rutina-exercise-header">
                      <h3>{details.name}</h3>
                      <div className="rutina-exercise-stats">
                        {exItem.sets && <span className="stat-badge"><i className="fa-solid fa-rotate-right"></i> {exItem.sets} series</span>}
                        <span className="stat-badge"><i className="fa-solid fa-stopwatch"></i> {exItem.duration}s activo</span>
                        {exItem.rest > 0 && <span className="stat-badge rest"><i className="fa-solid fa-bed"></i> {exItem.rest}s descanso</span>}
                      </div>
                    </div>
                    <p className="rutina-exercise-desc">{details.desc}</p>
                    {details.media?.type === 'video' && details.media.url && (
                      <div className="rutina-exercise-video">
                        <video src={details.media.url} loop muted playsInline controls={false} autoPlay />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="rutina-conclusion-box">
            <h3><i className="fa-solid fa-trophy" style={{marginRight: '8px', color: '#80CACD'}}></i>Conclusión</h3>
            <div dangerouslySetInnerHTML={{ __html: rutina.conclusion }} />
          </div>

          <CompleteSessionButton durationStr={rutina.duration} />
        </article>
      </div>
      
      <nav className="article-nav-footer" aria-label="Volver">
        <Link href="/rutinas" className="article-nav-back">
          ← Volver a Rutinas
        </Link>
      </nav>
    </div>
    </AuthWrapper>
  );
}
