'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

interface AuthGuardProps {
  children: React.ReactNode;
  /** Si true, redirige a /mi-espacio cuando el usuario YA está autenticado (para login/register) */
  redirectIfAuthenticated?: boolean;
}

export default function AuthGuard({ children, redirectIfAuthenticated = false }: AuthGuardProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!user && !redirectIfAuthenticated) {
      router.replace('/iniciar-sesion');
    }

    if (user && redirectIfAuthenticated) {
      router.replace('/mi-espacio');
    }
  }, [user, loading, router, redirectIfAuthenticated]);

  if (loading) {
    return (
      <div className="loader-container">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/assets/favicons/vitalia-favicon.svg" alt="" aria-hidden className="loader-logo" />
      </div>
    );
  }

  if (!user && !redirectIfAuthenticated) return null;
  if (user && redirectIfAuthenticated) return null;

  return <>{children}</>;
}
