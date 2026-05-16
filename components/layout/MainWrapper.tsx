'use client';

import { usePathname } from 'next/navigation';

/**
 * Routes where the global <main id="main-content"> wrapper should NOT render.
 * These pages manage their own full-bleed layout (e.g. the dashboard sidebar).
 */
const NO_MAIN_WRAPPER_ROUTES = ['/mi-espacio', '/crear-cuenta', '/iniciar-sesion'];

export default function MainWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const suppress = NO_MAIN_WRAPPER_ROUTES.some((r) => pathname?.startsWith(r));

  if (suppress) return <>{children}</>;

  return <main id="main-content">{children}</main>;
}
