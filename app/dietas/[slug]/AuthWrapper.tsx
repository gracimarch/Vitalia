'use client';

import AuthGuard from '@/components/auth/AuthGuard';

export default function AuthWrapper({ children }: { children: React.ReactNode }) {
  return <AuthGuard>{children}</AuthGuard>;
}
