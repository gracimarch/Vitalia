<div align="center">

# 💜 Vitalia

### Tu plataforma integral de bienestar físico y mental, con recomendaciones personalizadas.

<br />

[![Deployed on Vercel](https://img.shields.io/badge/Deploy-Vercel-black?logo=vercel&logoColor=white)](https://vitalia-selfcare.vercel.app/)
[![Made with Next.js](https://img.shields.io/badge/Stack-Next.js%20%7C%20React%20%7C%20CSS-purple)](#-tecnologías-utilizadas)
[![Firebase Auth](https://img.shields.io/badge/Auth-Firebase-orange?logo=firebase&logoColor=white)](#-tecnologías-utilizadas)
[![License](https://img.shields.io/badge/Licencia-Propietaria-334155)](#-licencia)

<br />

<img src="/public/assets/images/ui/og-vitalia.jpg" alt="Vista previa de Vitalia" width="800" style="border-radius: 12px; box-shadow: 0px 4px 16px rgba(0,0,0,0.12);" />

<br />

🔗 **[vitalia-selfcare.vercel.app](https://vitalia-selfcare.vercel.app/)**

</div>

<br />

## 📖 Descripción

**Vitalia** es una plataforma web de bienestar integral que combina salud física, mental y nutricional en un solo lugar. A través de un formulario de registro detallado, Vitalia recopila información sobre el estilo de vida, nivel de actividad física, dieta, calidad de sueño y objetivos de bienestar del usuario. Con estos datos, un **backend propio** genera recomendaciones personalizadas de artículos, rutinas de ejercicio y planes alimenticios.

El resultado es un espacio privado ("Mi Espacio") donde cada usuario recibe contenido curado y relevante para sus necesidades específicas.

<br />

## 🎯 Problema que resuelve

Muchas personas quieren mejorar su bienestar pero se pierden entre la enorme cantidad de información genérica disponible en internet. Vitalia resuelve esto al:

- **Centralizar** recursos de bienestar físico, mental y nutricional en un solo lugar.
- **Personalizar** las recomendaciones según el perfil real de cada usuario, basadas en su estilo de vida y objetivos.
- **Simplificar** el acceso a rutinas guiadas, planes alimenticios completos y artículos especializados.
- **Incluir** contenido accesible, con rutinas adaptadas para personas con movilidad reducida y personas en silla de ruedas.

**Usuarios objetivo:** cualquier persona interesada en mejorar su calidad de vida de forma integral — desde quienes buscan iniciar hábitos saludables hasta quienes necesitan planes adaptados a condiciones específicas.

<br />

## ✨ Características principales

### 🔐 Autenticación y perfil de usuario
- Registro con formulario detallado de bienestar (actividad física, dieta, estrés, sueño, objetivos, etc.)
- Inicio de sesión con email y contraseña (Firebase Authentication)
- Perfil de usuario con resumen de datos personales y de bienestar
- Rutas protegidas: "Mi Espacio", "Perfil", Rutinas, Dietas y Meditaciones solo accesibles con sesión activa (via `AuthGuard` client-side)

### 🎯 Recomendaciones personalizadas
- Al registrarse, se envían los datos del usuario a una API externa (`vitalia-core-api` en Render)
- La API genera un "score" con recomendaciones de artículos, rutinas y planes alimenticios
- Las recomendaciones se almacenan en Firestore y se muestran dinámicamente en "Mi Espacio"
- Botón para regenerar recomendaciones con feedback visual del proceso

### 📚 Blog de contenido
- Biblioteca de artículos organizados en cuatro categorías: Productividad, Salud Mental, Hábitos Alimenticios y Actividad Física
- Sistema de búsqueda en tiempo real con debounce y normalización de acentos
- Cada artículo se renderiza dinámicamente en App Router desde contenido local o remoto

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
- Catálogo de dietas con recetas detalladas
- Variedad de planes: vegetarianos, sin lácteos, energéticos, para ansiedad, para días ocupados, etc.
- Renderizado dinámico

### 🧘 Meditaciones guiadas
- 8 audios de meditación originales integrados en "Mi Espacio"
- Reproductor de audio personalizado con barra de progreso interactiva (drag & scrub)
- Control de reproducción: un solo audio a la vez, con indicador de estado

### 🎨 Experiencia visual y UX
- Diseño cohesivo implementado en Next.js con Server y Client Components
- Hero interactivo con efectos visuales dinámicos
- Animaciones de componentes, iconos, partículas flotantes y transiciones (Framer Motion / GSAP)
- Saludo contextual dinámico (Buenos días / Buenas tardes / Buenas noches)
- Header inteligente con auto-hide al hacer scroll y diseño responsivo
- Interfaz completamente adaptada para dispositivos móviles

### ⚙️ SEO y rendimiento
- Migrado a **Next.js App Router** para un rendimiento y SEO óptimos
- Sitemap XML autogenerado y robots.txt configurado
- URLs limpias nativas y ruteo basado en archivos
- Vercel Analytics y Speed Insights integrados
- Renderizado híbrido (SSR / SSG / CSR) asegurando una rápida carga de contenido

<br />

## 🛠️ Tecnologías utilizadas

| Capa | Tecnología |
|------|-----------|
| **Estructura/Framework** | Next.js 16 (App Router), React 19 |
| **Estilos** | Vanilla CSS (CSS Modules / CSS Variables) |
| **Lógica** | TypeScript / JavaScript ES6+ |
| **Animaciones** | Framer Motion, GSAP 3 |
| **3D / WebGL** | Three.js |
| **Autenticación** | Firebase Authentication |
| **Base de datos** | Cloud Firestore |
| **Backend** | API externa en Render (`vitalia-core-api`) |
| **Iconografía** | Font Awesome 6, SVGs integrados |
| **Tipografía** | Google Fonts (next/font) |
| **Deploy** | Vercel |
| **Analítica** | Vercel Analytics + Speed Insights |

<br />

## 🚀 Instalación y ejecución local

### Prerrequisitos

- [Node.js](https://nodejs.org/) (v18 o superior)
- Un navegador moderno

### Pasos

```bash
# 1. Clonar el repositorio
git clone https://github.com/gracimarch/Vitalia.git
cd Vitalia

# 2. Instalar dependencias
npm install

# 3. Servir localmente
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`.

### Variables de entorno

Crea un archivo `.env.local` en la raíz del proyecto para definir las credenciales de Firebase.

```env
NEXT_PUBLIC_FIREBASE_API_KEY=tu_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tu_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=tu_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tu_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=tu_app_id
```

<br />

## 📁 Estructura del proyecto

El proyecto utiliza **Next.js App Router**, organizando la estructura por dominios y características:

```
Vitalia/
├── app/                           # App Router: páginas, layouts y rutas API
│   ├── (auth)/                    # Grupo de rutas de autenticación
│   ├── blog/                      # Sistema de blog dinámico
│   ├── mi-espacio/                # Dashboard de usuario (Ruta protegida)
│   ├── rutinas/                   # Visor de rutinas
│   ├── dietas/                    # Visor de dietas
│   └── lecturas/                  # Visor de artículos y contenido
├── components/                    # Componentes React reutilizables (UI)
├── features/                      # Lógica y estilos vanilla 
├── lib/                           # Utilidades, configuración (Firebase) y helpers
├── public/                        # Activos estáticos públicos (imágenes, audios)
├── styles/                        # Sistema de diseño CSS global y variables
├── .env.local                     # Variables de entorno locales
├── next.config.ts                 # Configuración de Next.js
└── package.json                   # Dependencias y scripts
```

<br />

## 📊 Estado actual del proyecto

El proyecto fue recientemente **migrado a Next.js (App Router)** logrando paridad de funciones, mejor rendimiento, y un código mucho más mantenible.

### ✅ Implementado y funcional
- Integración completa con el App Router de Next.js
- Sistema de autenticación con Firebase (registro, login, logout, middleware de protección de rutas)
- Dashboard "Mi Espacio" con recomendaciones basadas en perfil de usuario
- Blog, Visor de rutinas interactivas, Planes alimenticios, y Meditaciones
- Componentes UI modernizados sin emojis nativos (usando iconos profesionales)
- Animaciones portadas a React, rendimiento optimizado y código limpiado de dependencias obsoletas
- SEO y URLs funcionales nativas en Next.js

### 🚧 En progreso / pendiente
- **Plan premium** — Integración real con Firestore/custom claims
- **Integración de pagos** — Conexión con un procesador de pagos para planes de suscripción

<br />

## 🗺️ Próximas mejoras / Roadmap

- [ ] **Edición de perfil** — permitir al usuario actualizar sus datos y regenerar recomendaciones
- [ ] **Meditaciones personalizadas** — vincular al perfil y score del usuario
- [ ] **PWA** — soporte progresivo
- [ ] **Protección server-side con cookies** — migrar la auth guard de client-side a Next.js Middleware usando una cookie HTTP-only propia (escrita al hacer login con Firebase y verificada en el servidor), eliminando el flash del loader en rutas protegidas y añadiendo una capa de seguridad real antes de que el HTML llegue al cliente
- [ ] **Integración de pagos / Premium real**

<br />

## 👥 Autoras

Vitalia es desarrollado y mantenido por:

| | Nombre | GitHub | LinkedIn |
|---|---|---|---|
| 🌷 | **Graciana March** | [@gracimarch](https://github.com/gracimarch) | [gracimarch](https://www.linkedin.com/in/gracimarch/) |
| 🌻 | **Josefina Marsala** | [@jossmarsala](https://github.com/jossmarsala) | [josmarsala](https://www.linkedin.com/in/josmarsala/) |

### Contacto del proyecto

- 💌 **Email:** [vitalia.selfcare@gmail.com](mailto:vitalia.selfcare@gmail.com)
- 📸 **Instagram:** [@vitalia.web](https://www.instagram.com/vitalia.web/)

### Repositorios del proyecto

| Repositorio | Descripción | Stack |
|---|---|---|
| **Vitalia** (este repo) | Frontend web | Next.js, React, TypeScript, CSS |
| [vitalia-core-api](https://github.com/jossmarsala/vitalia-core-api) | Backend & recomendaciones | Python, FastAPI, Firebase |

<br />

## 📄 Licencia

Este proyecto es **propietario** — todos los derechos reservados © 2026 Graciana March & Josefina Marsala.

No está permitida su reproducción, distribución ni modificación sin autorización expresa de las autoras. Ver [LICENSE](./LICENSE) para más detalles.

<br />

---

<div align="center">
  <i>Acompañando tu bienestar todos los días 💜</i>
</div>
