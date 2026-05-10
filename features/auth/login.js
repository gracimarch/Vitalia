import { signInWithEmailAndPassword, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-auth.js";
import { auth } from './firebase.js';

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

/** Show a Toastify notification. Reuses the same config as form-validation.js */
function showToast(message, type = 'error') {
    // Guard: Toastify is loaded as a regular script, not a module import
    if (typeof Toastify === 'undefined') {
        console.warn('[login.js] Toastify is not loaded yet, falling back to alert.');
        alert(message);
        return;
    }

    // Limit simultaneous toasts to 3
    const existing = document.querySelectorAll('.toastify');
    if (existing.length >= 3) {
        for (let i = 0; i <= existing.length - 3; i++) existing[i].remove();
    }

    Toastify({
        text: message,
        duration: 4000,
        close: true,
        gravity: 'top',
        position: 'center',
        stopOnFocus: true,
        className: type === 'error' ? 'toast-error' : 'toast-success',
        style: { background: 'transparent', boxShadow: 'none' },
    }).showToast();
}

/** Map Firebase error codes to human-readable Spanish messages */
function getFirebaseErrorMessage(code) {
    const messages = {
        'auth/invalid-email':        'El formato del correo electrónico no es válido.',
        'auth/user-not-found':       'No existe ninguna cuenta con este correo electrónico.',
        'auth/wrong-password':       'La contraseña es incorrecta.',
        'auth/invalid-credential':   'El correo o la contraseña son incorrectos.',
        'auth/too-many-requests':    'Demasiados intentos fallidos. Intenta de nuevo más tarde.',
        'auth/user-disabled':        'Esta cuenta ha sido desactivada.',
        'auth/network-request-failed': 'Error de conexión. Comprueba tu internet.',
    };
    return messages[code] || 'Error al iniciar sesión. Por favor, inténtalo de nuevo.';
}

// ─────────────────────────────────────────────────────────────
// Login form handler
// ─────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
    const form        = document.getElementById('loginForm');
    const emailInput  = document.getElementById('loginEmail');
    const passInput   = document.getElementById('loginPassword');
    const loginBtn    = document.getElementById('loginBtn');

    if (!form) return; // Safety guard — script is only loaded on login.html

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email    = emailInput.value.trim();
        const password = passInput.value;

        // ── Basic client-side validation ──────────────────────
        if (!email) {
            showToast('Por favor, introduce tu correo electrónico.');
            emailInput.focus();
            return;
        }
        if (!password) {
            showToast('Por favor, introduce tu contraseña.');
            passInput.focus();
            return;
        }

        // ── Loading state ─────────────────────────────────────
        loginBtn.disabled = true;
        loginBtn.innerHTML = `<span class="btn-spinner"></span> Iniciando sesión...`;

        try {
            // ── Firebase Authentication ───────────────────────
            await signInWithEmailAndPassword(auth, email, password);

            showToast('¡Bienvenido de nuevo! Entrando a tu espacio...', 'success');

            // Redirect after a short delay so the user sees the success toast
            setTimeout(() => {
                const isLocal =
                    window.location.hostname === 'localhost' ||
                    window.location.hostname === '127.0.0.1';
                window.location.href = isLocal ? '/pages/mi-espacio.html' : '/mi-espacio';
            }, 1200);

        } catch (error) {
            console.error('[login.js] Firebase sign-in error:', error.code, error.message);
            showToast(getFirebaseErrorMessage(error.code));

            // Restore button
            loginBtn.disabled = false;
            loginBtn.textContent = 'Iniciar sesión';
        }
    });

    // ── Forgot password ───────────────────────────────────────
    const forgotLink = document.getElementById('forgotPasswordLink');
    if (forgotLink) {
        forgotLink.addEventListener('click', async (e) => {
            e.preventDefault();

            const email = emailInput.value.trim();
            if (!email) {
                showToast('Introduce tu correo electrónico y luego pulsa "¿Olvidaste tu contraseña?".');
                emailInput.focus();
                return;
            }

            try {
                await sendPasswordResetEmail(auth, email);
                showToast('Te hemos enviado un correo para restablecer tu contraseña.', 'success');
            } catch (error) {
                console.error('[login.js] Password reset error:', error.code, error.message);
                showToast(getFirebaseErrorMessage(error.code));
            }
        });
    }
});
