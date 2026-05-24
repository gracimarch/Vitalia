import React from 'react';
import Link from 'next/link';
import '../legal.css';

export const metadata = {
  title: 'Vitalia | Política de Privacidad',
  description: 'Conocé cómo Vitalia recopila, usa y protege tu información personal. Tu privacidad es nuestra prioridad.',
  robots: { index: false, follow: true },
};

export default function PrivacidadPage() {
  return (
    <main className="page-container legal-page" id="privacidad">
      <section className="legal-hero">
        <div className="legal-hero-bg"></div>
        <div className="legal-hero-content">
          <div className="legal-hero-badge">
            <i className="fa-solid fa-shield-halved"></i>
            Documento legal
          </div>
          <h1 className="legal-hero-title">Política de <span>Privacidad</span></h1>
          <p className="legal-hero-meta">Última actualización: 8 de mayo de 2026</p>
        </div>
        <div className="legal-hero-divider"></div>
      </section>

      <article className="legal-article">
        <p className="legal-intro">
          Utilizamos tus datos personales para proporcionar y mejorar el servicio. Al utilizar Vitalia, aceptás la
          recopilación y el uso de información de acuerdo con esta Política de Privacidad.
        </p>

        <nav className="legal-toc" aria-label="Índice de contenidos">
          <h2 className="legal-toc-title">
            <i className="fa-solid fa-list"></i> Contenidos
          </h2>
          <ol className="legal-toc-list">
            <li><a href="#interpretacion">Interpretación y Definiciones</a></li>
            <li><a href="#recopilacion">Recopilación y Uso de tus Datos Personales</a></li>
            <li><a href="#retencion">Retención de tus Datos Personales</a></li>
            <li><a href="#transferencia">Transferencia de tus Datos Personales</a></li>
            <li><a href="#eliminacion">Eliminación de tus Datos Personales</a></li>
            <li><a href="#divulgacion">Divulgación de tus Datos Personales</a></li>
            <li><a href="#seguridad">Seguridad de tus Datos Personales</a></li>
            <li><a href="#ninos">Privacidad de los Niños</a></li>
            <li><a href="#enlaces">Enlaces a Otros Sitios Web</a></li>
            <li><a href="#firebase">Seguridad y Almacenamiento (Firebase)</a></li>
            <li><a href="#cambios">Cambios a esta Política</a></li>
            <li><a href="#contacto-privacidad">Contacto</a></li>
          </ol>
        </nav>

        <section className="legal-section" id="interpretacion">
          <h2 className="legal-section-title">
            <span className="legal-section-number">1</span>
            Interpretación y Definiciones
          </h2>
          <h3 className="legal-subsection-title">Interpretación</h3>
          <p>
            Las palabras cuya letra inicial está en mayúscula tienen significados definidos bajo las siguientes
            condiciones. Las definiciones tendrán el mismo significado, independientemente de si aparecen en
            singular o en plural.
          </p>
          <h3 className="legal-subsection-title">Definiciones</h3>
          <p>A los efectos de esta Política de Privacidad:</p>
          <ul className="legal-list">
            <li><strong>Cuenta</strong> — una cuenta única creada para que accedas a nuestro servicio o a partes del mismo.</li>
            <li><strong>Afiliado</strong> — una entidad que controla, es controlada por, o está bajo control común con una parte, donde &quot;control&quot; significa la propiedad del 50% o más de las acciones con derecho a voto.</li>
            <li><strong>Compañía</strong> (&quot;la Compañía&quot;, &quot;Nosotros&quot; o &quot;Nuestro&quot;) — se refiere a Vitalia.</li>
            <li><strong>Cookies</strong> — pequeños archivos que se colocan en tu dispositivo por un sitio web, que contienen detalles de tu historial de navegación.</li>
            <li><strong>País</strong> — Argentina.</li>
            <li><strong>Dispositivo</strong> — cualquier dispositivo que pueda acceder al servicio, como una computadora, un teléfono celular o una tableta digital.</li>
            <li><strong>Datos personales</strong> — cualquier información que se relacione con una persona identificada o identificable.</li>
            <li><strong>Servicio</strong> — el sitio web Vitalia.</li>
            <li><strong>Proveedor de servicios</strong> — cualquier persona natural o jurídica que procese los datos en nombre de la Compañía.</li>
            <li><strong>Datos de uso</strong> — datos recopilados automáticamente, generados por el uso del servicio o de la infraestructura del mismo.</li>
            <li><strong>Vos / Usted</strong> — la persona que accede o utiliza el servicio.</li>
          </ul>
        </section>

        <section className="legal-section" id="recopilacion">
          <h2 className="legal-section-title">
            <span className="legal-section-number">2</span>
            Recopilación y Uso de tus Datos Personales
          </h2>
          <h3 className="legal-subsection-title">Datos Personales</h3>
          <p>
            Mientras usás nuestro servicio, es posible que te pidamos que nos proporciones cierta información de
            identificación personal. La información puede incluir, pero no está limitada a:
          </p>
          <ul className="legal-list">
            <li>Dirección de correo electrónico</li>
            <li>Nombre y apellido</li>
            <li>Datos de uso</li>
          </ul>
          <h3 className="legal-subsection-title">Datos de Uso</h3>
          <p>
            Los datos de uso se recopilan automáticamente cuando se utiliza el servicio. Pueden incluir
            información como la dirección IP de tu dispositivo, tipo y versión de navegador, las páginas que
            visitás, la fecha y hora de tu visita, el tiempo dedicado a esas páginas e identificadores únicos de
            dispositivos.
          </p>
          <p>
            Cuando accedés al servicio desde un dispositivo móvil, podemos recopilar cierta información
            automáticamente, incluyendo el tipo de dispositivo, ID único del dispositivo, dirección IP, sistema
            operativo y tipo de navegador móvil.
          </p>
          <h3 className="legal-subsection-title">Tecnologías de Rastreo y Cookies</h3>
          <p>
            Utilizamos cookies y tecnologías de rastreo similares para rastrear la actividad en nuestro servicio
            y almacenar cierta información. Las tecnologías pueden incluir:
          </p>
          <ul className="legal-list">
            <li><strong>Cookies del Navegador.</strong> Un pequeño archivo colocado en tu dispositivo. Podés indicar a tu navegador que rechace todas las cookies; si no las aceptás, es posible que no puedas utilizar algunas partes de nuestro servicio.</li>
            <li><strong>Balizas Web.</strong> Pequeños archivos electrónicos que permiten a la Compañía contar usuarios que visitaron esas páginas o abrieron un correo electrónico, y obtener estadísticas relacionadas con el sitio web.</li>
          </ul>
          <div className="legal-table-wrapper">
            <table className="legal-table">
              <thead>
                <tr>
                  <th>Tipo de Cookie</th>
                  <th>Tipo</th>
                  <th>Propósito</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Cookies esenciales</td>
                  <td>Sesión</td>
                  <td>Autenticar usuarios y prevenir el uso fraudulento de cuentas.</td>
                </tr>
                <tr>
                  <td>Cookies de aceptación</td>
                  <td>Persistentes</td>
                  <td>Identificar si los usuarios aceptaron el uso de cookies.</td>
                </tr>
                <tr>
                  <td>Cookies de funcionalidad</td>
                  <td>Persistentes</td>
                  <td>Recordar tus preferencias de inicio de sesión e idioma.</td>
                </tr>
              </tbody>
            </table>
          </div>
          <h3 className="legal-subsection-title">Uso de tus Datos Personales</h3>
          <p>La Compañía puede usar los Datos Personales para los siguientes propósitos:</p>
          <ul className="legal-list">
            <li><strong>Para proporcionar y mantener nuestro Servicio,</strong> incluyendo el monitoreo del uso del mismo.</li>
            <li><strong>Para gestionar tu Cuenta</strong> como usuario registrado del Servicio.</li>
            <li><strong>Para la ejecución de un contrato:</strong> el desarrollo, cumplimiento y ejecución del contrato de los servicios que hayas adquirido.</li>
            <li><strong>Para contactarte</strong> por correo electrónico u otras formas de comunicación electrónica en relación con actualizaciones del Servicio.</li>
            <li><strong>Para proporcionarte novedades y ofertas</strong> sobre bienes, servicios y eventos similares a los que ya consultaste, salvo que hayas optado por no recibirlos.</li>
            <li><strong>Para gestionar tus solicitudes</strong> hacia Nosotros.</li>
            <li><strong>Para transferencias comerciales:</strong> evaluación o ejecución de una fusión, reestructuración u otra venta de activos.</li>
            <li><strong>Para otros propósitos:</strong> análisis de datos, identificar tendencias de uso y mejorar nuestro Servicio.</li>
          </ul>
          <p>Podemos compartir tu información personal en las siguientes situaciones:</p>
          <ul className="legal-list">
            <li><strong>Con Proveedores de Servicios</strong> para monitorear y analizar el uso de nuestro Servicio.</li>
            <li><strong>Para transferencias comerciales</strong> en relación con una fusión, venta de activos o adquisición.</li>
            <li><strong>Con Afiliados,</strong> quienes deberán respetar esta Política de Privacidad.</li>
            <li><strong>Con socios comerciales</strong> para ofrecerte ciertos productos, servicios o promociones.</li>
            <li><strong>Con otros usuarios:</strong> cuando compartís información en áreas públicas del servicio, puede ser vista por todos.</li>
            <li><strong>Con tu consentimiento</strong> para cualquier otro propósito que hayas autorizado.</li>
          </ul>
        </section>

        <section className="legal-section" id="retencion">
          <h2 className="legal-section-title">
            <span className="legal-section-number">3</span>
            Retención de tus Datos Personales
          </h2>
          <p>
            La Compañía retendrá tus Datos Personales solo durante el tiempo necesario para los fines
            establecidos en esta Política, para cumplir con obligaciones legales, resolver disputas y hacer
            cumplir nuestros acuerdos.
          </p>
          <p>
            Los Datos de Uso generalmente se retienen durante un período más corto, excepto cuando se usan para
            fortalecer la seguridad o mejorar la funcionalidad del Servicio.
          </p>
        </section>

        <section className="legal-section" id="transferencia">
          <h2 className="legal-section-title">
            <span className="legal-section-number">4</span>
            Transferencia de tus Datos Personales
          </h2>
          <p>
            Tu información es procesada en las oficinas operativas de la Compañía y en cualquier otro lugar donde
            se encuentren las partes involucradas en el procesamiento. Esto significa que puede transferirse a
            computadoras ubicadas fuera de tu jurisdicción, donde las leyes de protección de datos pueden
            diferir.
          </p>
          <p>
            Tu consentimiento a esta Política de Privacidad, seguido de tu envío de dicha información, representa
            tu acuerdo con esa transferencia. La Compañía tomará todas las medidas razonablemente necesarias
            para garantizar que tus datos sean tratados de manera segura.
          </p>
        </section>

        <section className="legal-section" id="eliminacion">
          <h2 className="legal-section-title">
            <span className="legal-section-number">5</span>
            Eliminación de tus Datos Personales
          </h2>
          <p>
            Tenés el derecho de eliminar o solicitar que te ayudemos a eliminar los Datos Personales que hemos
            recopilado sobre vos. Podés hacerlo iniciando sesión en tu cuenta y visitando la sección de
            configuración, o contactándonos directamente.
          </p>
          <p>
            Sin embargo, es posible que necesitemos retener cierta información cuando tengamos una obligación
            legal o una base legal para hacerlo.
          </p>
        </section>

        <section className="legal-section" id="divulgacion">
          <h2 className="legal-section-title">
            <span className="legal-section-number">6</span>
            Divulgación de tus Datos Personales
          </h2>
          <h3 className="legal-subsection-title">Transacciones Comerciales</h3>
          <p>
            Si la Compañía está involucrada en una fusión, adquisición o venta de activos, es posible que tus
            Datos Personales sean transferidos. Proporcionaremos un aviso antes de que eso ocurra.
          </p>
          <h3 className="legal-subsection-title">Cumplimiento de la Ley</h3>
          <p>
            En determinadas circunstancias, la Compañía puede estar obligada a divulgar tus Datos Personales si
            así lo requiere la ley o en respuesta a solicitudes válidas de autoridades públicas.
          </p>
          <h3 className="legal-subsection-title">Otros Requisitos Legales</h3>
          <p>
            La Compañía puede divulgar tus Datos Personales de buena fe cuando considere que esta acción es
            necesaria para:
          </p>
          <ul className="legal-list">
            <li>Cumplir con una obligación legal</li>
            <li>Proteger y defender los derechos o la propiedad de la Compañía</li>
            <li>Prevenir o investigar posibles infracciones en relación con el Servicio</li>
            <li>Proteger la seguridad personal de los usuarios del Servicio o del público</li>
            <li>Protegerse contra responsabilidades legales</li>
          </ul>
        </section>

        <section className="legal-section" id="seguridad">
          <h2 className="legal-section-title">
            <span className="legal-section-number">7</span>
            Seguridad de tus Datos Personales
          </h2>
          <p>
            La seguridad de tus Datos Personales es importante para Nosotros. Recordá que ningún método de
            transmisión a través de Internet ni de almacenamiento electrónico es 100% seguro. Nos esforzamos por
            utilizar medios comercialmente aceptables para proteger tu información, pero no podemos garantizar
            su seguridad absoluta.
          </p>
        </section>

        <section className="legal-section" id="ninos">
          <h2 className="legal-section-title">
            <span className="legal-section-number">8</span>
            Privacidad de los Niños
          </h2>
          <p>
            Nuestro Servicio no está dirigido a menores de 13 años. No recopilamos conscientemente información de
            identificación personal de personas menores de 13 años. Si sos padre, madre o tutor y sabés que tu
            hijo nos proporcionó Datos Personales, por favor contactanos.
          </p>
          <p>
            Si nos damos cuenta de que recopilamos Datos Personales de cualquier persona menor de 13 años sin
            verificación del consentimiento parental, tomaremos medidas para eliminar esa información de
            nuestros servidores.
          </p>
        </section>

        <section className="legal-section" id="enlaces">
          <h2 className="legal-section-title">
            <span className="legal-section-number">9</span>
            Enlaces a Otros Sitios Web
          </h2>
          <p>
            Nuestro Servicio puede contener enlaces a otros sitios web que no son operados por Nosotros. Si hacés
            clic en un enlace de un tercero, serás dirigido al sitio de ese tercero. Te recomendamos que revises
            la Política de Privacidad de cada sitio que visitás.
          </p>
          <p>
            No tenemos control ni asumimos responsabilidad alguna por el contenido, las políticas de privacidad o
            las prácticas de sitios o servicios de terceros.
          </p>
        </section>

        <section className="legal-section" id="firebase">
          <h2 className="legal-section-title">
            <span className="legal-section-number">10</span>
            Seguridad y Almacenamiento de Datos (Firebase)
          </h2>
          <p>
            Los datos de inicio de sesión y los datos recopilados a través de nuestros formularios son
            almacenados en Firebase, un servicio de Google. Firebase implementa medidas de seguridad robustas
            para proteger los datos de los usuarios, incluyendo el cifrado de datos en tránsito y acceso
            restringido a la información personal solo para personal autorizado.
          </p>
          <div className="legal-callout">
            <i className="fa-solid fa-circle-info"></i>
            <p>
              Al completar los formularios en Vitalia, aceptás que los datos proporcionados pueden ser
              anonimizados y utilizados para fines de análisis y mejora del servicio. Estos datos no incluirán
              ninguna información que pueda identificarte personalmente.
            </p>
          </div>
        </section>

        <section className="legal-section" id="cambios">
          <h2 className="legal-section-title">
            <span className="legal-section-number">11</span>
            Cambios a esta Política de Privacidad
          </h2>
          <p>
            Podemos actualizar nuestra Política de Privacidad de vez en cuando. Te notificaremos cualquier cambio
            publicando la nueva Política en esta página y actualizando la fecha de &quot;Última actualización&quot; en la
            parte superior.
          </p>
          <p>
            Te aconsejamos que revises esta Política periódicamente. Los cambios son efectivos cuando se publican
            en esta página.
          </p>
        </section>

        <section className="legal-section" id="contacto-privacidad">
          <h2 className="legal-section-title">
            <span className="legal-section-number">12</span>
            Contacto
          </h2>
          <p>Si tenés alguna pregunta sobre esta Política de Privacidad, podés contactarnos:</p>
          <a href="mailto:vitalia.selfcare@gmail.com?subject=Consulta%20-%20Política%20de%20Privacidad" className="legal-contact-btn">
            <i className="fa-solid fa-envelope"></i>
            vitalia.selfcare@gmail.com
          </a>
        </section>

        <div className="legal-also">
          <p>También te puede interesar</p>
          <Link href="/terminos" className="legal-also-link">
            <i className="fa-solid fa-file-contract"></i>
            Términos y Condiciones
            <i className="fa-solid fa-arrow-right"></i>
          </Link>
        </div>
      </article>
    </main>
  );
}
