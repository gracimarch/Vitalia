import { auth } from './firebase.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-auth.js";

// ─────────────────────────────────────────────────────────────
// getUserSession — promesa única del estado de auth
// ─────────────────────────────────────────────────────────────
export const getUserSession = () => {
    return new Promise((resolve, reject) => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            resolve(user);
            unsubscribe();
        }, reject);
    });
};

// ─────────────────────────────────────────────────────────────
// Helpers — premium detection
// ─────────────────────────────────────────────────────────────
/**
 * Detecta si el usuario tiene plan premium.
 * Actualmente devuelve false por defecto.
 * Para activar: guardar { premium: true } en Firestore o custom claims
 * y connectar aquí la lógica de lectura.
 */
async function detectPremium(user) {
    if (!user) return false;
    // TODO: leer desde Firestore o custom claims cuando esté implementado
    // Ejemplo Firestore: const snap = await getDoc(doc(db,'users', user.uid));
    //                    return snap.data()?.premium === true;
    return false;
}

// ─────────────────────────────────────────────────────────────
// Main auth state listener
// ─────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    onAuthStateChanged(auth, async (user) => {
        const currentPath = window.location.pathname.replace(/\/$/, "");

        // Rutas protegidas → redirige a login si no hay sesión
        const protectedRoutes = ['/mi-espacio', '/pages/mi-espacio.html', '/perfil', '/pages/perfil.html'];
        const isProtectedRoute = protectedRoutes.some(route => currentPath.includes(route));

        if (!user && isProtectedRoute) {
            window.location.href = '/iniciar-sesion';
            return;
        }

        // Rutas de auth → redirige a mi-espacio si ya hay sesión activa
        const authOnlyRoutes = ['/iniciar-sesion', '/pages/login.html', '/crear-cuenta', '/pages/form.html'];
        const isAuthOnlyRoute = authOnlyRoutes.some(route => currentPath.includes(route));

        if (user && isAuthOnlyRoute) {
            window.location.href = '/mi-espacio';
            return;
        }

        // Detectar premium
        const isPremium = await detectPremium(user);

        // ── Actualiza el header cuando el partial ya esté inyectado ──
        const updateHeaderUI = () => {
            const guestBtns = document.getElementById('nav-guest-btns');
            const userMenu  = document.getElementById('nav-user-menu');

            // Si el header aún no se ha inyectado, reintentar
            if (!guestBtns && !userMenu) return false;

            if (user) {
                // ───── LOGUEADO ─────

                // — Determinar nombre de display —
                const displayName = user.displayName || user.email || '';
                const shortName   = displayName.includes('@')
                    ? displayName.split('@')[0]
                    : displayName.split(' ')[0];
                const initial = shortName.charAt(0).toUpperCase() || '?';

                // ─── DESKTOP: ocultar guest, mostrar user menu ───
                if (guestBtns) guestBtns.style.display = 'none';
                if (userMenu)  userMenu.style.display  = 'flex';

                // ─── DESKTOP: poblar avatar ───
                const avatarEl = document.getElementById('nav-user-avatar');
                if (avatarEl) avatarEl.textContent = initial;

                // ─── DESKTOP: badge corona ───
                const crownEl = document.getElementById('nav-avatar-crown');
                if (crownEl) {
                    if (isPremium) crownEl.removeAttribute('hidden');
                    else           crownEl.setAttribute('hidden', '');
                }

                // ─── DESKTOP: dropdown header (nombre + email) ───
                const dropAvatarEl = document.getElementById('nav-dropdown-avatar');
                const dropNameEl   = document.getElementById('nav-dropdown-name');
                const dropEmailEl  = document.getElementById('nav-dropdown-email');
                if (dropAvatarEl) dropAvatarEl.textContent = initial;
                if (dropNameEl)   dropNameEl.textContent   = shortName || user.email;
                if (dropEmailEl)  dropEmailEl.textContent  = user.email;

                // ─── DESKTOP: plan label en dropdown ───
                const planLabelEl = document.getElementById('nav-dropdown-plan-label');
                const planLinkEl  = document.getElementById('nav-dropdown-plan-link');
                if (planLabelEl) planLabelEl.textContent = isPremium ? 'Mi plan 👑' : 'Mejorar plan 👑';
                if (planLinkEl && isPremium) {
                    planLinkEl.href = '/perfil'; // si es premium, va a su perfil de plan
                }

                // ─── DESKTOP: toggle dropdown ───
                const trigger  = document.getElementById('nav-user-trigger');
                const dropdown = document.getElementById('nav-user-dropdown');
                if (trigger && dropdown && !trigger._vitaliaDropdown) {
                    trigger._vitaliaDropdown = true;

                    trigger.addEventListener('click', (e) => {
                        e.stopPropagation();
                        const isOpen = dropdown.classList.contains('is-open');
                        dropdown.classList.toggle('is-open', !isOpen);
                        trigger.setAttribute('aria-expanded', String(!isOpen));
                    });

                    document.addEventListener('click', () => {
                        dropdown.classList.remove('is-open');
                        trigger.setAttribute('aria-expanded', 'false');
                    });

                    document.addEventListener('keydown', (e) => {
                        if (e.key === 'Escape') {
                            dropdown.classList.remove('is-open');
                            trigger.setAttribute('aria-expanded', 'false');
                        }
                    });
                }

                // ─── DESKTOP: logout ───
                const logoutBtn = document.getElementById('nav-logout-btn');
                if (logoutBtn && !logoutBtn._vitaliaLogout) {
                    logoutBtn._vitaliaLogout = true;
                    logoutBtn.addEventListener('click', () => {
                        signOut(auth).then(() => { window.location.href = '/'; });
                    });
                }

                // ─── MOBILE: user block visible, guest hidden ───
                const mobileUserBlock    = document.getElementById('nav-mobile-user-block');
                const mobileGuestBlock   = document.getElementById('nav-mobile-guest-block');
                const mobileUserActions  = document.getElementById('nav-mobile-user-actions');
                if (mobileUserBlock)   mobileUserBlock.style.display  = 'block';
                if (mobileGuestBlock)  mobileGuestBlock.style.display = 'none';
                if (mobileUserActions) mobileUserActions.style.display = 'flex';

                // ─── MOBILE: avatar + nombre + email ───
                const mobileAvatar  = document.getElementById('nav-mobile-avatar');
                const mobileName    = document.getElementById('nav-mobile-name');
                const mobileEmail   = document.getElementById('nav-mobile-email');
                if (mobileAvatar) mobileAvatar.textContent = initial;
                if (mobileName)   mobileName.textContent   = shortName || user.email;
                if (mobileEmail)  mobileEmail.textContent  = user.email;

                // ─── MOBILE: badge corona ───
                const mobileCrown = document.getElementById('nav-mobile-crown');
                if (mobileCrown) {
                    if (isPremium) mobileCrown.removeAttribute('hidden');
                    else           mobileCrown.setAttribute('hidden', '');
                }

                // ─── MOBILE: plan label ───
                const mobilePlanLabel = document.getElementById('nav-mobile-plan-label');
                const mobilePlanLink  = document.getElementById('nav-mobile-plan-link');
                if (mobilePlanLabel) mobilePlanLabel.textContent = isPremium ? 'Mi plan 👑' : 'Mejorar plan 👑';
                if (mobilePlanLink && isPremium) mobilePlanLink.href = '/perfil';

                // ─── MOBILE: logout ───
                const mobileLogoutBtn = document.getElementById('nav-mobile-logout-btn');
                if (mobileLogoutBtn && !mobileLogoutBtn._vitaliaLogout) {
                    mobileLogoutBtn._vitaliaLogout = true;
                    mobileLogoutBtn.addEventListener('click', () => {
                        signOut(auth).then(() => { window.location.href = '/'; });
                    });
                }

                // ─── "Mi espacio" link — quitar lock, navegar normalmente ───
                const espacioLink = document.getElementById('nav-mi-espacio-link');
                if (espacioLink) {
                    espacioLink.classList.remove('is-guest');
                    espacioLink._userLoggedIn = true;
                }
                const mobileEspacioLink = document.getElementById('nav-mobile-espacio-link');
                if (mobileEspacioLink) {
                    mobileEspacioLink.classList.remove('is-guest');
                    mobileEspacioLink._userLoggedIn = true;
                }

            } else {
                // ───── NO LOGUEADO ─────

                // — Desktop: mostrar guest, ocultar user menu —
                if (guestBtns) guestBtns.style.display = 'flex';
                if (userMenu)  userMenu.style.display  = 'none';

                // — Mobile: mostrar guest block, ocultar user block —
                const mobileUserBlock    = document.getElementById('nav-mobile-user-block');
                const mobileGuestBlock   = document.getElementById('nav-mobile-guest-block');
                const mobileUserActions  = document.getElementById('nav-mobile-user-actions');
                if (mobileUserBlock)   mobileUserBlock.style.display  = 'none';
                if (mobileGuestBlock)  mobileGuestBlock.style.display = 'flex';
                if (mobileUserActions) mobileUserActions.style.display = 'none';

                // — "Mi espacio" → mostrar lock + intersticial en lugar de navegar —
                const espacioLink = document.getElementById('nav-mi-espacio-link');
                if (espacioLink) {
                    espacioLink.classList.add('is-guest');
                }
                const mobileEspacioLink = document.getElementById('nav-mobile-espacio-link');
                if (mobileEspacioLink) {
                    mobileEspacioLink.classList.add('is-guest');
                }
            }

            return true;
        };

        // Reintentar hasta que load-components.js inyecte el header
        if (!updateHeaderUI()) {
            const interval = setInterval(() => {
                if (updateHeaderUI()) clearInterval(interval);
            }, 100);
        }
    });
});

// ─────────────────────────────────────────────────────────────
// initHeaderInteractions — llamado desde load-components.js
// después de inyectar el header
// ─────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    // Esperar a que el header esté disponible
    const waitForHeader = setInterval(() => {
        const hamburger = document.getElementById('nav-hamburger');
        if (!hamburger) return;
        clearInterval(waitForHeader);
        initMobilePanel();
        initEspacioInterstitial();
        initHighlightNav();
    }, 80);
});

// ── Mobile panel (drawer) ──────────────────────────────────
function initMobilePanel() {
    const hamburger   = document.getElementById('nav-hamburger');
    const panel       = document.getElementById('nav-mobile-panel');
    const overlay     = document.getElementById('nav-mobile-overlay');
    const closeBtn    = document.getElementById('nav-mobile-close');
    if (!hamburger || !panel || !overlay) return;

    // ★ KEY FIX: Move panel & overlay to <body> so their position:fixed
    //   is resolved relative to the VIEWPORT, not the header's bounding box.
    //   Without this, the panel height was constrained to the header's ~62px.
    if (panel.parentElement !== document.body)   document.body.appendChild(panel);
    if (overlay.parentElement !== document.body) document.body.appendChild(overlay);

    function openPanel() {
        panel.classList.add('is-open');
        overlay.classList.add('is-open');
        overlay.style.display = 'block';
        hamburger.setAttribute('aria-expanded', 'true');
        panel.setAttribute('aria-hidden', 'false');
        overlay.setAttribute('aria-hidden', 'false');
        document.body.classList.add('no-scroll');
    }

    function closePanel() {
        panel.classList.remove('is-open');
        overlay.classList.remove('is-open');
        hamburger.setAttribute('aria-expanded', 'false');
        panel.setAttribute('aria-hidden', 'true');
        overlay.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('no-scroll');
        // Hide overlay after transition
        setTimeout(() => {
            if (!panel.classList.contains('is-open')) {
                overlay.style.display = 'none';
            }
        }, 350);
    }

    hamburger.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = panel.classList.contains('is-open');
        isOpen ? closePanel() : openPanel();
    });

    if (closeBtn)  closeBtn.addEventListener('click', closePanel);
    overlay.addEventListener('click', closePanel);

    // Close on Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && panel.classList.contains('is-open')) closePanel();
    });

    // Close when a mobile nav link is clicked
    panel.querySelectorAll('.nav-mobile-link, .nav-mobile-btn').forEach(link => {
        link.addEventListener('click', () => {
            // Only close if it's not a button intercepted by intersticial
            setTimeout(closePanel, 80);
        });
    });
}

// ── Intersticial "Mi espacio" (no logueado) ──────────────
function initEspacioInterstitial() {
    const interstitial = document.getElementById('espacio-interstitial');
    const backdrop     = document.getElementById('espacio-interstitial-backdrop');
    const closeBtn     = document.getElementById('espacio-interstitial-close');

    if (!interstitial) return;

    // ★ KEY FIX: Move interstitial to <body> so it's not inside the header's
    //   stacking context (position:fixed + z-index creates containment). Without
    //   this, the modal gets clipped, appearing only half-visible.
    if (interstitial.parentElement !== document.body) {
        document.body.appendChild(interstitial);
        // Remove the inline display:none that was set to prevent flash during the move
        interstitial.style.display = '';
    }

    function openInterstitial() {
        interstitial.classList.add('is-open');
        interstitial.setAttribute('aria-hidden', 'false');
        document.body.classList.add('no-scroll');
    }

    function closeInterstitial() {
        interstitial.classList.remove('is-open');
        interstitial.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('no-scroll');
    }

    // Desktop nav "Mi espacio" — intercept si no logueado
    const espacioLink = document.getElementById('nav-mi-espacio-link');
    if (espacioLink) {
        espacioLink.addEventListener('click', (e) => {
            if (!espacioLink._userLoggedIn) {
                e.preventDefault();
                openInterstitial();
            }
        });
    }

    // Mobile nav "Mi espacio" — intercept si no logueado
    const mobileEspacioLink = document.getElementById('nav-mobile-espacio-link');
    if (mobileEspacioLink) {
        mobileEspacioLink.addEventListener('click', (e) => {
            if (!mobileEspacioLink._userLoggedIn) {
                e.preventDefault();
                openInterstitial();
            }
        });
    }

    // Close on backdrop / close button / Escape
    if (backdrop) backdrop.addEventListener('click', closeInterstitial);
    if (closeBtn)  closeBtn.addEventListener('click', closeInterstitial);
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && interstitial.classList.contains('is-open')) closeInterstitial();
    });
}

// ── Active nav highlight ──────────────────────────────────
function initHighlightNav() {
    const currentPath = window.location.pathname.replace(/\/$/, '').replace('.html', '').replace('/pages', '');

    // Desktop header nav
    document.querySelectorAll('.header-nav-link').forEach(link => {
        const href = link.getAttribute('href');
        if (!href) return;
        const cleanHref = href.replace(/\/$/, '').replace('.html', '').replace('/pages', '');
        if (
            cleanHref === currentPath ||
            (cleanHref !== '' && cleanHref !== '/' && currentPath.startsWith(cleanHref)) ||
            (cleanHref === '/' && (currentPath === '' || currentPath === '/'))
        ) {
            link.classList.add('active');
        }
    });

    // Mobile nav links
    document.querySelectorAll('.nav-mobile-link[href]').forEach(link => {
        const href = link.getAttribute('href');
        if (!href) return;
        const cleanHref = href.replace(/\/$/, '').replace('.html', '').replace('/pages', '');
        if (
            cleanHref === currentPath ||
            (cleanHref !== '' && cleanHref !== '/' && currentPath.startsWith(cleanHref)) ||
            (cleanHref === '/' && (currentPath === '' || currentPath === '/'))
        ) {
            link.classList.add('active');
        }
    });
}
