'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import '@/app/blog/blog.css'; // Reusing the magic bento grid cards styles
import './meditaciones.css'; // specific styles for audio
import { logSession } from '@/lib/progress';

interface Meditation {
  id: string;
  title: string;
  description: string;
  duration: string;
  src: string;
  color: string;
}

interface Props {
  meditations: Meditation[];
}

function MeditationCard({ meditation, index, isActive, onPlay }: { meditation: Meditation; index: number; isActive?: boolean; onPlay: () => void }) {
  const cardRef = useRef<HTMLElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (isActive && cardRef.current && audioRef.current) {
      // Scroll to this card with a slight delay to allow layout to settle
      setTimeout(() => {
        cardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Attempt to auto-play
        audioRef.current?.play().catch(e => console.log('Autoplay prevented:', e));
      }, 300);
    }
  }, [isActive]);

  return (
    <article
      ref={cardRef}
      className={`blog-card meditation-card ${isActive ? 'active-meditation' : ''}`}
      style={{ '--card-accent': '#80CACD', animationDelay: `${index * 0.06}s` } as React.CSSProperties}
      aria-label={meditation.title}
    >
      <div className="blog-card-body">
        <h2 className="blog-card-title">{meditation.title}</h2>
        <p className="blog-card-excerpt">{meditation.description}</p>
        <div className="meditation-player-container">
          <audio 
            ref={audioRef} 
            controls 
            controlsList="nodownload" 
            className="meditation-audio"
            onPlay={(e) => {
              const audios = document.querySelectorAll('audio');
              audios.forEach((a) => {
                if (a !== e.currentTarget) {
                  a.pause();
                }
              });
              onPlay();
            }}
            onEnded={() => {
              const minutes = parseInt(meditation.duration, 10) || 10;
              logSession(minutes);
              // We could show a toast here, but for now it's fine just silently logging.
            }}
          >
            <source src={meditation.src} type="audio/mpeg" />
            Tu navegador no soporta el elemento de audio.
          </audio>
        </div>
        <footer className="blog-card-footer mt-2">
          <span className="blog-card-time">
            <i className="fa-solid fa-headphones" style={{marginRight: '6px'}} aria-hidden></i>
            {meditation.duration}
          </span>
        </footer>
      </div>
    </article>
  );
}

function MeditacionesGrid({ meditations }: { meditations: Meditation[] }) {
  const searchParams = useSearchParams();
  const playId = searchParams.get('play');
  const [activeId, setActiveId] = useState<string | null>(playId);

  // Sync state if the URL parameter changes
  useEffect(() => {
    if (playId) {
      setActiveId(playId);
    }
  }, [playId]);

  return (
    <div className="blog-grid" role="feed" aria-busy="false">
      {meditations.map((meditation, i) => (
        <MeditationCard 
          key={meditation.id} 
          meditation={meditation} 
          index={i} 
          isActive={activeId === meditation.id}
          onPlay={() => setActiveId(meditation.id)}
        />
      ))}
    </div>
  );
}

export default function MeditacionClient({ meditations }: Props) {
  return (
    <div className="blog-page">
      <header className="blog-hero">
        <div className="blog-hero-inner">
          <h1 className="blog-hero-title">Meditación y Mindfulness</h1>
          <p className="blog-hero-subtitle">Encuentra un espacio de silencio y calma. Escucha nuestras meditaciones guiadas para reconectar contigo mismo.</p>
        </div>
      </header>
      <main className="blog-grid-wrap">
        {meditations.length > 0 ? (
          <Suspense fallback={<div className="blog-grid">Cargando meditaciones...</div>}>
            <MeditacionesGrid meditations={meditations} />
          </Suspense>
        ) : (
          <div className="blog-empty">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1} width={48} height={48}><circle cx="12" cy="12" r="10"/><path d="M16 16s-1.5-2-4-2-4 2-4 2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
            <h2>No se encontraron meditaciones</h2>
            <p>Vuelve más tarde para ver nuevo contenido.</p>
          </div>
        )}
      </main>
    </div>
  );
}
