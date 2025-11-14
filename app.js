  
    let health = 100;
    let hunger = 50;
    let happiness = 70;
    let energy = 40;
    let dayNumber = 0;
    let timeOfDay = 0.0;

   


   function render() {
    document.getElementById("health").textContent = health;
    document.getElementById("hunger").textContent = hunger;
    document.getElementById("happiness").textContent = happiness;
    document.getElementById("energy").textContent = energy;
    document.getElementById("day-number").textContent = dayNumber;
    document.getElementById("time-of-day").textContent = timeOfDay;
   
}
    function lowerStats() {
        decreaseHunger()
        decreaseHapiness()
        decreaseHealth()
        decreaseEnergy()
        render()

    }

    function feed() {
        hunger += 1;
        render();
    }

    function wash() {
        happiness += 5;
        energy += 5;
        render();
    }


     document.querySelector('button[data-action="clean"]').addEventListener('click', () => {
    startWashAnimation();        // animácia hneď
    setTimeout(wash, 5000); // efekt po 5s
});
    

   

















    function decreaseHunger() {
    if (hunger > 0) {    
        hunger -= 1;
        render();
    }
}


setInterval(decreaseHunger, 5000);

function decreaseHealth() {
    if (health > 0) {    
        health -= 1;
        render();
    }
}
setInterval(decreaseHealth, 6000);

function decreaseHapiness() {
    if (happiness > 0) {    
        happiness -= 1;
        render();
    }
}
setInterval(decreaseHapiness, 6000);

function decreaseEnergy() {
    if (energy > 0) {    
        energy -= 1;
        render();
    }
}
setInterval(decreaseEnergy, 6000);





render()

