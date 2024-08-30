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

    // Audios y botones de play/pause
    document.querySelectorAll('.audio-button').forEach(button => {
        button.addEventListener('click', function () {
            const audio = this.nextElementSibling.querySelector('audio');
            const playPauseBtnImg = this.querySelector('img');
    
            // Detener el audio actual si es diferente al nuevo
            if (currentAudio && currentAudio !== audio) {
                currentAudio.pause();
                currentAudioButton.querySelector('img').src = 'assets/images/reproducirIconoMeditaciones.png';
            }
    
            // Reproducir o pausar el audio
            if (audio.paused) {
                audio.play();
                playPauseBtnImg.src = 'assets/images/pausarIconoMeditaciones.png';
                currentAudio = audio;
                currentAudioButton = button;
            } else {
                audio.pause();
                playPauseBtnImg.src = 'assets/images/reproducirIconoMeditaciones.png';
                currentAudio = null;
                currentAudioButton = null;
            }
    
            // Restablecer el botón cuando el audio termine
            audio.addEventListener('ended', function () {
                playPauseBtnImg.src = 'assets/images/reproducirIconoMeditaciones.png';
                currentAudio = null;
                currentAudioButton = null;
            });
        });
    });

    // Barra de progreso del audio
    const updateProgressBar = (audio, progressBar, currentTimeDisplay) => {
        const duration = audio.duration;
        const currentTime = audio.currentTime;
        const percentage = (currentTime / duration) * 100;

        progressBar.style.width = percentage + '%';
        currentTimeDisplay.textContent = formatTime(currentTime);
    };

    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }

    document.querySelectorAll('.custom-audio-player').forEach(player => {
        const audio = player.querySelector('audio');
        const progressBar = player.querySelector('.progress-bar');
        const currentTimeDisplay = player.querySelector('.current-time');
        const durationDisplay = player.querySelector('.duration-time');

        audio.addEventListener('timeupdate', function () {
            updateProgressBar(audio, progressBar, currentTimeDisplay);
        });

        audio.addEventListener('loadedmetadata', function () {
            durationDisplay.textContent = formatTime(audio.duration);
        });

        progressBar.addEventListener('click', function (e) {
            const rect = progressBar.getBoundingClientRect();
            const offsetX = e.clientX - rect.left;
            const width = rect.width;
            const percentage = offsetX / width;
            const newTime = percentage * audio.duration;

            audio.currentTime = newTime;
        });
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
});
