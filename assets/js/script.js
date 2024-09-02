document.addEventListener('DOMContentLoaded', function () {
    let currentAudio = null;
    let currentAudioButton = null;
    let lastScrollPosition = 0;
    const header = document.querySelector('.header');
    const loader = document.getElementById('loader');
    const body = document.body;

    // No permitir que el usuario scrollee mientras esté la pantalla de carga
    window.addEventListener('load', function () {
        loader.style.display = 'none';
        body.classList.remove('no-scroll');
    });

    // Mantener 'no-scroll' hasta que esté completamente cargada
    window.addEventListener('load', function () {
        body.classList.remove('no-scroll');

        // Animación de los blocks
        const blocks = document.querySelectorAll('.articles .block, .articles .info-block, .lecturas .block, .lecturas .info-block, .reading .reading-section, .welcome .welcome-section, .ejercicios .block, .thanks .thanks-section, .audio-blocks .audio-block');

        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate');
                    observer.unobserve(entry.target);
                }
            });
        });

        blocks.forEach(block => {
            observer.observe(block);
        });

    });

    // Manejador de audios y botones de play/pause
    document.querySelectorAll('.audio-button').forEach(button => {
        button.addEventListener('click', function () {
            const audio = this.nextElementSibling.querySelector('audio');
            const playPauseBtnImg = this.querySelector('img');
        
            // Detener el audio actual si es diferente al nuevo
            if (currentAudio && currentAudio !== audio) {
                currentAudio.pause();
                currentAudioButton.querySelector('img').src = 'assets/images/reproducirIconoMeditaciones.webp';
            }
        
            // Reproducir o pausar el audio
            if (audio.paused) {
                audio.play();
                playPauseBtnImg.src = 'assets/images/pausarIconoMeditaciones.webp';
                currentAudio = audio;
                currentAudioButton = button;
            } else {
                audio.pause();
                playPauseBtnImg.src = 'assets/images/reproducirIconoMeditaciones.webp';
                currentAudio = null;
                currentAudioButton = null;
            }
        
            // Restablecer el botón cuando el audio termine
            audio.addEventListener('ended', function () {
                playPauseBtnImg.src = 'assets/images/reproducirIconoMeditaciones.webp';
                currentAudio = null;
                currentAudioButton = null;
            });
        });
    });

    // Función para actualizar la barra de progreso y el tiempo actual
    const updateProgressBar = (audio, progressBar, currentTimeDisplay) => {
        if (audio.duration) {
            const duration = audio.duration;
            const currentTime = audio.currentTime;
            const percentage = (currentTime / duration) * 100;

            progressBar.style.width = percentage + '%';
            if (currentTimeDisplay) {
                currentTimeDisplay.textContent = formatTime(currentTime);
            }
        }
    };

    // Función para formatear el tiempo en minutos y segundos
    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }

    // Configuración de cada reproductor de audio
    document.querySelectorAll('.custom-audio-player').forEach(player => {
        const audio = player.querySelector('audio');
        const progressBar = player.querySelector('.progress-bar');
        const currentTimeDisplay = player.querySelector('.current-time');
        const durationDisplay = player.querySelector('.duration-time');
    
        if (audio && progressBar && currentTimeDisplay) {
            // Actualiza la barra de progreso durante la reproducción
            audio.addEventListener('timeupdate', function () {
                updateProgressBar(audio, progressBar, currentTimeDisplay);
            });
    
            // Muestra la duración total del audio cuando se carga la metadata
            audio.addEventListener('loadedmetadata', function () {
                if (durationDisplay) {
                    durationDisplay.textContent = formatTime(audio.duration);
                }
            });
    
            // Permite hacer clic en la barra de progreso para cambiar el tiempo de reproducción
            progressBar.parentElement.addEventListener('click', function (e) {
                const rect = this.getBoundingClientRect();
                const offsetX = e.clientX - rect.left;
                const width = rect.width;
                const percentage = offsetX / width;
                const newTime = percentage * audio.duration;
    
                audio.currentTime = newTime;
                updateProgressBar(audio, progressBar, currentTimeDisplay);
            });
        }
    });    

    // Animación de desplazamiento suave del header
    window.addEventListener('scroll', function () {
        const currentScrollPosition = window.pageYOffset;

        if (currentScrollPosition > lastScrollPosition) {
            header.classList.add('hidden');
        } else {
            header.classList.remove('hidden');
        }

        lastScrollPosition = currentScrollPosition;
    });

    // Botón de volver arriba
    const scrollToTopBtn = document.getElementById('scrollToTop');

    window.addEventListener('scroll', function () {
        if (window.scrollY > 200) {
            scrollToTopBtn.classList.add('show');
        } else {
            scrollToTopBtn.classList.remove('show');
        }
    });

    scrollToTopBtn.addEventListener('click', function () {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // Añadir 'no-scroll' a la web mientras el loader está visible
    body.classList.add('no-scroll');

    // Cambiar la reflexión del día
    const phrases = [
        "Estás exactamente donde necesitas estar en este momento",
        "Confía en el proceso, estás creciendo cada día",
        "Hoy es el mejor día para cuidar de ti",
        "Cada pequeño avance es un gran logro en tu camino",
        "La paz interior se encuentra en el momento presente",
        "Donde estás ahora es justo donde necesitas estar",
        "La calma que buscas está dentro de ti",
        "Cada respiro es una nueva oportunidad para empezar de nuevo",
        "Eres más fuerte de lo que crees, sigue adelante",
        "Escucha a tu cuerpo y mente, ellos saben lo que necesitas",
        "Tu bienestar es una prioridad, no una opción",
        "El viaje hacia la paz interior comienza ahora",
        "Abraza el presente, es un regalo para tu bienestar",
        "Hoy elige cuidarte con amor y paciencia",
        "La gratitud transforma el momento presente en suficiente",
        "Estás creando un futuro lleno de bienestar y equilibrio",
        "El equilibrio que buscas comienza desde dentro",
        "Hoy es el día perfecto para reconectar contigo",
        "Cada día es una nueva oportunidad para nutrir tu mente y tu cuerpo",
        "Tu bienestar es una inversión en tu felicidad futura"
    ];

    const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];

    document.getElementById("share-text").textContent = `"${randomPhrase}"`;
});
