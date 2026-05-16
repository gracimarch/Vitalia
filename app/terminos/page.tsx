import React from 'react';
import Link from 'next/link';
import '../legal.css';

export const metadata = {
  title: 'Vitalia | Términos y Condiciones',
  description: 'Leé los Términos y Condiciones de Vitalia: qué podés esperar del servicio, tus derechos y responsabilidades como usuario.',
  robots: { index: false, follow: true },
};

export default function TerminosPage() {
  return (
    <main className="page-container legal-page" id="terminos">
      <section className="legal-hero">
        <div className="legal-hero-bg"></div>
        <div className="legal-hero-content">
          <div className="legal-hero-icon">
            <i className="fa-solid fa-file-contract"></i>
          </div>
          <h1 className="legal-hero-title">Términos y Condiciones</h1>
          <p className="legal-hero-meta">Última actualización: 8 de mayo de 2026</p>
        </div>
      </section>

      <article className="legal-article">
        <nav className="legal-toc" aria-label="Índice de contenidos">
          <h2 className="legal-toc-title">
            <i className="fa-solid fa-list"></i> Contenidos
          </h2>
          <ol className="legal-toc-list">
            <li><a href="#descripcion">Descripción del servicio</a></li>
            <li><a href="#pasos">Pasos para adquirir los servicios</a></li>
            <li><a href="#responsabilidades">Responsabilidades del propietario</a></li>
            <li><a href="#garantias">Garantías y políticas de devoluciones</a></li>
            <li><a href="#publico">Público objetivo</a></li>
            <li><a href="#contenidos">Derechos relativos a los contenidos</a></li>
            <li><a href="#cuenta">Registro de la cuenta</a></li>
            <li><a href="#pagos">Modelo de negocio, pagos y derechos</a></li>
            <li><a href="#usos">Usos aceptables</a></li>
            <li><a href="#garantias-legales">Garantías y limitaciones de responsabilidad</a></li>
            <li><a href="#accesibilidad">Accesibilidad</a></li>
            <li><a href="#terceros">Uso de contenido de terceros</a></li>
            <li><a href="#firebase-terminos">Seguridad y almacenamiento (Firebase)</a></li>
            <li><a href="#cambios-terminos">Notificación de cambios</a></li>
            <li><a href="#contacto-terminos">Contacto</a></li>
          </ol>
        </nav>

        <section className="legal-section" id="descripcion">
          <h2 className="legal-section-title">
            <span className="legal-section-number">1</span>
            Descripción del Servicio
          </h2>
          <p>
            Vitalia es una plataforma en línea que ofrece servicios personalizados de bienestar mental y físico.
            Estos incluyen planes personalizados con rutinas de ejercicio, artículos educativos, planes de
            comida y meditaciones guiadas tomadas de videos de YouTube.
          </p>
          <p>
            Los usuarios pueden registrarse y crear un perfil basado en datos de salud mental y física para
            recibir recomendaciones personalizadas.
          </p>
        </section>

        <section className="legal-section" id="pasos">
          <h2 className="legal-section-title">
            <span className="legal-section-number">2</span>
            Pasos para Adquirir los Servicios
          </h2>
          <ol className="legal-list">
            <li>Registro en la plataforma mediante correo electrónico o cuenta de Google.</li>
            <li>Completar el formulario de salud mental y física.</li>
            <li>Recibir recomendaciones y planes personalizados.</li>
          </ol>
        </section>

        <section className="legal-section" id="responsabilidades">
          <h2 className="legal-section-title">
            <span className="legal-section-number">3</span>
            Responsabilidades del Propietario
          </h2>
          <p>Vitalia se compromete a:</p>
          <ul className="legal-list">
            <li>Proteger los datos personales de los usuarios siguiendo estrictos protocolos de seguridad.</li>
            <li>Garantizar que los servicios ofrecidos se entreguen según lo prometido.</li>
            <li>Atender cualquier problema relacionado con los servicios, como errores en los planes personalizados o acceso a contenido.</li>
          </ul>
          <p>
            En caso de cualquier problema con el servicio, como la recepción de información incorrecta o un fallo
            técnico, Vitalia trabajará para resolverlo de manera oportuna y en un plazo razonable.
          </p>
        </section>

        <section className="legal-section" id="garantias">
          <h2 className="legal-section-title">
            <span className="legal-section-number">4</span>
            Garantías y Políticas de Devoluciones
          </h2>
          <p>
            Vitalia no ofrece productos físicos que requieran envíos, pero cualquier servicio adquirido será
            detallado antes de la compra.
          </p>
          <p>
            Las solicitudes de reembolso se manejarán caso por caso, según se describe en nuestra política de
            reembolsos.
          </p>
        </section>

        <section className="legal-section" id="publico">
          <h2 className="legal-section-title">
            <span className="legal-section-number">5</span>
            Público Objetivo
          </h2>
          <p>
            Este sitio web y los servicios ofrecidos están dirigidos a personas mayores de 13 años interesadas en
            el bienestar mental y físico.
          </p>
          <p>Los menores de 13 años no están autorizados a utilizar este servicio.</p>
        </section>

        <section className="legal-section" id="contenidos">
          <h2 className="legal-section-title">
            <span className="legal-section-number">6</span>
            Derechos Relativos a los Contenidos
          </h2>
          <p>
            Todo el contenido disponible en este sitio, incluyendo textos, gráficos, logotipos, imágenes, videos
            y software, es propiedad de Vitalia o de sus proveedores de contenido y está protegido por las leyes
            de derechos de autor.
          </p>
          <p>
            El usuario se compromete a no reproducir, duplicar, copiar, vender o explotar cualquier parte del
            contenido sin el consentimiento expreso de Vitalia. Cualquier uso no autorizado puede resultar en
            acciones legales.
          </p>
        </section>

        <section className="legal-section" id="cuenta">
          <h2 className="legal-section-title">
            <span className="legal-section-number">7</span>
            Registro de la Cuenta
          </h2>
          <p>
            Para acceder a ciertas funciones del sitio, como los planes personalizados, es necesario
            registrarse y crear una cuenta. El registro puede realizarse a través de Google o un correo
            electrónico.
          </p>
          <p>
            El usuario es responsable de mantener la confidencialidad de su cuenta y contraseña, y acepta
            notificar inmediatamente a Vitalia de cualquier uso no autorizado.
          </p>
        </section>

        <section className="legal-section" id="pagos">
          <h2 className="legal-section-title">
            <span className="legal-section-number">8</span>
            Modelo de Negocio, Pagos y Derechos de los Usuarios
          </h2>
          <p>
            Vitalia ofrece planes personalizados de bienestar con algunas funciones que pueden requerir un pago.
            Los precios y detalles se especificarán claramente en la sección correspondiente.
          </p>
          <p>
            Los usuarios tienen derecho a solicitar la cancelación o reembolso conforme a la política de
            reembolsos vigente.
          </p>
          <div className="legal-callout">
            <i className="fa-solid fa-circle-info"></i>
            <p>
              Vitalia puede mostrar anuncios de terceros dentro del sitio web. Vitalia no se responsabiliza por
              el contenido o la política de privacidad de dichos anuncios.
            </p>
          </div>
        </section>

        <section className="legal-section" id="usos">
          <h2 className="legal-section-title">
            <span className="legal-section-number">9</span>
            Usos Aceptables
          </h2>
          <p>El usuario se compromete a utilizar el sitio de manera legal y de acuerdo con estos términos.</p>
          <p>
            Está prohibido el uso del sitio para enviar o transmitir material ilícito, acosador, difamatorio,
            abusivo, amenazante, dañino, vulgar, obsceno o de cualquier otra manera objetable.
          </p>
          <p>
            Todas las disposiciones de estos términos que, por su naturaleza, deban sobrevivir a la terminación
            de los mismos, permanecerán en vigor, incluyendo, sin limitación: disposiciones de propiedad,
            renuncias de garantías, indemnizaciones y limitaciones de responsabilidad.
          </p>
        </section>

        <section className="legal-section" id="garantias-legales">
          <h2 className="legal-section-title">
            <span className="legal-section-number">10</span>
            Garantías y Limitaciones de Responsabilidad
          </h2>
          <p>
            El servicio se proporciona <strong>&quot;tal cual&quot;</strong> y <strong>&quot;según disponibilidad&quot;</strong>.
            Vitalia no garantiza que el servicio será ininterrumpido o libre de errores.
          </p>
          <p>
            En la máxima medida permitida por la ley, Vitalia no será responsable de ningún daño indirecto,
            incidental, especial, punitivo o consecuente derivado del uso del servicio.
          </p>
        </section>

        <section className="legal-section" id="accesibilidad">
          <h2 className="legal-section-title">
            <span className="legal-section-number">11</span>
            Accesibilidad
          </h2>
          <p>
            Vitalia se compromete a proporcionar un sitio web accesible a la mayor cantidad de usuarios posible,
            incluyendo a personas con discapacidades.
          </p>
          <p>
            Si encontrás alguna barrera de accesibilidad, te solicitamos que nos lo notifiques a través del
            correo electrónico de contacto para poder mejorar nuestro servicio.
          </p>
        </section>

        <section className="legal-section" id="terceros">
          <h2 className="legal-section-title">
            <span className="legal-section-number">12</span>
            Uso de Contenido de Terceros
          </h2>
          <p>
            En Vitalia utilizamos ciertos contenidos, como meditaciones en audio, tomados de YouTube. Aunque
            estos contenidos no se utilizan con fines comerciales, reconocemos los derechos de autor de los
            creadores originales.
          </p>
          <p>
            Si sos titular de los derechos de autor de alguno de estos contenidos y deseás que lo eliminemos o
            acreditemos adecuadamente, podés contactarnos y atenderemos tu solicitud de inmediato.
          </p>
        </section>

        <section className="legal-section" id="firebase-terminos">
          <h2 className="legal-section-title">
            <span className="legal-section-number">13</span>
            Seguridad y Almacenamiento de Datos (Firebase)
          </h2>
          <p>
            Los datos de inicio de sesión y los datos recopilados a través de nuestros formularios son
            almacenados en Firebase, un servicio de Google, que implementa medidas de seguridad robustas para
            proteger los datos de los usuarios.
          </p>
          <p>Podés consultar la política de privacidad de Firebase para más detalles.</p>
          <div className="legal-callout">
            <i className="fa-solid fa-circle-info"></i>
            <p>
              Al completar los formularios en Vitalia, aceptás que los datos proporcionados pueden ser
              anonimizados y utilizados para fines de análisis, desarrollo de productos y otras actividades
              comerciales. Los datos serán anonimizados de manera que no se puedan identificar personalmente.
            </p>
          </div>
        </section>

        <section className="legal-section" id="cambios-terminos">
          <h2 className="legal-section-title">
            <span className="legal-section-number">14</span>
            Notificación de Cambios
          </h2>
          <p>
            Nos reservamos el derecho de actualizar estos términos y condiciones cuando sea necesario. En caso de
            realizar cambios significativos, notificaremos a los usuarios registrados mediante correo
            electrónico antes de que las nuevas políticas entren en vigor.
          </p>
        </section>

        <section className="legal-section" id="contacto-terminos">
          <h2 className="legal-section-title">
            <span className="legal-section-number">15</span>
            Contacto
          </h2>
          <p>Para cualquier consulta relacionada con estos términos y condiciones, podés contactarnos:</p>
          <a href="mailto:vitalia.selfcare@gmail.com?subject=Consulta%20-%20Términos%20y%20Condiciones" className="legal-contact-btn">
            <i className="fa-solid fa-envelope"></i>
            vitalia.selfcare@gmail.com
          </a>
        </section>

        <div className="legal-also">
          <p>También te puede interesar</p>
          <Link href="/privacidad" className="legal-also-link">
            <i className="fa-solid fa-shield-halved"></i>
            Política de Privacidad
            <i className="fa-solid fa-arrow-right"></i>
          </Link>
        </div>
      </article>
    </main>
  );
}
