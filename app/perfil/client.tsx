'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import AuthGuard from '@/components/auth/AuthGuard';
import GradientAvatar from '@/components/ui/GradientAvatar';
import './profile.css';

const ACTIVITY_LABELS: Record<string, string> = {
  'sedentario': 'Sedentario (sin actividad física)',
  'ligero': 'Ligero (1-2 veces/semana)',
  'moderado': 'Moderado (3-5 veces/semana)',
  'activo': 'Activo (6-7 veces/semana)',
  'muy-activo': 'Muy activo (varias veces al día)',
  'ninguna': 'Sin actividad física regular',
  'muy activo': 'Muy activo',
};

const DIET_LABELS: Record<string, string> = {
  'omnivora': 'Omnívora',
  'vegetariana': 'Vegetariana',
  'vegana': 'Vegana',
  'sin-gluten': 'Sin gluten',
  'cetogenica': 'Cetogénica',
  'paleo': 'Paleo',
  'sin restricciones': 'Sin restricciones',
};

const SLEEP_LABELS: Record<string, string> = {
  'excelente': 'Excelente',
  'bueno': 'Bueno',
  'regular': 'Regular',
  'malo': 'Malo',
  'muy malo': 'Muy malo',
  'muy-malo': 'Muy malo',
};

const STRESS_LABELS: Record<string, string> = {
  'bajo': 'Bajo',
  'moderado': 'Moderado',
  'alto': 'Alto',
  'muy-alto': 'Muy alto',
  'muy alto': 'Muy alto',
};

function labelOf(obj: Record<string, string>, key?: string) {
  if (!key) return null;
  const k = key.toLowerCase().trim();
  return obj[k] || key;
}

function formatDate(dateValue: any) {
  if (!dateValue) return null;
  try {
    const d = dateValue.toDate ? dateValue.toDate() : new Date(dateValue);
    return d.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
  } catch {
    return null;
  }
}

function ProfileContent() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    if (!user) return;
    const fetchProfile = async () => {
      try {
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setData(userSnap.data());
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoadingData(false);
      }
    };
    fetchProfile();
  }, [user]);

  if (!user) return null;

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
      router.push('/');
    } catch (e) {
      console.error(e);
      setLoggingOut(false);
    }
  };

  const email = user.email || '';
  const displayName = user.displayName || email.split('@')[0] || 'Usuario';
  const firstName = data?.firstName || '';
  const lastName = data?.lastName || '';
  const fullName = [firstName, lastName].filter(Boolean).join(' ') || displayName;

  const creationDate = formatDate(data?.createdAt) || formatDate(user.metadata?.creationTime) || 'No especificado';
  
  const wellbeingGoals = data?.wellbeingGoals || [];

  return (
    <main className="profile-page">
      <div className="profile-container">
        
        {/* HERO */}
        <section className="profile-hero">
          <div className="profile-hero-avatar">
            <GradientAvatar uid={user.uid} size={84} />
          </div>
          <div className="profile-hero-info">
            <h1>{fullName}</h1>
            <p className="profile-hero-email">{email}</p>
            <div className="profile-hero-badges">
              <span className="profile-hero-badge">Plan Gratuito</span>
              <span className="profile-hero-badge">Miembro desde {new Date(user.metadata?.creationTime || Date.now()).getFullYear()}</span>
            </div>
          </div>
        </section>

        {/* STATS */}
        <section className="profile-stats">
          <div className="profile-stat-card">
            <div className="profile-stat-icon"><i className="fa-solid fa-bullseye"></i></div>
            <div className="profile-stat-value">{wellbeingGoals.length || '0'}</div>
            <div className="profile-stat-label">Objetivos</div>
          </div>
          <div className="profile-stat-card">
            <div className="profile-stat-icon"><i className="fa-regular fa-calendar-check"></i></div>
            <div className="profile-stat-value">0</div>
            <div className="profile-stat-label">Días Activos</div>
          </div>
          <div className="profile-stat-card">
            <div className="profile-stat-icon"><i className="fa-solid fa-fire"></i></div>
            <div className="profile-stat-value">0</div>
            <div className="profile-stat-label">Racha</div>
          </div>
        </section>

        {/* DETAILS CARDS */}
        <section className="profile-card profile-card-purple">
          <h2 className="profile-card-title">
            <div className="profile-card-title-icon"><i className="fa-solid fa-user"></i></div> Datos Personales
          </h2>
          <div className="profile-field">
            <div className="profile-field-icon"><i className="fa-solid fa-id-card"></i></div>
            <div className="profile-field-content">
              <div className="profile-field-label">Nombre Completo</div>
              <div className={`profile-field-value ${!fullName ? 'text-muted' : ''}`}>{fullName || 'No especificado'}</div>
            </div>
          </div>
          <div className="profile-field">
            <div className="profile-field-icon"><i className="fa-solid fa-envelope"></i></div>
            <div className="profile-field-content">
              <div className="profile-field-label">Correo Electrónico</div>
              <div className="profile-field-value">{email}</div>
            </div>
          </div>
          <div className="profile-field">
            <div className="profile-field-icon"><i className="fa-solid fa-earth-americas"></i></div>
            <div className="profile-field-content">
              <div className="profile-field-label">País</div>
              <div className={`profile-field-value ${!data?.country ? 'text-muted' : ''}`}>{data?.country || 'No especificado'}</div>
            </div>
          </div>
          <div className="profile-field">
            <div className="profile-field-icon"><i className="fa-regular fa-calendar-days"></i></div>
            <div className="profile-field-content">
              <div className="profile-field-label">Fecha de Registro</div>
              <div className="profile-field-value">{creationDate}</div>
            </div>
          </div>
        </section>

        <section className="profile-card profile-card-cyan">
          <h2 className="profile-card-title">
            <div className="profile-card-title-icon"><i className="fa-solid fa-heart-pulse"></i></div> Bienestar y Hábitos
          </h2>
          <div className="profile-field">
            <div className="profile-field-icon"><i className="fa-solid fa-person-running"></i></div>
            <div className="profile-field-content">
              <div className="profile-field-label">Actividad Física</div>
              <div className={`profile-field-value ${!data?.physicalActivity ? 'text-muted' : ''}`}>
                {loadingData ? <div className="profile-skeleton"></div> : (labelOf(ACTIVITY_LABELS, data?.physicalActivity) || 'No especificado')}
              </div>
            </div>
          </div>
          <div className="profile-field">
            <div className="profile-field-icon"><i className="fa-solid fa-leaf"></i></div>
            <div className="profile-field-content">
              <div className="profile-field-label">Dieta preferida</div>
              <div className={`profile-field-value ${!data?.diet ? 'text-muted' : ''}`}>
                {loadingData ? <div className="profile-skeleton wide"></div> : (labelOf(DIET_LABELS, data?.diet) || 'No especificado')}
              </div>
            </div>
          </div>
          <div className="profile-field">
            <div className="profile-field-icon"><i className="fa-solid fa-moon"></i></div>
            <div className="profile-field-content">
              <div className="profile-field-label">Calidad de sueño</div>
              <div className={`profile-field-value ${!data?.sleepQuality ? 'text-muted' : ''}`}>
                {loadingData ? <div className="profile-skeleton"></div> : (labelOf(SLEEP_LABELS, data?.sleepQuality) || 'No especificado')}
              </div>
            </div>
          </div>
          <div className="profile-field">
            <div className="profile-field-icon"><i className="fa-solid fa-brain"></i></div>
            <div className="profile-field-content">
              <div className="profile-field-label">Nivel de estrés</div>
              <div className={`profile-field-value ${!data?.stressLevel ? 'text-muted' : ''}`}>
                {loadingData ? <div className="profile-skeleton"></div> : (labelOf(STRESS_LABELS, data?.stressLevel) || 'No especificado')}
              </div>
            </div>
          </div>
        </section>

        <section className="profile-card profile-card-orange">
          <h2 className="profile-card-title">
            <div className="profile-card-title-icon"><i className="fa-solid fa-bullseye"></i></div> Tus Objetivos
          </h2>
          {loadingData ? (
             <div className="profile-tags"><div className="profile-skeleton"></div></div>
          ) : (
            <div className="profile-tags">
              {wellbeingGoals.length > 0 ? (
                wellbeingGoals.slice(0, 6).map((g: string, i: number) => (
                  <span key={i} className="profile-tag">{g}</span>
                ))
              ) : (
                <span className="text-muted" style={{fontSize: '0.9rem'}}>No especificados</span>
              )}
            </div>
          )}
        </section>

        {/* ACTIONS */}
        <section className="profile-actions">
          <button className="profile-btn profile-btn-danger" onClick={handleLogout} disabled={loggingOut}>
            {loggingOut ? <><i className="fa-solid fa-spinner fa-spin"></i> Cerrando sesión...</> : <><i className="fa-solid fa-right-from-bracket"></i> Cerrar sesión</>}
          </button>
        </section>
      </div>
    </main>
  );
}

export default function PerfilClient() {
  return (
    <AuthGuard>
      <ProfileContent />
    </AuthGuard>
  );
}
