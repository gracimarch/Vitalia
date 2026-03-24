/**
 * Routine Controller — State Machine
 * Screens: overview → warmup → exercise ↔ rest → finish
 */

// ─── State ───
let routineData = null;
let exercises = [];
let currentIndex = 0;
let isRunning = false;
let isPaused = false;
let remainingTimeMs = 0;
let totalDurationMs = 0;
let endTime = 0;
let animationFrameId = null;
let onSegmentComplete = null;
let routineStartTime = 0;
let descTimeout = null;

// ─── DOM References (lazy, set after load) ───
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

// ─── Motivational phrases ───
const REST_PHRASES = [
  '¡Vas muy bien! Respira profundo.',
  'Excelente trabajo. Recupera el aliento.',
  '¡Sigue así! Ya falta menos.',
  'Tómate un momento. Lo estás haciendo genial.',
  'Respira… inhala… exhala…',
  '¡Increíble esfuerzo! Prepárate para lo que sigue.',
];

const EXERCISE_INTROS = [
  'Vamos con:', 'Ahora:', 'Siguiente ejercicio:', 'Continuamos con:', '¡Vamos!',
];

// ─── Warmup messages by routine type ───
function getWarmupDetail(routine) {
  if (routine.warmup_text) return routine.warmup_text;
  
  const slug = routine.slug || '';
  if (slug.includes('yoga')) return 'Cierra los ojos, respira profundo tres veces y permite que tu cuerpo se relaje.';
  if (slug.includes('hiit') || slug.includes('cardio')) return 'Activa tu core, haz algunas rotaciones de cadera y prepárate para darlo todo.';
  if (slug.includes('fuerza') || slug.includes('cuerpo-completo')) return 'Haz rotaciones de hombros y muñecas. Activa tu cuerpo con un trote suave en el lugar.';
  if (slug.includes('espalda') || slug.includes('postura')) return 'Estira los brazos y haz unas suaves rotaciones de cuello para liberar tensión.';
  return 'Respira profundo, prepara tu espacio y concéntrate en tu cuerpo.';
}

// ─── Square Breathing Module ───
const SquareBreathing = (() => {
  const TOTAL_PERIMETER = 536; // matches SVG stroke-dasharray
  const PHASE_DURATION  = 4000; // 4 s per phase
  // phases: label, voice, hint, color, perimeter consumed at end of phase
  const PHASES = [
    { label: 'INHALA',   hint: '4 segundos', voice: 'Inhala…',              stroke: '#80CACD', pct: 0.25 },
    { label: 'SOSTIENE', hint: 'retención',   voice: 'Sostiene el aire…',   stroke: '#E1947F', pct: 0.50 },
    { label: 'EXHALA',   hint: '4 segundos', voice: 'Exhala lentamente…',  stroke: '#a0d8b8', pct: 0.75 },
    { label: 'SOSTIENE', hint: 'pulmones vacíos', voice: 'Vacío… y de nuevo…', stroke: '#c4a3e0', pct: 1.00 },
  ];

  let _active  = false;
  let _raf     = null;
  let _phaseIdx = 0;
  let _cycleStart = 0;
  let _overlay, _phaseEl, _countEl, _hintEl, _progressEl;

  function _dom() {
    _overlay    = document.getElementById('sq-breath-overlay');
    _phaseEl    = document.getElementById('sq-breath-phase');
    _countEl    = document.getElementById('sq-breath-count');
    _hintEl     = document.getElementById('sq-breath-hint');
    _progressEl = document.getElementById('sq-breath-progress');
  }

  function _setPhase(idx) {
    const p = PHASES[idx];
    if (_phaseEl) _phaseEl.textContent = p.label;
    if (_hintEl)  _hintEl.textContent  = p.hint;
    if (_progressEl) _progressEl.setAttribute('stroke', p.stroke);
  }

  function _loop(now) {
    if (!_active) return;
    const elapsed = now - _cycleStart;
    const fullCycle = PHASES.length * PHASE_DURATION; // 16s
    const cycleElapsed = elapsed % fullCycle;

    const phaseIdx = Math.floor(cycleElapsed / PHASE_DURATION);
    const phaseElapsed = cycleElapsed % PHASE_DURATION;
    const phasePct = phaseElapsed / PHASE_DURATION;

    // Update phase label / color when crossing boundary
    if (phaseIdx !== _phaseIdx) {
      _phaseIdx = phaseIdx;
      _setPhase(_phaseIdx);
      // Voice cue at start of each phase
      if (typeof VoiceService !== 'undefined') {
        VoiceService.speak(PHASES[_phaseIdx].voice, true);
      }
    }

    // Countdown seconds inside phase
    const secLeft = Math.ceil((PHASE_DURATION - phaseElapsed) / 1000);
    if (_countEl) _countEl.textContent = secLeft;

    // Stroke animation — fill perimeter fraction
    if (_progressEl) {
      const prevPct = phaseIdx > 0 ? PHASES[phaseIdx - 1].pct : 0;
      const thisPct = prevPct + (PHASES[phaseIdx].pct - prevPct) * phasePct;
      const offset  = TOTAL_PERIMETER * (1 - thisPct);
      _progressEl.setAttribute('stroke-dashoffset', offset.toFixed(1));
    }

    _raf = requestAnimationFrame(_loop);
  }

  function start() {
    if (_active) return;
    _dom();
    if (!_overlay) return;
    _active = true;
    _phaseIdx = -1; // force update on first frame
    _cycleStart = performance.now();
    if (_progressEl) _progressEl.setAttribute('stroke-dashoffset', TOTAL_PERIMETER);
    _overlay.classList.add('active');
    // Speak intro
    if (typeof VoiceService !== 'undefined') {
      setTimeout(() => VoiceService.speak('Respiración cuadrada. Sigue el cuadrado con tu respiración.', true), 300);
    }
    _raf = requestAnimationFrame(_loop);
  }

  function stop() {
    _active = false;
    if (_raf) cancelAnimationFrame(_raf);
    _raf = null;
    if (_overlay) _overlay.classList.remove('active');
    if (_progressEl) _progressEl.setAttribute('stroke-dashoffset', TOTAL_PERIMETER);
  }

  return { start, stop, isActive: () => _active };
})();


// ─── Screen Manager ───
function showScreen(id) {
  $$('.screen').forEach(s => s.classList.remove('active'));
  const screen = $(id);
  if (screen) {
    screen.classList.add('active');
    // Re-trigger animation
    screen.style.animation = 'none';
    screen.offsetHeight; // force reflow
    screen.style.animation = '';
  }
}

// ─── Format time ───
function formatTime(ms) {
  const totalSec = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(totalSec / 60).toString().padStart(2, '0');
  const s = (totalSec % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function formatDuration(seconds) {
  if (seconds < 60) return `0:${seconds.toString().padStart(2, '0')}`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

// ─── Load Routine ───
async function loadRoutine() {
  try {
    let slug = '';
    if (window.VitaliaRouter) slug = window.VitaliaRouter.getSlug();
    if (!slug) { window.location.replace('/404.html'); return; }

    // Fetch both files in parallel
    const [rutRes, ejRes] = await Promise.all([
      fetch('/assets/data/rutinas.json'),
      fetch('/assets/data/ejercicios.json')
    ]);
    if (!rutRes.ok) throw new Error('No se pudo cargar rutinas.json');
    if (!ejRes.ok) throw new Error('No se pudo cargar ejercicios.json');

    const rutData = await rutRes.json();
    const ejData = await ejRes.json();

    routineData = rutData.rutinas.find(r => r.slug === slug);
    if (!routineData) { window.location.replace('/404.html'); return; }

    // Build exercise catalog: id → exercise object
    const catalog = {};
    ejData.exercises.forEach(e => catalog[e.id] = e);

    // Merge: resolve title/description/videoSrc from catalog, with routine-level overrides
    const expandedExercises = [];
    routineData.exercises.forEach(ex => {
      const sets = ex.sets || 1;
      const baseEx = {
        title: ex.title || catalog[ex.exerciseId]?.name || 'Ejercicio',
        description: ex.description || catalog[ex.exerciseId]?.desc || '',
        videoSrc: ex.videoSrc || catalog[ex.exerciseId]?.media?.url || '',
        duration: ex.duration,
        rest: ex.rest
      };
      
      console.log(`[Routine] Resolviendo ejercicio: ${ex.exerciseId}`, {
        hasCatalogInfo: !!catalog[ex.exerciseId],
        finalVideoSrc: baseEx.videoSrc
      });

      for (let i = 0; i < sets; i++) {
        const item = { ...baseEx };
        // If there are multiple sets, we append the series number for clarity
        if (sets > 1) {
          item.title = `${item.title} (Serie ${i + 1}/${sets})`;
        }
        expandedExercises.push(item);
      }
    });

    exercises = expandedExercises;

    document.title = routineData.title + ' | Vitalia';

    renderOverview();
    injectSEO();
  } catch (e) {
    console.error('Error cargando rutina:', e);
    window.location.replace('/404.html');
  }
}

// ─── Render Overview Screen ───
function renderOverview() {
  const getPath = (p) => p.startsWith('http') ? p : (p.startsWith('/') ? p : '/' + p);

  // Hero background
  const hero = $('#overview-hero');
  if (hero && routineData.image) {
    hero.style.backgroundImage = `url('${getPath(routineData.image)}')`;
  }

  // Title
  const titleEl = $('#overview-title');
  if (titleEl) titleEl.textContent = routineData.title;

  // Description
  const descEl = $('#overview-description');
  if (descEl && routineData.introduction) {
    descEl.innerHTML = routineData.introduction;
  }

  // Badges
  const badges = $('#overview-badges');
  if (badges) {
    const totalSeconds = exercises.reduce((sum, ex) => sum + ex.duration + ex.rest, 0);
    const totalMin = Math.ceil(totalSeconds / 60);
    badges.innerHTML = `
      <span class="overview-badge"><i class="fa-solid fa-clock"></i> ${totalMin} min</span>
      <span class="overview-badge"><i class="fa-solid fa-chart-simple"></i> ${routineData.level}</span>
      <span class="overview-badge"><i class="fa-solid fa-bolt"></i> ${exercises.length} ejercicios</span>
    `;
  }

  // Exercise list
  const list = $('#overview-exercise-list');
  if (list) {
    let html = '<span class="overview-group-label">Ejercicios</span>';
    exercises.forEach((ex, i) => {
      // Exercise item
      html += `
        <div class="overview-exercise-item">
          <div class="overview-exercise-thumb"><i class="fa-regular fa-circle-play"></i></div>
          <div class="overview-exercise-info">
            <div class="overview-exercise-name">${ex.title}</div>
            <div class="overview-exercise-duration">${formatDuration(ex.duration)}</div>
          </div>
        </div>
      `;
    });
    list.innerHTML = html;
  }
}

// ─── SEO ───
function injectSEO() {
  const desc = routineData.introduction ? routineData.introduction.replace(/<[^>]*>/g, '').substring(0, 160) : routineData.title;
  const ogImage = routineData.image ? (routineData.image.startsWith('http') ? routineData.image : 'https://vitalia-selfcare.vercel.app/' + routineData.image) : '';

  const setMeta = (sel, attr, val) => {
    let el = document.querySelector(sel);
    if (!el) { el = document.createElement('meta'); const m = sel.match(/\[(\w+)="([^"]+)"\]/); if (m) el.setAttribute(m[1], m[2]); document.head.appendChild(el); }
    el.setAttribute(attr || 'content', val);
  };

  setMeta('meta[name="description"]', 'content', desc);
  setMeta('meta[property="og:title"]', 'content', routineData.title + ' | Vitalia');
  setMeta('meta[property="og:description"]', 'content', desc);
  setMeta('meta[property="og:image"]', 'content', ogImage);
  setMeta('meta[property="og:url"]', 'content', 'https://vitalia-selfcare.vercel.app/rutinas/' + routineData.slug);
  setMeta('meta[name="twitter:title"]', 'content', routineData.title + ' | Vitalia');
  setMeta('meta[name="twitter:description"]', 'content', desc);
  setMeta('meta[name="twitter:image"]', 'content', ogImage);

  // Canonical
  const canonical = document.querySelector('link[rel="canonical"]');
  if (canonical) canonical.setAttribute('href', 'https://vitalia-selfcare.vercel.app/rutinas/' + routineData.slug);
  // JSON-LD
  const schema = { "@context": "https://schema.org", "@type": "ExercisePlan", "name": routineData.title, "description": desc, "image": ogImage, "url": 'https://vitalia-selfcare.vercel.app/rutinas/' + routineData.slug };
  const tag = document.createElement('script');
  tag.type = 'application/ld+json';
  tag.textContent = JSON.stringify(schema);
  document.head.appendChild(tag);
}

// ─── Start Warmup ───
function startWarmup() {
  showScreen('#screen-warmup');
  routineStartTime = Date.now();

  const detail = $('#warmup-detail');
  if (detail) detail.textContent = getWarmupDetail(routineData);

  if (typeof VoiceService !== 'undefined') {
    VoiceService.speak('¿Preparado? ' + getWarmupDetail(routineData));
  }

  // 30 second warmup
  startCountdown(30, 30, () => {
    currentIndex = 0;
    startExercise(0);
  }, 'warmup');
}

// ─── Start Exercise ───
function startExercise(index) {
  currentIndex = index;
  if (index >= exercises.length) { finishRoutine(); return; }

  const ex = exercises[index];
  showScreen('#screen-exercise');

  // Stop square breathing if previous exercise was breathing
  SquareBreathing.stop();

  // Square breathing special mode
  const isBreathing = ex.exerciseId === 'square_breathing';
  // Video
  const video = $('#exercise-video');
  if (video) {
    if (isBreathing) {
      video.src = ''; video.pause();
    } else {
      video.src = ex.videoSrc;
      video.loop = true;
      video.muted = true;
      video.play().catch(() => {});
    }
  }

  // Info
  const nameEl = $('#exercise-name');
  const descEl = $('#exercise-desc');
  if (nameEl) nameEl.textContent = ex.title;
  if (descEl) descEl.textContent = ex.description;

  // Show description briefly
  const center = $('.exercise-center');
  if (center) {
    if (descTimeout) clearTimeout(descTimeout);
    center.classList.add('show-desc');
    descTimeout = setTimeout(() => {
      center.classList.remove('show-desc');
      descTimeout = null;
    }, 8000);
  }

  // Next up
  const nextCard = $('#next-up-card');
  const nextTitle = $('#next-up-title');
  if (index + 1 < exercises.length) {
    if (nextCard) nextCard.classList.remove('hidden');
    if (nextTitle) nextTitle.textContent = exercises[index + 1].title;
  } else {
    if (nextCard) nextCard.classList.add('hidden');
  }

  // Update pause icon
  updatePauseIcon(false);

  // Activate square breathing animation overlay
  if (isBreathing) {
    SquareBreathing.start();
  }

  // TTS (skip for square_breathing since it has its own guided voice)
  if (!isBreathing && typeof VoiceService !== 'undefined') {
    const intro = EXERCISE_INTROS[index % EXERCISE_INTROS.length];
    const prefix = index === 0 ? 'Empezamos la rutina. ' : '';
    VoiceService.speak(`${prefix}${intro} ${ex.title}. ${ex.description}`);
  }

  // Timer
  startCountdown(ex.duration, ex.duration, () => {
    SquareBreathing.stop();
    if (ex.rest > 0) {
      startRest(index);
    } else {
      startExercise(index + 1);
    }
  }, 'exercise');
}

// ─── Start Rest ───
function startRest(index) {
  const ex = exercises[index];
  showScreen('#screen-rest');

  // Timer text
  const timerEl = $('#rest-timer');
  if (timerEl) timerEl.textContent = formatTime(ex.rest * 1000);

  // Motivation
  const motEl = $('#rest-motivation');
  if (motEl) motEl.textContent = REST_PHRASES[Math.floor(Math.random() * REST_PHRASES.length)];

  // Next up
  const nextTitle = $('#rest-next-title');
  const nextUp = $('#rest-next-up');
  if (index + 1 < exercises.length) {
    if (nextTitle) nextTitle.textContent = exercises[index + 1].title;
    if (nextUp) nextUp.style.display = '';
  } else {
    if (nextUp) nextUp.style.display = 'none';
  }

  // TTS
  if (typeof VoiceService !== 'undefined') {
    let msg = `Descanso. ${ex.rest} segundos.`;
    if (index + 1 < exercises.length) {
      msg += ` Prepárate para: ${exercises[index + 1].title}.`;
    }
    VoiceService.speak(msg);
  }

  // Timer
  startCountdown(ex.rest, ex.rest, () => {
    startExercise(index + 1);
  }, 'rest');
}

// ─── Finish ───
function finishRoutine() {
  showScreen('#screen-finish');

  const totalSec = exercises.reduce((s, e) => s + e.duration + e.rest, 0);
  const statEx = $('#stat-exercises');
  const statDur = $('#stat-duration');
  if (statEx) statEx.textContent = exercises.length;
  if (statDur) statDur.textContent = Math.ceil(totalSec / 60);

  if (typeof VoiceService !== 'undefined') {
    VoiceService.speak('¡Rutina completada! Excelente trabajo. Tómate un momento para hidratarte y relajarte.');
  }
}

// ─── Timer Engine ───
function startCountdown(seconds, totalSeconds, onComplete, context) {
  cancelTimer();
  totalDurationMs = totalSeconds * 1000;
  remainingTimeMs = seconds * 1000;
  lastAnnouncedSecond = -1;
  onSegmentComplete = onComplete;
  isRunning = true;
  isPaused = false;

  updateTimerUI(context);
  endTime = performance.now() + remainingTimeMs;
  tick(context);
}

function tick(context) {
  if (!isRunning) return;

  const now = performance.now();
  remainingTimeMs = endTime - now;

  // 3-2-1 countdown voice
  const sec = Math.ceil(remainingTimeMs / 1000);
  if (sec <= 3 && sec > 0 && sec !== lastAnnouncedSecond) {
    // Suppress default countdown during square breathing (it has its own voice)
    if (!SquareBreathing.isActive()) {
      if (typeof VoiceService !== 'undefined') VoiceService.speak(sec.toString(), true);
    }
    lastAnnouncedSecond = sec;
  }

  if (remainingTimeMs <= 0) {
    remainingTimeMs = 0;
    updateTimerUI(context);
    isRunning = false;
    if (onSegmentComplete) onSegmentComplete();
  } else {
    updateTimerUI(context);
    animationFrameId = requestAnimationFrame(() => tick(context));
  }
}

function updateTimerUI(context) {
  const progress = Math.max(0, remainingTimeMs / totalDurationMs);

  if (context === 'exercise') {
    const timerEl = $('#exercise-timer');
    const barEl = $('#exercise-progress-bar');
    if (timerEl) timerEl.textContent = formatTime(remainingTimeMs);
    if (barEl) barEl.style.width = (progress * 100) + '%';
  } else if (context === 'rest') {
    const timerEl = $('#rest-timer');
    const barEl = $('#rest-fill');
    if (timerEl) timerEl.textContent = formatTime(remainingTimeMs);
    if (barEl) barEl.style.height = (progress * 100) + '%';
  } else if (context === 'warmup') {
    const timerEl = $('#warmup-timer');
    const barEl = $('#warmup-fill');
    if (timerEl) timerEl.textContent = formatTime(remainingTimeMs);
    if (barEl) barEl.style.height = (progress * 100) + '%';
  }
}

function cancelTimer() {
  if (animationFrameId) cancelAnimationFrame(animationFrameId);
  isRunning = false;
  isPaused = false;
}

function pauseTimer() {
  if (!isRunning) return;
  cancelAnimationFrame(animationFrameId);
  isRunning = false;
  isPaused = true;

  const video = $('#exercise-video');
  if (video) video.pause();

  if (typeof VoiceService !== 'undefined') VoiceService.pause();
}

function resumeTimer(context) {
  if (!isPaused) return;
  isRunning = true;
  isPaused = false;
  endTime = performance.now() + remainingTimeMs;

  const video = $('#exercise-video');
  if (video && context === 'exercise') video.play().catch(() => {});

  if (typeof VoiceService !== 'undefined') VoiceService.resume();

  tick(context);
}

function updatePauseIcon(paused) {
  const icon = $('#pause-icon');
  if (!icon) return;
  if (paused) {
    icon.className = 'fa-solid fa-play';
  } else {
    icon.className = 'fa-solid fa-pause';
  }
}

// ─── Event Bindings ───
function bindEvents() {
  // Overview → Start
  const btnStart = $('#btn-start-routine');
  if (btnStart) btnStart.addEventListener('click', () => startWarmup());

  // Back buttons
  const btnBack = $('#btn-back');
  if (btnBack) btnBack.addEventListener('click', () => window.history.back());

  // Close buttons → back to overview
  ['#btn-close-warmup', '#btn-close-exercise', '#btn-close-rest'].forEach(sel => {
    const btn = $(sel);
    if (btn) btn.addEventListener('click', () => {
      cancelTimer();
      if (typeof VoiceService !== 'undefined') VoiceService.stop();
      const video = $('#exercise-video');
      if (video) { video.pause(); video.src = ''; }
      currentIndex = 0;
      showScreen('#screen-overview');
    });
  });

  // Skip warmup
  const btnSkip = $('#btn-skip-warmup');
  if (btnSkip) btnSkip.addEventListener('click', () => {
    currentIndex = 0;
    startExercise(0);
  });

  // Pause / Resume
  const btnPause = $('#btn-pause');
  if (btnPause) btnPause.addEventListener('click', () => {
    if (isRunning) {
      pauseTimer();
      updatePauseIcon(true);
    } else if (isPaused) {
      resumeTimer('exercise');
      updatePauseIcon(false);
    }
  });

  // Previous exercise
  const btnPrev = $('#btn-prev');
  if (btnPrev) btnPrev.addEventListener('click', () => {
    cancelTimer();
    if (typeof VoiceService !== 'undefined') VoiceService.stop();
    if (currentIndex > 0) {
      startExercise(currentIndex - 1);
    } else {
      startExercise(0);
    }
  });

  // Next exercise
  const btnNext = $('#btn-next');
  if (btnNext) btnNext.addEventListener('click', () => {
    cancelTimer();
    if (typeof VoiceService !== 'undefined') VoiceService.stop();
    startExercise(currentIndex + 1);
  });

  // Skip to next (from next-up card)
  const btnSkipNext = $('#btn-skip-to-next');
  if (btnSkipNext) btnSkipNext.addEventListener('click', () => {
    cancelTimer();
    if (typeof VoiceService !== 'undefined') VoiceService.stop();
    startExercise(currentIndex + 1);
  });

  // Skip rest
  const btnSkipRest = $('#btn-skip-rest');
  if (btnSkipRest) btnSkipRest.addEventListener('click', () => {
    cancelTimer();
    if (typeof VoiceService !== 'undefined') VoiceService.stop();
    startExercise(currentIndex + 1);
  });

  // Finish → back
  const btnFinishBack = $('#btn-finish-back');
  if (btnFinishBack) btnFinishBack.addEventListener('click', () => {
    window.location.href = '/pages/mi-espacio.html';
  });
}

// ─── TTS visual link ───
function linkTTS() {
  if (typeof VoiceService === 'undefined') return;
  VoiceService.onSpeakingStateChange = (isSpeaking) => {
    const nameEl = $('#exercise-name');
    const descEl = $('#exercise-desc');
    [nameEl, descEl].forEach(el => {
      if (!el) return;
      if (isSpeaking) el.classList.add('tts-speaking');
      else el.classList.remove('tts-speaking');
    });
  };
}

// ─── Init ───
function init() {
  loadRoutine().then(() => {
    bindEvents();
    linkTTS();
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
