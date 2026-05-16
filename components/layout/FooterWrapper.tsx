'use client';

import { usePathname } from 'next/navigation';
import Footer from './Footer';

/** Routes where the global footer should not render */
const HIDDEN_ROUTES = ['/mi-espacio', '/iniciar-sesion', '/crear-cuenta'];

export default function FooterWrapper() {
  const pathname = usePathname();
  const hidden = HIDDEN_ROUTES.some(r => pathname?.startsWith(r));
  if (hidden) return null;
  return <Footer />;
}
