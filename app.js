let cleaness = 46;
let hunger = 500;
let happiness = 500;
let energy = 15;

let dayNumber = 0;
let timeOfDay = 8;

let speed = 0.01;

let gameIsRunning = true;
let actionInProgress = false;
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
    action();
    render();

    sleepCooldown = false;
    updateSleepButton();
    buttonLocked = false;
    allButtons.forEach(b => b.disabled = false);
  }, ms);
}

function disableButtons() {
  const allButtons = document.querySelectorAll('#controls button');
    allButtons.forEach(b => b.disabled = true);
  }
  function enableButtons() {
  const allButtons = document.querySelectorAll('#controls button');
    allButtons.forEach(b => b.disabled = false);
  }


function updateSleepButton() {
  const btn = document.getElementById('sleepBtn');
  if (!btn) return;


   if (!gameIsRunning || actionInProgress || hunger < 6 || cleaness < 6) {
    btn.disabled = true;
    return;
  }


  if (!sleepCooldown && (timeOfDay > 20 || timeOfDay < 6) ||  energy < 15) {
    btn.disabled = false;
} else {
    btn.disabled = true;
}
}
setInterval(updateSleepButton, 100);

/* ===============================
           FUNKCIE ANIMACII
   =============================== */



/* ----------ZMURKANIE---------- */

function blinkPig() {
  const eyes = document.querySelectorAll(".pig-eye");
  const pupils = document.querySelectorAll(".pig-pupil");

  // pridaj triedu
  eyes.forEach(e => e.classList.add("blinking"));
  pupils.forEach(p => p.classList.add("blinking"));

  // odstráň po 200ms
  setTimeout(() => {
    eyes.forEach(e => e.classList.remove("blinking"));
    pupils.forEach(p => p.classList.remove("blinking"));
  }, 200);
}

// prasiatko žmurkne každé 3 – 6 sekúnd
setInterval(() => {
  if (!gameIsRunning) return;
  const randomTime = 3000 + Math.random() * 3000;
  setTimeout(blinkPig, randomTime);
}, 3500);


/* --------- KRUHY POD OCAMI --------- */
function updateTiredEyes() {
  const eyes = document.querySelectorAll(".pig-eye");

  if (energy < 15) {
    eyes.forEach(e => e.classList.add("tired"));
  } else {
    eyes.forEach(e => e.classList.remove("tired"));
  }
}
setInterval(updateTiredEyes, 0);








/* --------- ŠPINA NA PRASIATKU --------- */

function updateDirtVisual() {
  let dirtOpacity;

  if (cleaness > 45) dirtOpacity = 0;
  else if (cleaness > 35) dirtOpacity = 0.2;
  else if (cleaness > 25) dirtOpacity = 0.4;
  else if (cleaness > 15) dirtOpacity = 0.6;
  else if (cleaness > 5) dirtOpacity = 0.8;
  else dirtOpacity = 1;

  document.documentElement.style.setProperty('--dirtOpacity', dirtOpacity);
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


function feedAnimation() {
  const feedAnim = document.getElementById("feed-animation");
  if (feedAnim) {
    feedAnim.textContent = "🍎";
    feedAnim.classList.remove("feed-show");
    void feedAnim.offsetWidth;
    feedAnim.classList.add("feed-show");
  }
}

function feed() {
  if (!gameIsRunning) return;

  actionInProgress = true;
  disableButtons();

  hunger += 3;
  energy += 1;
  
}

function wash() {
  if (!gameIsRunning) return;
  actionInProgress = true;

 disableButtons()

  happiness += 3;
  cleaness += 5;
  

  const bubbles = document.getElementById("bath-animation");
  if (bubbles) {
    bubbles.style.opacity = 1;

    setTimeout(() => {
      bubbles.style.opacity = 0;
      updateDirtVisual();
      render();

      if (gameIsRunning) {
        enableButtons();
        updateSleepButton();
      }
    }, 5000);
  } else {
    updateDirtVisual();
    render();
    
  }
}

function sleep() {
  if (!gameIsRunning) return;
  actionInProgress = true;
  hunger -= 5;
  cleaness -=5;
  energy += 20;
  dayNumber += 1;
  timeOfDay = 8;
}

function play() {
  if (!gameIsRunning) return;
   actionInProgress = true;
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
    message = "Tvoj kamarat zomrel od smutku";
  }

  if (message !== "") {
    document.getElementById("game-over-message").textContent = message;
    gameIsRunning = false;
    disableButtons();
  }
}

function decreaseHunger() {
  if (!gameIsRunning) return;
  if (hunger > 0) hunger -= 1;
  render();
  gameOver();
}
setInterval(decreaseHunger, 5000);

function decreaseHapiness() {
  if (!gameIsRunning) return;
  if (happiness > 0) happiness -= 1;
  render();
  gameOver();
}
setInterval(decreaseHapiness, 6000);

function decreaseEnergy() {
  if (!gameIsRunning) return;
  if (energy > 0) energy -= 1;
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
setInterval(() => {
  updateTime();
  updateNightMode();

}, 200);

function updateNightMode() {
  const isNight = timeOfDay >= 20 || timeOfDay < 6;

  const body = document.body;
  const gameArea = document.getElementById("game-area");
  const pig = document.getElementById("pig");
  const windowGlow = document.getElementById("window");

  if (isNight) {
    body.classList.add("night-mode");
    gameArea.classList.add("night");
    pig.classList.add("night");
    windowGlow.classList.add("night-glow");
  } else {
    body.classList.remove("night-mode");
    gameArea.classList.remove("night");
    pig.classList.remove("night");
    windowGlow.classList.remove("night-glow");
  }
}


render();
updateDirtVisual();
updateSleepButton();
updateTiredEyes();
