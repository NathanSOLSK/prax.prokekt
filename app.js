let cleaness = 100, hunger = 100, happiness = 100, energy = 100;
let dayNumber = 0, timeOfDay = 8;
let speed = 0.01;
let gameIsRunning = true, actionInProgress = false, buttonLocked = false, sleepCooldown = false;

function render() {
  document.getElementById("cleaness").textContent = cleaness;
  document.getElementById("hunger").textContent = hunger;
  document.getElementById("happiness").textContent = happiness;
  document.getElementById("energy").textContent = energy;
  document.getElementById("day-number").textContent = dayNumber;
}

function delayedAction(action, buttonId, ms = 500) {
  if (buttonLocked) return;
  buttonLocked = true;

  const btn = document.getElementById(buttonId);
  const allButtons = document.querySelectorAll('#controls button');
  // disable UI while waiting
  allButtons.forEach(b => b.disabled = true);

  // if target button doesn't exist, restore state and exit
  if (!btn) {
    buttonLocked = false;
    allButtons.forEach(b => b.disabled = false);
    return;
  }

  sleepCooldown = true;

  if (buttonId === 'sleepBtn') {
    const pig = document.getElementById('pig');
    if (pig) {
      pig.style.setProperty('--sleep-duration', ms + 'ms');
      pig.classList.add('sleeping');
      actionInProgress = true;
      // keep sleeping class until wait + lie-down completes (800ms default)
      setTimeout(() => {
        pig.classList.remove('sleeping');
        actionInProgress = false;
      }, ms + 800);
    }
  }

  setTimeout(() => {
    try { action(); } catch (e) { console.error('delayedAction error', e); }
    render();
    sleepCooldown = false;
    updateSleepButton();
    buttonLocked = false;
    allButtons.forEach(b => b.disabled = false);
  }, ms);
}

// Tlačidlá
function disableButtons() { document.querySelectorAll('#controls button').forEach(b => b.disabled = true); }
function enableButtons() { document.querySelectorAll('#controls button').forEach(b => b.disabled = false); }

function updateSleepButton() {
  const btn = document.getElementById('sleepBtn');
  if (!btn) return;
  const gameArea = document.getElementById('game-area');
  const inBedroom = gameArea && gameArea.classList.contains('bedroom');
  btn.disabled = !gameIsRunning || actionInProgress || hunger < 6 || cleaness < 6 || !inBedroom || (sleepCooldown && energy >= 100);
}

setInterval(updateSleepButton, 100);

// Žmurkanie
function blinkPig() {
  const eyes = document.querySelectorAll(".pig-eye");
  const pupils = document.querySelectorAll(".pig-pupil");
  eyes.forEach(e => e.classList.add("blinking"));
  pupils.forEach(p => p.classList.add("blinking"));
  setTimeout(() => { eyes.forEach(e => e.classList.remove("blinking")); pupils.forEach(p => p.classList.remove("blinking")); }, 200);
}
setInterval(() => {
  if (!gameIsRunning) return;
  const randomTime = 3000 + Math.random() * 3000;
  setTimeout(blinkPig, randomTime);
}, 3500);

// Kruhy pod očami
function updateTiredEyes() {
  const eyes = document.querySelectorAll(".pig-eye");
  eyes.forEach(e => e.classList.toggle("tired", energy < 15));
}
setInterval(updateTiredEyes, 500);

// Špina
function updateDirtVisual() {
  let dirtOpacity = 0;
  if (cleaness <= 5) dirtOpacity = 1;
  else if (cleaness <= 15) dirtOpacity = 0.8;
  else if (cleaness <= 25) dirtOpacity = 0.6;
  else if (cleaness <= 35) dirtOpacity = 0.4;
  else if (cleaness <= 45) dirtOpacity = 0.2;
  document.documentElement.style.setProperty('--dirtOpacity', dirtOpacity);
}
setInterval(() => { if(!gameIsRunning) return; cleaness = Math.max(0, cleaness-1); updateDirtVisual(); render(); }, 7000);

// Hranie a kŕmenie
function feedAnimation() { const feedAnim = document.getElementById("feed-animation"); if(feedAnim){ feedAnim.textContent="🍎"; feedAnim.classList.remove("feed-show"); void feedAnim.offsetWidth; feedAnim.classList.add("feed-show"); } }
function feed() { hunger = Math.min(100, hunger+3); energy = Math.min(100, energy+1); render(); }
function play() { happiness = Math.min(100, happiness+5); energy = Math.max(0, energy-3); render(); }
function wash() { cleaness = Math.min(100, cleaness+5); happiness = Math.min(100,happiness+3); const bubbles = document.getElementById("bath-animation"); if(bubbles){ bubbles.style.opacity=1; setTimeout(()=>{bubbles.style.opacity=0; updateDirtVisual(); render(); enableButtons();},5000);} else {updateDirtVisual(); render();} }

// Spánok
function sleep() {
  if (!gameIsRunning) return;
  const gameArea = document.getElementById('game-area');
  if (!gameArea || !gameArea.classList.contains('bedroom')) {
    const note = document.getElementById('feed-notification');
    if (note) {
      note.textContent = "Môžeš spať len v spálni.";
      setTimeout(() => { note.textContent = ""; }, 2500);
    }
    return;
  }

  hunger = Math.max(0, hunger - 5);
  cleaness = Math.max(0, cleaness - 5);
  energy = Math.min(100, energy + 20);
  dayNumber += 1;
  timeOfDay = 8;
  render();
}

// Denný cyklus
function updateTime() { if(!gameIsRunning) return; timeOfDay+=speed; if(timeOfDay>=24){ timeOfDay=0; dayNumber+=1;} let hours=Math.floor(timeOfDay), minutes=Math.floor((timeOfDay-hours)*60); document.getElementById("time-of-day").textContent = (hours<10?"0"+hours:hours)+":"+(minutes<10?"0"+minutes:minutes); updateNightMode();}
setInterval(updateTime,200);

function updateNightMode() {
  const isNight = timeOfDay >= 20 || timeOfDay < 6;
  const body = document.body;
  const gameArea = document.getElementById("game-area");
  const pig = document.getElementById("pig");
  const windowGlow = document.getElementById("window");

  if (isNight) {
    body.classList.add("night-mode");
    if (gameArea) gameArea.classList.add("night");
    if (pig) pig.classList.add("night");
    if (windowGlow) windowGlow.classList.add("night-glow");
  } else {
    body.classList.remove("night-mode");
    if (gameArea) gameArea.classList.remove("night");
    if (pig) pig.classList.remove("night");
    if (windowGlow) windowGlow.classList.remove("night-glow");
  }
}

// Funkcie pre prechod medzi miestnosťami
function goToBedroom() {
  const gameArea = document.getElementById('game-area');
  if (!gameArea) return;
  gameArea.classList.add('bedroom');
  gameArea.classList.remove('kitchen');
  const note = document.getElementById('feed-notification');
  if (note) {
    note.textContent = 'Presun do spálne.';
    setTimeout(() => { note.textContent = ''; }, 1200);
  }
  updateSleepButton();
}

function goToKitchen() {
  const gameArea = document.getElementById('game-area');
  if (!gameArea) return;
  gameArea.classList.add('kitchen');
  gameArea.classList.remove('bedroom');
  const note = document.getElementById('feed-notification');
  if (note) {
    note.textContent = 'Presun do kuchyne.';
    setTimeout(() => { note.textContent = ''; }, 1200);
  }
  updateSleepButton();
}

// Automatický pokles
setInterval(()=>{ if(!gameIsRunning) return; hunger=Math.max(0,hunger-1); render(); },5000);
setInterval(()=>{ if(!gameIsRunning) return; happiness=Math.max(0,happiness-1); render(); },6000);
setInterval(()=>{ if(!gameIsRunning) return; energy=Math.max(0,energy-1); render(); },10000);

render(); updateDirtVisual(); updateSleepButton(); updateTiredEyes();
