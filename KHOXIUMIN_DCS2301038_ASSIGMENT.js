let rects = [];
let speed = 6;
let rectWidth = 200;
let rectGap = 500;
let angle = 0;
let ballStates = [
    { x: 240, y: 200, offset: 400, active: true, speed: 2, velocity: 0, gravity: 0.2},   // small ball
    { x: 420, y: 200, offset: 400, active: true, speed: 2, velocity: 0, gravity: 0.2, movingRight: true },   // large ball 
    { x: 600, y: -100, offset: 1000, active: true, speed: 1, velocity: 0, gravity: 0.2 }    // medium ball
];

let img; 
let shadows = []; 
let shadowDuration = 50;

function preload() {
    img = loadImage('crescendo.png'); 
}

function setup() {
    createCanvas(1280, 720);
    background(255, 58, 80);
    for (let i = 0; i < 3; i++) {
        rects.push(createVector(-500 + i * rectGap, -700));
    }
}

function draw() {
    background(255, 58, 80); // Clear the background each frame
    noStroke();
    
    // Update positions of rectangles
    for (let i = 0; i < rects.length; i++) {
        rects[i].x -= speed;
        drawRect(rects[i].x, rects[i].y);
    }
    
    // Check if the first rectangle moves out of the canvas and move it to the third position
    if (rects[0].x + rectWidth < -width / 2) {
        rects[0].x = rects[2].x + rectGap;
        let temp = rects.shift();
        rects.push(temp);
    }

    angle += 0.05;

    drawPersistentShadows();

    drawBalls();

    let scaleFactor = 0.5 + sin(angle) * 0.2; 

    let imgWidth = 300 * scaleFactor; 
    let imgHeight = 300 * scaleFactor; 

    let imgX = width - imgWidth - 200;
    let imgY = height / 2 - imgHeight / 2; 

    push();
    translate(imgX + imgWidth / 2, imgY + imgHeight / 2);
    scale(scaleFactor);
    imageMode(CENTER);
    image(img, 0, 0, 500, 500); 
    pop();
}

function drawRect(x, y) {
    push();
    rotate(70);
    translate(x, y, 0);

    // Define light yellow and a lighter shade of dark color
    let lightYellowColor = color(255, 255, 226); 
    let lighterDarkColor = color(0); 

    // Loop through each horizontal pixel in the rectangle
    for (let i = 0; i < rectWidth; i++) {
        // Calculate the gradient color between light yellow and lighter dark color for each pixel
        let gradientColor = lerpColor(lightYellowColor, lighterDarkColor, i / (rectWidth * 3.9));
        // Set the fill color for the current pixel
        fill(gradientColor);
        // Draw a small vertical rectangle at the current position
        rect(700 + i, -700, 1, 3000);
    }
    pop();
}

function drawBalls() {
    for (let i = 0; i < ballStates.length; i++) {
        if (!ballStates[i].active) continue;

        // Apply gravity
        ballStates[i].velocity += ballStates[i].gravity;
        ballStates[i].y += ballStates[i].velocity;

        // Bounce logic
        let bounceHeight = ballStates[i].y + ballStates[i].offset / 2;

        if (i === 1) { // Large ball behavior
            // Move right
            if (ballStates[i].y < height / 2) {
                ballStates[i].x += ballStates[i].speed; 
            }

            // Bounce back to the left when exceeding x = 700
            if (ballStates[i].x > 680) {
                ballStates[i].speed = -Math.abs(ballStates[i].speed); // Reverse speed to move left
            }
            // Move left back to the original position
            if (ballStates[i].x < 425) {
                ballStates[i].speed = Math.abs(ballStates[i].speed); // Reverse speed to move right again
            }

            if (bounceHeight > height) {
                ballStates[i].y = 2 * height - ballStates[i].y - ballStates[i].offset; // Adjusting to maintain the bounce height
                ballStates[i].velocity *= -1;
                // Ball has bounced, draw shadow at bounceHeight
                drawShadow(ballStates[i].x, height, i); // Pass index i to draw appropriate shadow
            }
        } else { // Small ball (index 0) and medium ball (index 2) behavior
            if (bounceHeight > height) {
                ballStates[i].y = 2 * height - ballStates[i].y - ballStates[i].offset; // Adjusting to maintain the bounce height
                ballStates[i].velocity *= -1;
                // Ball has bounced, draw shadow at bounceHeight
                drawShadow(ballStates[i].x, height, i); // Pass index i to draw appropriate shadow
            }
        }


        if (i === 0) {
            drawTexturedCircleSmall(ballStates[i].x, ballStates[i].y, 80, angle);
        } else if (i === 1) {
            drawTexturedCircleLarge(ballStates[i].x, ballStates[i].y, 200, angle);
        } else if (i === 2) {
            drawTexturedCircleMedium(ballStates[i].x, ballStates[i].y, 100, angle);
        }
    }
}

function drawShadow(x, bottomPosition, index) {
    let shadowY;
    if (index === 0) {
        shadowY = bottomPosition - 180; 
        shadows.push({ x, y: shadowY, size: 80, type: 'small', timestamp: millis() });
    } else if (index === 1) {
        shadowY = bottomPosition - 140; 
        shadows.push({ x, y: shadowY, size: 200, type: 'large', timestamp: millis() });
    } else if (index === 2) {
        shadowY = bottomPosition - 480; 
        shadows.push({ x, y: shadowY, size: 120, type: 'medium', timestamp: millis() });
    }
}

function drawPersistentShadows() {
    let currentTime = millis();
    for (let i = shadows.length - 1; i >= 0; i--) {
        if (currentTime - shadows[i].timestamp > shadowDuration) {
            shadows.splice(i, 1);
        } else {
            if (shadows[i].type === 'small') {
                drawSmallBallShadow(shadows[i].x, shadows[i].y);
            } else if (shadows[i].type === 'large') {
                drawLargeBallShadow(shadows[i].x, shadows[i].y);
            } else if (shadows[i].type === 'medium') {
                drawMediumBallShadow(shadows[i].x, shadows[i].y);
            }
        }
    }
}

function drawSmallBallShadow(x, shadowY) {
    let offsetX = 40; 
    fill(0, 50); 
    ellipse(x + offsetX, shadowY, 80, 50); 
}

function drawLargeBallShadow(x, shadowY) {
    let offsetX = 100; 
    fill(0, 50); 
    ellipse(x + offsetX, shadowY, 200, 120); 
}

function drawMediumBallShadow(x, shadowY) {
    let offsetX = 60; 
    fill(0, 50); 
    ellipse(x + offsetX, shadowY, 120, 60); 
}



function drawTexturedCircleSmall(x, y, d, angle) {
    push();
    translate(x, y);
    rotate(angle);
    fill('93'); 
    circle(0, 0, d); 
    

    fill('white'); 
    beginShape();
    curveVertex(-35, 20);
    curveVertex(0, 25);
    curveVertex(34, 20);
    curveVertex(17, 37);
    curveVertex(-5, 41);
    curveVertex(-26, 31);
    endShape(CLOSE);

    fill(255, 58, 80); 
    beginShape();
    curveVertex(-40, -4);
    curveVertex(0, 4);
    curveVertex(38, -5);
    curveVertex(36, 19);
    curveVertex(30, 20);
    curveVertex(0, 25);
    curveVertex(-29, 22);
    curveVertex(-36, 18);
    curveVertex(-40, 10);
    endShape(CLOSE);

    fill('white'); 
    beginShape();
    curveVertex(-31, -25);
    curveVertex(0, -21);
    curveVertex(28, -25);
    curveVertex(36.5, -17);
    curveVertex(37, -2);
    curveVertex(0, 4);
    curveVertex(-37, -2);
    curveVertex(-39, -13);
    endShape(CLOSE);

    fill(255, 58, 80); 
    beginShape();
    curveVertex(-32, -25);
    curveVertex(-21, -35);
    curveVertex(0, -41);
    curveVertex(20, -35);
    curveVertex(30, -24);
    curveVertex(0, -20);
    endShape(CLOSE);
    pop();
}

function drawTexturedCircleMedium(x, y, d, angle) {
    push();
    translate(x, y);
    rotate(angle);
    fill('white'); 
    circle(0, 0, d); 



    fill(255, 58, 80); 
    beginShape();
    curveVertex(-50.5, 2);
    curveVertex(0, 7);
    curveVertex(48, -1 );
    curveVertex(46 , 20);
    curveVertex(35, 27);
    curveVertex(-6, 30);
    curveVertex(-43, 25);
    endShape(CLOSE);
  

    fill(255, 58, 80); 
    beginShape();
    curveVertex(-44, -25);
    curveVertex(0, -20);
    curveVertex(40, -25);
    curveVertex(29  , -42);
    curveVertex(0  , -51);
    curveVertex(-28, -42);
    endShape(CLOSE);
    pop();
}

function drawTexturedCircleLarge(x, y, d, angle) {
    push();
    translate(x, y);
    rotate(angle);
    fill('white'); 
    circle(0, 0, d); 
    

    fill(255, 58, 80); 
    beginShape();
    curveVertex(-66, 75);
    curveVertex(0, 80);
    curveVertex(60, 77);
    curveVertex(50, 85);
    curveVertex(0, 90);
    curveVertex(-50 , 85);
    endShape(CLOSE);
  
    fill(255, 58, 80); 
    beginShape();
    curveVertex(-85, 55);
    curveVertex(0, 60);
    curveVertex(77, 57);
    curveVertex(68, 65);
    curveVertex(0 , 70);
    curveVertex(-70 , 65);
    endShape(CLOSE);
  
    fill(255, 58, 80); 
    beginShape();
    curveVertex(-95, 35);
    curveVertex(0, 40);
    curveVertex(87, 37);
    curveVertex(77, 45);
    curveVertex(0 , 50);
    curveVertex(-80 , 45);
    endShape(CLOSE);

    fill(255, 58, 80);
    beginShape();
    curveVertex(-100, 15);
    curveVertex(0, 20);
    curveVertex(95, 17);
    curveVertex(75, 25);
    curveVertex(0 , 30);
    curveVertex(-87 , 25);
    endShape(CLOSE);

    fill(255, 58, 80); 
    beginShape();
    curveVertex(-101, -5);
    curveVertex(0, 0);
    curveVertex(91, -7);
    curveVertex(89, 5);
    curveVertex(0, 10);
    curveVertex(-90, 5);
    endShape(CLOSE);

    fill(255, 58, 80); 
    beginShape();
    curveVertex(-98, -25);
    curveVertex(0, -20);
    curveVertex(92, -27);
    curveVertex(77, -15);
    curveVertex(0 , -10);
    curveVertex(-87 , -15);
    endShape(CLOSE);

    fill(255, 58, 80); 
    beginShape();
    curveVertex(-90, -45);
    curveVertex(0, -40);
    curveVertex(83, -47);
    curveVertex(80, -35);
    curveVertex(0 , -30);
    curveVertex(-84 , -35);
    endShape(CLOSE);
  
    fill(255, 58, 80); 
    beginShape();
    curveVertex(-78, -65);
    curveVertex(0, -60);
    curveVertex(72, -67);
    curveVertex(68, -55);
    curveVertex(0 , -50);
    curveVertex(-75 , -55);
    endShape(CLOSE);

    fill(255, 58, 80); 
    beginShape();
    curveVertex(-55, -85);
    curveVertex(0, -80);
    curveVertex(50, -87);
    curveVertex(58, -75);
    curveVertex(0 , -70);
    curveVertex(-58 , -75);
    endShape(CLOSE);
    pop();
}