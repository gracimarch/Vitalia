import type { Metadata } from 'next';
import DietasClient from './client';
import dietasData from '@/public/data/dietas.json';

export const metadata: Metadata = {
  title: 'Vitalia | Dietas y Nutrición',
  description: 'Planes nutricionales adaptados a tus objetivos: energía, reducción de estrés, opciones vegetarianas y más.',
};

export default function DietasPage() {
  return <DietasClient dietas={dietasData.dietas} />;
}
