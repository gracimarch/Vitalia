import type { Metadata } from 'next';
import PerfilClient from './client';

export const metadata: Metadata = {
  title: 'Vitalia | Mi Perfil',
  description: 'Configuración de tu cuenta y perfil personal.',
  robots: { index: false, follow: false },
};

export default function PerfilPage() {
  return <PerfilClient />;
}
