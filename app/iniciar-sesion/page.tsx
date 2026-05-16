import type { Metadata } from 'next';
import IniciarSesionClient from './client';

export const metadata: Metadata = {
  title: 'Vitalia | Iniciar Sesión',
  description: 'Iniciá sesión en Vitalia y continuá con tu plan de bienestar personalizado.',
  robots: { index: false, follow: false },
  alternates: { canonical: 'https://vitalia-selfcare.vercel.app/iniciar-sesion' },
};

export default function IniciarSesionPage() {
  return <IniciarSesionClient />;
}
