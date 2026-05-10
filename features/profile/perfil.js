import { db, auth } from '../auth/firebase.js';
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js";
import { signOut } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-auth.js";
import { getUserSession } from '../auth/auth-state.js';

// ── Helpers de label ──────────────────────────────────────────────────
const ACTIVITY_LABELS = {
    'sedentario': 'Sedentario (sin actividad física)',
    'ligero': 'Ligero (1-2 veces/semana)',
    'moderado': 'Moderado (3-5 veces/semana)',
    'activo': 'Activo (6-7 veces/semana)',
    'muy-activo': 'Muy activo (varias veces al día)',
    'ninguna': 'Sin actividad física regular',
    'muy activo': 'Muy activo',
};

const DIET_LABELS = {
    'omnivora': 'Omnívora',
    'vegetariana': 'Vegetariana',
    'vegana': 'Vegana',
    'sin-gluten': 'Sin gluten',
    'cetogenica': 'Cetogénica',
    'paleo': 'Paleo',
    'sin restricciones': 'Sin restricciones',
};

const SLEEP_LABELS = {
    'excelente': 'Excelente',
    'bueno': 'Bueno',
    'regular': 'Regular',
    'malo': 'Malo',
    'muy malo': 'Muy malo',
    'muy-malo': 'Muy malo',
};

const STRESS_LABELS = {
    'bajo': 'Bajo',
    'moderado': 'Moderado',
    'alto': 'Alto',
    'muy-alto': 'Muy alto',
    'muy alto': 'Muy alto',
};

function labelOf(obj, key) {
    if (!key) return null;
    const k = key.toLowerCase().trim();
    return obj[k] || key;
}

function formatDate(dateValue) {
    if (!dateValue) return null;
    try {
        // Firestore Timestamp
        const d = dateValue.toDate ? dateValue.toDate() : new Date(dateValue);
        return d.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch {
        return null;
    }
}

// ── Render helpers ────────────────────────────────────────────────────
function setText(id, value, fallback = 'No especificado') {
    const el = document.getElementById(id);
    if (!el) return;
    if (value) {
        el.textContent = value;
        el.classList.remove('text-muted');
    } else {
        el.textContent = fallback;
        el.classList.add('text-muted');
    }
}

function setTags(id, values) {
    const el = document.getElementById(id);
    if (!el) return;
    if (!values || values.length === 0) {
        el.innerHTML = '<span class="text-muted" style="font-size:0.9rem">No especificados</span>';
        return;
    }
    el.innerHTML = values
        .slice(0, 6)
        .map(v => `<span class="profile-tag">${v}</span>`)
        .join('');
}

// ── Main ──────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const user = await getUserSession();
        if (!user) return; // auth-state.js redirige

        // ── Datos básicos desde Firebase Auth ──
        const email = user.email || '';
        const displayName = user.displayName || email.split('@')[0] || 'Usuario';
        const initial = displayName.charAt(0).toUpperCase();

        // Avatar y nombre en el hero
        const avatarEl = document.getElementById('profile-avatar');
        const nameEl = document.getElementById('profile-display-name');
        const emailEl = document.getElementById('profile-email');

        if (avatarEl) avatarEl.textContent = initial;
        if (nameEl) nameEl.textContent = displayName;
        if (emailEl) emailEl.textContent = email;

        // Email en los campos
        setText('field-email', email);

        // ── Datos desde Firestore ──
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
            // No hay datos de perfil — mostrar lo que tenemos de Auth
            setText('field-fullname', displayName);
            setText('field-country', null);
            setText('field-activity', null);
            setText('field-diet', null);
            setText('field-sleep', null);
            setText('field-stress', null);
            setTags('field-goals', null);
            setText('field-created', formatDate(user.metadata?.creationTime));
            return;
        }

        const data = userSnap.data();

        // Nombre completo
        const firstName = data.firstName || '';
        const lastName = data.lastName || '';
        const fullName = [firstName, lastName].filter(Boolean).join(' ') || displayName;

        // Actualizar héroe con nombre real
        if (nameEl) nameEl.textContent = fullName;
        if (avatarEl) avatarEl.textContent = fullName.charAt(0).toUpperCase();

        // Campos
        setText('field-fullname', fullName);
        setText('field-email', email);
        setText('field-country', data.country);
        setText('field-activity', labelOf(ACTIVITY_LABELS, data.physicalActivity));
        setText('field-diet', labelOf(DIET_LABELS, data.diet));
        setText('field-sleep', labelOf(SLEEP_LABELS, data.sleepQuality));
        setText('field-stress', labelOf(STRESS_LABELS, data.stressLevel));
        setText('field-created', formatDate(data.createdAt) || formatDate(user.metadata?.creationTime));

        // Objetivos como etiquetas
        setTags('field-goals', data.wellbeingGoals);

    } catch (error) {
        console.error('[Perfil] Error cargando datos:', error);
    }

    // ── Logout button ──
    const logoutBtn = document.getElementById('profile-logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            logoutBtn.disabled = true;
            logoutBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Cerrando sesión...';
            try {
                await signOut(auth);
                window.location.href = '/';
            } catch (e) {
                logoutBtn.disabled = false;
                logoutBtn.innerHTML = '<i class="fa-solid fa-right-from-bracket"></i> Cerrar sesión';
            }
        });
    }
});
