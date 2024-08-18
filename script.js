document.addEventListener('DOMContentLoaded', function () {
    let currentAudio = null;
    let currentAudioButton = null;

    // Funcionalidad para el manejo de audios y botones de play/pause
    document.querySelectorAll('.audio-button').forEach(button => {
        button.addEventListener('click', function () {
            const audio = this.nextElementSibling.querySelector('audio');
            const playPauseBtnImg = this.querySelector('img');

            if (currentAudio && currentAudio !== audio) {
                // Pausa el audio que estaba en reproducción
                currentAudio.pause();
                // Cambia el icono de play a pausa en el botón anterior
                currentAudioButton.querySelector('img').src = 'images/reproducirIconoMeditaciones.png';
            }

            if (audio.paused) {
                audio.play();
                playPauseBtnImg.src = 'images/pausarIconoMeditaciones.png';
                currentAudio = audio;
                currentAudioButton = button;
            } else {
                audio.pause();
                playPauseBtnImg.src = 'images/reproducirIconoMeditaciones.png';
                currentAudio = null;
                currentAudioButton = null;
            }

            audio.addEventListener('ended', function () {
                playPauseBtnImg.src = 'images/reproducirIconoMeditaciones.png';
                currentAudio = null;
                currentAudioButton = null;
            });
        });
    });

    // Funcionalidad para la barra de progreso del audio
    const updateProgressBar = (audio, progressBar, currentTimeDisplay) => {
        const duration = audio.duration;
        const currentTime = audio.currentTime;

        // Utiliza una interpolación para suavizar el movimiento
        const percentage = (currentTime / duration) * 100;
        const currentWidth = parseFloat(progressBar.style.width) || 0;
        const step = (percentage - currentWidth) * 0.1; // Ajusta el factor para la suavidad

        if (Math.abs(step) > 0.1) {
            progressBar.style.width = (currentWidth + step) + '%';
            requestAnimationFrame(() => updateProgressBar(audio, progressBar, currentTimeDisplay));
        } else {
            progressBar.style.width = percentage + '%';
        }

        currentTimeDisplay.textContent = formatTime(currentTime);
    };

    // Formatea el tiempo en minutos y segundos
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

    // Funcionalidad para fijar el header al desplazar la página con animación de desvanecimiento
    const header = document.querySelector('.header');
    const headerPlaceholder = document.createElement('div');
    headerPlaceholder.classList.add('header-placeholder');
    header.parentNode.insertBefore(headerPlaceholder, header);

    window.addEventListener('scroll', function () {
        if (window.scrollY > 50) { // Cambia 50 por el valor en px que desees
            header.classList.add('fixed');
            headerPlaceholder.style.display = 'block';
        } else {
            header.classList.remove('fixed');
            headerPlaceholder.style.display = 'none';
        }
    });

    // Desplazarse al principio de la página con retraso
    setTimeout(() => {
        window.scrollTo(0, 0);
    }, 500); // Ajusta el tiempo según sea necesario

    // Funcionalidad para el desplazamiento ajustado
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault(); // Evita el desplazamiento predeterminado

            // Obtiene el destino del desplazamiento
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                // Calcula la posición de desplazamiento con ajuste
                const offsetTop = targetElement.getBoundingClientRect().top + window.pageYOffset;
                const adjustedOffsetTop = offsetTop - 100; // Ajuste de 100px

                // Realiza el desplazamiento suave
                window.scrollTo({
                    top: adjustedOffsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Funcionalidad para el botón de volver arriba
    const scrollToTopBtn = document.getElementById('scrollToTop');

    window.addEventListener('scroll', function () {
        if (window.scrollY > 200) { // Cambia el valor según cuándo quieres que aparezca el botón
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

    // Funcionalidad para compartir en redes sociales
    document.querySelector('.btn_wrap').addEventListener('click', function () {
        const text = document.getElementById('share-text').innerText;
        const encodedText = encodeURIComponent(text);
        const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${window.location.href}`;
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodedText}`;

        // Abre las URLs de compartición en nuevas pestañas
        window.open(facebookUrl, '_blank');
        window.open(twitterUrl, '_blank');
    });
});
