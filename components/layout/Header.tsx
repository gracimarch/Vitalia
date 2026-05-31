'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import GradientAvatar from '@/components/ui/GradientAvatar';

export default function Header() {
  const { user, loading, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [interstitialOpen, setInterstitialOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Scroll handler
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Cerrar paneles al navegar
  useEffect(() => { 
    setMobileOpen(false); 
    setDropdownOpen(false);
    setInterstitialOpen(false);
  }, [pathname]);

  // Bloquear scroll cuando el panel móvil está abierto
  useEffect(() => {
    document.body.classList.toggle('no-scroll', mobileOpen || interstitialOpen);
    return () => document.body.classList.remove('no-scroll');
  }, [mobileOpen, interstitialOpen]);

  // Cerrar con Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileOpen(false);
        setDropdownOpen(false);
        setInterstitialOpen(false);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  // Abrir interstitial desde el Footer (custom event)
  useEffect(() => {
    const handler = () => setInterstitialOpen(true);
    window.addEventListener('vitalia:open-interstitial', handler);
    return () => window.removeEventListener('vitalia:open-interstitial', handler);
  }, []);

  const isLanding = pathname === '/';
  const shortName = user?.displayName
    ? user.displayName.split(' ')[0]
    : user?.email?.split('@')[0] ?? '';

  const isActive = useCallback(
    (href: string) => {
      if (!pathname) return false;
      if (href === '/') return pathname === '/';
      return pathname.startsWith(href);
    },
    [pathname]
  );

  const isAuthPage = pathname?.startsWith('/iniciar-sesion') || pathname?.startsWith('/crear-cuenta');

  if (isAuthPage) return null;

  const handleEspacioClick = (e: React.MouseEvent) => {
    if (!user) {
      e.preventDefault();
      setInterstitialOpen(true);
      setMobileOpen(false);
    }
  };

  const headerClass = `header${isLanding && !scrolled ? ' header--transparent' : ''}`;


  return (
    <>
      <header className={headerClass} id="site-header">
        <a href="#main-content" className="skip-to-content">Saltar al contenido</a>

        <div className="header-inner">
          {/* Logo */}
          <Link className="navbar-brand" href="/" aria-label="Vitalia — Inicio">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/assets/images/ui/vitalia-logo.svg" alt="Vitalia Logo" className="logo" width={130} height={30} />
          </Link>

          {/* Nav desktop */}
          <nav className="header-nav" aria-label="Navegación principal">
            <Link className={`header-nav-link${isActive('/') ? ' active' : ''}`} href="/">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden width={18} height={18}><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
              Inicio
            </Link>
            <Link className={`header-nav-link${isActive('/blog') ? ' active' : ''}`} href="/blog">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden width={18} height={18}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1={16} y1={13} x2={8} y2={13}/><line x1={16} y1={17} x2={8} y2={17}/></svg>
              Blog
            </Link>
            <Link
              className={`header-nav-link header-nav-link--espacio${isActive('/mi-espacio') ? ' active' : ''}${!user ? ' is-guest' : ''}`}
              href="/mi-espacio"
              onClick={handleEspacioClick}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden width={18} height={18} className="espacio-icon"><rect x={3} y={3} width={7} height={7} rx={1}/><rect x={14} y={3} width={7} height={7} rx={1}/><rect x={14} y={14} width={7} height={7} rx={1}/><rect x={3} y={14} width={7} height={7} rx={1}/></svg>
              Mi espacio
            </Link>
          </nav>

          {/* Auth zone */}
          <div className="header-auth">
            {!loading && (
              <>
                {!user ? (
                  <div className="nav-guest-btns">
                    <Link className="nav-login-link" href="/iniciar-sesion">Iniciar sesión</Link>
                    <Link className="nav-btn-signup" href="/crear-cuenta">Crear cuenta</Link>
                  </div>
                ) : (
                  <div className="nav-user-menu" ref={dropdownRef}>
                    <button
                      className="nav-avatar-btn"
                      aria-expanded={dropdownOpen}
                      aria-haspopup="true"
                      aria-label="Menú de usuario"
                      onClick={() => setDropdownOpen((o) => !o)}
                    >
                      <GradientAvatar uid={user.uid} size={34} />
                    </button>
                    <div className={`nav-user-dropdown${dropdownOpen ? ' is-open' : ''}`} role="menu">
                      <div className="nav-dropdown-header">
                        <GradientAvatar uid={user.uid} size={36} />
                        <div className="nav-dropdown-info">
                          <span className="nav-dropdown-name">{shortName || user.email}</span>
                          <span className="nav-dropdown-email">{user.email}</span>
                        </div>
                      </div>
                      <div className="nav-dropdown-divider" />
                      <Link className="nav-dropdown-item" href="/perfil" role="menuitem" onClick={() => setDropdownOpen(false)}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx={12} cy={7} r={4}/></svg>
                        Configuración
                      </Link>
                      <Link className="nav-dropdown-item nav-dropdown-item--plan" href="/#premium" role="menuitem" onClick={() => setDropdownOpen(false)}>
                        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className="nav-plan-icon"><path d="M2 19l2-7 4 4 4-7 4 7 4-4 2 7H2z"/></svg>
                        Mejorar plan
                      </Link>
                      <div className="nav-dropdown-divider" />
                      <button className="nav-dropdown-item nav-dropdown-item--danger" role="menuitem" onClick={async () => { await logout(); router.push('/'); router.refresh(); }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1={21} y1={12} x2={9} y2={12}/></svg>
                        Cerrar sesión
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Hamburger */}
          <button
            className="nav-hamburger"
            aria-expanded={mobileOpen}
            aria-controls="nav-mobile-panel"
            aria-label={mobileOpen ? 'Cerrar menú' : 'Abrir menú'}
            onClick={() => setMobileOpen((o) => !o)}
          >
            <span className="hamburger-bar" />
            <span className="hamburger-bar" />
            <span className="hamburger-bar" />
          </button>
        </div>
      </header>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="nav-mobile-overlay is-open"
          aria-hidden
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile panel */}
      <aside
        className={`nav-mobile-panel${mobileOpen ? ' is-open' : ''}`}
        id="nav-mobile-panel"
        aria-label="Menú de navegación móvil"
        aria-hidden={!mobileOpen}
      >
        <div className="nav-mobile-panel-header">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/images/ui/vitalia-logo.svg" alt="Vitalia" className="nav-mobile-logo" width={110} height={28} />
          <button className="nav-mobile-close" aria-label="Cerrar menú" onClick={() => setMobileOpen(false)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" aria-hidden><line x1={18} y1={6} x2={6} y2={18}/><line x1={6} y1={6} x2={18} y2={18}/></svg>
          </button>
        </div>

        {!loading && user ? (
          <div className="nav-mobile-user-block" style={{ display: 'block' }}>
            <div className="nav-mobile-user-inner">
              <div className="nav-mobile-avatar-wrap">
                <GradientAvatar uid={user.uid} size={42} />
              </div>
              <div className="nav-mobile-user-info">
                <span className="nav-mobile-user-name">{shortName || user.email}</span>
                <span className="nav-mobile-user-email">{user.email}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="nav-mobile-guest-block">
            <Link className="nav-mobile-btn nav-mobile-btn--primary" href="/crear-cuenta">Crear cuenta</Link>
            <Link className="nav-mobile-btn nav-mobile-btn--ghost" href="/iniciar-sesion">Iniciar sesión</Link>
          </div>
        )}

        <div className="nav-mobile-divider" />

        <nav className="nav-mobile-nav" aria-label="Navegación móvil">
          <Link className={`nav-mobile-link${isActive('/') ? ' active' : ''}`} href="/">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            Inicio
          </Link>
          <Link className={`nav-mobile-link${isActive('/blog') ? ' active' : ''}`} href="/blog">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1={16} y1={13} x2={8} y2={13}/><line x1={16} y1={17} x2={8} y2={17}/></svg>
            Blog
          </Link>
          <Link
            className={`nav-mobile-link nav-mobile-link--espacio${isActive('/mi-espacio') ? ' active' : ''}`}
            href="/mi-espacio"
            onClick={handleEspacioClick}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden className="espacio-icon"><rect x={3} y={3} width={7} height={7} rx={1}/><rect x={14} y={3} width={7} height={7} rx={1}/><rect x={14} y={14} width={7} height={7} rx={1}/><rect x={3} y={14} width={7} height={7} rx={1}/></svg>
            Mi espacio
          </Link>
        </nav>

        {!loading && user && (
          <div className="nav-mobile-user-actions" style={{ display: 'flex' }}>
            <div className="nav-mobile-divider" />
            <Link className="nav-mobile-link" href="/perfil">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx={12} cy={7} r={4}/></svg>
              Configuración
            </Link>
            <button className="nav-mobile-link nav-mobile-link--danger" onClick={async () => { await logout(); router.push('/'); router.refresh(); }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1={21} y1={12} x2={9} y2={12}/></svg>
              Cerrar sesión
            </button>
          </div>
        )}
      </aside>

      {/* Intersticial Mi Espacio */}
      {interstitialOpen && (
        <div
          className="espacio-interstitial is-open"
          aria-modal="true"
          role="dialog"
          aria-labelledby="espacio-interstitial-title"
        >
          <div className="espacio-interstitial-backdrop" onClick={() => setInterstitialOpen(false)} />
          <div className="espacio-interstitial-card">
            <button
              className="espacio-interstitial-close"
              aria-label="Cerrar"
              onClick={() => setInterstitialOpen(false)}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" aria-hidden><line x1={18} y1={6} x2={6} y2={18}/><line x1={6} y1={6} x2={18} y2={18}/></svg>
            </button>
            <div className="espacio-interstitial-icon" aria-hidden>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            </div>
            <h2 className="espacio-interstitial-title" id="espacio-interstitial-title">Tu espacio personalizado te espera</h2>
            <p className="espacio-interstitial-desc">Accede a lecturas, rutinas de ejercicio, meditaciones y planes de alimentación diseñados especialmente para ti.</p>
            <div className="espacio-interstitial-actions">
              <Link className="espacio-btn espacio-btn--primary" href="/crear-cuenta">Crear cuenta gratis</Link>
              <Link className="espacio-btn espacio-btn--ghost" href="/iniciar-sesion">Ya tengo cuenta</Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
