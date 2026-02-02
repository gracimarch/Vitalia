
const mostrarBtn = document.getElementById('mostrar-btn');
const routineContent = document.getElementById('routine-content');
const videoEl = routineContent.querySelector('video');
const titleEl = routineContent.querySelector('.exercise-title');
const descEl = routineContent.querySelector('.text-desc');
const countdownCircle = document.querySelector('.countdown-circle');
const countdownText = document.getElementById('countdown');
const pauseButton = document.getElementById('pauseButton');

let animationFrameId;
let isRunning = false;
let currentIndex = 0;
let isRest = false;
let remainingTimeMs = 0;
let totalDurationMs = 0;
let endTime = 0;
let onSegmentComplete = null;
let firstRun = true;
const circumference = 2 * Math.PI * 45;

if (countdownCircle) {
  countdownCircle.style.strokeDasharray = `${circumference}`;
  countdownCircle.style.strokeDashoffset = `${circumference}`;
}

// — Lista de ejercicios con descripciones detalladas —
let exercises = [];

// — Función para cargar rutina desde JSON —
async function loadRoutine() {
  try {
    const path = window.location.pathname;
    let slug = '';

    // Check for clean URL: /rutinas/slug
    if (path.includes('/rutinas/')) {
      const parts = path.split('/rutinas/');
      if (parts.length > 1 && parts[1]) {
        slug = parts[1].replace('.html', '').replace('/', '');
      }
    }

    if (!slug) {
      console.log("No routine slug found.");
      return;
    }

    // Absolute path
    const jsonPath = '/data/rutinas.json';

    const response = await fetch(jsonPath);
    if (!response.ok) throw new Error('No se pudo cargar rutinas.json');

    const data = await response.json();
    const routine = data.rutinas.find(r => r.slug === slug);

    if (!routine) {
      console.error('Rutina no encontrada:', slug);
      return;
    }

    // Renderizar contenido estático de la rutina
    renderRoutineStaticContent(routine);

    // Asignar ejercicios
    exercises = routine.exercises;

  } catch (error) {
    console.error('Error cargando rutina:', error);
  }
}

function renderRoutineStaticContent(routine) {
  const getPath = (path) => {
    if (path.startsWith('http')) return path;
    return path.startsWith('/') ? path : '/' + path;
  };

  // Título y meta
  document.title = routine.title;
  const titleContainer = document.querySelector('.title');
  if (titleContainer) {
    titleContainer.innerHTML = `
            <h3>${routine.level}</h3>
            <h1>${routine.title}</h1>
            <div class="reading-time">
                <i class="bi bi-clock" alt="Ícono de reloj"></i>
                <p>${routine.duration}</p>
            </div>
        `;
  }

  // Intro
  const intro = document.getElementById('introduction');
  if (intro) intro.innerHTML = routine.introduction;

  // Imagen principal
  const imageContainer = document.querySelector('.image');
  if (imageContainer) {
    imageContainer.innerHTML = `<img src="${getPath(routine.image)}" alt="${routine.title}">`;
  }

  // Preparación
  const instructions = document.getElementById('instrucciones');
  if (instructions) instructions.innerHTML = routine.preparation;

  // Conclusión
  const articles = document.querySelectorAll('.article');
  const lastArticle = articles[articles.length - 1]; // Assuming it's the last one as per original script logic
  if (lastArticle && lastArticle.id !== 'instrucciones' && lastArticle.id !== 'introduction') {
    lastArticle.innerHTML = routine.conclusion;
  }

  // Disparar evento para animaciones
  document.dispatchEvent(new Event('article-content-loaded'));
}


// — Iniciar rutina al presionar “Comenzar rutina” —
if (mostrarBtn) {
  mostrarBtn.addEventListener('click', () => {
    mostrarBtn.style.display = 'none';

    if (routineContent) {
      routineContent.classList.remove('no-mostrar');
      routineContent.classList.add('visible');
    }
    runSegment();
  });
}

// — Alterna entre ejercicio y descanso —
function runSegment() {
  if (animationFrameId) cancelAnimationFrame(animationFrameId);

  // Solo animamos fade-out para ejecuciones posteriores
  if (!firstRun) {
    [videoEl, titleEl, descEl].forEach(el => {
      if (el) {
        el.classList.remove('fade-in');
        el.classList.add('fade-out');
      }
    });
  }

  setTimeout(() => {
    // Quitamos estados previos
    if (routineContent) routineContent.classList.remove('rest', 'finish');
    if (videoEl) videoEl.classList.remove('fade-out');

    if (!isRest && currentIndex < exercises.length) {
      // --- Fase de ejercicio ---
      const { title, description, videoSrc, duration } = exercises[currentIndex];
      if (titleEl) titleEl.textContent = title;
      if (descEl) descEl.textContent = description;
      if (videoEl) {
        videoEl.src = videoSrc;
        videoEl.loop = true;
        videoEl.style.display = 'block';
        videoEl.play();
      }

      startCountdown(duration, duration, () => {
        isRest = true;
        if (videoEl) videoEl.pause();
        runSegment();
      });

    } else if (isRest) {
      // --- Fase de descanso ---
      const restTime = exercises[currentIndex].rest;
      if (titleEl) titleEl.textContent = 'Descanso';
      if (descEl) descEl.textContent = `Recupérate durante ${restTime} segundos.`;

      // Mantenemos margen aunque ocultemos el video
      if (routineContent) routineContent.classList.add('rest');
      if (videoEl) {
        videoEl.classList.add('fade-out');
        setTimeout(() => {
          videoEl.style.display = 'none';
        }, 400);
      }

      startCountdown(restTime, restTime, () => {
        isRest = false;
        currentIndex++;
        if (currentIndex < exercises.length) {
          runSegment();
        } else {
          finishRoutine();
        }
      });
    }

    if (!firstRun) {
      [videoEl, titleEl, descEl].forEach(el => {
        if (el) {
          el.classList.remove('fade-out');
          el.classList.add('fade-in');
        }
      });
    }
    firstRun = false;
  }, 600);
}

// — Inicia el temporizador circular y guarda el callback —
function startCountdown(seconds, totalSeconds, onComplete) {
  totalDurationMs = totalSeconds * 1000;
  remainingTimeMs = seconds * 1000;
  onSegmentComplete = onComplete;
  isRunning = true;

  // Reinicio manual del círculo
  if (countdownCircle) countdownCircle.style.strokeDasharray = `${circumference}`;

  updateVisuals();

  if (pauseButton) pauseButton.textContent = 'Pausar';
  startTimerLoop();
}

function startTimerLoop() {
  const now = performance.now();
  endTime = now + remainingTimeMs;

  tick();
}

function tick() {
  if (!isRunning) return;

  const now = performance.now();
  remainingTimeMs = endTime - now;

  if (remainingTimeMs <= 0) {
    remainingTimeMs = 0;
    updateVisuals();
    isRunning = false;
    cancelAnimationFrame(animationFrameId);
    if (onSegmentComplete) onSegmentComplete();
  } else {
    updateVisuals();
    animationFrameId = requestAnimationFrame(tick);
  }
}

// — Detiene el temporizador sin resetear el círculo —
function stopCountdown() {
  cancelAnimationFrame(animationFrameId);
  isRunning = false;
  if (pauseButton) pauseButton.textContent = 'Reanudar';
  if (videoEl) videoEl.pause();
}

// — Actualiza el texto y el progreso del círculo —
function updateVisuals() {
  // Texto (techos para evitar que 0.9s se vea como 0s)
  const totalSecondsCeil = Math.ceil(remainingTimeMs / 1000);
  const m = Math.floor(totalSecondsCeil / 60).toString().padStart(2, '0');
  const s = (totalSecondsCeil % 60).toString().padStart(2, '0');
  if (countdownText) countdownText.textContent = `${m}:${s}`;

  // Círculo (Progreso fluido)
  const progress = Math.max(0, remainingTimeMs / totalDurationMs);
  if (countdownCircle) countdownCircle.style.strokeDashoffset = circumference * (1 - progress);
}

// — Pausar o reanudar temporizador y video —
if (pauseButton) {
  pauseButton.addEventListener('click', () => {
    if (isRunning) {
      stopCountdown();
    } else {
      // Reanudar
      isRunning = true;
      pauseButton.textContent = 'Pausar';
      if (!isRest && videoEl) {
        videoEl.play();
      }
      startTimerLoop();
    }
  });
}

// — Final de la rutina —
function finishRoutine() {
  if (routineContent) routineContent.classList.add('finish');
  if (titleEl) titleEl.textContent = 'Rutina completada';
  if (descEl) descEl.textContent = 'Buen trabajo. Estira y toma un vaso de agua.';
  // Ocultar temporizador
  const timerContent = document.getElementById('timer-content');
  if (timerContent) timerContent.style.display = 'none';
  if (videoEl) videoEl.style.display = 'none';
}

// Iniciar carga
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadRoutine);
} else {
  loadRoutine();
}
