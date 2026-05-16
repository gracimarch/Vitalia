import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import dietasData from '@/public/data/dietas.json';
import recetasData from '@/public/data/recetas.json';
import '@/app/blog/[slug]/article.css';
import './dieta.css';
import DietaViewer from './DietaViewer';

interface Props {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return dietasData.dietas.map((d) => ({
    slug: d.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const dieta = dietasData.dietas.find(d => d.slug === resolvedParams.slug);
  if (!dieta) return { title: 'Dieta no encontrada' };

  return {
    title: `${dieta.title} | Vitalia`,
    description: dieta.type,
  };
}

export default async function DietaPage({ params }: Props) {
  const resolvedParams = await params;
  const dieta = dietasData.dietas.find(d => d.slug === resolvedParams.slug);

  if (!dieta) {
    notFound();
  }

  // Normalize image URL
  const imgUrl = dieta.image.startsWith('http') || dieta.image.startsWith('/') 
    ? dieta.image 
    : `/${dieta.image.replace(/^\.\.\//, '')}`;

  return (
    <div className="article-page">
      <header className="article-hero">
        <img src={imgUrl} alt={dieta.title} className="article-hero-img" />
        <div className="article-hero-overlay" style={{ background: 'linear-gradient(to top, rgba(10,6,20,0.82) 0%, rgba(10,6,20,0.3) 60%, transparent 100%)' }}></div>
        <div className="article-hero-content">
          <nav className="article-breadcrumb" aria-label="Ruta de navegación">
            <Link href="/dietas">← Dietas</Link>
            <span>/</span>
            <span className="article-bc-cat" style={{ color: '#E1947F' }}>{dieta.duration}</span>
          </nav>
          <h1 className="article-hero-title">{dieta.title}</h1>
          <div className="article-hero-meta">
            <span className="article-cat-badge" style={{ background: '#E1947F' }}>{dieta.type}</span>
          </div>
        </div>
      </header>

      <div className="article-body" style={{ gridTemplateColumns: '1fr', maxWidth: '800px', margin: '0 auto', paddingTop: '40px' }}>
        <article className="article-content article-prose" style={{ width: '100%' }}>
          <DietaViewer dieta={dieta} globalRecipes={recetasData.meals} />
        </article>
      </div>
    </div>
  );
}
