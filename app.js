let cleaness = 100, hunger = 100, happiness = 100, energy = 10, smoking = 20;
let money = 0;
let dayNumber = 0, timeOfDay = 20;
let speed = 0.01;
let gameIsRunning = true, actionInProgress = false, buttonLocked = false, sleepCooldown = false;

// State version: bump this when you change default initial stats
const STATE_VERSION = 1;
// Keys that should always use the current code default instead of a saved value
const DEFAULT_OVERRIDE_KEYS = ['timeOfDay'];

// Small DOM helpers to reduce repetition
const $ = (id) => document.getElementById(id);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));
const setText = (id, value) => { const el = $(id); if (el) el.textContent = value; };
const show = (id) => { const el = $(id); if (el && el.style) el.style.display = 'inline-block'; };
const hide = (id) => { const el = $(id); if (el && el.style) el.style.display = 'none'; };
const controlButtons = () => $$('#controls button');

// Persist/load minimal game state to localStorage
function saveState() {
  try {
    const gameArea = document.getElementById('game-area');
    const rooms = ['bedroom','kitchen','casino','mine','grass'];
    let room = null;
    if (gameArea) for (const r of rooms) if (gameArea.classList.contains(r)) { room = r; break; }
    const state = { cleaness, hunger, happiness, energy, smoking, money, dayNumber, timeOfDay, room, version: STATE_VERSION };
    localStorage.setItem('vk_game_state', JSON.stringify(state));
  } catch (e) { console.warn('saveState failed', e); }
}

function loadState() {
  try {
    const raw = localStorage.getItem('vk_game_state');
    if (!raw) return;
    const s = JSON.parse(raw);
    if (s && typeof s === 'object') {
      // If saved state version doesn't match current version, ignore saved state
      const savedVersion = (typeof s.version === 'number') ? s.version : 0;
      if (savedVersion !== STATE_VERSION) {
        console.info('Saved game state version', savedVersion, 'does not match current', STATE_VERSION, '- ignoring saved state.');
        try { localStorage.removeItem('vk_game_state'); } catch (e) {}
        return;
      }
      if (typeof s.cleaness === 'number') cleaness = s.cleaness;
      if (typeof s.hunger === 'number') hunger = s.hunger;
      if (typeof s.happiness === 'number') happiness = s.happiness;
      if (typeof s.energy === 'number') energy = s.energy;
      if (typeof s.smoking === 'number') smoking = s.smoking;
      if (typeof s.money === 'number') money = s.money;
      if (typeof s.dayNumber === 'number') dayNumber = s.dayNumber;
      if (typeof s.timeOfDay === 'number' && !DEFAULT_OVERRIDE_KEYS.includes('timeOfDay')) timeOfDay = s.timeOfDay;
      if (s.room) {
        const gameArea = document.getElementById('game-area');
        if (gameArea) {
          gameArea.classList.remove('bedroom','kitchen','casino','mine','grass');
          if (['bedroom','kitchen','casino','mine','grass'].includes(s.room)) gameArea.classList.add(s.room);
        }
      }
    }
  } catch (e) { console.warn('loadState failed', e); }
}

function render() {
  // Ensure stats remain within 0..100
  cleaness = Math.max(0, Math.min(100, cleaness));
  hunger = Math.max(0, Math.min(100, hunger));
  happiness = Math.max(0, Math.min(100, happiness));
  energy = Math.max(0, Math.min(100, energy));
  smoking = Math.max(0, Math.min(100, smoking));

  setText('cleaness', cleaness);
  setText('hunger', hunger);
  setText('happiness', happiness);
  setText('energy', energy);
  setText('smoking', smoking);
  setText('money', money);
  setText('day-number', dayNumber);
  // check for game over after each render
  gameOver();
  // persist state after render so progress isn't lost
  try { saveState(); } catch (e) {}
}

function delayedAction(action, buttonId, ms = 500) {
  if (buttonLocked) return;
  buttonLocked = true;

  const btn = $(buttonId);
  const allButtons = controlButtons();
  allButtons.forEach(b => b.disabled = true);

  if (!btn) {
    buttonLocked = false;
    allButtons.forEach(b => b.disabled = false);
    return;
  }

  sleepCooldown = true;

  if (buttonId === 'sleepBtn') {
    const pig = $('pig');
    if (pig && pig.style) {
      pig.style.setProperty('--sleep-duration', ms + 'ms');
      pig.classList.add('sleeping');
      actionInProgress = true;
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
function disableButtons() { controlButtons().forEach(b => b.disabled = true); }
function enableButtons() { controlButtons().forEach(b => b.disabled = false); }

// Enable/disable wash button depending on whether player is in the bathroom
function updateWashButton() {
  const btn = $('washBtn');
  const gameArea = $('game-area');
  if (!btn) return;
  btn.disabled = !(gameArea && gameArea.classList.contains('bathroom'));
}

function updateSleepButton() {
  const btn = $('sleepBtn');
  if (!btn) return;
  const gameArea = $('game-area');
  const inBedroom = gameArea && gameArea.classList.contains('bedroom');
  const isNight = timeOfDay >= 20 || timeOfDay < 6;
  const allowedToSleep = inBedroom && (energy < 20 || isNight);
  btn.disabled = !gameIsRunning || actionInProgress || hunger < 6 || cleaness < 6 || !allowedToSleep || (sleepCooldown && energy >= 100);
}

setInterval(updateSleepButton, 100);

// Žmurkanie
function blinkPig() {
  const pig = $('pig');
  // don't blink while sleeping
  if (pig && pig.classList.contains('sleeping')) return;
  const eyes = $$(".pig-eye");
  const pupils = $$(".pig-pupil");
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
  const eyes = $$(".pig-eye");
  eyes.forEach(e => e.classList.toggle("tired", energy < 20));
}
setInterval(updateTiredEyes, 500);

function updateSmokedEyes() {
  const eyes = $$(".pig-eye");
  eyes.forEach(e => e.classList.toggle("sfetovane", smoking > 40));
}
setInterval(updateSmokedEyes, 500);

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
// Only allow washing when in the bathroom. Show a short notification otherwise.
function wash() {
  const gameArea = document.getElementById('game-area');
  const note = document.getElementById('feed-notification');
  if (!gameArea || !gameArea.classList.contains('bathroom')) {
    if (note) {
      note.textContent = 'Kúpať sa dá iba v kúpeľni.';
      setTimeout(() => { note.textContent = ''; }, 1400);
    }
    return;
  }

  cleaness = Math.min(100, cleaness+5);
  happiness = Math.min(100, happiness+3);
  const bubbles = document.getElementById('bath-animation');
  if (bubbles) {
    bubbles.style.opacity = 1;
    bubbles.classList.add('show');
    setTimeout(() => { bubbles.style.opacity = 0; bubbles.classList.remove('show'); }, 1800);
  }
  render();

}

// Spánok
function sleep() {
  if (!gameIsRunning) return;
  const gameArea = $('game-area');
  const isNight = timeOfDay >= 20 || timeOfDay < 6;
  if (!gameArea || !gameArea.classList.contains('bedroom')) {
    const note = $('feed-notification');
    if (note) {
      note.textContent = "Môžeš spať len v spálni.";
      setTimeout(() => { note.textContent = ""; }, 2500);
    }
    return;
  }

  // Require either low energy or night time to sleep
  if (!(energy < 20 || isNight)) {
    const note = $('feed-notification');
    if (note) {
      note.textContent = "Môžeš spať len keď si unavený (energia <20) alebo v noci.";
      setTimeout(() => { note.textContent = ""; }, 2800);
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

// Game over handling: set message and stop the game when a stat hits 0
function gameOver() {
  if (!document) return;
  let message = "";

  // smoking reaching zero ends the game
  if (smoking <= 0) {
    message = "Z Džigina sa stal abstinent.";
  } else if (cleaness <= 0) {
    // neutral cleanliness message
    message = "Z Džigina sa stal špinavý kamarát.";
  } else if (hunger <= 0) {
    message = "Džigino zomrel na hlad.";
  } else if (happiness <= 0) {
    message = "Džigino sa dobrovoľne vymazal z tohto sveta.";
  } else if (energy <= 0) {
    message = "Džigino zomrel na vyčerpanie.";
  }

  if (message !== "") {
    const el = document.getElementById('game-over-message');
    if (el) el.textContent = message;
    gameIsRunning = false;
    // disable all controls
    try { controlButtons().forEach(b => b.disabled = true); } catch (e) {}
    // show restart button and enable it
    try {
      const rb = document.getElementById('restartBtn');
      if (rb) { rb.style.display = 'inline-block'; rb.disabled = false; }
    } catch (e) {}
  }
}

// Show/hide restart button helper
function setRestartVisible(visible) {
  const b = document.getElementById('restartBtn');
  if (!b) return;
  b.style.display = visible ? 'inline-block' : 'none';
}

// Restart the game to initial state
function restartGame() {
  // Clear saved state
  try { localStorage.removeItem('vk_game_state'); } catch (e) {}

  // Reset core stats
  cleaness = 100; hunger = 100; happiness = 100; energy = 10; smoking = 30; money = 0;
  dayNumber = 0; timeOfDay = 8; gameIsRunning = true; actionInProgress = false; buttonLocked = false; sleepCooldown = false;

  // Close any open UI
  try { closeSlots(); } catch (e) {}

  // Reset room to default (kitchen)
  try {
    const gameArea = document.getElementById('game-area');
    if (gameArea) {
      gameArea.classList.remove('bedroom','casino','mine');
      gameArea.classList.add('kitchen');
    }
  } catch (e) {}

  // Hide restart button and ensure other room buttons hidden/shown correctly
  try { setRestartVisible(false); } catch (e) {}
  try { setMineButtonVisible(false); } catch (e) {}
  try { setCasinoButtonVisible(false); } catch (e) {}
  try { setGrassButtonVisible(false); } catch (e) {}

  // Clear game over message
  try { const el = document.getElementById('game-over-message'); if (el) el.textContent = ''; } catch (e) {}

  // Re-enable controls
  try { controlButtons().forEach(b => b.disabled = false); } catch (e) {}

  // Render initial UI and save state
  render(); updateDirtVisual(); updateSleepButton(); updateTiredEyes();
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

function updateSmokedMode() {
  const isSmoked = smoking >= 50;
  const body = document.body;
  const gameArea = document.getElementById("game-area");
  const pig = document.getElementById("pig");
  const windowGlow = document.getElementById("window");

  if (isSmoked) {
    body.classList.add("smoked-mode");
    if (gameArea) gameArea.classList.add("smoked");
    if (pig) pig.classList.add("smoked");
    if (windowGlow) windowGlow.classList.add("smoked-glow");
  } else {
    body.classList.remove("smoked-mode");
    if (gameArea) gameArea.classList.remove("smoked");
    if (pig) pig.classList.remove("smoked");
    if (windowGlow) windowGlow.classList.remove("smoked-glow");
  }
}
setInterval(updateSmokedMode, 500);

// Funkcie pre prechod medzi miestnosťami
function goToBedroom() {
  const gameArea = document.getElementById('game-area');
  if (!gameArea) return;
  // remove any other room classes and add bedroom
  gameArea.classList.remove('kitchen', 'casino', 'mine', 'grass');
  gameArea.classList.add('bedroom');
  // hide mine work button when not in mine
  try { setMineButtonVisible(false); } catch (e) {}
  // hide slot button when leaving casino
  try { setCasinoButtonVisible(false); } catch (e) {}
  // hide grass use when leaving grass
  try { setGrassButtonVisible(false); } catch (e) {}
  const note = document.getElementById('feed-notification');
  if (note) {
    note.textContent = 'Presun do spálne.';
    setTimeout(() => { note.textContent = ''; }, 1200);
  }
  updateSleepButton();
  try { if (typeof updateWashButton === 'function') updateWashButton(); } catch (e) {}
}

function goToKitchen() {
  const gameArea = document.getElementById('game-area');
  if (!gameArea) return;
  // remove any other room classes and add kitchen
  gameArea.classList.remove('bedroom', 'casino', 'mine', 'grass');
  gameArea.classList.add('kitchen');
  try { setMineButtonVisible(false); } catch (e) {}
  // hide slot button when leaving casino
  try { setCasinoButtonVisible(false); } catch (e) {}
  // hide grass use when leaving grass
  try { setGrassButtonVisible(false); } catch (e) {}
  const note = document.getElementById('feed-notification');
  if (note) {
    note.textContent = 'Presun do kuchyne.';
    setTimeout(() => { note.textContent = ''; }, 1200);
  }
  updateSleepButton();
  try { if (typeof updateWashButton === 'function') updateWashButton(); } catch (e) {}
}

function goToCasino() {
  const gameArea = document.getElementById('game-area');
  if (!gameArea) return;
  // remove other room classes and add casino
  gameArea.classList.remove('bedroom', 'kitchen', 'mine', 'grass');
  gameArea.classList.add('casino');

  try { setMineButtonVisible(false); } catch (e) {}

  // show slot machine button when in casino
  try { setCasinoButtonVisible(true); } catch (e) {}
  // hide grass use when leaving grass
  try { setGrassButtonVisible(false); } catch (e) {}
  const note = document.getElementById('feed-notification');
  if (note) {
    note.textContent = 'Presun do kasína.';
    setTimeout(() => { note.textContent = ''; }, 1200);
  }

  // try to update UI state related to sleeping if function exists
  try { if (typeof updateSleepButton === 'function') updateSleepButton(); } catch (e) { console.warn('updateSleepButton missing', e); }
  try { if (typeof updateWashButton === 'function') updateWashButton(); } catch (e) {}
}

function goToMine() {
  const gameArea = document.getElementById('game-area');
  if (!gameArea) return;
  // clear other room classes and add mine
  gameArea.classList.remove('bedroom', 'kitchen', 'casino', 'grass');
  gameArea.classList.add('mine');
  // show the mine work button when in the mine
  try { setMineButtonVisible(true); } catch (e) {}
  // hide slot button when leaving casino
  try { setCasinoButtonVisible(false); } catch (e) {}
  // hide grass use when leaving grass
  try { setGrassButtonVisible(false); } catch (e) {}

  const note = document.getElementById('feed-notification');
  if (note) {
    note.textContent = 'Presun do bane.';
    setTimeout(() => { note.textContent = ''; }, 1200);
  }

  try { if (typeof updateSleepButton === 'function') updateSleepButton(); } catch (e) { console.warn('updateSleepButton missing', e); }
  try { if (typeof updateWashButton === 'function') updateWashButton(); } catch (e) {}
}

function goToBathroom() {
  const gameArea = document.getElementById('game-area');
  if (!gameArea) return;
  // remove any other room classes and add bathroom
  gameArea.classList.remove('bedroom', 'kitchen', 'casino', 'mine', 'grass');
  gameArea.classList.add('bathroom');
  // hide mine/slot/grass controls when in bathroom
  try { setMineButtonVisible(false); } catch (e) {}
  try { setCasinoButtonVisible(false); } catch (e) {}
  try { setGrassButtonVisible(false); } catch (e) {}
  const note = document.getElementById('feed-notification');
  if (note) { note.textContent = ''; }
  updateSleepButton();
  try { if (typeof updateWashButton === 'function') updateWashButton(); } catch (e) {}
}

// show/hide grass-use button
function setGrassButtonVisible(visible) {
  const b = document.getElementById('grassUseBtn');
  if (!b) return;
  b.style.display = visible ? 'inline-block' : 'none';
}

// start smoking: add visual immediately and run delayed action
function startSmoking() {
  const pig = $('pig');
  if (pig) pig.classList.add('smoking');
  // small smoke puffs: create a few puff elements so CSS animation runs when class added
  const smokeContainer = $('smoke-effect');
  if (smokeContainer) {
    smokeContainer.innerHTML = '';
    for (let i = 0; i < 3; i++) {
      const puff = document.createElement('div');
      puff.className = 'smoke-puff';
      puff.style.left = (10 + i*18) + 'px';
      puff.style.top = (20 + i*6) + 'px';
      // stagger animation slightly
      puff.style.animationDelay = (i * 250) + 'ms';
      smokeContainer.appendChild(puff);
    }
  }
  // run the delayed action (3s) which will call smokeGrass
  delayedAction(smokeGrass, 'grassUseBtn', 3000);
}

// executed after delay: apply effects and remove visuals
function smokeGrass() {
  // increase smoking stat and small happiness effect
  smoking = Math.min(100, (typeof smoking === 'number' ? smoking : 0) + 10);
  happiness = Math.min(100, (typeof happiness === 'number' ? happiness : 0) + 3);
  const note = document.getElementById('feed-notification');
  if (note) { note.textContent = '+sfajčenosť +10, +radosť +3'; setTimeout(()=>{ note.textContent = ''; }, 1600); }

  // remove smoking visual class after a short fade
  const pig = $('pig');
  if (pig) pig.classList.remove('smoking');
  const smokeContainer = $('smoke-effect');
  if (smokeContainer) smokeContainer.innerHTML = '';

  render();
}

function goToGrassStreet() {
  const gameArea = document.getElementById('game-area');
  if (!gameArea) return;
  // clear other room classes and add grass street
  gameArea.classList.remove('bedroom', 'kitchen', 'casino', 'mine');
  gameArea.classList.add('grass');

  // hide mine and slot buttons in this area
  try { setMineButtonVisible(false); } catch (e) {}
  try { setCasinoButtonVisible(false); } catch (e) {}
  // show grass-use button when in grass
  try { setGrassButtonVisible(true); } catch (e) {}

  const note = document.getElementById('feed-notification');
  if (note) {
    note.textContent = 'Presun na Trávnatú ulicu.';
    setTimeout(() => { note.textContent = ''; }, 1200);
  }

  try { if (typeof updateSleepButton === 'function') updateSleepButton(); } catch (e) { console.warn('updateSleepButton missing', e); }
}

// show/hide casino slot button
function setCasinoButtonVisible(visible) {
  const b = document.getElementById('slotBtn');
  if (!b) return;
  b.style.display = visible ? 'inline-block' : 'none';
}

// Slot machine UI control: open/close modal
function openSlots() {
  const modal = $('slot-modal');
  if (!modal) return;
  modal.style.display = 'flex';
  // initialize reels
  const reels = [$('reel1'), $('reel2'), $('reel3')];
  reels.forEach(r => { if (r) r.textContent = '❓'; });
  const result = $('slot-result'); if (result) result.textContent = '';
}

function closeSlots() {
  const modal = $('slot-modal');
  if (!modal) return;
  modal.style.display = 'none';
}

// Slot machine logic
const SLOT_SYMBOLS = ['🍒','🍋','🔔','⭐','7️⃣'];
let slotIntervals = [];

function spinSlots() {
  const spinBtn = $('spinBtn');
  const resultEl = $('slot-result');
  if (!spinBtn) return;
  // cost per spin
  const SPIN_COST = 350;
  // prevent spinning without enough money
  if (typeof money !== 'number' || money < SPIN_COST) {
    if (resultEl) resultEl.textContent = 'Nedostatok peňazí (potrebné €' + SPIN_COST + ')';
    return;
  }
  // charge immediately
  money -= SPIN_COST;
  render();
  spinBtn.disabled = true;
  if (resultEl) resultEl.textContent = '... (–' + SPIN_COST + ' €)';

  const r1 = $('reel1');
  const r2 = $('reel2');
  const r3 = $('reel3');
  if (!r1 || !r2 || !r3) { spinBtn.disabled = false; return; }

  // start quick cycling for each reel
  const cycle = (el) => setInterval(() => { el.textContent = SLOT_SYMBOLS[Math.floor(Math.random()*SLOT_SYMBOLS.length)]; }, 80);
  slotIntervals = [cycle(r1), cycle(r2), cycle(r3)];

  // stop reels sequentially
  setTimeout(() => { clearInterval(slotIntervals[0]); }, 1600);
  setTimeout(() => { clearInterval(slotIntervals[1]); }, 2200);
  setTimeout(() => { clearInterval(slotIntervals[2]);
    // evaluate
    const s1 = r1.textContent, s2 = r2.textContent, s3 = r3.textContent;
    let message = 'Skús znova.';
    if (s1 === s2 && s2 === s3) {
      money += 600; message = 'VEĽKÁ VÝHRA! +600 €';
    } else if (s1 === s2 || s2 === s3 || s1 === s3) {
      money += 100; message = 'Výhra! +100 €';
    }
    if (resultEl) resultEl.textContent = message;
    // add +5 happiness after each slot spin
    happiness = Math.min(100, (typeof happiness === 'number' ? happiness : 0) + 5);
    render();
    // re-enable spin after short delay
    setTimeout(() => { spinBtn.disabled = false; }, 900);
  }, 2800);
}

// Show/hide the mine work button
function setMineButtonVisible(visible) {
  const b = document.getElementById('mineWorkBtn');
  if (!b) return;
  b.style.display = visible ? 'inline-block' : 'none';
}

// Start mining (attached to button). Uses delayedAction to manage UI locking.
function startMining() {
  const btn = document.getElementById('mineWorkBtn');
  if (!btn) return;
  delayedAction(mineWork, 'mineWorkBtn', 3000);
}

// The actual mining action: award money and animate pickaxe
function mineWork() {
  money = (typeof money === 'number') ? money + 150 : 150;
  const note = document.getElementById('feed-notification');
  if (note) {
    note.textContent = '+150 €';
    setTimeout(() => { note.textContent = ''; }, 1600);
  }
  const anim = document.getElementById('mine-animation');
  if (anim) {
    anim.classList.remove('mining');
    // force reflow to restart animation
    void anim.offsetWidth;
    anim.classList.add('mining');
  }
  // reduce energy by 7 when work completes
  energy = Math.max(0, (typeof energy === 'number' ? energy : 0) - 7);
  render();
}

// Automatický pokles
setInterval(()=>{ if(!gameIsRunning) return; hunger=Math.max(0,hunger-1); render(); },7000);
setInterval(()=>{ if(!gameIsRunning) return; happiness=Math.max(0,happiness-1); render(); },6000);
setInterval(()=>{ if(!gameIsRunning) return; energy=Math.max(0,energy-1); render(); },10000);
// Smoking (sfajčenosť) decays by 1 every 2 seconds while the game is running
setInterval(()=>{
  if(!gameIsRunning) return;
  smoking = Math.max(0, (typeof smoking === 'number' ? smoking : 0) - 1);
  // small debug: log and briefly show current smoking so user can see decay
  try {
    console.log('sfajčenosť ->', smoking);
    const note = document.getElementById('feed-notification');
    if (note) {
      note.textContent = 'Sfajčenosť: ' + smoking;
      setTimeout(()=>{ if (note && note.textContent && note.textContent.startsWith('Sfajčenosť')) note.textContent = ''; }, 900);
    }
  } catch (e) {}
  render();
},2000);

// load saved state (if any) then initialize UI
try { loadState(); } catch (e) {}
render(); updateDirtVisual(); updateSleepButton(); updateTiredEyes();

// Ensure wash button state reflects current room on load
try { if (typeof updateWashButton === 'function') updateWashButton(); } catch (e) {}

// ensure buttons reflect loaded room
try { setMineButtonVisible(document.getElementById('game-area')?.classList.contains('mine')); } catch (e) {}
try { setCasinoButtonVisible(document.getElementById('game-area')?.classList.contains('casino')); } catch (e) {}
try { setGrassButtonVisible(document.getElementById('game-area')?.classList.contains('grass')); } catch (e) {}

// save state on unload as a last resort
window.addEventListener('beforeunload', () => { try { saveState(); } catch (e) {} });
