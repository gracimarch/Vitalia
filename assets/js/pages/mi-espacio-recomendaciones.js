import { db, auth } from '../auth/firebase.js';
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js";
import { getUserSession } from '../auth/auth-state.js';

document.addEventListener('DOMContentLoaded', async () => {

    // Referencias a los contenedores
    const lecturasGrid = document.getElementById('dynamic-readings-list');
    const rutinasGrid = document.getElementById('dynamic-routines-list');
    const dietasGrid = document.getElementById('dynamic-food-list');
    const emptyState = document.getElementById('empty-scores-state');

    // ── Función central: eliminar skeletons y mostrar estado vacío ──
    function mostrarEmptyState() {
        clearSkeletons();
        if (emptyState) emptyState.style.display = 'block';

        const btn = document.getElementById('refresh-recommendations-btn');
        const msg = document.getElementById('refresh-recommendations-msg');
        if (!btn) return;

        btn.addEventListener('click', async () => {
            btn.disabled = true;
            btn.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 16 16" style="margin-right: 8px; animation: spin 1s linear infinite;">
                    <path fill-rule="evenodd" d="M14 2.5a.5.5 0 0 0-.5-.5h-6a.5.5 0 0 0 0 1h4.793L2.146 13.146a.5.5 0 0 0 .708.708L13 3.707V8.5a.5.5 0 0 0 1 0z"/>
                </svg> Generando con IA...`;
            if (msg) {
                msg.innerHTML = '⏳ El servidor de IA se está activando, esto puede tardar <strong>hasta 60 segundos</strong> la primera vez. Espera un momento...';
                msg.style.color = '#888';
            }

            try {
                const user = await getUserSession();
                if (!user) throw new Error('Sin sesión');

                const res = await fetch('https://vitalia-core-api.onrender.com/api/v1/scores/generate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ uid: user.uid })
                });

                const rawResponse = await res.text();
                console.log("-----------------------------------------");
                console.log("📡 DEBUGGING API RE-GENERATOR");
                console.log("Status Code:", res.status);
                console.log("Response Body:", rawResponse);
                console.log("-----------------------------------------");

                if (!res.ok) throw new Error('Fallo en la API, status: ' + res.status + ' Detalle: ' + rawResponse);

                if (msg) {
                    msg.textContent = '✅ ¡Recomendaciones generadas! Recargando tu espacio...';
                    msg.style.color = 'var(--primary)';
                }

                // Polling: verificar cada 4s si el doc existe en Firestore
                let attempts = 0;
                const pollInterval = setInterval(async () => {
                    attempts++;
                    try {
                        const checkSnap = await getDoc(doc(db, 'scores', user.uid));
                        if (checkSnap.exists() || attempts >= 10) {
                            clearInterval(pollInterval);
                            window.location.reload();
                        }
                    } catch (_) {
                        clearInterval(pollInterval);
                        window.location.reload();
                    }
                }, 4000);

            } catch (err) {
                console.error('Error al generar recomendaciones:', err);
                if (msg) {
                    msg.textContent = 'Ocurrió un error de conexión. Intenta de nuevo en unos segundos.';
                    msg.style.color = 'red';
                }
                btn.disabled = false;
                btn.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 16 16" style="margin-right: 8px;">
                        <path fill-rule="evenodd" d="M14 2.5a.5.5 0 0 0-.5-.5h-6a.5.5 0 0 0 0 1h4.793L2.146 13.146a.5.5 0 0 0 .708.708L13 3.707V8.5a.5.5 0 0 0 1 0z"/>
                    </svg> Generar mis recomendaciones de IA`;
            }
        });
    }

    // ── Eliminar los skeleton-cards de todos los grids ──
    function clearSkeletons() {
        if (lecturasGrid) lecturasGrid.innerHTML = '';
        if (rutinasGrid) rutinasGrid.innerHTML = '';
        if (dietasGrid) dietasGrid.innerHTML = '';
    }

    // ── Mensaje de sección vacía cuando hay score pero sin items para ese slug ──
    function renderEmptySection(grid, message) {
        if (!grid) return;
        grid.innerHTML = `
            <div style="padding: 2rem 1rem; text-align: center; color: #999; width: 100%; grid-column: 1/-1;">
                <i class="fa-solid fa-magnifying-glass" style="font-size: 1.5rem; margin-bottom: 0.5rem; display:block;"></i>
                <p style="margin: 0; font-size: 0.9rem;">${message}</p>
            </div>
        `;
    }

    try {
        const user = await getUserSession();

        if (!user) {
            // Sin sesión: limpiar skeletons (auth-state redirigirá)
            clearSkeletons();
            return;
        }

        // 1. Verificar UID actual
        console.log("-----------------------------------------");
        console.log("🔍 DEBUGGING FIRESTORE SCORES");
        console.log("UID actual (getUserSession):", user.uid);
        console.log("UID actual (auth.currentUser):", auth?.currentUser?.uid);
        console.log("Colección consultada: 'scores'");
        console.log("ID del documento:", user.uid);
        console.log("Ruta exacta:", `scores/${user.uid}`);
        console.log("-----------------------------------------");

        // Consultar el "score" (recomendaciones)
        const scoreRef = doc(db, 'scores', user.uid);
        const scoreSnap = await getDoc(scoreRef);

        if (!scoreSnap.exists() || !scoreSnap.data()) {
            console.log('[Mi Espacio] Sin scores en Firestore → mostrando empty state.');
            mostrarEmptyState();
            return;
        }

        const scoreData = scoreSnap.data();
        console.log('[Mi Espacio] Firestore datos encontrados:', scoreData);

        // Verificar si los arrays están vacíos
        const isEmpty = (
            !scoreData.planes_alimenticios?.length &&
            !scoreData.rutinas?.length &&
            !scoreData.articulos?.length
        );

        if (isEmpty) {
            console.log('[Mi Espacio] Arrays de recomendación vacíos → empty state.');
            mostrarEmptyState();
            return;
        }

        // ── Fetch catálogos estáticos en paralelo ──
        const [resDietas, resRutinas, resLecturas] = await Promise.all([
            fetch('/assets/data/dietas.json').then(r => r.ok ? r.json() : { dietas: [] }),
            fetch('/assets/data/rutina.json').then(r => r.ok ? r.json() : { rutinas: [] }),
            fetch('/assets/data/lecturas.json').then(r => r.ok ? r.json() : { lecturas: [] })
        ]);

        const catDietas = resDietas.dietas || [];
        const catRutinas = resRutinas.rutinas || [];
        const catLecturas = resLecturas.lecturas || [];

        // ── RENDER LECTURAS ──
        if (lecturasGrid && scoreData.articulos?.length) {
            lecturasGrid.innerHTML = '';
            const rendered = [];
            scoreData.articulos.slice(0, 4).forEach(slug => {
                const item = catLecturas.find(i => i.slug === slug);
                if (item) {
                    lecturasGrid.appendChild(createLecturaCard(item));
                    rendered.push(slug);
                }
            });
            if (rendered.length === 0) {
                renderEmptySection(lecturasGrid, 'No encontramos las lecturas recomendadas. Genera nuevas recomendaciones.');
            } else {
                agregarTarjetaBlog(lecturasGrid);
            }
        } else if (lecturasGrid) {
            renderEmptySection(lecturasGrid, 'Aún no tienes lecturas recomendadas.');
        }

        // ── RENDER RUTINAS ──
        if (rutinasGrid && scoreData.rutinas?.length) {
            rutinasGrid.innerHTML = '';
            const rendered = [];
            scoreData.rutinas.slice(0, 4).forEach(slug => {
                const item = catRutinas.find(i => i.slug === slug);
                if (item) {
                    rutinasGrid.appendChild(createRutinaCard(item));
                    rendered.push(slug);
                }
            });
            if (rendered.length === 0) {
                renderEmptySection(rutinasGrid, 'No encontramos las rutinas recomendadas. Genera nuevas recomendaciones.');
            }
        } else if (rutinasGrid) {
            renderEmptySection(rutinasGrid, 'Aún no tienes rutinas recomendadas.');
        }

        // ── RENDER DIETAS ──
        if (dietasGrid && scoreData.planes_alimenticios?.length) {
            dietasGrid.innerHTML = '';
            const rendered = [];
            scoreData.planes_alimenticios.slice(0, 4).forEach(slug => {
                const item = catDietas.find(i => i.slug === slug);
                if (item) {
                    dietasGrid.appendChild(createDietaCard(item));
                    rendered.push(slug);
                }
            });
            if (rendered.length === 0) {
                renderEmptySection(dietasGrid, 'No encontramos los planes alimenticios recomendados. Genera nuevas recomendaciones.');
            }
        } else if (dietasGrid) {
            renderEmptySection(dietasGrid, 'Aún no tienes planes alimenticios recomendados.');
        }

    } catch (error) {
        console.error('[Mi Espacio] Error cargando recomendaciones:', error);
        // En caso de error inesperado: limpiar skeletons y mostrar estado vacío
        clearSkeletons();
        mostrarEmptyState();
    }
});

// ─────────────────────────────────────────────────────────────────────
// Card creators
// ─────────────────────────────────────────────────────────────────────

function createLecturaCard(item) {
    const card = document.createElement('a');
    card.href = `/lecturas/${item.slug}`;
    card.className = 'article-card';

    const category = item.category || 'Bienestar';
    const title = item.title || 'Artículo';
    const duration = item.readingTime || '5 min';

    card.innerHTML = `
        <p>${category}</p>
        <div class="heading-time">
            <h3>${title}</h3>
            <div class="reading-time">
                <i class="fa-solid fa-clock"></i>
                <span>${duration}</span>
            </div>
        </div>
    `;
    return card;
}

function agregarTarjetaBlog(container) {
    const blogLinkCard = document.createElement('div');
    blogLinkCard.className = 'blog-info-card';
    blogLinkCard.id = 'blog';
    blogLinkCard.innerHTML = `
        <div class="blog-info-text">
            <h3>¿No Encuentras lo que Buscas?</h3>
            <p>Echa un vistazo a nuestro blog completo para acceder a una variedad de artículos útiles</p>
        </div>
        <a href="/blog" class="btn" target="_blank">
            <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 16 16" class="bi-arrow-up-right"><path fillRule="evenodd" d="M14 2.5a.5.5 0 0 0-.5-.5h-6a.5.5 0 0 0 0 1h4.793L2.146 13.146a.5.5 0 0 0 .708.708L13 3.707V8.5a.5.5 0 0 0 1 0z"/></svg>
            Ir al blog
        </a>
    `;
    container.appendChild(blogLinkCard);
}

function createRutinaCard(item) {
    const card = document.createElement('a');
    card.href = `/rutinas/${item.slug}`;
    card.className = 'routine-card';
    card.innerHTML = `
        <p>${item.level || 'General'}</p>
        <div class="heading-time">
            <h3>${item.title}</h3>
            <div class="reading-time">
                <i class="fa-solid fa-clock"></i>
                <span>${item.duration || 'Variable'}</span>
            </div>
        </div>
    `;
    return card;
}

function createDietaCard(item) {
    const card = document.createElement('a');
    card.href = `/dietas/${item.slug}`;
    card.className = 'food-card';

    let summaryDuracion = 'Recomendado';
    if (item.duration) summaryDuracion = item.duration.toLowerCase().includes('semana') ? 'Plan Semanal' : 'Plan Diario';

    card.innerHTML = `
        <p>${item.type || 'Equilibrada'}</p>
        <div class="heading-time">
            <h3>${item.title}</h3>
            <div class="reading-time">
                <i class="fa-solid fa-clock"></i>
                <span>${summaryDuracion}</span>
            </div>
        </div>
    `;
    return card;
}
