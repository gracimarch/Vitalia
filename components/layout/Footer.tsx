'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/lib/auth-context';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const { user } = useAuth();

  /** Si no está logueado, abre el modal en vez de navegar */
  const handleEspacioClick = (e: React.MouseEvent) => {
    if (!user) {
      e.preventDefault();
      window.dispatchEvent(new CustomEvent('vitalia:open-interstitial'));
    }
  };

  return (
    <footer className="footer">
      <div className="container">
        <div className="row">
          <div className="col-lg-4 col-md-6 mb-3">
            <Link href="/" className="d-flex align-items-center mb-3 link-body-emphasis text-decoration-none">
              <Image src="/assets/images/ui/vitalia-logo.svg" alt="Logo de Vitalia" className="footer-logo" width={160} height={37} />
            </Link>
            <div className="footer-socials">
              <a href="https://www.facebook.com/profile.php?id=61565298270139" target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="Facebook de Vitalia">
                <i className="fa-brands fa-facebook"></i>
              </a>
              <a href="https://www.instagram.com/vitalia.web" target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="Instagram de Vitalia">
                <i className="fa-brands fa-instagram"></i>
              </a>
              <a href="mailto:vitalia.selfcare@gmail.com?subject=Consulta%20-%20Vitalia&body=Me%20comunicaba%20porque..." target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="E-mail de Vitalia">
                <i className="fa-solid fa-envelope"></i>
              </a>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', marginTop: '1rem' }}>
              Transformando tu bienestar diario con pequeños cambios significativos.
            </p>
          </div>

          {/* Spacer col */}
          <div className="col-lg-1 d-none d-lg-block"></div>

          {/* Vitalia */}
          <div className="col-lg-2 col-md-6 mb-3 div-space">
            <h3 className="footer-heading">Vitalia</h3>
            <ul className="footer-nav-list">
              <li className="footer-nav-item"><Link href="/#que-es-vitalia" className="footer-nav-link">¿Qué es Vitalia?</Link></li>
              <li className="footer-nav-item"><Link href="/#preguntas-frecuentes" className="footer-nav-link">FAQ</Link></li>
              <li className="footer-nav-item"><Link href="/#premium" className="footer-nav-link">Planes Premium</Link></li>
            </ul>
          </div>

          {/* Blog */}
          <div className="col-lg-2 col-md-6 mb-3">
            <h3 className="footer-heading">Blog</h3>
            <ul className="footer-nav-list">
              <li className="footer-nav-item"><Link href="/blog?categoria=Productividad" className="footer-nav-link">Productividad</Link></li>
              <li className="footer-nav-item"><Link href="/blog?categoria=Actividad%20f%C3%ADsica%20y%20movilidad" className="footer-nav-link">Actividad física</Link></li>
              <li className="footer-nav-item"><Link href="/blog?categoria=H%C3%A1bitos%20alimenticios" className="footer-nav-link">Hábitos alimenticios</Link></li>
              <li className="footer-nav-item"><Link href="/blog?categoria=Salud%20mental%20y%20bienestar" className="footer-nav-link">Salud mental</Link></li>
            </ul>
          </div>

          {/* Mi espacio */}
          <div className="col-lg-2 col-md-6 mb-3">
            <h3 className="footer-heading">Mi espacio</h3>
            <ul className="footer-nav-list">
              <li className="footer-nav-item"><Link href="/mi-espacio?tab=lecturas" className="footer-nav-link" onClick={handleEspacioClick}>Artículos</Link></li>
              <li className="footer-nav-item"><Link href="/mi-espacio?tab=ejercicios" className="footer-nav-link" onClick={handleEspacioClick}>Rutinas</Link></li>
              <li className="footer-nav-item"><Link href="/mi-espacio?tab=meditaciones" className="footer-nav-link" onClick={handleEspacioClick}>Meditaciones</Link></li>
              <li className="footer-nav-item"><Link href="/mi-espacio?tab=alimentaciones" className="footer-nav-link" onClick={handleEspacioClick}>Planes</Link></li>
            </ul>
          </div>

          <div className="col-12 mt-4">
            <div className="footer-bottom">
              <p className="mb-0">&copy; 2024–<span suppressHydrationWarning>{currentYear}</span> Vitalia. Todos los derechos reservados.</p>
              <div className="footer-legal-links">
                <Link href="/privacidad" className="footer-legal-link">Privacidad</Link>
                <Link href="/terminos" className="footer-legal-link">Términos</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
