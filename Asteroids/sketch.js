var ship; 
var hud;
var asteroids = [];
var lasers = []; 
var laserSoundEffects = []; 
var dust = []; 
var explosionSoundEffects = []; 
var explosionImage; 
var explosions = []; 
var canPlay = true; 
var shieldTime = 180; 
var stars = []; 
var startImage; 
var gameStarted = false; 
var gameOverImage; 
var isGameOver = false; 
var trailImage;
var highScore = 0; 
var bgMusic; 
var musicOnImage; 
var musicOffImage; 
var musicOn = true; 
var volumeSlider; 
var pauseImage1; 
var pauseImage2; 
var isPauseImage1 = true;

function preload() {
  for (var i = 0; i < 3; i++) {
    laserSoundEffects[i] = loadSound('audio/pew-' + i + '.mp3');
  }
  for (var i = 0; i < 3; i++) {
    explosionSoundEffects[i] = loadSound('audio/explosion-' + i + '.mp3');
  }
  startImage = loadImage('header.jpg');
  gameOverImage = loadImage('game_over.png');
  explosionImage = loadImage('explosion.png');
  trailImage = loadImage('trail.png'); 
  bgMusic = loadSound('audio/song.mp3'); 
  musicOnImage = loadImage('music1.png'); 
  musicOffImage = loadImage('music2.png'); 
  pauseImage1 = loadImage('pause1.png'); 
  pauseImage2 = loadImage('pause2.png'); 
}

var score = 0; 
var lives = 3; 
var points = [100, 50, 20]; 
var level = 0; 

function setup() {
  createCanvas(1280, 720); 
  ship = new Ship(); 
  hud = new Hud(); 
  spawnAsteroids(); 
  generateStars(500); 
  musicButton = createButton('');
  musicButton.position(50, 50);
  musicButton.mousePressed(toggleMusic);
  musicButton.style('background', 'transparent');
  musicButton.style('border', 'none');
  volumeSlider = createSlider(0, 1, 0.5, 0.01); 
  volumeSlider.position(130, 110); 
}

function draw() {
  if (!gameStarted) {
    drawStartScreen(); 
  } else if (isGameOver) {
    drawGameOverScreen(); 
  } else {
    background(0);
    drawStars();

    for (var i = lasers.length - 1; i >= 0; i--) {
      lasers[i].update();
      if (lasers[i].offscreen()) {
        lasers.splice(i, 1);
        continue;
      }
      for (var j = asteroids.length - 1; j >= 0; j--) {
        if (lasers[i].hits(asteroids[j])) {
          asteroids[j].playSoundEffect(explosionSoundEffects);
          score += points[asteroids[j].size];
          var dustVel = p5.Vector.add(lasers[i].vel.mult(0.2), asteroids[j].vel);
          var dustNum = (asteroids[j].size + 1) * 5;
          addDust(asteroids[j].pos, dustVel, dustNum);

          explosions.push({
            pos: asteroids[j].pos.copy(),
            frame: frameCount
          });

          var newAsteroids = asteroids[j].breakup();
          asteroids = asteroids.concat(newAsteroids);
          asteroids.splice(j, 1);
          lasers.splice(i, 1);
          if (asteroids.length == 0) {
            level++;
            spawnAsteroids();
            ship.shields = shieldTime;
          }
          break;
        }
      }
    }

    for (var i = explosions.length - 1; i >= 0; i--) {
      if (frameCount - explosions[i].frame < 30) {
        var explosionSize = 0.3;
        image(explosionImage, explosions[i].pos.x - explosionImage.width * explosionSize / 2, explosions[i].pos.y - explosionImage.height * explosionSize / 2, explosionImage.width * explosionSize, explosionImage.height * explosionSize);
      } else {
        explosions.splice(i, 1);
      }
    }
    for (var i = 0; i < asteroids.length; i++) {
      if (ship.hits(asteroids[i]) && canPlay) {
        canPlay = false;
        ship.destroy();
        input.reset();

        explosionSoundEffects[Math.floor(Math.random() * explosionSoundEffects.length)].play();

        setTimeout(function() {
          lives--;
          if (lives >= 0) {
            ship = new Ship();
            canPlay = true;
          } else {
            isGameOver = true;
            if (score > highScore) {
              highScore = score;
            }
            
          }
        }, 3000);
      }
      asteroids[i].update();
    }

    ship.update();

    for (var i = dust.length - 1; i >= 0; i--) {
      dust[i].update();
      if (dust[i].transparency <= 0) {
        dust.splice(i, 1);
      }
    }

    for (var i = 0; i < asteroids.length; i++) {
      asteroids[i].render();
    }
    for (var i = lasers.length - 1; i >= 0; i--) {
      lasers[i].render();
    }
    ship.render();
    hud.render();
    for (var i = dust.length - 1; i >= 0; i--) {
      dust[i].render();
    }
  }
  if (musicOn) {
    image(musicOnImage, 50, 50, 50, 50);
  } else {
    image(musicOffImage, 50, 50, 50, 50);
  }
  bgMusic.setVolume(volumeSlider.value());

  if (isPauseImage1) {
    image(pauseImage1, width - 140, 30, 120, 80);
  } else {
    image(pauseImage2, width - 140, 30, 120, 80);
  }
}

function mousePressed() {
  if (mouseX >= 50 && mouseX <= 100 && mouseY >= 50 && mouseY <= 100) {
    toggleMusic();
  } else if (mouseX >= width - 100 && mouseX <= width - 50 && mouseY >= 50 && mouseY <= 100) {
    isPauseImage1 = !isPauseImage1;
    gameStarted = !gameStarted;
    if (gameStarted) {
      bgMusic.loop();
    } else {
      bgMusic.pause();
    }
  } else if (!gameStarted) {
    gameStarted = true;
    bgMusic.loop();
  } else if (isGameOver) {
    resetGame();
  }
}

function keyPressed() {
  if (isGameOver && key === ' ') {
    resetGame();
  }
  input.handleEvent(key, keyCode, true);
}

function keyReleased() {
  input.handleEvent(key, keyCode, false);
}

function drawStartScreen() {
  background(0);
  image(startImage, 0, 0, width, height);

  textAlign(CENTER, CENTER);
  textSize(64);
  noStroke();

  fill(0, 0, 0, 150);
  text("Press The Screen To Start The Game", width / 2 + 5, 555);

  let gradient = drawingContext.createLinearGradient(0, 0, width, 0);
  gradient.addColorStop(0, color(255, 0, 0));
  gradient.addColorStop(1, color(255, 255, 0));
  drawingContext.fillStyle = gradient;
  text("Press The Screen To Start The Game", width / 2, 550);
}


function drawGameOverScreen() {
  background(0);
  image(gameOverImage, 0, 0, width, height);

  textAlign(CENTER, CENTER);
  textSize(64);

  let gradient = drawingContext.createLinearGradient(0, 0, width, 0);
  gradient.addColorStop(0, color(237, 176, 15)); 
  gradient.addColorStop(1, color(255, 0, 0)); 
  drawingContext.fillStyle = gradient;

  text("Score: " + score, width / 2, 550);
  text("Highest Score: " + highScore, width / 2, 600);
}

function resetGame() {
  score = 0;
  lives = 3;
  level = 0;
  asteroids = [];
  lasers = [];
  dust = [];
  ship = new Ship();
  spawnAsteroids();
  isGameOver = false;
  canPlay = true;
  bgMusic.stop();
  bgMusic.loop();
  musicOn = true;
}

function spawnAsteroids() {
  for (var i = 0; i < level + 8; i++) {
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
  return t >= 0 && t <= 1 && u >= 0 && u <= 1;
}

function generateStars(numStars) {
  for (var i = 0; i < numStars; i++) {
    stars.push({
      x: random(width),
      y: random(height),
      size: random(1, 3)
    });
  }
}

function drawStars() {
  fill(255);
  noStroke();
  for (var i = 0; i < stars.length; i++) {
    ellipse(stars[i].x, stars[i].y, stars[i].size, stars[i].size);
  }
}

function addDust(position, velocity, numParticles) {
  for (var i = 0; i < numParticles; i++) {
    dust.push(new DustParticle(position, velocity));
  }
}

function toggleMusic() {
  musicOn = !musicOn;
  if (musicOn) {
    bgMusic.loop();
  } else {
    bgMusic.stop();
  }
}
