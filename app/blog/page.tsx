import type { Metadata } from 'next';
import { Suspense } from 'react';
import BlogClient from './client';
import lecturas from '@/public/data/lecturas.json';

export const metadata: Metadata = {
  title: 'Vitalia | Blog de Bienestar y Salud',
  description:
    'Artículos sobre bienestar integral, salud mental, hábitos saludables, productividad y autocuidado. Descubrí recursos de Vitalia para transformar tu vida.',
  keywords:
    'bienestar, salud mental, hábitos saludables, autocuidado, productividad, meditación, nutrición, vitalia',
  openGraph: {
    title: 'Blog Vitalia — Bienestar y Salud',
    description: 'Artículos y guías sobre bienestar integral, salud mental y hábitos saludables.',
    url: 'https://vitalia-selfcare.vercel.app/blog',
    type: 'website',
  },
  alternates: { canonical: 'https://vitalia-selfcare.vercel.app/blog' },
};

export default function BlogPage() {
  return (
    <Suspense fallback={null}>
      <BlogClient articles={lecturas.lecturas} />
    </Suspense>
  );
}
