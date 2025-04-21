// Mostrar contenido de la rutina

document.getElementById('mostrar-btn').addEventListener('click', function () {
  const elementos = document.querySelectorAll('#routine-content');

  elementos.forEach(el => {
    el.classList.remove('no-mostrar');
    void el.offsetWidth; 
    el.classList.add('visible'); 
  });

  this.style.display = 'none';
});

// routinescript.js

document.addEventListener('DOMContentLoaded', () => {
  const startBtn = document.getElementById('mostrar-btn');
  const routineContent = document.getElementById('routine-content');
  const videoEl = routineContent.querySelector('video');
  const titleEl = routineContent.querySelector('.exercise-title');
  const descEl = routineContent.querySelector('.text-desc');
  const countdownEl = document.getElementById('countdown');

  // 1) Define tu lista de ejercicios (ajusta títulos, src, descripción, tiempos)
  const exercises = [
    {
      title: 'Marcha en el lugar',
      description: 'Activa tu sistema cardiovascular marchando en el sitio.',
      videoSrc: 'https://videos.pexels.com/video-files/10042798/10042798-hd_1920_1080_24fps.mp4',
      duration: 30,  // segundos de ejercicio
      rest: 15       // segundos de descanso
    },
    {
      title: 'Sentadillas',
      description: 'Fortalece piernas y glúteos con sentadillas controladas.',
      videoSrc: 'https://videos.pexels.com/video-files/12345678/sample-squat.mp4',
      duration: 30,
      rest: 15
    },
    {
      title: 'Flexiones modificadas',
      description: 'Trabaja pecho y tríceps apoyando rodillas.',
      videoSrc: 'https://videos.pexels.com/video-files/23456789/sample-pushup.mp4',
      duration: 20,
      rest: 10
    },
    // Añade más ejercicios según necesites...
  ];

  let currentIndex = 0;
  let isRest = false;
  let timerInterval = null;

  startBtn.addEventListener('click', () => {
    // Mostrar la sección de rutina
    startBtn.style.display = 'none';
    routineContent.classList.remove('no-mostrar');
    routineContent.classList.add('visible');
    // Iniciar la primera actividad
    runSegment();
  });

  function runSegment() {
    clearInterval(timerInterval);
    const { title, description, videoSrc, duration, rest } = exercises[currentIndex];
    if (!isRest) {
      // --- Fase de ejercicio ---
      titleEl.textContent = title;
      descEl.textContent = description;
      videoEl.src = videoSrc;
      videoEl.play();
      startTimer(duration, () => {
        // Al terminar ejercicio, pasar a descanso
        isRest = true;
        videoEl.pause();
        runSegment();
      });
    } else {
      // --- Fase de descanso ---
      titleEl.textContent = '¡Descanso!';
      descEl.textContent = `Recupérate durante ${rest} segundos.`;
      videoEl.pause();
      startTimer(rest, () => {
        // Al terminar descanso, siguiente ejercicio
        isRest = false;
        currentIndex++;
        if (currentIndex < exercises.length) {
          runSegment();
        } else {
          finishRoutine();
        }
      });
    }
  }

  function startTimer(seconds, onComplete) {
    let timeLeft = seconds;
    updateCountdown(timeLeft);
    // Limpia cualquier intervalo previo
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
      timeLeft--;
      updateCountdown(timeLeft);
      if (timeLeft <= 0) {
        clearInterval(timerInterval);
        onComplete();
      }
    }, 1000);
  }

  function updateCountdown(sec) {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    countdownEl.textContent = `${m}:${s}`;
  }

  function finishRoutine() {
    titleEl.textContent = '¡Rutina completada!';
    descEl.textContent = 'Buen trabajo. Tómate un momento para estirar y hidratarte.';
    countdownEl.textContent = '';
    videoEl.src = '';
  }
});
