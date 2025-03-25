let countdownInterval;
let isRunning = false;
const countdownCircle = document.querySelector(".countdown-circle");
const countdownText = document.getElementById("countdown");
const pauseButton = document.getElementById("pauseButton");
const circumference = 2 * Math.PI * 45;

function startCountdown() {
  let timeLeft = 5; // Duración fija del temporizador en segundos
  let duration = timeLeft;

  if (!isRunning) {
    isRunning = true;

    // Reset the animation before starting the countdown
    countdownCircle.style.animation = "none";
    countdownCircle.getBoundingClientRect(); // Trigger a reflow
    countdownCircle.style.animation = `moveGradient ${duration}s linear`;
    countdownCircle.style.strokeDasharray = `${circumference} ${circumference}`;

    updateCountdown(timeLeft, duration);

    countdownInterval = setInterval(() => {
      timeLeft--;
      if (timeLeft < 0) {
        stopCountdown();
        return;
      }
      updateCountdown(timeLeft, duration);
    }, 1000);

    pauseButton.textContent = "Pausar";
  }
}

function stopCountdown() {
  if (isRunning) {
    clearInterval(countdownInterval);
    isRunning = false;

    // Reset the animation state when countdown stops
    countdownCircle.style.animation = "none"; 
    countdownCircle.style.strokeDashoffset = circumference;

    pauseButton.textContent = "Reanudar";
  }
}

function updateCountdown(timeLeft, duration) {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  countdownText.textContent = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

  const progress = (duration - timeLeft) / duration;
  const dashoffset = circumference * (1 - progress);
  countdownCircle.style.strokeDashoffset = dashoffset;
}

// Pausar o reanudar el temporizador
pauseButton.addEventListener("click", function() {
  if (isRunning) {
    stopCountdown();
  } else {
    startCountdown();
  }
});

// Iniciar el temporizador automáticamente
startCountdown();

