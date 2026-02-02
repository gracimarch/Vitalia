document.addEventListener('DOMContentLoaded', () => {
    const cards = document.querySelectorAll('.meditation-card');
    let currentAudio = null;
    let currentBtn = null;

    cards.forEach(card => {
        const btn = card.querySelector('.meditation-btn');
        const audio = card.querySelector('audio');
        const progressBar = card.querySelector('.progress-bar');
        const timeDisplay = card.querySelector('.current-time');
        const icon = btn.querySelector('i');

        if (!audio) return;

        // Toggle Play/Pause
        btn.addEventListener('click', () => {
            if (audio.paused) {
                // Pause currently playing audio if any
                if (currentAudio && currentAudio !== audio) {
                    currentAudio.pause();
                    if (currentBtn) {
                        currentBtn.querySelector('i').className = 'bi bi-play-fill';
                        currentBtn.classList.remove('playing');
                    }
                }

                audio.play();
                icon.className = 'bi bi-pause-fill';
                currentAudio = audio;
                currentBtn = btn;
            } else {
                audio.pause();
                icon.className = 'bi bi-play-fill';
                currentAudio = null;
                currentBtn = null;
            }
        });

        // Update Progress
        audio.addEventListener('timeupdate', () => {
            if (audio.duration) {
                const percent = (audio.currentTime / audio.duration) * 100;
                progressBar.style.width = `${percent}%`;
                timeDisplay.textContent = formatTime(audio.currentTime);
            }
        });

        // Reset on End
        audio.addEventListener('ended', () => {
            icon.className = 'bi bi-play-fill';
            progressBar.style.width = '0%';
            timeDisplay.textContent = '0:00';
            currentAudio = null;
            currentBtn = null;
        });
    });

    function formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }
});
