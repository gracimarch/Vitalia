// — Referencias DOM —
const mostrarBtn       = document.getElementById('mostrar-btn');
const routineContent   = document.getElementById('routine-content');
const videoEl          = routineContent.querySelector('video');
const titleEl          = routineContent.querySelector('.exercise-title');
const descEl           = routineContent.querySelector('.text-desc');
const countdownCircle  = document.querySelector('.countdown-circle');
const countdownText    = document.getElementById('countdown');
const pauseButton      = document.getElementById('pauseButton');

// — Variables globales para control de temporizador y segmentos —
let countdownInterval;
let isRunning          = false;
let currentIndex       = 0;
let isRest             = false;
let segmentDuration    = 0;
let onSegmentComplete  = null;
const circumference    = 2 * Math.PI * 45;

// — Lista de ejercicios con descripciones detalladas —
const exercises = [
  {
    title: 'Marcha en el lugar',
    description: 'Párate con espalda recta, mirada al frente y eleva las rodillas a la altura de la cadera, moviendo los brazos al compás.',
    videoSrc:    'https://videos.pexels.com/video-files/10042798/10042798-hd_1920_1080_24fps.mp4',
    duration:    30,
    rest:        15
  },
  {
    title: 'Sentadillas',
    description: 'Coloca los pies al ancho de hombros, flexiona rodillas y caderas como si te sentaras, mantén la espalda recta y empuja con los talones.',
    videoSrc:    'https://videos.pexels.com/video-files/12345678/sample-squat.mp4',
    duration:    30,
    rest:        15
  },
  {
    title: 'Flexiones modificadas',
    description: 'Manos al ancho de hombros y rodillas apoyadas, baja el pecho manteniendo los codos cerca del cuerpo y vuelve a subir sin bloquear los codos.',
    videoSrc:    'https://videos.pexels.com/video-files/23456789/sample-pushup.mp4',
    duration:    20,
    rest:        10
  },
  // … pueden agregarse más ejercicios …
];

// — Evento para iniciar la rutina —
mostrarBtn.addEventListener('click', () => {
  mostrarBtn.style.display = 'none';
  routineContent.classList.remove('no-mostrar');
  routineContent.classList.add('visible');
  runSegment();
});

// — Función que alterna entre ejercicio y descanso —
function runSegment() {
  clearInterval(countdownInterval);

  // Animación de salida
  [videoEl, titleEl, descEl, countdownText].forEach(el => {
    el.classList.remove('fade-in');
    el.classList.add('fade-out');
  });

  setTimeout(() => {
    // Fase de ejercicio
    if (!isRest && currentIndex < exercises.length) {
      const { title, description, videoSrc, duration } = exercises[currentIndex];
      titleEl.textContent = title;
      descEl.textContent  = description;
      videoEl.src         = videoSrc;
      videoEl.loop        = true;
      videoEl.style.display = 'block';
      videoEl.play();

      startCountdown(duration, () => {
        isRest = true;
        videoEl.pause();
        runSegment();
      });

    // Fase de descanso
    } else if (isRest) {
      const restTime = exercises[currentIndex].rest;
      titleEl.textContent = 'Descanso';
      descEl.textContent  = `Recupérate durante ${restTime} segundos.`;

      // Ocultar video y centrar mensaje
      videoEl.classList.add('fade-out');
      setTimeout(() => {
        videoEl.style.display = 'none';
      }, 400);

      startCountdown(restTime, () => {
        isRest = false;
        currentIndex++;
        if (currentIndex < exercises.length) {
          runSegment();
        } else {
          finishRoutine();
        }
      });
    }

    // Animación de entrada
    [videoEl, titleEl, descEl, countdownText].forEach(el => {
      el.classList.remove('fade-out');
      el.classList.add('fade-in');
    });
  }, 450);
}

// — Inicia el temporizador circular y guarda el callback —
function startCountdown(seconds, onComplete) {
  segmentDuration   = seconds;
  onSegmentComplete = onComplete;
  let timeLeft      = seconds;
  isRunning         = true;

  // Reinicio de animación SVG
  countdownCircle.style.animation = 'none';
  countdownCircle.getBoundingClientRect();
  countdownCircle.style.animation = `moveGradient ${seconds}s linear`;
  countdownCircle.style.strokeDasharray = `${circumference} ${circumference}`;
  updateCountdown(timeLeft, seconds);

  countdownInterval = setInterval(() => {
    timeLeft--;
    updateCountdown(timeLeft, seconds);
    if (timeLeft < 0) {
      clearInterval(countdownInterval);
      isRunning = false;
      onSegmentComplete();
    }
  }, 1000);

  pauseButton.textContent = 'Pausar';
}

// — Detiene el temporizador y reinicia el círculo —
function stopCountdown() {
  clearInterval(countdownInterval);
  isRunning = false;
  countdownCircle.style.animation = 'none';
  countdownCircle.style.strokeDashoffset = circumference;
  pauseButton.textContent = 'Reanudar';
}

// — Actualiza el texto y el progreso del círculo —
function updateCountdown(timeLeft, duration) {
  const m = Math.floor(timeLeft / 60).toString().padStart(2, '0');
  const s = (timeLeft % 60).toString().padStart(2, '0');
  countdownText.textContent = `${m}:${s}`;
  const progress = (duration - timeLeft) / duration;
  countdownCircle.style.strokeDashoffset = circumference * (1 - progress);
}

// — Pausar o reanudar tanto el temporizador como el video —
pauseButton.addEventListener('click', () => {
  if (isRunning) {
    stopCountdown();
    videoEl.pause();
  } else {
    // Calcula tiempo restante a partir del texto
    const [mm, ss] = countdownText.textContent.split(':').map(Number);
    const timeLeft = mm * 60 + ss;
    startCountdown(timeLeft, onSegmentComplete);
    videoEl.play();
  }
});

// — Mensaje final al terminar toda la rutina —
function finishRoutine() {
  titleEl.textContent = 'Rutina completada';
  descEl.textContent  = 'Buen trabajo. Estira y toma un vaso de agua.';
  countdownText.textContent = '';
  videoEl.style.display = 'none';
}
