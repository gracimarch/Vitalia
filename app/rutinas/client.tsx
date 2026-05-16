'use client';

import { useState } from 'react';
import Link from 'next/link';
import '@/app/blog/blog.css'; // Reusing the same magic bento grid cards styles from blog

interface Rutina {
  slug: string;
  title: string;
  level: string;
  duration: string;
  introduction: string;
  image: string;
}

interface Props {
  rutinas: Rutina[];
}

function stripHtml(html: string) {
  return html.replace(/<[^>]+>/g, '').slice(0, 140);
}

function normalizeImg(raw: string): string {
  if (raw.startsWith('http') || raw.startsWith('/')) return raw;
  const clean = raw.replace(/^\.\.\//, '');
  return `/${clean}`;
}

function RutinaCard({ rutina, index }: { rutina: Rutina; index: number }) {
  const [imgErr, setImgErr] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const preview = stripHtml(rutina.introduction);
  const color = '#B571DE'; // Primary brand purple

  const fallbackImg = 'https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=600&auto=format&fit=crop';
  const finalImage = (!rutina.image || imgErr) ? fallbackImg : normalizeImg(rutina.image);

  return (
    <article
      className="blog-card"
      style={{ '--card-accent': color, animationDelay: `${index * 0.06}s` } as React.CSSProperties}
      aria-label={rutina.title}
    >
      {/* Thumbnail */}
      <div className={`blog-card-thumb ${!imgLoaded ? 'blog-skeleton' : ''}`}>
        <img
          src={finalImage}
          alt={rutina.title}
          loading="lazy"
          onLoad={() => setImgLoaded(true)}
          onError={() => { if (!imgErr) setImgErr(true); setImgLoaded(true); }}
          style={{ opacity: imgLoaded ? 1 : 0, transition: 'opacity 0.3s ease, transform 0.4s ease' }}
          ref={(el) => {
            if (el && el.complete && !imgLoaded) {
              setImgLoaded(true);
            }
          }}
        />
        <span className="blog-card-category" style={{ background: color }}>{rutina.level}</span>
      </div>

      {/* Body */}
      <div className="blog-card-body">
        <h2 className="blog-card-title">{rutina.title}</h2>
        <p className="blog-card-excerpt">{preview}…</p>
        <footer className="blog-card-footer">
          <span className="blog-card-time">
            <i className="fa-solid fa-clock" style={{marginRight: '6px'}} aria-hidden></i>
            {rutina.duration.split(' ')[0]} min
          </span>
          <Link href={`/rutinas/${rutina.slug}`} className="blog-card-link" aria-label={`Ver rutina: ${rutina.title}`}>
            Ver rutina
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={14} height={14} aria-hidden><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </Link>
        </footer>
      </div>
    </article>
  );
}

export default function RutinasClient({ rutinas }: Props) {
  return (
    <div className="blog-wrapper">
      <header className="blog-hero">
        <div className="blog-hero-inner">
          <h1 className="blog-hero-title">Rutinas de Ejercicio</h1>
          <p className="blog-hero-subtitle">Encuentra la rutina perfecta para activar tu cuerpo y mente a tu propio ritmo.</p>
        </div>
      </header>
      <main className="blog-grid-wrap">
        {rutinas.length > 0 ? (
          <div className="blog-grid" role="feed" aria-busy="false">
            {rutinas.map((rutina, i) => (
              <RutinaCard key={rutina.slug} rutina={rutina} index={i} />
            ))}
          </div>
        ) : (
          <div className="blog-empty">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1} width={48} height={48}><circle cx="12" cy="12" r="10"/><path d="M16 16s-1.5-2-4-2-4 2-4 2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
            <h2>No se encontraron rutinas</h2>
            <p>Vuelve más tarde para ver nuevo contenido.</p>
          </div>
        )}
      </main>
    </div>
  );
}
