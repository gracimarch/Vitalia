import type { Metadata } from 'next';
import MiEspacioClient from './client';
import rutinaData from '@/public/data/rutina.json';
import dietasData from '@/public/data/dietas.json';
import meditacionData from '@/public/data/meditaciones.json';
import lecturasData from '@/public/data/lecturas.json';

export const metadata: Metadata = {
  title: 'Vitalia | Mi Espacio',
  description: 'Tu panel personal de bienestar. Accedé a tus rutinas, meditaciones y recomendaciones de nutrición personalizadas.',
  robots: { index: false, follow: false },
};

export default function MiEspacioPage() {
  return (
    <MiEspacioClient
      rutinas={rutinaData.rutinas}
      dietas={dietasData.dietas}
      meditaciones={meditacionData.meditaciones}
      lecturas={lecturasData.lecturas}
    />
  );
}
