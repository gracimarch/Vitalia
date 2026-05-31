'use client';

import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import './blog.css';

/* ── Types ─────────────────────────────────────────────────── */
interface Article {
  slug: string;
  title: string;
  category: string;
  readingTime: string;
  description: string;
  image: string;
  introduction: string;
}

interface Props {
  articles: Article[];
}

/* ── Strip HTML tags for plain-text preview ─────────────────── */
function stripHtml(html: string) {
  return html.replace(/<[^>]+>/g, '').slice(0, 140);
}

/* ── Category badge color ───────────────────────────────────── */
const CAT_COLORS: Record<string, string> = {
  'Productividad':              '#B571DE',
  'Salud mental y bienestar':  '#80CACD',
  'Hábitos alimenticios':       '#E1947F',
  'Actividad física y movilidad': '#7c3aed',
};
function catColor(cat: string) { return CAT_COLORS[cat] ?? '#B571DE'; }

function hexToRgb(hex: string) {
  const clean = hex.replace('#', '');
  if (clean.length !== 6) return '181, 113, 222';
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  return `${r}, ${g}, ${b}`;
}

/* ── Normalize image path ───────────────────────────────────── */
function normalizeImg(raw: string): string {
  if (raw.startsWith('http') || raw.startsWith('/')) return raw;
  // Some entries use "assets/..." some "../assets/..."
  const clean = raw.replace(/^\.\.\//, '');
  return `/${clean}`;
}

/* ══════════════════════════════════════════════════════════
   ARTICLE CARD
   ══════════════════════════════════════════════════════════ */
function ArticleCard({ article, index }: { article: Article; index: number }) {
  const [imgErr, setImgErr] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const preview = stripHtml(article.introduction);
  const color = catColor(article.category);

  return (
    <article
      className="blog-card"
      style={{ 
        '--card-accent': color, 
        '--card-accent-rgb': hexToRgb(color), 
        animationDelay: `${index * 0.06}s` 
      } as React.CSSProperties}
      aria-label={article.title}
    >
      {/* Thumbnail */}
      <div className={`blog-card-thumb ${!imgLoaded && !imgErr ? 'blog-skeleton' : ''}`}>
        {!imgErr ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={normalizeImg(article.image)}
            alt={article.title}
            loading="lazy"
            onLoad={() => setImgLoaded(true)}
            onError={() => { setImgErr(true); setImgLoaded(true); }}
            style={{ opacity: imgLoaded ? 1 : 0, transition: 'opacity 0.3s ease, transform 0.4s ease' }}
            ref={(el) => {
              if (el && el.complete && !imgLoaded) {
                setImgLoaded(true);
              }
            }}
          />
        ) : (
          <div className="blog-card-thumb-fallback">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden>
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
            </svg>
          </div>
        )}
        <span className="blog-card-category" style={{ background: color }}>{article.category}</span>
      </div>

      {/* Body */}
      <div className="blog-card-body">
        <h2 className="blog-card-title">{article.title}</h2>
        <p className="blog-card-excerpt">{preview}…</p>
        <footer className="blog-card-footer">
          <span className="blog-card-time">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={14} height={14} aria-hidden><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            {article.readingTime}
          </span>
          <Link href={`/blog/${article.slug}`} className="blog-card-link" aria-label={`Leer: ${article.title}`}>
            Leer artículo
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={14} height={14} aria-hidden><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </Link>
        </footer>
      </div>
    </article>
  );
}

/* ══════════════════════════════════════════════════════════
   BLOG PAGE CLIENT
   ══════════════════════════════════════════════════════════ */
export default function BlogClient({ articles }: Props) {
  const searchParams = useSearchParams();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('Todos');

  /* Sync category from URL query param on first render */
  useEffect(() => {
    const cat = searchParams.get('categoria');
    if (cat) setActiveCategory(cat);
  }, [searchParams]);

  /* Unique categories */
  const categories = useMemo(() => {
    const cats = ['Todos', ...Array.from(new Set(articles.map(a => a.category)))];
    return cats;
  }, [articles]);

  /* Filter */
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return articles.filter(a => {
      const matchCat = activeCategory === 'Todos' || a.category === activeCategory;
      const matchQ = !q ||
        a.title.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q);
      return matchCat && matchQ;
    });
  }, [articles, search, activeCategory]);

  return (
    <div className="blog-page" id="main-content">

      {/* ── Hero header ───────────────────────────────────── */}
      <header className="blog-hero">
        <div className="blog-hero-inner">
          <div className="blog-hero-eyebrow">
            <span className="blog-hero-dot" />
            Vitalia Blog
          </div>
          <h1 className="blog-hero-title">
            Tu guía de <span className="blog-hero-gradient">bienestar integral</span>
          </h1>
          <p className="blog-hero-subtitle">
            Artículos escritos por especialistas para acompañarte en tu camino hacia
            una vida más saludable, consciente y plena.
          </p>

          {/* Search */}
          <div className="blog-search-wrap">
            <svg className="blog-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={18} height={18} aria-hidden>
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              id="blogSearch"
              type="search"
              className="blog-search-input"
              placeholder="Buscar artículos…"
              aria-label="Buscar artículos"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Decorative blobs */}
        <div className="blog-hero-blob blog-hero-blob--1" aria-hidden />
        <div className="blog-hero-blob blog-hero-blob--2" aria-hidden />
      </header>

      {/* ── Category filters ──────────────────────────────── */}
      <section className="blog-filters-wrap" aria-label="Filtrar por categoría">
        <div className="blog-filters">
          {categories.map(cat => {
            const color = cat === 'Todos' ? '#B571DE' : catColor(cat);
            const rgb = hexToRgb(color);
            return (
              <button
                key={cat}
                className={`blog-filter-btn${activeCategory === cat ? ' active' : ''}`}
                onClick={() => setActiveCategory(cat)}
                aria-pressed={activeCategory === cat}
                style={{
                  '--filter-accent': color,
                  '--filter-accent-rgb': rgb,
                } as React.CSSProperties}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </section>

      {/* ── Articles grid ─────────────────────────────────── */}
      <section className="blog-grid-wrap" aria-live="polite" aria-label="Artículos">
        {filtered.length > 0 ? (
          <>
            <p className="blog-count">{filtered.length} artículo{filtered.length !== 1 ? 's' : ''}</p>
            <div className="blog-grid">
              {filtered.map((a, i) => (
                <ArticleCard key={a.slug} article={a} index={i} />
              ))}
            </div>
          </>
        ) : (
          <div className="blog-empty">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} width={48} height={48} aria-hidden>
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <p>No se encontraron artículos para <strong>"{search}"</strong>.</p>
            <button className="blog-reset-btn" onClick={() => { setSearch(''); setActiveCategory('Todos'); }}>
              Ver todos los artículos
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
