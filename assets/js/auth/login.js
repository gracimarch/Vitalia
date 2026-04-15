import { auth } from './firebase.js';
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-auth.js";

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    if (!loginForm) return;

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        const btn = document.getElementById('loginBtn');

        btn.textContent = 'Iniciando sesión...';
        btn.disabled = true;

        try {
            await signInWithEmailAndPassword(auth, email, password);
            Toastify({
                text: "¡Sesión iniciada con éxito! Redirigiendo...",
                duration: 2000,
                gravity: "top",
                position: "center",
                style: { background: "linear-gradient(to right, #00b09b, #96c93d)", color: "#fff", borderRadius: "8px" }
            }).showToast();

            setTimeout(() => {
                const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
                window.location.href = isLocal ? '/pages/mi-espacio.html' : '/mi-espacio';
            }, 1000);

        } catch (error) {
            console.error("Login error:", error);
            let userMsg = "Ocurrió un error al iniciar sesión.";
            
            if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
                userMsg = "Correo o contraseña incorrectos.";
            } else if (error.code === 'auth/too-many-requests') {
                userMsg = "Demasiados intentos. Intenta más tarde.";
            }

            Toastify({
                text: userMsg,
                duration: 4000,
                close: true,
                gravity: "top",
                position: "center",
                style: { background: "#ff4b4b", color: "#fff", borderRadius: "8px" }
            }).showToast();
            
            btn.textContent = 'Iniciar Sesión';
            btn.disabled = false;
        }
    });
});
