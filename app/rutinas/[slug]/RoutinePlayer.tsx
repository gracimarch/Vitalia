'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { VoiceService } from '@/lib/voice';
import { logSession } from '@/lib/progress';

interface ExerciseDetail {
  id: string;
  name: string;
  desc: string;
  media?: { type: string; url: string };
}

interface RoutineItem {
  exerciseId: string;
  duration: number;
  rest: number;
  sets?: number;
  title?: string;
  description?: string;
}

interface RoutineData {
  title: string;
  duration: string;
  warmup_text: string;
  image: string;
  exercises: RoutineItem[];
}

export default function RoutinePlayer({
  routine,
  exerciseDetails,
}: {
  routine: RoutineData;
  exerciseDetails: ExerciseDetail[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [state, setState] = useState<'idle' | 'warmup' | 'exercise' | 'rest' | 'finished'>('idle');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [remainingTime, setRemainingTime] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const isPausedRef = useRef(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // Flatten exercises based on sets
  const flatExercises = useRef<any[]>([]);

  useEffect(() => {
    const expanded: any[] = [];
    routine.exercises.forEach((ex) => {
      const details = exerciseDetails.find(e => e.id === ex.exerciseId);
      const sets = ex.sets || 1;
      
      for (let i = 0; i < sets; i++) {
        expanded.push({
          ...ex,
          title: details?.name || 'Ejercicio',
          description: details?.desc || '',
          videoSrc: details?.media?.url || '',
          isLastSet: i === sets - 1,
          setIndex: i + 1,
          totalSets: sets
        });
      }
    });
    flatExercises.current = expanded;
  }, [routine, exerciseDetails]);

  // Timer logic
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const clearTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const startCountdown = useCallback((seconds: number, callback: () => void) => {
    clearTimer();
    setTotalTime(seconds);
    setRemainingTime(seconds);
    let current = seconds;

    timerRef.current = setInterval(() => {
      if (!isPausedRef.current) {
        current -= 1;
        setRemainingTime(current);

        if (current <= 3 && current > 0) {
          VoiceService.speak(current.toString(), true);
        }

        if (current <= 0) {
          clearTimer();
          callback();
        }
      }
    }, 1000);
  }, []);

  // State transitions
  const startWarmup = () => {
    VoiceService.init();
    setIsOpen(true);
    setState('warmup');
    const txt = routine.warmup_text || 'Prepárate para comenzar la rutina.';
    VoiceService.speak(`Preparación: ${txt}`);
    
    startCountdown(15, () => {
      startExercise(0);
    });
  };

  const startExercise = (index: number) => {
    if (index >= flatExercises.current.length) {
      finishRoutine();
      return;
    }
    setCurrentIndex(index);
    setState('exercise');
    
    const ex = flatExercises.current[index];
    let prefix = index === 0 ? 'Empezamos. ' : 'Siguiente ejercicio. ';
    let setInfo = ex.totalSets > 1 ? `Serie ${ex.setIndex} de ${ex.totalSets}. ` : '';
    VoiceService.speak(`${prefix}${setInfo}${ex.title}.`);

    startCountdown(ex.duration, () => {
      if (ex.rest > 0) {
        startRest(index);
      } else {
        startExercise(index + 1);
      }
    });
  };

  const startRest = (index: number) => {
    setState('rest');
    const ex = flatExercises.current[index];
    
    let msg = `Descanso de ${ex.rest} segundos.`;
    if (index + 1 < flatExercises.current.length) {
      msg += ` Prepárate para: ${flatExercises.current[index + 1].title}.`;
    }
    VoiceService.speak(msg);

    startCountdown(ex.rest, () => {
      startExercise(index + 1);
    });
  };

  const finishRoutine = () => {
    setState('finished');
    VoiceService.speak('¡Rutina completada! Excelente trabajo.');
    const minutes = parseInt(routine.duration, 10) || 20;
    logSession(minutes);
  };

  const togglePause = () => {
    if (isPausedRef.current) {
      VoiceService.resume();
      setIsPaused(false);
      isPausedRef.current = false;
      if (videoRef.current) videoRef.current.play();
    } else {
      VoiceService.pause();
      setIsPaused(true);
      isPausedRef.current = true;
      if (videoRef.current) videoRef.current.pause();
    }
  };

  const skipNext = () => {
    clearTimer();
    VoiceService.stop();
    setIsPaused(false);
    isPausedRef.current = false;
    if (state === 'warmup') {
      startExercise(0);
    } else if (state === 'exercise') {
      const ex = flatExercises.current[currentIndex];
      if (ex.rest > 0) startRest(currentIndex);
      else startExercise(currentIndex + 1);
    } else if (state === 'rest') {
      startExercise(currentIndex + 1);
    }
  };

  const skipPrev = () => {
    clearTimer();
    VoiceService.stop();
    setIsPaused(false);
    isPausedRef.current = false;
    if (state === 'exercise') {
      startExercise(Math.max(0, currentIndex - 1));
    } else if (state === 'rest' || state === 'finished') {
      startExercise(currentIndex);
    } else {
      startExercise(0);
    }
  };

  const closePlayer = () => {
    clearTimer();
    VoiceService.stop();
    setIsOpen(false);
    setState('idle');
  };

  // Re-run timer logic on pause/resume change is handled by the setInterval reading the latest isPaused through the ref, but here we used it in dependency. 
  // Wait, setInterval closure captures isPaused. We need to update it properly.
  // Actually, useEffect for the interval is better to avoid stale closures.
  
  useEffect(() => {
    return () => clearTimer();
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  if (!isOpen) {
    return (
      <div className="start-routine-wrapper">
        <button className="btn-empezar-rutina" onClick={startWarmup}>
          <i className="fa-solid fa-play"></i> Empezar Rutina
        </button>
      </div>
    );
  }

  const currentEx = flatExercises.current[currentIndex];
  const progressPct = totalTime > 0 ? ((totalTime - remainingTime) / totalTime) * 100 : 0;

  return (
    <div className="routine-fullscreen-player">
      {/* Background with blur and dark gradient */}
      <div className="player-bg">
        {currentEx?.videoSrc && state === 'exercise' && (
          <video ref={videoRef} src={currentEx.videoSrc} className="player-bg-video" loop muted autoPlay playsInline />
        )}
        <div className="player-overlay"></div>
      </div>

      <div className="player-header">
        <button className="player-close-btn" onClick={closePlayer}>
          <i className="fa-solid fa-xmark"></i>
        </button>
        <div className="player-progress">
          {currentIndex + 1} / {flatExercises.current.length}
        </div>
      </div>

      <div className="player-content">
        {state === 'warmup' && (
          <div className="player-state-view">
            <h2 className="state-label">Preparación</h2>
            <p className="state-desc">{routine.warmup_text}</p>
            <div className="timer-huge">{formatTime(remainingTime)}</div>
          </div>
        )}

        {state === 'exercise' && currentEx && (
          <div className="player-state-view">
            <h2 className="state-label" style={{ color: '#E1947F' }}>¡A entrenar!</h2>
            <h1 className="exercise-title">{currentEx.title}</h1>
            {currentEx.totalSets > 1 && (
              <span className="set-badge">Serie {currentEx.setIndex} de {currentEx.totalSets}</span>
            )}
            
            <div className="timer-circle-wrap">
              <svg className="timer-svg" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" className="timer-track" />
                <circle 
                  cx="50" cy="50" r="45" 
                  className="timer-fill" 
                  style={{ strokeDasharray: 283, strokeDashoffset: 283 - (283 * progressPct) / 100 }} 
                />
              </svg>
              <div className="timer-huge inside-circle">{formatTime(remainingTime)}</div>
            </div>
          </div>
        )}

        {state === 'rest' && currentEx && (
          <div className="player-state-view">
            <h2 className="state-label" style={{ color: '#80CACD' }}>Descanso</h2>
            <p className="state-desc">Recupera el aliento</p>
            <div className="timer-huge" style={{ color: '#80CACD' }}>{formatTime(remainingTime)}</div>
            
            {currentIndex + 1 < flatExercises.current.length && (
              <div className="up-next-box">
                Siguiente: <strong>{flatExercises.current[currentIndex + 1].title}</strong>
              </div>
            )}
          </div>
        )}

        {state === 'finished' && (
          <div className="player-state-view">
            <i className="fa-solid fa-trophy giant-icon" style={{ color: '#F4D03F', fontSize: '5rem', marginBottom: '1rem' }}></i>
            <h1 className="exercise-title">¡Rutina Completada!</h1>
            <p className="state-desc">Has hecho un excelente trabajo.</p>
            <button className="btn-empezar-rutina mt-8" onClick={closePlayer}>
              Volver
            </button>
          </div>
        )}
      </div>

      {state !== 'finished' && (
        <div className="player-controls">
          <button className="control-btn" onClick={skipPrev}>
            <i className="fa-solid fa-backward-step"></i>
          </button>
          <button className="control-btn" style={{ transform: 'scale(1.2)' }} onClick={togglePause}>
            <i className={`fa-solid ${isPaused ? 'fa-play' : 'fa-pause'}`}></i>
          </button>
          <button className="control-btn" onClick={skipNext}>
            <i className="fa-solid fa-forward-step"></i>
          </button>
        </div>
      )}
    </div>
  );
}
