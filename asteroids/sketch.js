// Daniel Shiffman
// http://codingrainbow.com
// http://patreon.com/codingrainbow
// Code for: https://youtu.be/hacZU523FyM

var ship, asteroids, lasers, dust, canPlay, shieldTime, level, asteroidsMultiplier, isGamePaused;

var score, points;

function setupGame(networkBrain) {
    input.reset();
    asteroids = [];
    lasers = [];
    dust = [];
    canPlay = true;
    shieldTime = 180;
    level = 1;
    asteroidsMultiplier = 5;
    isGamePaused=false;
    score = 0;
    points = [100, 50, 20]; // small, med, large points

    createCanvas(windowWidth, windowHeight - document.getElementById('controlBar').offsetHeight);
    ship = networkBrain==undefined ? new Ship() : new Ship(networkBrain);
    spawnAsteroids(level * asteroidsMultiplier);
    console.log('setup');
}

function updateGame() {
    if (isGamePaused) {
        
    } else {
        // Handles the round loss, destruction of ship and round restart when the
        // ship contacts an asteroid.
        for (var i = 0; i < asteroids.length; i++) {
            if (ship.hits(asteroids[i]) && canPlay) {
                canPlay = false;
                ship.destroy();
                input.reset();
                setTimeout(function () {
                    ship = new Ship();
                    canPlay = true;
                    level = 1;
                    score = 0;
                }, 3000);
            }
            asteroids[i].update();
        }

        // Update the lasers' positions
        for (var i = lasers.length - 1; i >= 0; i--) {
            lasers[i].update();
            if (lasers[i].offscreen()) {
                // Destroy lasers that go off screen.
                lasers.splice(i, 1);

                continue;
            }

            for (var j = asteroids.length - 1; j >= 0; j--) {
                if (lasers[i].hits(asteroids[j])) {
                    // Handle laser contact with asteroids - handles graphics and sounds -
                    // including asteroids that result from being hit.
                    score += points[asteroids[j].size];
                    console.log(score);
                    var dustVel = p5.Vector.add(lasers[i].vel.mult(0.2), asteroids[j].vel);
                    var dustNum = (asteroids[j].size + 1) * 5;
                    addDust(asteroids[j].pos, dustVel, dustNum);
                    // The new smaller asteroids broken lasers are added to the same list
                    // of asteroids, so they can be referenced the same way as their full
                    // asteroid counterparts.
                    var newAsteroids = asteroids[j].breakup();
                    asteroids = asteroids.concat(newAsteroids);
                    // Laser and previous asteroid are removed as per the rules of the game.
                    asteroids.splice(j, 1);
                    lasers.splice(i, 1);
                    if (asteroids.length == 0) {
                        level++;
                        spawnAsteroids(level * asteroidsMultiplier);
                        ship.shields = shieldTime;
                    }
                    break;
                }
            }
        }

        ship.networkBrain==undefined ? ship.update() : ship.update(asteroids,180);

        for (var i = dust.length - 1; i >= 0; i--) {
            dust[i].update();
            if (dust[i].transparency <= 0) {
                dust.splice(i, 1);
            }
        }

        // Render
        background(0);

        for (var i = 0; i < asteroids.length; i++) {
            asteroids[i].render();
        }

        for (var i = lasers.length - 1; i >= 0; i--) {
            lasers[i].render();
        }

        ship.render();

        for (var i = dust.length - 1; i >= 0; i--) {
            dust[i].render();
        }
    }
}

function spawnAsteroids(amount) {
    for (var i = 0; i < amount; i++) {
        asteroids.push(new Asteroid(null, null, 2));
    }
}

function cross(v1, v2) {
    return v1.x * v2.y - v2.x * v1.y;
}

function lineIntersect(l1v1, l1v2, l2v1, l2v2) {
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

const pauseGame = () => isGamePaused = !isGamePaused;
