  
    let health = 100;
    let hunger = 50;
    let happiness = 70;
    let energy = 30;
    
    let dayNumber = 0;
    let timeOfDay = 0;

    let speed = 0.01;

    let gameIsRunning = true;

   


   function render() {
    document.getElementById("health").textContent = health;
    document.getElementById("hunger").textContent = hunger;
    document.getElementById("happiness").textContent = happiness;
    document.getElementById("energy").textContent = energy;
    document.getElementById("day-number").textContent = dayNumber;
    
   
   
}

    function gameLoop() {
            if (gameIsRunning) {
                lowerStats()
                feed()
                
                
            }
        }

        

    function lowerStats() {
        decreaseHunger()
        decreaseHapiness()
        decreaseHealth()
        decreaseEnergy()
        render()

    }

    function feed() {
        if (!gameIsRunning) return;
        hunger += 3;
        energy += 1;
        health += 1;
        render();
        
    }

    function wash() {
         if (!gameIsRunning) return;
        happiness += 3;
        energy += 2;
        health += 5;
        render();
        
    }

    function sleep() {
         if (!gameIsRunning) return;
        energy += 10;
        health += 5;
        render();
        
    }

    function play() {
        if (!gameIsRunning) return;
        happiness += 5;
        energy -= 3;
        render();
        
    }
    

     function gameOver() {
        let message = "";
        
    if (hunger <= 0) {
        message = "Tvoj kamarat zomrel od hladu";
    }
    if (energy <= 0) {
        message = "Tvoj kamarat zomrel od vycerpania";
    }
    if (health <= 0) {
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
     gameOver()
}


setInterval(decreaseHunger, 5000);

function decreaseHealth() {
     if (!gameIsRunning) return;
    if (health > 0) {    
        health -= 1;
       
    }
     render();
     gameOver()
}
setInterval(decreaseHealth, 6000);

function decreaseHapiness() {
     if (!gameIsRunning) return;
    if (happiness > 0) {    
        happiness -= 1;
       
    }
     render();
     gameOver()
}
setInterval(decreaseHapiness, 6000);

function decreaseEnergy() {
     if (!gameIsRunning) return;
    if (energy > 0) {    
        energy -= 1;
        
       
    }
     render();
     gameOver()
   
}
setInterval(decreaseEnergy, 6000);

function dayCounter() {
    if (!gameIsRunning) return;
     dayNumber += 1;

     render()
}
setInterval(dayCounter, 300000)

function updateTime() {
    if (!gameIsRunning) return;
    
    timeOfDay += speed;

    if (timeOfDay >= 24) timeOfDay = 0, dayCounter();

      let hours = Math.floor(timeOfDay);
     let minutes = Math.floor((timeOfDay - hours) * 60);

     let formattedTime = (hours < 10 ? "0" + hours : hours) + ":" + (minutes < 10 ? "0" + minutes : minutes);
    
    document.getElementById("time-of-day").textContent = formattedTime; 
  }
  setInterval(updateTime, 200);



 





render()


