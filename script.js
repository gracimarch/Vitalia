document.addEventListener('DOMContentLoaded', function () {
    let currentAudio = null;
    let currentAudioButton = null;
    let lastScrollPosition = 0;
    const header = document.querySelector('.header');

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

    window.addEventListener('scroll', function () {
        const currentScrollPosition = window.pageYOffset;

        if (currentScrollPosition > lastScrollPosition) {
            header.classList.add('hidden');
        } else {
            header.classList.remove('hidden');
        }

        lastScrollPosition = currentScrollPosition;
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
