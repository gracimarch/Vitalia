/**
 * Component: Custom Audio Player
 * Handles play/pause, progress bar updates, and single-audio-at-a-time logic.
 */
document.addEventListener('DOMContentLoaded', function () {
    let currentAudio = null;
    let currentAudioButton = null;

    // --- Selectors ---
    const playButtons = document.querySelectorAll('.audio-button');
    const players = document.querySelectorAll('.custom-audio-player');

    // --- Helpers ---
    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }

    const updateProgressBar = (audio, progressBar, currentTimeDisplay) => {
        if (!audio.duration) return;

        const duration = audio.duration;
        const currentTime = audio.currentTime;
        const percentage = (currentTime / duration) * 100;

        progressBar.style.width = percentage + '%';
        if (currentTimeDisplay) {
            currentTimeDisplay.textContent = formatTime(currentTime);
        }
    };

    // --- Event Listeners: Play/Pause Buttons ---
    playButtons.forEach(button => {
        button.addEventListener('click', function () {
            const container = this.nextElementSibling;
            if (!container) return;

            const audio = container.querySelector('audio');
            if (!audio) return;

            const playPauseBtnImg = this.querySelector('img');

            // Pause current audio if switching to a new one
            if (currentAudio && currentAudio !== audio) {
                currentAudio.pause();
                if (currentAudioButton) {
                    const prevImg = currentAudioButton.querySelector('img');
                    if (prevImg) prevImg.src = '/assets/images/ui/icono-reproducir.webp';
                }
            }

            // Toggle Play/Pause
            if (audio.paused) {
                audio.play();
                if (playPauseBtnImg) playPauseBtnImg.src = '/assets/images/ui/icono-pausar.webp';
                currentAudio = audio;
                currentAudioButton = button;
            } else {
                audio.pause();
                if (playPauseBtnImg) playPauseBtnImg.src = '/assets/images/ui/icono-reproducir.webp';
                currentAudio = null;
                currentAudioButton = null;
            }

            // Reset when audio ends
            audio.addEventListener('ended', function () {
                if (playPauseBtnImg) playPauseBtnImg.src = '/assets/images/ui/icono-reproducir.webp';
                currentAudio = null;
                currentAudioButton = null;
            }, { once: true });
        });
    });

    // --- Event Listeners: Player Controls (Progress Bar) ---
    players.forEach(player => {
        const audio = player.querySelector('audio');
        const progressBar = player.querySelector('.progress-bar');
        const currentTimeDisplay = player.querySelector('.current-time');
        const durationDisplay = player.querySelector('.duration-time');

        if (audio && progressBar && currentTimeDisplay) {
            // Update progress while playing
            audio.addEventListener('timeupdate', function () {
                updateProgressBar(audio, progressBar, currentTimeDisplay);
            });

            // Set total duration on load
            audio.addEventListener('loadedmetadata', function () {
                if (durationDisplay) {
                    durationDisplay.textContent = formatTime(audio.duration);
                }
            });

            // Seek functionality
            if (progressBar.parentElement) {
                progressBar.parentElement.addEventListener('click', function (e) {
                    const rect = this.getBoundingClientRect();
                    const offsetX = e.clientX - rect.left;
                    const width = rect.width;
                    const percentage = offsetX / width;
                    const newTime = percentage * audio.duration;

                    if (isFinite(newTime)) {
                        audio.currentTime = newTime;
                        updateProgressBar(audio, progressBar, currentTimeDisplay);
                    }
                });
            }
        }
    });

    // --- Event Listeners: Meditation Cards (Merged Logic) ---
    const meditationCards = document.querySelectorAll('.meditation-card');
    meditationCards.forEach(card => {
        const btn = card.querySelector('.meditation-btn');
        const audio = card.querySelector('audio');
        // Progress bar inside .meditation-controls -> .progress-container -> .progress-bar
        const progressBar = card.querySelector('.progress-bar');
        const progressContainer = card.querySelector('.progress-container');
        const currentTimeDisplay = card.querySelector('.current-time');
        const totalTimeDisplay = card.querySelector('.total-time'); // Select Total Time
        const icon = btn ? btn.querySelector('i') : null;

        if (!audio || !btn) return;

        // Load Metadata to set Total Duration
        audio.addEventListener('loadedmetadata', () => {
            if (totalTimeDisplay) {
                totalTimeDisplay.textContent = formatTime(audio.duration);
            }
        });

        // Toggle Play/Pause
        btn.addEventListener('click', () => {
            if (audio.paused) {
                // Pause currently playing audio if any
                if (currentAudio && currentAudio !== audio) {
                    currentAudio.pause();
                    // Reset standard button if exists
                    if (currentAudioButton) {
                        const prevImg = currentAudioButton.querySelector('img');
                        if (prevImg) prevImg.src = '/assets/images/ui/icono-reproducir.webp';
                    }
                    // Reset other meditation cards
                    meditationCards.forEach(c => {
                        const cAudio = c.querySelector('audio');
                        const cBtn = c.querySelector('.meditation-btn');
                        if (cAudio !== audio && cBtn) {
                            cAudio.pause();
                            const cIcon = cBtn.querySelector('i');
                            if (cIcon) cIcon.className = 'bi bi-play-fill';
                            cBtn.classList.remove('playing');
                        }
                    });
                }

                audio.play();
                if (icon) icon.className = 'bi bi-pause-fill';
                btn.classList.add('playing');
                currentAudio = audio;
                // currentAudioButton = btn; // Keep separate to avoid img vs i conflicts
            } else {
                audio.pause();
                if (icon) icon.className = 'bi bi-play-fill';
                btn.classList.remove('playing');
                currentAudio = null;
            }
        });

        // Update Progress
        audio.addEventListener('timeupdate', () => {
            updateProgressBar(audio, progressBar, currentTimeDisplay);
        });

        // Seek & Scrubbing Functionality for Meditations
        if (progressContainer) {
            let isDragging = false;

            const handleScrub = (e) => {
                const rect = progressContainer.getBoundingClientRect();
                const offsetX = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
                const width = rect.width;
                const percentage = Math.max(0, Math.min(1, offsetX / width));
                const newTime = percentage * audio.duration;

                if (isFinite(newTime)) {
                    audio.currentTime = newTime;
                    updateProgressBar(audio, progressBar, currentTimeDisplay);
                }
            };

            const handleScrubVisual = (e) => {
                const rect = progressContainer.getBoundingClientRect();
                const offsetX = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
                const width = rect.width;
                const percentage = Math.max(0, Math.min(1, offsetX / width));

                // Solo actualizar la barra visualmente, no el audio
                progressBar.style.width = (percentage * 100) + '%';
                if (currentTimeDisplay) {
                    currentTimeDisplay.textContent = formatTime(percentage * audio.duration);
                }
            };

            // Hover Position Update (for gray bar)
            progressContainer.addEventListener('mousemove', (e) => {
                // Ignore if we are dragging, because dragging has its own visual feedback 
                // but updating the variable is harmless since --hover-pos will just match the bar
                const rect = progressContainer.getBoundingClientRect();
                const offsetX = e.clientX - rect.left;
                const width = rect.width;
                const percentage = Math.max(0, Math.min(1, offsetX / width));
                progressContainer.style.setProperty('--hover-pos', (percentage * 100) + '%');
            });

            progressContainer.addEventListener('mouseleave', () => {
                progressContainer.style.setProperty('--hover-pos', '0%');
            });

            progressContainer.addEventListener('mousedown', (e) => {
                isDragging = true;
                progressContainer.classList.add('dragging');
                handleScrubVisual(e);
            });

            // Touch support
            progressContainer.addEventListener('touchstart', (e) => {
                isDragging = true;
                progressContainer.classList.add('dragging');
                handleScrubVisual(e);
            }, { passive: true });

            document.addEventListener('mousemove', (e) => {
                if (isDragging) {
                    handleScrubVisual(e);
                }
            });

            document.addEventListener('touchmove', (e) => {
                if (isDragging) {
                    handleScrubVisual(e);
                }
            }, { passive: false });

            document.addEventListener('mouseup', (e) => {
                if (isDragging) {
                    isDragging = false;
                    progressContainer.classList.remove('dragging');
                    handleScrub(e);
                }
            });

            document.addEventListener('touchend', (e) => {
                if (isDragging) {
                    isDragging = false;
                    progressContainer.classList.remove('dragging');
                    // For touch events we need the last known touch position if touchend doesn't have it
                    // But handleScrub handles this mostly. To be safe, we could just read the visual percentage back
                    const currentPercent = parseFloat(progressBar.style.width) / 100;
                    if (isFinite(currentPercent)) {
                        audio.currentTime = currentPercent * audio.duration;
                        updateProgressBar(audio, progressBar, currentTimeDisplay);
                    }
                }
            });
        }

        // Reset on End
        audio.addEventListener('ended', () => {
            if (icon) icon.className = 'bi bi-play-fill';
            if (progressBar) progressBar.style.width = '0%';
            if (currentTimeDisplay) currentTimeDisplay.textContent = '0:00';
            btn.classList.remove('playing');
            currentAudio = null;
        });
    });
});
