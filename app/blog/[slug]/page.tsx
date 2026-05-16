import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import lecturas from '@/public/data/lecturas.json';
import ArticleClient from './client';

interface Props {
  params: Promise<{ slug: string }>;
}

/* Static params — pre-render all articles at build time */
export async function generateStaticParams() {
  return lecturas.lecturas.map(a => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = lecturas.lecturas.find(a => a.slug === slug);
  if (!article) return {};
  const description = article.description.slice(0, 160);
  return {
    title: `${article.title} | Vitalia Blog`,
    description,
    keywords: article.keywords,
    openGraph: {
      title: article.title,
      description,
      url: `https://vitalia-selfcare.vercel.app/blog/${slug}`,
      type: 'article',
    },
    alternates: { canonical: `https://vitalia-selfcare.vercel.app/blog/${slug}` },
  };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = lecturas.lecturas.find(a => a.slug === slug);
  if (!article) notFound();
  return <ArticleClient article={article} />;
}
