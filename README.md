<div align="center">

# 💜 Vitalia

### Tu plataforma integral de bienestar físico y mental, impulsada por IA.

<br />

[![Deployed on Vercel](https://img.shields.io/badge/Deploy-Vercel-black?logo=vercel&logoColor=white)](https://vitalia-selfcare.vercel.app/)
[![Made with JS](https://img.shields.io/badge/Stack-HTML%20%7C%20CSS%20%7C%20JS%20%7C%20React-purple)](#-tecnologías-utilizadas)
[![Firebase Auth](https://img.shields.io/badge/Auth-Firebase-orange?logo=firebase&logoColor=white)](#-tecnologías-utilizadas)
[![License](https://img.shields.io/badge/Licencia-Propietaria-334155)](#-licencia)

<br />

<img src="assets/images/ui/og-vitalia.jpg" alt="Vista previa de Vitalia" width="800" style="border-radius: 12px; box-shadow: 0px 4px 16px rgba(0,0,0,0.12);" />

<br />

🔗 **[vitalia-selfcare.vercel.app](https://vitalia-selfcare.vercel.app/)**

</div>

<br />

## 📖 Descripción

**Vitalia** es una plataforma web de bienestar integral que combina salud física, mental y nutricional en un solo lugar. A través de un formulario de registro detallado, Vitalia recopila información sobre el estilo de vida, nivel de actividad física, dieta, calidad de sueño y objetivos de bienestar del usuario. Con estos datos, un **backend con IA** genera recomendaciones personalizadas de artículos, rutinas de ejercicio y planes alimenticios.

El resultado es un espacio privado ("Mi Espacio") donde cada usuario recibe contenido curado y relevante para sus necesidades específicas.

<br />

## 🎯 Problema que resuelve

Muchas personas quieren mejorar su bienestar pero se pierden entre la enorme cantidad de información genérica disponible en internet. Vitalia resuelve esto al:

- **Centralizar** recursos de bienestar físico, mental y nutricional en un solo lugar.
- **Personalizar** las recomendaciones según el perfil real de cada usuario, usando inteligencia artificial.
- **Simplificar** el acceso a rutinas guiadas, planes alimenticios completos y artículos especializados.
- **Incluir** contenido accesible, con rutinas adaptadas para personas con movilidad reducida y personas en silla de ruedas.

**Usuarios objetivo:** cualquier persona interesada en mejorar su calidad de vida de forma integral — desde quienes buscan iniciar hábitos saludables hasta quienes necesitan planes adaptados a condiciones específicas.

<br />

## ✨ Características principales

### 🔐 Autenticación y perfil de usuario
- Registro con formulario detallado de bienestar (actividad física, dieta, estrés, sueño, objetivos, etc.)
- Inicio de sesión con email y contraseña (Firebase Authentication)
- Perfil de usuario con resumen de datos personales y de bienestar
- Rutas protegidas: "Mi Espacio" y "Perfil" solo accesibles con sesión activa
- Modal intersticial cuando un usuario no logueado intenta acceder a contenido protegido

### 🤖 Recomendaciones personalizadas con IA
- Al registrarse, se envían los datos del usuario a una API externa (`vitalia-core-api` en Render)
- La API genera un "score" con recomendaciones de artículos, rutinas y planes alimenticios
- Las recomendaciones se almacenan en Firestore y se muestran dinámicamente en "Mi Espacio"
- Botón para regenerar recomendaciones con feedback visual del proceso

### 📚 Blog de contenido
- Biblioteca de artículos organizados en cuatro categorías: Productividad, Salud Mental, Hábitos Alimenticios y Actividad Física
- Sistema de búsqueda en tiempo real con debounce y normalización de acentos
- Carga progresiva de artículos ("Ver más" / "Ver menos")
- Cada artículo se renderiza desde un catálogo JSON estático

### 🏋️ Rutinas de ejercicio interactivas
- Visor de rutinas con **máquina de estados** completa: vista previa → calentamiento → ejercicio → descanso → finalización
- Temporizador con barra de progreso animada y cuenta regresiva
- Videos demostrativos integrados para cada ejercicio
- **Guía por voz** (Text-to-Speech) con selección inteligente de voces en español
- **Ejercicio de respiración cuadrada** con animación SVG interactiva y guía vocal integrada
- Soporte de pausa, anterior/siguiente y saltar ejercicios
- Frases motivacionales aleatorias durante los descansos
- Rutinas inclusivas: "Movilidad y fuerza en silla" y "Fuerza silla de ruedas"

### 🍽️ Planes alimenticios
- Catálogo de dietas con recetas detalladas cargadas desde JSON
- Variedad de planes: vegetarianos, sin lácteos, energéticos, para ansiedad, para días ocupados, etc.
- Renderizado dinámico con sistema de loaders

### 🧘 Meditaciones guiadas
- 8 audios de meditación originales integrados en "Mi Espacio"
- Reproductor de audio personalizado con barra de progreso interactiva (drag & scrub)
- Control de reproducción: un solo audio a la vez, con indicador de estado

### 💬 Chat de soporte
- Chatbot integrado vía Smartsupp en todas las páginas excepto la landing

### 🎨 Experiencia visual y UX
- Hero con efecto **líquido WebGL** (Three.js + custom shaders GLSL) interactivo
- Componentes React renderizados en cliente: Magic Bento, FAQ dinámicas, tarjetas de precios, texto con gradiente animado
- Animaciones de scroll (GSAP), iconos magnéticos, partículas flotantes
- Saludo contextual dinámico (Buenos días / Buenas tardes / Buenas noches)
- Frase diaria de bienestar con botones para compartir en LinkedIn, Twitter y WhatsApp
- Pantalla de carga con logo animado
- Header sticky con auto-hide al hacer scroll
- Diseño responsive completo con panel móvil (drawer) dedicado
- Página 404 personalizada con iconos magnéticos flotantes

### ⚙️ SEO y rendimiento
- Sitemap XML completo, robots.txt configurado
- Structured Data (JSON-LD) en landing y páginas de contenido
- Meta tags Open Graph y Twitter Cards en todas las páginas
- URLs limpias con rewrites (Vercel + serve.json para desarrollo local)
- Cache headers optimizados por tipo de recurso
- Vercel Analytics y Speed Insights integrados

<br />

## 🛠️ Tecnologías utilizadas

| Capa | Tecnología |
|------|-----------|
| **Estructura** | HTML5 semántico |
| **Estilos** | CSS3 (CSS Variables, Grid, Flexbox, animaciones) |
| **Lógica** | JavaScript ES6+ (módulos nativos) |
| **Componentes UI** | React 18 + Babel (transpilación en cliente) |
| **Animaciones** | GSAP 3, Framer Motion 10 |
| **3D / WebGL** | Three.js r128 (shaders GLSL personalizados) |
| **Autenticación** | Firebase Authentication |
| **Base de datos** | Cloud Firestore |
| **Backend IA** | API externa en Render (`vitalia-core-api`) |
| **Chatbot** | Smartsupp |
| **Iconografía** | Font Awesome 6 |
| **Tipografía** | Google Fonts (Poppins + Zilla Slab) |
| **Notificaciones** | Toastify.js |
| **Deploy** | Vercel |
| **Analítica** | Vercel Analytics + Speed Insights |

<br />

## 🚀 Instalación y ejecución local

### Prerrequisitos

- [Node.js](https://nodejs.org/) (v16 o superior)
- Un navegador moderno (Chrome, Edge, Firefox)

### Pasos

```bash
# 1. Clonar el repositorio
git clone https://github.com/gracimarch/Vitalia.git
cd Vitalia

# 2. Instalar dependencias
npm install

# 3. Servir localmente con URLs limpias
npx serve .
```

> El archivo `serve.json` ya está configurado con los rewrites necesarios para que las URLs limpias (`/blog`, `/mi-espacio`, `/lecturas/:slug`, etc.) funcionen en desarrollo local igual que en producción.

La aplicación estará disponible en `http://localhost:3000`.

### Variables de entorno

La configuración de Firebase está incluida directamente en el código fuente (`firebase.js`). Para un entorno de producción propio, se recomienda externalizar estas credenciales en variables de entorno.

<br />

## 📁 Estructura del proyecto

```
Vitalia/
├── index.html                  # Landing page principal
├── 404.html                    # Página de error personalizada
├── pages/                      # Páginas HTML
│   ├── blog.html               # Blog con artículos categorizados
│   ├── mi-espacio.html         # Dashboard privado del usuario
│   ├── perfil.html             # Perfil del usuario
│   ├── login.html              # Inicio de sesión
│   ├── form.html               # Formulario de registro (crear cuenta)
│   ├── lectura.html            # Template dinámico para artículos
│   ├── dieta.html              # Template dinámico para planes alimenticios
│   └── rutina.html             # Template dinámico para rutinas de ejercicio
├── assets/
│   ├── css/
│   │   ├── core/               # Variables, layout, utilidades, estilos comunes
│   │   ├── pages/              # Estilos por página
│   │   ├── components/         # Estilos de componentes React (Bento, Gradient, etc.)
│   │   └── vendor/             # Estilos de terceros (Toastify)
│   ├── js/
│   │   ├── auth/               # Firebase config, auth-state, login
│   │   ├── core/               # Router, loader, chatbot, main
│   │   ├── components/         # Componentes React (FAQ, Bento, pricing, audio player)
│   │   ├── effects/            # Efectos visuales (liquid WebGL, partículas, scroll, magnetic)
│   │   ├── loaders/            # Loaders dinámicos para dietas y lecturas
│   │   ├── pages/              # Lógica específica por página
│   │   └── utils/              # Servicios auxiliares (voz TTS, artículos recomendados)
│   ├── data/                   # Catálogos JSON (lecturas, dietas, rutinas, ejercicios, recetas)
│   ├── audios/meditaciones/    # Audios originales de meditación guiada
│   ├── images/                 # Imágenes organizadas por categoría
│   ├── partials/               # Header y footer reutilizables (carga dinámica)
│   ├── favicons/               # Iconos de la app
│   └── legal/                  # Política de privacidad y términos (PDFs)
├── dev/                        # Herramientas de debug
├── vercel.json                 # Configuración de deploy (rewrites + cache headers)
├── serve.json                  # Configuración de desarrollo local (rewrites)
├── sitemap.xml                 # Mapa del sitio para SEO
├── robots.txt                  # Directivas para crawlers
└── package.json                # Dependencia: @vercel/speed-insights
```

<br />

## 📊 Estado actual del proyecto

El proyecto está en **producción activa** y es accesible públicamente en [vitalia-selfcare.vercel.app](https://vitalia-selfcare.vercel.app/).

### ✅ Implementado y funcional
- Landing page completa con hero WebGL, FAQ, planes de precios y Magic Bento
- Sistema de autenticación completo (registro, login, logout, recuperación de contraseña, rutas protegidas)
- Formulario de registro con validación y 10+ campos de bienestar
- Dashboard "Mi Espacio" con recomendaciones personalizadas por IA
- Blog con búsqueda, filtros por categoría y carga progresiva
- Visor de rutinas interactivo con temporizador, voz guiada y respiración cuadrada
- Reproductor de meditaciones con 8 audios originales
- Planes alimenticios con recetas completas
- Perfil de usuario con datos de Firestore
- Página 404 personalizada
- SEO completo (sitemap, structured data, meta tags)
- Responsive design completo (desktop + mobile)

### 🚧 En progreso / pendiente
- **Plan premium** — la detección de usuario premium (`detectPremium`) siempre retorna `false`; la integración real con Firestore/custom claims está como TODO en el código
- **Integración de pagos** — los planes de suscripción se muestran en la UI pero no hay pasarela de pago conectada

<br />

## 🗺️ Próximas mejoras / Roadmap

- [ ] **Edición de perfil** — permitir al usuario actualizar sus datos y regenerar recomendaciones
- [ ] **Meditaciones personalizadas** — actualmente son estáticas; podrían vincularse al score de IA del usuario
- [ ] **PWA** — agregar Service Worker y manifest para experiencia offline
- [ ] **Sistema premium real** — conectar la detección de plan premium con Firestore o Firebase Custom Claims
- [ ] **Integración de pagos** — conectar los planes de suscripción con un procesador de pagos (Stripe, MercadoPago, etc.)
- [ ] **Externalizar credenciales de Firebase** — mover la configuración a variables de entorno

<br />

## 👥 Contacto

- 💌 **Email:** [vitalia.selfcare@gmail.com](mailto:vitalia.selfcare@gmail.com)
- 📸 **Instagram:** [@vitalia.web](https://www.instagram.com/vitalia.web/)

### Repositorios del proyecto

| Repositorio | Descripción | Stack |
|---|---|---|
| **Vitalia** (este repo) | Frontend web | HTML, CSS, JS, React |
| [vitalia-core-api](https://github.com/jossmarsala/vitalia-core-api) | Backend & lógica de recomendaciones IA | Python, FastAPI, Firebase |

<br />

## 📄 Licencia

Este proyecto es **propietario** — todos los derechos reservados © 2026 Graciana March & Josefina Marsala.

No está permitida su reproducción, distribución ni modificación sin autorización expresa de las autoras. Ver [LICENSE](./LICENSE) para más detalles.

Se incluyen documentos legales adicionales en `assets/legal/`:
- Política de privacidad
- Términos y condiciones

<br />

---

<div align="center">
  <i>Construyendo mejores mañanas 💜</i>
</div>
