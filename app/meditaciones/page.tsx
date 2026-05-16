import type { Metadata } from 'next';
import MeditacionClient from './client';
import meditacionData from '@/public/data/meditaciones.json';

export const metadata: Metadata = {
  title: 'Vitalia | Meditación y Mindfulness',
  description: 'Encuentra un espacio de calma con nuestras meditaciones guiadas para reducir el estrés, dormir mejor y reconectar.',
};

export default function MeditacionPage() {
  return <MeditacionClient meditations={meditacionData.meditaciones} />;
}
