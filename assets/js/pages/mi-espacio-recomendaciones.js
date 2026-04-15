import { db } from '../auth/firebase.js';
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js";
import { getUserSession } from '../auth/auth-state.js';

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const user = await getUserSession();
        if (!user) return; // auth-state redirige

        // Referencias a los contenedores
        const lecturasGrid = document.getElementById('dynamic-readings-list');
        const rutinasGrid = document.getElementById('dynamic-routines-list');
        const dietasGrid = document.getElementById('dynamic-food-list');
        const emptyState = document.getElementById('empty-scores-state');

        // Consultar el "score" (recomendaciones)
        const scoreRef = doc(db, "scores", user.uid);
        const scoreSnap = await getDoc(scoreRef);

        if (!scoreSnap.exists() || !scoreSnap.data()) {
            mostrarEmptyState();
            return;
        }

        const scoreData = scoreSnap.data();
        
        // Verificar si los arrays están vacíos
        const isEmpty = (!scoreData.planes_alimenticios?.length && !scoreData.rutinas?.length && !scoreData.articulos?.length);
        if (isEmpty) {
            mostrarEmptyState();
            return;
        }

        // Si tenemos recomendaciones, hacemos fetch a los catálogos estáticos en paralelo
        const [resDietas, resRutinas, resLecturas] = await Promise.all([
            fetch('/assets/data/dietas.json').then(r => r.ok ? r.json() : { dietas: [] }),
            fetch('/assets/data/rutina.json').then(r => r.ok ? r.json() : { rutinas: [] }),
            fetch('/assets/data/lecturas.json').then(r => r.ok ? r.json() : { lecturas: [] })
        ]);

        const catDietas = resDietas.dietas || [];
        const catRutinas = resRutinas.rutinas || [];
        const catLecturas = resLecturas.lecturas || [];

        // RENDER LECTURAS
        if (lecturasGrid && scoreData.articulos) {
            lecturasGrid.innerHTML = '';
            scoreData.articulos.slice(0, 4).forEach(slug => {
                const item = catLecturas.find(i => i.slug === slug);
                if (item) lecturasGrid.appendChild(createLecturaCard(item));
            });
            agregarTarjetaBlog(lecturasGrid);
        }

        // RENDER RUTINAS
        if (rutinasGrid && scoreData.rutinas) {
            rutinasGrid.innerHTML = '';
            scoreData.rutinas.slice(0, 4).forEach(slug => {
                const item = catRutinas.find(i => i.slug === slug);
                if (item) rutinasGrid.appendChild(createRutinaCard(item));
            });
        }

        // RENDER DIETAS
        if (dietasGrid && scoreData.planes_alimenticios) {
            dietasGrid.innerHTML = '';
            scoreData.planes_alimenticios.slice(0, 4).forEach(slug => {
                const item = catDietas.find(i => i.slug === slug);
                if (item) dietasGrid.appendChild(createDietaCard(item));
            });
        }

        function mostrarEmptyState() {
            if (lecturasGrid) lecturasGrid.innerHTML = '';
            if (rutinasGrid) rutinasGrid.innerHTML = '';
            if (dietasGrid) dietasGrid.innerHTML = '';
            if (emptyState) emptyState.style.display = 'block';

            const btn = document.getElementById('refresh-recommendations-btn');
            const msg = document.getElementById('refresh-recommendations-msg');
            if (btn) {
                btn.addEventListener('click', async () => {
                    btn.disabled = true;
                    btn.textContent = 'Generando con IA... (puede tardar)';
                    try {
                        const res = await fetch('/api/v1/scores/generate', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ uid: user.uid })
                        });
                        if (res.ok) {
                            msg.textContent = '¡Recomendaciones generadas! Recargando...';
                            msg.style.color = 'var(--primary)';
                            setTimeout(() => window.location.reload(), 1500);
                        } else {
                            throw new Error('Fallo en la API');
                        }
                    } catch (err) {
                        console.error(err);
                        msg.textContent = 'Ocurrió un error. Intenta nuevamente.';
                        msg.style.color = 'red';
                        btn.disabled = false;
                        btn.textContent = 'Generar mis recomendaciones de IA';
                    }
                });
            }
        }

    } catch (error) {
        console.error("Error cargando recomendaciones:", error);
    }
});

function createLecturaCard(item) {
    const card = document.createElement('a');
    card.href = `/lecturas/${item.slug}`;
    card.className = 'article-card';
    
    const category = item.category || 'Bienestar';
    const title = item.title || 'Artículo';
    const duration = item.readingTime || '5 min';

    card.innerHTML = `
        <div class="article-header">
            <span class="article-category">${category}</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 16 16" class="bi-arrow-up-right icon-arrow"><path fillRule="evenodd" d="M14 2.5a.5.5 0 0 0-.5-.5h-6a.5.5 0 0 0 0 1h4.793L2.146 13.146a.5.5 0 0 0 .708.708L13 3.707V8.5a.5.5 0 0 0 1 0z"/></svg>
        </div>
        <div>
            <h3 class="article-title">${title}</h3>
            <div class="article-meta">
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
        <div class="article-header">
            <span class="article-category">${item.level || 'General'}</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 16 16" class="bi-arrow-up-right" style="font-size: 1.2rem; color: #333;"><path fillRule="evenodd" d="M14 2.5a.5.5 0 0 0-.5-.5h-6a.5.5 0 0 0 0 1h4.793L2.146 13.146a.5.5 0 0 0 .708.708L13 3.707V8.5a.5.5 0 0 0 1 0z"/></svg>
        </div>
        <div>
            <h3 class="article-title">${item.title}</h3>
            <div class="article-meta">
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
    
    // Determinar duración de la dieta basándose en si tiene 1 día o varios días (semanal)
    let summaryDuracion = 'Recomendado';
    if (item.duration) summaryDuracion = item.duration.toLowerCase().includes('semana') ? 'Plan Semanal' : 'Plan Diario';

    card.innerHTML = `
        <div class="article-header">
            <span class="article-category">${item.type || 'Equilibrada'}</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 16 16" class="bi-arrow-up-right" style="font-size: 1.2rem; color: #333;"><path fillRule="evenodd" d="M14 2.5a.5.5 0 0 0-.5-.5h-6a.5.5 0 0 0 0 1h4.793L2.146 13.146a.5.5 0 0 0 .708.708L13 3.707V8.5a.5.5 0 0 0 1 0z"/></svg>
        </div>
        <div>
            <h3 class="article-title">${item.title}</h3>
            <div class="article-meta">
                <i class="fa-solid fa-clock"></i>
                <span>${summaryDuracion}</span>
            </div>
        </div>
    `;
    return card;
}
