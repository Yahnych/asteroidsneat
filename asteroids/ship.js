// Daniel Shiffman
// http://codingrainbow.com
// http://patreon.com/codingrainbow
// Code for: https://youtu.be/hacZU523FyM

function Ship(networkBrain,simulationIndex,pos, r) {
    this.networkBrain=networkBrain;
    this.simulationIndex=simulationIndex;
    Entity.call(this, width / 2, height / 2, 20);
    this.isDestroyed = false;
    this.destroyFrames = 600;
    this.shields = 180;
    this.rmax = 4 / 3 * this.r;
    this.rmax2 = this.rmax * this.rmax;
    this.shootingInterval=0;

    this.inputShoot=(char, code, press)=>{
        if (!press) return;

        if(this.networkBrain==undefined || (this.networkBrain!=undefined && this.shootingInterval<=0)){
            var laser = new Laser(this.pos, this.vel, this.heading);
            
            if(this.simulationIndex==undefined){
                lasers.push(laser);
                if(this.networkBrain!=undefined){
                    this.shootingInterval=12;
                }
            }else{
                runningSimulations[this.simulationIndex].lasers.push(laser);
                this.networkBrain.score-=SHOOTING_COST;
                runningSimulations[this.simulationIndex].score=this.networkBrain.score;
                this.shootingInterval=12;
            }
        }
    }
    this.inputUp = (char, code, press) => this.setAccel(press ? 0.1 : 0);
    this.inputRight = (char, code, press) => this.setRotation(press ? 0.08 : 0);
    this.inputLeft = (char, code, press) => this.setRotation(press ? -0.08 : 0);

    if(this.networkBrain==undefined){
        //var scope = this;
        input.registerAsListener(" ".charCodeAt(0), this.inputShoot);
        input.registerAsListener(RIGHT_ARROW, this.inputRight);
        input.registerAsListener(LEFT_ARROW, this.inputLeft);
        input.registerAsListener(UP_ARROW, this.inputUp);
    }

    this.update = function (asteroids=[],maxDistance=0) {
        Entity.prototype.update.call(this);
        this.vel.mult(0.99);
        // if (this.isDestroyed) {

        // } else {
        //     this.vel.mult(0.99);
        // }
        if (this.shields > 0) {
            this.shields -= 1;
        }
        if(this.shootingInterval>0) this.shootingInterval-=1;
        if(this.networkBrain!=undefined){
            this.think(asteroids,maxDistance);
        }
    }

    this.destroy = function () {
        this.isDestroyed = true;
    }

    this.hits = function (asteroid) {

        // Are shields up?
        if (this.shields > 0) {
            return false;
        }

        // Is the ship far from the asteroid?
        var dist2 = (this.pos.x - asteroid.pos.x) * (this.pos.x - asteroid.pos.x)
            + (this.pos.y - asteroid.pos.y) * (this.pos.y - asteroid.pos.y);
        if (dist2 >= (asteroid.rmax + this.rmax2) * (asteroid.rmax + this.rmax2)) {
            return false;
        }

        // Is the ship inside the asteroid?
        if (dist2 <= asteroid.rmin2) {
            return true;
        }

        // Otherwise, we need to check for line intersection
        var vertices = [
            createVector(-2 / 3 * this.r, this.r).rotate(this.heading),
            createVector(-2 / 3 * this.r, -this.r).rotate(this.heading),
            createVector(4 / 3 * this.r, 0).rotate(this.heading)
        ];
        for (var i = 0; i < vertices.length; i++) {
            vertices[i] = p5.Vector.add(vertices[i], this.pos);
        }
        var asteroid_vertices = asteroid.vertices();

        for (var i = 0; i < asteroid_vertices.length; i++) {
            for (var j = 0; j < vertices.length; j++) {
                var next_i = (i + 1) % asteroid_vertices.length;
                if (lineIntersect(vertices[j], vertices[(j + 1) % vertices.length],
                    asteroid_vertices[i], asteroid_vertices[next_i])) {
                    return true;
                }
            }
        }
        return false;
    }

    this.render = function () {
        if (this.isDestroyed) {

        } else {
            push();
            translate(this.pos.x, this.pos.y);
            rotate(this.heading);
            fill(0);
            var shieldCol = random(map(this.shields, 0, shieldTime, 255, 0), 255);
            stroke(shieldCol, shieldCol, 255);
            triangle(-2 / 3 * this.r, -this.r,
                -2 / 3 * this.r, this.r,
                4 / 3 * this.r, 0);

            if (this.accelMagnitude != 0) {
                translate(-this.r, 0);
                rotate(random(PI / 4, 3 * PI / 4));
                line(0, 0, 0, 10);
            }

            pop();
        }
    }

    this.sense = (asteroids, maxDistance, reprMethod='LINEAR') => {
        let distancesMatrix = Array(INPUT_SIZE).fill(0.0);
        asteroids.forEach(asteroid => {
            let [rawDist,rawAngle] = Utils.CalculateDistanceAndAngle(this.pos.x, this.pos.y, asteroid.pos.x, asteroid.pos.y)
            let distance = rawDist - (asteroid.r + this.r);
            
            if (distance > maxDistance) return;

            distance=Math.max(distance,1.0);
            let angle=(rawAngle-this.rotation) % (2*Math.PI);
            let closestDirection=Math.floor((angle + (2*Math.PI / 2*INPUT_SIZE)) / (2*Math.PI / INPUT_SIZE)) % INPUT_SIZE;
            if(reprMethod=='LINEAR'){
                distancesMatrix[closestDirection]=Math.max(1-distance/maxDistance, distancesMatrix[closestDirection]);
            }else{
                distancesMatrix[closestDirection]=Math.max(1.0/distance, distancesMatrix[closestDirection]);
            }
        });
        return distancesMatrix;
    }

    this.think = (asteroids,maxDistance) => {
        if (!this.isDestroyed) {
            let thinkingOutput=this.networkBrain.activate(this.sense(asteroids,maxDistance));
            this.inputUp(undefined,undefined,thinkingOutput[0]>0.75?true:false);//TODO: bisa dicoba ganti tresholdnya dan distance
            this.inputLeft(undefined,undefined,thinkingOutput[1]>0.75?true:false);
            this.inputRight(undefined,undefined,thinkingOutput[2]>0.75?true:false);
            this.inputShoot(undefined,undefined,thinkingOutput[3]>0.75?true:false);
            // if(elapsedTime>9){
            //     //console.log(this.sense(asteroids,maxDistance));
            //     console.log(thinkingOutput);
            //     //wow--;
            // }
        }
    }
}

Ship.prototype = Object.create(Entity.prototype);
