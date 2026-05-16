import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  const currentYear = new Date().getFullYear();

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

          <div className="col-lg-2 col-md-6 mb-3 div-space">
            <h3 className="footer-heading">Blog</h3>
            <ul className="footer-nav-list">
              <li className="footer-nav-item"><Link href="/blog#productividad" className="footer-nav-link">Productividad</Link></li>
              <li className="footer-nav-item"><Link href="/blog#ejercicios" className="footer-nav-link">Actividad física</Link></li>
              <li className="footer-nav-item"><Link href="/blog#alimentaciones" className="footer-nav-link">Hábitos alimenticios</Link></li>
              <li className="footer-nav-item"><Link href="/blog#salud-mental" className="footer-nav-link">Salud mental</Link></li>
            </ul>
          </div>

          <div className="col-lg-2 col-md-6 mb-3">
            <h3 className="footer-heading">Mi espacio</h3>
            <ul className="footer-nav-list">
              <li className="footer-nav-item"><Link href="/mi-espacio#lecturas" className="footer-nav-link">Artículos</Link></li>
              <li className="footer-nav-item"><Link href="/mi-espacio#ejercicios" className="footer-nav-link">Rutinas</Link></li>
              <li className="footer-nav-item"><Link href="/mi-espacio#meditaciones" className="footer-nav-link">Meditaciones</Link></li>
              <li className="footer-nav-item"><Link href="/mi-espacio#alimentaciones" className="footer-nav-link">Planes</Link></li>
            </ul>
          </div>

          <div className="col-lg-2 col-md-6 mb-3">
            <h3 className="footer-heading">Vitalia</h3>
            <ul className="footer-nav-list">
              <li className="footer-nav-item"><Link href="/#que-es-vitalia" className="footer-nav-link">¿Qué es Vitalia?</Link></li>
              <li className="footer-nav-item"><Link href="/#preguntas-frecuentes" className="footer-nav-link">FAQ</Link></li>
              <li className="footer-nav-item"><Link href="/#premium" className="footer-nav-link">Planes Premium</Link></li>
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
