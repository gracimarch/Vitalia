import { auth } from './firebase.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-auth.js";

// Obtener la sesión activa como Promesa (útil para vistas que requieren fetch condicionado a UID)
export const getUserSession = () => {
    return new Promise((resolve, reject) => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            resolve(user);
            unsubscribe();
        }, reject);
    });
};

document.addEventListener('DOMContentLoaded', () => {
    onAuthStateChanged(auth, (user) => {
        const currentPath = window.location.pathname.replace(/\/$/, "");
        
        // Verifica si estamos en la ruta protegida y no hay sesión activa
        const protectedRoutes = ['/mi-espacio', '/pages/mi-espacio.html'];
        const isProtectedRoute = protectedRoutes.some(route => currentPath.includes(route));

        if (!user && isProtectedRoute) {
            const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
            window.location.href = isLocal ? '/pages/login.html' : '/login';
        }

        // Manejar visibilidad de botones del header (que carga asíncronamente)
        const updateHeaderUI = () => {
            const loginBtn = document.getElementById('nav-login-btn');
            const logoutBtn = document.getElementById('nav-logout-btn');
            const mobileLoginBtn = document.getElementById('nav-mobile-login-btn');
            const mobileLogoutBtn = document.getElementById('nav-mobile-logout-btn');

            if (!loginBtn && !logoutBtn) return false;

            if (user) {
                if (loginBtn) loginBtn.style.display = 'none';
                if (logoutBtn) {
                    logoutBtn.style.display = 'block';
                    logoutBtn.onclick = (e) => {
                        e.preventDefault();
                        signOut(auth).then(() => { window.location.href = '/' });
                    };
                }
                if (mobileLoginBtn) mobileLoginBtn.style.display = 'none';
                if (mobileLogoutBtn) {
                    mobileLogoutBtn.style.display = 'block';
                    mobileLogoutBtn.onclick = (e) => {
                        e.preventDefault();
                        signOut(auth).then(() => { window.location.href = '/' });
                    };
                }
            } else {
                if (loginBtn) loginBtn.style.display = 'block';
                if (logoutBtn) logoutBtn.style.display = 'none';
                if (mobileLoginBtn) mobileLoginBtn.style.display = 'block';
                if (mobileLogoutBtn) mobileLogoutBtn.style.display = 'none';
            }
            return true;
        };

        // Reintentamos actualizar el Header hasta que load-components.js lo haya inyectado
        if (!updateHeaderUI()) {
            const interval = setInterval(() => {
                if (updateHeaderUI()) clearInterval(interval);
            }, 100);
        }
    });
});
