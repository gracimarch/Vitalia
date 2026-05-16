export const PROGRESS_KEY = 'vitalia-progress';

export interface ProgressData {
  diasActivos: string[];
  sesionesTotales: number;
  minutosTotales: number;
}

export function getProgress(): ProgressData {
  if (typeof window === 'undefined') return { diasActivos: [], sesionesTotales: 0, minutosTotales: 0 };
  const saved = localStorage.getItem(PROGRESS_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch { }
  }
  return { diasActivos: [], sesionesTotales: 0, minutosTotales: 0 };
}

export function logSession(minutes: number) {
  if (typeof window === 'undefined') return;
  const data = getProgress();
  
  const today = new Date().toISOString().split('T')[0];
  if (!data.diasActivos.includes(today)) {
    data.diasActivos.push(today);
  }
  
  data.sesionesTotales += 1;
  data.minutosTotales += minutes;
  
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(data));
  // Dispatch a custom event so components can update
  window.dispatchEvent(new Event('vitalia-progress-updated'));
}

export function markActiveDay() {
  if (typeof window === 'undefined') return;
  const data = getProgress();
  
  const today = new Date().toISOString().split('T')[0];
  if (!data.diasActivos.includes(today)) {
    data.diasActivos.push(today);
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(data));
    window.dispatchEvent(new Event('vitalia-progress-updated'));
  }
}
