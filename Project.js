let leftPlayer, rightPlayer, ball;
let leftScore = 0, rightScore = 0;
let leftRacketUp = false, leftRacketForward = false, leftRacketBackward = false;
let rightRacketUp = false, rightRacketForward = false, rightRacketBackward = false;
let ballMoving = true;

function setup() {
    let canvas = createCanvas(1280, 720);
    canvas.parent('game');
    leftPlayer = new Racket(50, height - 150, 'left', false); // Human player
    rightPlayer = new Racket(width - 70, height - 150, 'right', false); // Human player
    ball = new Ball(width / 2, height / 2); // Initial position in the center of the court
}

function draw() {
    background(132, 185, 77, 255); // Tennis court green

    fill(255);
    stroke(129, 128, 124, 255); // Net color
    strokeWeight(20); // Net line width
    line(width / 2, height - 200, width / 2, height); // Tennis net in side view

    noStroke();
    textSize(32);
    textAlign(CENTER, CENTER);
    text(`Left Player: ${leftScore}                 Right Player: ${rightScore}`, width / 2, 50);

    leftPlayer.display();
    rightPlayer.display();
    ball.display();

    leftPlayer.move(leftRacketUp, leftRacketForward, leftRacketBackward);
    rightPlayer.move(rightRacketUp, rightRacketForward, rightRacketBackward);

    leftPlayer.applyGravity();
    rightPlayer.applyGravity();

    if (ballMoving) {
        ball.update(leftPlayer, rightPlayer);
    }

    checkScore();
}

function checkScore() {
    if (ball.x < 0) {
        rightScore++;
        resetBall();
    } else if (ball.x > width) {
        leftScore++;
        resetBall();
    }

    if (leftScore >= 5 || rightScore >= 5) {
        noLoop();
        let winner = leftScore > rightScore ? "Left Player Wins!" : "Right Player Wins!";
        fill(255);
        textSize(64);
        textAlign(CENTER, CENTER);
        text(winner, width / 2, height / 2);
    }
}

function resetBall() {
    ball = new Ball(width / 2, height / 2); // Reset ball position to the center
    ballMoving = true;
}

function keyPressed() {
    if (keyCode === UP_ARROW) rightRacketUp = true;
    if (keyCode === LEFT_ARROW) rightRacketForward = true;
    if (keyCode === RIGHT_ARROW) rightRacketBackward = true;

    if (keyCode === 87) leftRacketUp = true; // W key
    if (keyCode === 65) leftRacketForward = true; // A key
    if (keyCode === 68) leftRacketBackward = true; // D key
}

function keyReleased() {
    if (keyCode === UP_ARROW) rightRacketUp = false;
    if (keyCode === LEFT_ARROW) rightRacketForward = false;
    if (keyCode === RIGHT_ARROW) rightRacketBackward = false;

    if (keyCode === 87) leftRacketUp = false; // W key
    if (keyCode === 65) leftRacketForward = false; // A key
    if (keyCode === 68) leftRacketBackward = false; // D key
}

class Racket {
    constructor(x, y, side, isComputer) {
        this.x = x;
        this.y = y;
        this.width = 20;
        this.height = 100;
        this.side = side;
        this.isComputer = isComputer;
        this.groundY = y; // Default ground position
        this.jumpSpeed = -12; // Initial jump speed
        this.gravity = 0.8; // Gravity force
        this.velocityY = 0; // Initial vertical velocity
        this.jumping = false;
    }

    display() {
        fill(241, 194, 125);
        rect(this.x, this.y, this.width, this.height); // Body
        ellipse(this.x + 10, this.y - 20, 40, 40); // Head

        // Draw arm
        stroke(241, 194, 125);
        strokeWeight(15);
        if (this.side === 'left') {
            line(this.x + 10, this.y + 40, this.x + 60, this.y); // Arm positioned at the body
        } else {
            line(this.x + 10, this.y + 40, this.x - 40, this.y); // Arm positioned at the body
        }

        // Draw racket handle
        stroke(0);
        strokeWeight(10);
        if (this.side === 'left') {
            line(this.x + 60, this.y, this.x + 80, this.y - 40); // Handle
        } else {
            line(this.x - 40, this.y, this.x - 60, this.y - 40); // Handle
        }

        // Draw racket head
        noStroke();
        fill(0);
        if (this.side === 'left') {
            ellipse(this.x + 80, this.y - 60, 30, 60); // Head
        } else {
            ellipse(this.x - 60, this.y - 60, 30, 60); // Head
        }
    }

    move(up, forward, backward) {
        if (up && !this.jumping) {
            this.velocityY = this.jumpSpeed;
            this.jumping = true;
        }
        if (forward && this.x > 0) {
            this.x -= 5;
        }
        if (backward && this.x < width - this.width) {
            this.x += 5;
        }
    }

    applyGravity() {
        this.y += this.velocityY;
        this.velocityY += this.gravity;

        if (this.y >= this.groundY) {
            this.y = this.groundY;
            this.jumping = false;
            this.velocityY = 0;
        }
    }
}

class Ball {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 15;
        this.xSpeed = random([-6, 6]); // Ensure the ball moves initially to the left or right
        this.ySpeed = random(-2, 2); // Random initial vertical speed
        this.gravity = 0.2; // Gravity for the ball
        this.bounced = false;
    }

    display() {
        fill(255);
        ellipse(this.x, this.y, this.radius * 2);
    }

    update(leftRacket, rightRacket) {
        this.x += this.xSpeed;
        this.y += this.ySpeed;
        this.ySpeed += this.gravity; // Apply gravity to the ball

        // Prevent the ball from going too high
        if (this.y < this.radius) {
            this.y = this.radius;
            this.ySpeed *= -1;
        }

        // Check for ground collision
        if (this.y > height - this.radius) {
            this.y = height - this.radius;
            this.ySpeed *= -0.8; // Ball loses some speed after bouncing
            this.bounced = true;
            this.handleMissedBall();
        }

        // Check for net collision
        if (this.x > width / 2 - 10 && this.x < width / 2 + 10 && this.y > height - 200) {
            this.handleNetCollision();
        }

        // Check for collision with left racket
        if (this.x - this.radius < leftRacket.x + leftRacket.width &&
            this.y > leftRacket.y && this.y < leftRacket.y + leftRacket.height) {
            this.xSpeed = 5; // Speed towards right player
            this.ySpeed = random(-8, -12); // Increased bounce height after hit
            this.bounced = false;
        }

        // Check for collision with right racket
        if (this.x + this.radius > rightRacket.x &&
            this.y > rightRacket.y && this.y < rightRacket.y + rightRacket.height) {
            this.xSpeed = -5; // Speed towards left player
            this.ySpeed = random(-8, -12); // Increased bounce height after hit
            this.bounced = false;
        }

        // Limit ball's travel area
        if (this.x < 0 || this.x > width) {
            this.handleMissedBall();
        }
    }

    handleNetCollision() {
        if (this.xSpeed > 0) {
            leftScore++;
        } else {
            rightScore++;
        }
        resetBall();
    }

    handleMissedBall() {
        if (this.xSpeed > 0) {
            leftScore++;
        } else {
            rightScore++;
        }
        resetBall();
    }
}



