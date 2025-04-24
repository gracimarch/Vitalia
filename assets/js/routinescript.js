
const mostrarBtn       = document.getElementById('mostrar-btn');
const routineContent   = document.getElementById('routine-content');
const videoEl          = routineContent.querySelector('video');
const titleEl          = routineContent.querySelector('.exercise-title');
const descEl           = routineContent.querySelector('.text-desc');
const countdownCircle  = document.querySelector('.countdown-circle');
const countdownText    = document.getElementById('countdown');
const pauseButton      = document.getElementById('pauseButton');

let countdownInterval;
let isRunning          = false;
let currentIndex       = 0;
let isRest             = false;
let segmentDuration    = 0;
let onSegmentComplete  = null;
let firstRun           = true;                 
const circumference    = 2 * Math.PI * 45;

countdownCircle.style.strokeDasharray  = `${circumference}`;
countdownCircle.style.strokeDashoffset = `${circumference}`;

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
  // … más ejercicios …
];

// — Iniciar rutina al presionar “Comenzar rutina” —
mostrarBtn.addEventListener('click', () => {
  mostrarBtn.style.display = 'none';
  routineContent.classList.remove('no-mostrar');
  routineContent.classList.add('visible');
  runSegment();
});

// — Alterna entre ejercicio y descanso —
function runSegment() {
  clearInterval(countdownInterval);

  // Solo animamos fade-out para ejecuciones posteriores
  if (!firstRun) {
    [videoEl, titleEl, descEl].forEach(el => {
      el.classList.remove('fade-in');
      el.classList.add('fade-out');
    });
  }

  setTimeout(() => {
    // Quitamos estados previos
    routineContent.classList.remove('rest', 'finish');
    videoEl.classList.remove('fade-out');

    if (!isRest && currentIndex < exercises.length) {
      // --- Fase de ejercicio ---
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

    } else if (isRest) {
      // --- Fase de descanso ---
      const restTime = exercises[currentIndex].rest;
      titleEl.textContent = 'Descanso';
      descEl.textContent  = `Recupérate durante ${restTime} segundos.`;

      // Mantenemos margen aunque ocultemos el video
      routineContent.classList.add('rest');
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

    if (!firstRun) {
      [videoEl, titleEl, descEl].forEach(el => {
        el.classList.remove('fade-out');
        el.classList.add('fade-in');
      });
    }
    firstRun = false;
  }, 450);
}

// — Inicia el temporizador circular y guarda el callback —
function startCountdown(seconds, onComplete) {
  segmentDuration   = seconds;
  onSegmentComplete = onComplete;
  let timeLeft      = seconds;
  isRunning         = true;

  // Reinicio manual del círculo
  countdownCircle.style.strokeDasharray  = `${circumference}`;
  countdownCircle.style.strokeDashoffset = `${circumference}`;

  updateCountdown(timeLeft, seconds);

  countdownInterval = setInterval(() => {
    timeLeft--;
    if (timeLeft > 0) {
      updateCountdown(timeLeft, seconds);
    } else {
      // Forzar 00:00 y círculo vacío sin negativo ni giro
      updateCountdown(0, seconds);
      clearInterval(countdownInterval);
      isRunning = false;
      onSegmentComplete();
    }
  }, 1000);

  pauseButton.textContent = 'Pausar';
}

// — Detiene el temporizador sin resetear el círculo —
function stopCountdown() {
  clearInterval(countdownInterval);
  isRunning = false;
  pauseButton.textContent = 'Reanudar';
  videoEl.pause();
}

// — Actualiza el texto y el progreso del círculo —
function updateCountdown(timeLeft, duration) {
  const m = Math.floor(timeLeft / 60).toString().padStart(2, '0');
  const s = (timeLeft % 60).toString().padStart(2, '0');
  countdownText.textContent = `${m}:${s}`;

  const progress = (duration - timeLeft) / duration;
  countdownCircle.style.strokeDashoffset = circumference * (1 - progress);
}

// — Pausar o reanudar temporizador y video —
pauseButton.addEventListener('click', () => {
  if (isRunning) {
    stopCountdown();
  } else {
    const [mm, ss] = countdownText.textContent.split(':').map(Number);
    const timeLeft = mm * 60 + ss;
    startCountdown(timeLeft, onSegmentComplete);
  }
});

// — Final de la rutina —
function finishRoutine() {
  routineContent.classList.add('finish');
  titleEl.textContent = 'Rutina completada';
  descEl.textContent  = 'Buen trabajo. Estira y toma un vaso de agua.';
  // Ocultar temporizador
  document.getElementById('timer-content').style.display = 'none';
  videoEl.style.display = 'none';
}
