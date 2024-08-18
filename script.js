document.addEventListener('DOMContentLoaded', function () {
    let currentAudio = null;
    let currentAudioButton = null;

    window.addEventListener('load', function () {
        document.body.classList.add('loaded');
    });

    document.querySelectorAll('.audio-button').forEach(button => {
        button.addEventListener('click', function () {
            const audio = this.nextElementSibling.querySelector('audio');
            const playPauseBtnImg = this.querySelector('img');

            if (currentAudio && currentAudio !== audio) {
                currentAudio.pause();
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

    const updateProgressBar = (audio, progressBar, currentTimeDisplay) => {
        const duration = audio.duration;
        const currentTime = audio.currentTime;

        const percentage = (currentTime / duration) * 100;
        const currentWidth = parseFloat(progressBar.style.width) || 0;
        const step = (percentage - currentWidth) * 0.1;

        if (Math.abs(step) > 0.1) {
            progressBar.style.width = (currentWidth + step) + '%';
            requestAnimationFrame(() => updateProgressBar(audio, progressBar, currentTimeDisplay));
        } else {
            progressBar.style.width = percentage + '%';
        }

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

    const header = document.querySelector('.header');
    const headerPlaceholder = document.createElement('div');
    headerPlaceholder.classList.add('header-placeholder');
    header.parentNode.insertBefore(headerPlaceholder, header);

    window.addEventListener('scroll', function () {
        if (window.scrollY > 50) {
            header.classList.add('fixed');
            headerPlaceholder.style.display = 'block';
        } else {
            header.classList.remove('fixed');
            headerPlaceholder.style.display = 'none';
        }
    });

    setTimeout(() => {
        window.scrollTo(0, 0);
    }, 500);

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {

            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                const offsetTop = targetElement.getBoundingClientRect().top + window.pageYOffset;
                const adjustedOffsetTop = offsetTop - 100;

                window.scrollTo({
                    top: adjustedOffsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });

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
});
