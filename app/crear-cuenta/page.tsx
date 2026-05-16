import type { Metadata } from 'next';
import CrearCuentaClient from './client';

export const metadata: Metadata = {
  title: 'Vitalia | Crear cuenta',
  description: 'Creá tu cuenta en Vitalia y recibí un plan de bienestar personalizado. Completá el formulario y accedé a rutinas, meditaciones y nutrición adaptadas a vos.',
  robots: { index: false, follow: false },
  alternates: { canonical: 'https://vitalia-selfcare.vercel.app/crear-cuenta' },
  openGraph: {
    title: 'Crear cuenta en Vitalia | Plan de Bienestar Personalizado',
    description: 'Creá tu cuenta en Vitalia y recibí un plan de bienestar personalizado.',
    url: 'https://vitalia-selfcare.vercel.app/crear-cuenta',
  },
};

export default function CrearCuentaPage() {
  return <CrearCuentaClient />;
}
