'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import './article.css';

/* ── Types ──────────────────────────────────────────────────── */
interface TocEntry { id: string; title: string; }
interface Section  { id: string; title: string; content: string; }
interface Article {
  slug: string;
  title: string;
  category: string;
  readingTime: string;
  description: string;
  image: string;
  introduction: string;
  tableOfContents: TocEntry[];
  sections: Section[];
  keywords?: string;
}

/* ── Normalize image path ───────────────────────────────────── */
function normalizeImg(raw: string): string {
  if (raw.startsWith('http') || raw.startsWith('/')) return raw;
  return `/${raw.replace(/^\.\.\//, '')}`;
}

/* ── Category color ─────────────────────────────────────────── */
const CAT_COLORS: Record<string, string> = {
  'Productividad':              '#B571DE',
  'Salud mental y bienestar':  '#80CACD',
  'Hábitos alimenticios':       '#E1947F',
  'Actividad física y movilidad': '#7c3aed',
};
function catColor(cat: string) { return CAT_COLORS[cat] ?? '#B571DE'; }

/* ── Reading progress hook ──────────────────────────────────── */
function useReadingProgress() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement;
      const scrolled = el.scrollTop;
      const total = el.scrollHeight - el.clientHeight;
      setProgress(total > 0 ? (scrolled / total) * 100 : 0);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return progress;
}

/* ── Active section highlight ───────────────────────────────── */
function useActiveSection(ids: string[]) {
  const [active, setActive] = useState('');
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        for (const e of entries) {
          if (e.isIntersecting) { setActive(e.target.id); break; }
        }
      },
      { rootMargin: '-20% 0px -70% 0px' }
    );
    ids.forEach(id => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [ids]);
  return active;
}

/* ══════════════════════════════════════════════════════════════
   ARTICLE CLIENT
   ══════════════════════════════════════════════════════════════ */
export default function ArticleClient({ article }: { article: Article }) {
  const progress = useReadingProgress();
  const allIds   = ['introduction', ...article.sections.map(s => s.id)];
  const activeId = useActiveSection(allIds);
  const color    = catColor(article.category);
  const [imgErr, setImgErr] = useState(false);

  return (
    <>
      {/* Reading progress bar */}
      <div
        className="article-progress-bar"
        role="progressbar"
        aria-valuenow={Math.round(progress)}
        aria-valuemin={0}
        aria-valuemax={100}
        style={{ width: `${progress}%`, background: color }}
      />

      <div className="article-page">

        {/* ── Hero banner ────────────────────────────────── */}
        <header className="article-hero">
          {!imgErr ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={normalizeImg(article.image)}
              alt={article.title}
              className="article-hero-img"
              onError={() => setImgErr(true)}
            />
          ) : (
            <div className="article-hero-img article-hero-fallback" style={{ background: `linear-gradient(135deg, ${color}22, ${color}08)` }} />
          )}
          <div className="article-hero-overlay" style={{ background: `linear-gradient(to top, rgba(10,6,20,0.82) 0%, rgba(10,6,20,0.3) 60%, transparent 100%)` }} />
          <div className="article-hero-content">
            <nav className="article-breadcrumb" aria-label="Ruta de navegación">
              <Link href="/blog">← Blog</Link>
              <span>/</span>
              <span className="article-bc-cat" style={{ color }}>{article.category}</span>
            </nav>
            <h1 className="article-hero-title">{article.title}</h1>
            <div className="article-hero-meta">
              <span className="article-cat-badge" style={{ background: color }}>{article.category}</span>
              <span className="article-meta-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={14} height={14} aria-hidden><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                {article.readingTime}
              </span>
            </div>
          </div>
        </header>

        {/* ── Body: sidebar + content ─────────────────────── */}
        <div className="article-body">

          {/* Table of contents — sticky sidebar */}
          <aside className="article-toc" aria-label="Tabla de contenidos">
            <h2 className="article-toc-title">Contenidos</h2>
            <nav>
              <ol className="article-toc-list">
                <li>
                  <a
                    href="#introduction"
                    className={`article-toc-link${activeId === 'introduction' ? ' active' : ''}`}
                    style={activeId === 'introduction' ? { color, borderColor: color } : undefined}
                  >
                    Introducción
                  </a>
                </li>
                {article.tableOfContents.map(entry => (
                  <li key={entry.id}>
                    <a
                      href={`#${entry.id}`}
                      className={`article-toc-link${activeId === entry.id ? ' active' : ''}`}
                      style={activeId === entry.id ? { color, borderColor: color } : undefined}
                    >
                      {entry.title}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>

            {/* Back to blog CTA */}
            <Link href="/blog" className="article-toc-back">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={14} height={14} aria-hidden><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
              Volver al blog
            </Link>
          </aside>

          {/* Main article content */}
          <article className="article-content" id="article-main">

            {/* Introduction */}
            <section id="introduction" className="article-section">
              <div
                className="article-prose"
                dangerouslySetInnerHTML={{ __html: article.introduction }}
              />
            </section>

            {/* Sections */}
            {article.sections.map(section => (
              <section key={section.id} id={section.id} className="article-section">
                <h2 className="article-section-title" style={{ '--section-color': color } as React.CSSProperties}>
                  {section.title}
                </h2>
                <div
                  className="article-prose"
                  dangerouslySetInnerHTML={{ __html: section.content }}
                />
              </section>
            ))}

            {/* Tags */}
            {article.keywords && (
              <footer className="article-tags">
                <span className="article-tags-label">Temas:</span>
                {article.keywords.split(',').slice(0, 6).map(k => (
                  <span key={k} className="article-tag">{k.trim()}</span>
                ))}
              </footer>
            )}

            {/* CTA */}
            <div className="article-cta">
              <div className="article-cta-icon" style={{ background: `linear-gradient(135deg, ${color}, #80CACD)` }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2} width={22} height={22} aria-hidden><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              </div>
              <div>
                <p className="article-cta-title">¿Querés un plan personalizado?</p>
                <p className="article-cta-text">Vitalia adapta rutinas, meditaciones y nutrición a tu perfil de bienestar único.</p>
              </div>
              <Link href="/crear-cuenta" className="article-cta-btn" style={{ background: color }}>
                Empezar gratis
              </Link>
            </div>
          </article>
        </div>

        {/* ── Related articles navigation ──────────────────── */}
        <nav className="article-nav-footer" aria-label="Más artículos">
          <Link href="/blog" className="article-nav-back">
            ← Ver todos los artículos
          </Link>
        </nav>
      </div>
    </>
  );
}
