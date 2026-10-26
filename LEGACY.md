# Vitalia Legacy — Versión HTML/CSS

> **Snapshot del commit `b8151fd` (`vitalia-pfse6i8yr`)**  
> Última versión estática pura de Vitalia (HTML, CSS y Vanilla JS) antes de la migración completa a Next.js App Router.

---

## 🚀 Cómo iniciar el servidor local

Desde esta carpeta (`Vitalia-legacy`):

```bash
# Iniciar en puerto por defecto (8080)
./start.sh

# O en un puerto personalizado
./start.sh 3000
```

Luego abre en tu navegador:  
👉 **[http://localhost:8080](http://localhost:8080)**

---

## 🌐 URLs y Navegación soportada

El servidor local (`server.py`) reproduce las reglas de reescritura de `vercel.json`, permitiendo URLs limpias idénticas a producción:

| Sección | URL limpia | Archivo servido |
|---|---|---|
| **Inicio** | `http://localhost:8080/` | `index.html` |
| **Blog** | `http://localhost:8080/blog` | `pages/blog.html` |
| **Mi Espacio** | `http://localhost:8080/mi-espacio` | `pages/mi-espacio.html` |
| **Crear Cuenta** | `http://localhost:8080/crear-cuenta` | `pages/form.html` |
| **Iniciar Sesión** | `http://localhost:8080/iniciar-sesion` | `pages/login.html` |
| **Perfil** | `http://localhost:8080/perfil` | `pages/perfil.html` |
| **Página 404** | `http://localhost:8080/404.html` (o cualquier ruta desconocida) | `404.html` |

### 📖 Recursos enlazados en el Blog

El Blog ahora integra todos los recursos interactivos de Vitalia:
1. **Actividad Física y Rutinas**: Artículos y las 10 rutinas de ejercicio interactivas (ej. `/rutinas/cuerpo-completo-en-casa`, `/rutinas/entrenamiento-en-15-minutos`).
2. **Hábitos y Planes Alimenticios**: Artículos de nutrición y los 12 planes de dieta (ej. `/dietas/energia-y-vitalidad`, `/dietas/aliviar-la-ansiedad-en-dias-estresantes`).
3. **Buscador global**: Permite filtrar artículos, dietas y rutinas desde el campo de búsqueda del Blog.

---

## 🛠️ Ajustes locales implementados

1. **`server.py`**: Servidor multihilo en Python que reproduce las reescrituras de Vercel y responde con el `404.html` propio de Vitalia ante rutas no encontradas.
2. **`features/blog/blog.js`**: Integración de `lecturas.json`, `dietas.json` y `rutina.json` en las tarjetas dinámicas del blog y en el buscador con soporte para paginación progresiva ("Ver más").
3. **`dev/local-nav.js`**: Normalizador de enlaces en cliente, soporte para inyecciones dinámicas e interceptor de navegación programática (`window.location.href`).
4. **`features/auth/auth-state.js`**: Bypass de autenticación activo en `localhost` para permitir explorar libremente **Mi Espacio** y el dashboard sin requerir login en Firebase.
5. **`assets/shared/js/core/load-components.js`**: Carga dinámica de header y footer con resolución automática de rutas.

---

## 📦 Contenido incluido

- **14 lecturas / artículos** (`assets/data/lecturas.json`)
- **12 planes de dieta** (`assets/data/dietas.json`)
- **10 rutinas de ejercicio** (`assets/data/rutina.json` y `assets/data/ejercicios.json`)
- Todos los assets estáticos (imágenes webp/svg, fuentes, estilos, audios de meditaciones guiadas).
