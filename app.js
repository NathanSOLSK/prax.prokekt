let cleaness = 4;
let hunger = 50;
let happiness = 70;
let energy = 30;


let dayNumber = 0;
let timeOfDay = 20;

let speed = 0.01;

let gameIsRunning = true;

let buttonLocked = false;
let sleepCooldown = false;

function render() {
  document.getElementById("cleaness").textContent = cleaness;
  document.getElementById("hunger").textContent = hunger;
  document.getElementById("happiness").textContent = happiness;
  document.getElementById("energy").textContent = energy;
  document.getElementById("day-number").textContent = dayNumber;
}

function delayedAction(action, buttonId, ms = 1000000) {
  if (buttonLocked) return;
  buttonLocked = true;

  const btn = document.getElementById(buttonId);
  if (!btn) return;

  const allButtons = document.querySelectorAll('#controls button');
  allButtons.forEach(b => b.disabled = true);

  sleepCooldown = true;

  setTimeout(() => {
    action();        // vykoná funkciu po ms
    render();

    sleepCooldown = false;
    updateSleepButton();
    buttonLocked = false;
    allButtons.forEach(b => b.disabled = false);
  }, ms);
}

function updateSleepButton() {
  const btn = document.getElementById('sleepBtn');
  if (!btn) return;

  if (!sleepCooldown && timeOfDay > 20) {
    btn.disabled = false;
  } else {
    btn.disabled = true;
  }
}
setInterval(updateSleepButton, 100);

/* --------- ŠPINA NA PRASIATKU --------- */

function updateDirtVisual() {
  const dirt = document.getElementById("dirt-layer");
  if (!dirt) return;

  if (cleaness > 45) dirt.style.opacity = 0;
  else if (cleaness > 35) dirt.style.opacity = 0.2;
  else if (cleaness > 25) dirt.style.opacity = 0.4;
  else if (cleaness > 15) dirt.style.opacity = 0.6;
  else if (cleaness > 5) dirt.style.opacity = 0.8;
  else dirt.style.opacity = 1;
}

// postupné špinenie
setInterval(() => {
  if (!gameIsRunning) return;

  cleaness -= 1;
  if (cleaness < 0) cleaness = 0;

  updateDirtVisual();
  render();
}, 7000);

/* -------------------------------------- */

function lowerStats() {
  decreaseHunger();
  decreaseHapiness();
  decreaseCleaness();
  decreaseEnergy();
  render();
}

function feed() {
  if (!gameIsRunning) return;
  hunger += 3;
  energy += 1;
}

/* KÚPEĽ – animácia + čistenie */
function wash() {
  if (!gameIsRunning) return;

  happiness += 3;
  cleaness += 5;
  

  const bubbles = document.getElementById("bath-animation");
  if (bubbles) {
    bubbles.style.opacity = 1;

    setTimeout(() => {
      bubbles.style.opacity = 0;
      updateDirtVisual();
      render();
    }, 1500);
  } else {
    updateDirtVisual();
    render();
  }
}

function sleep() {
  if (!gameIsRunning) return;
  energy = 30;
  dayNumber += 1;
  timeOfDay = 8;
}

function play() {
  if (!gameIsRunning) return;
  delayedAction(() => {
    buttonLocked = true;
    happiness += 5;
    energy -= 3;
  }, "playBtn", 500);
}

function gameOver() {
  let message = "";

  if (hunger <= 0) {
    message = "Tvoj kamarat zomrel od hladu";
  }
  if (energy <= 0) {
    message = "Tvoj kamarat zomrel od vycerpania";
  }
  if (cleaness <= 0) {
    message = "Tvoj kamarat zomrel na chorobu";
  }
  if (happiness <= 0) {
    message = "Tvoj kamarat spachal sebevrazdu";
  }

  if (message !== "") {
    document.getElementById("game-over-message").textContent = message;
    gameIsRunning = false;
  }
}

function decreaseHunger() {
  if (!gameIsRunning) return;
  if (hunger > 0) {
    hunger -= 1;
  }
  render();
  gameOver();
}
setInterval(decreaseHunger, 5000);



function decreaseHapiness() {
  if (!gameIsRunning) return;
  if (happiness > 0) {
    happiness -= 1;
  }
  render();
  gameOver();
}
setInterval(decreaseHapiness, 6000);

function decreaseEnergy() {
  if (!gameIsRunning) return;
  if (energy > 0) {
    energy -= 1;
  }
  render();
  gameOver();
}
setInterval(decreaseEnergy, 10000);

function dayCounter() {
  if (!gameIsRunning) return;
  dayNumber += 1;
  render();
}

function updateTime() {
  if (!gameIsRunning) return;

  timeOfDay += speed;

  if (timeOfDay >= 24) {
    timeOfDay = 0;
    dayCounter();
  }

  let hours = Math.floor(timeOfDay);
  let minutes = Math.floor((timeOfDay - hours) * 60);

  let formattedTime =
    (hours < 10 ? "0" + hours : hours) +
    ":" +
    (minutes < 10 ? "0" + minutes : minutes);

  document.getElementById("time-of-day").textContent = formattedTime;
}
setInterval(updateTime, 200);

/* inicializácia */
render();
// enableSleep(); // už nevoláme, neexistuje
updateDirtVisual();
