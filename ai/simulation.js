class Simulation {
    constructor(runningSimulationIndex, networkBrain) {
        this.runningSimulationIndex=runningSimulationIndex;
        networkBrain.score=0;
        this.ship = new Ship(networkBrain,runningSimulationIndex);
        this.asteroids = [];
        this.lasers = [];
        this.shieldTime = 180;
        this.level = 1;
        this.asteroidsMultiplier = 5;
        this.score = 0;
        this.points = [100, 50, 20];
        this.isSimulationFinish=false;
        this.timeLimit=7200;// limit 2 menit
        this.addAsteroidInterval=600;// add asteroid tiap 10 detik
        this.spawnAsteroids(this.level * this.asteroidsMultiplier);
    }

    update(){
        if(!this.isSimulationFinish){
            // Update the asteroids' positions
            for (var i = 0; i < this.asteroids.length; i++) {
                if (this.ship.hits(this.asteroids[i])) {
                    this.submitFitness();
                }
                this.asteroids[i].update();
            }
            // Update the lasers' positions
            for (var i = this.lasers.length - 1; i >= 0; i--) {
                this.lasers[i].update();
                if (this.lasers[i].offscreen()) {
                    // Destroy lasers that go off screen.
                    this.lasers.splice(i, 1);

                    continue;
                }

                for (var j = this.asteroids.length - 1; j >= 0; j--) {
                    if (this.lasers[i].hits(this.asteroids[j])) {
                        // Handle laser contact with asteroids
                        //console.log("simulasi"+this.runningSimulationIndex+"mendapat poin");
                        this.score += this.points[this.asteroids[j].size];
                        this.ship.networkBrain.score=this.score;
                        // The new smaller asteroids broken lasers are added to the same list
                        // of asteroids, so they can be referenced the same way as their full
                        // asteroid counterparts.
                        var newAsteroids = this.asteroids[j].breakup();
                        this.asteroids = this.asteroids.concat(newAsteroids);
                        // Laser and previous asteroid are removed as per the rules of the game.
                        this.asteroids.splice(j, 1);
                        this.lasers.splice(i, 1);
                        if (this.asteroids.length == 0) {
                            this.level++;
                            this.spawnAsteroids(this.level * this.asteroidsMultiplier);
                            this.ship.shields = this.shieldTime;
                        }
                        break;
                    }
                }
            }
            this.ship.update(this.asteroids,180);
            this.timeLimit-=1;
            if(this.timeLimit<=0) this.submitFitness();
            // this.addAsteroidInterval-=1;
            // if(this.addAsteroidInterval<=0){
            //     this.addAsteroidInterval=600;
            //     this.spawnAsteroids(1);
            // }
        }
    }
    
    spawnAsteroids(amount) {
        for (var i = 0; i < amount; i++) {
            this.asteroids.push(new Asteroid(null, null, 2));
        }
    }

    submitFitness(){
        this.isSimulationFinish=true;
        if(this.score>bestFitness) bestFitness=this.score;
        //let cloneSim = Object.assign(Object.create(Object.getPrototypeOf(runningSimulations[this.runningSimulationIndex])), runningSimulations[this.runningSimulationIndex]);
        //waitingSimulations.push(cloneSim);
        //runningSimulations[this.runningSimulationIndex]=null;
        updateDOM(false,true,true);
    }

    static cross(v1, v2) {
        return v1.x * v2.y - v2.x * v1.y;
    }
    
    static lineIntersect(l1v1, l1v2, l2v1, l2v2) {
        var base = p5.Vector.sub(l1v1, l2v1);
        var l1_vector = p5.Vector.sub(l1v2, l1v1);
        var l2_vector = p5.Vector.sub(l2v2, l2v1);
        var direction_cross = cross(l2_vector, l1_vector);
        var t = cross(base, l1_vector) / direction_cross;
        var u = cross(base, l2_vector) / direction_cross;
        if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
            return true;
        } else {
            return false;
        }
    }
}