import type { Metadata } from 'next';
import RutinasClient from './client';
import rutinaData from '@/public/data/rutina.json';

export const metadata: Metadata = {
  title: 'Vitalia | Rutinas de Ejercicio',
  description: 'Descubre rutinas de ejercicio adaptadas a tu nivel y necesidades, desde fuerza en casa hasta movilidad suave.',
};

export default function RutinasPage() {
  return <RutinasClient rutinas={rutinaData.rutinas} />;
}
