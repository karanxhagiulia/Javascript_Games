const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const collisionCanvas = document.getElementById('collisionCanvas');
const collisionCtx = collisionCanvas.getContext('2d');
collisionCanvas.width = window.innerWidth;
collisionCanvas.height = window.innerHeight;

let score = 0;
let gameOver= false;

ctx.font = '50px Impact'


let timeToNextRaven = 0;
let ravenInterval = 500;
let lastTime = 0 ;


let ravens = [];
class Raven {
  constructor(){
    this.spriteWidth = 271; //take the width and divide by horizontal 
    this.spriteHeight = 194;
    this.sizeModifier = Math.random() * 0.6 + 0.4; //to make the ravens a random size
    this.width = this.spriteWidth * this.sizeModifier ;
    this.height = this.spriteHeight * this.sizeModifier ;
    this.x = canvas.width;
    this.y = Math.random() * (canvas.height - this.height);
    this.directionX = Math.random() * 5+3 ; 
    this.directionY = Math.random() * 5 - 2.5;
    this.markedForDeletion = false;
    this.image = new Image();
    this.image.src = 'raven.png';
    this.frame = 0;
    this.maxFrame = 4;
    this.timeSinceFlap = 0;
    this.flapInterval = Math.random() * 50 + 50;
    this.randomColors = [Math.floor(Math.random()*255),
      Math.floor(Math.random()*255) , 
      Math.floor(Math.random()*255)]; //Three random color values assigned to each raven obj --we take the RGB value and if it matches we know we clicked on that color
    this.color = 'rgb(' + this.randomColors[0] + ',' + this.randomColors[1] + ',' + this.randomColors[2] + ')';
    this.hasTrail = Math.random() > 0.5; //to make the particles for half of the ravens
  }

  update(deltatime){
    if (this.y < 0 || this.y > canvas.height - this.height){
      this.directionY = this.directionY * -1;
    }
    this.x -= this.directionX;
    this.y += this.directionY;
    if (this.x < 0 - this.width ) this.markedForDeletion = true;
    this.timeSinceFlap += deltatime;
    if (this.timeSinceFlap > this.flapInterval){
      if (this.frame > this.maxFrame) this.frame=0;
      else this.frame++;
      this.timeSinceFlap = 0;
      if (this.hasTrail){
        for (let i = 0; i < 5; i++){
          particles.push(new Particle(this.x, this.y, this.width, this.color));
        }
      }
    }
    if (this.x < 0 - this.width) gameOver = true;
  }

  draw(){
    collisionCtx.fillStyle = this.color;
    collisionCtx.fillRect(this.x, this.y, this.width, this.height);
    ctx.drawImage(this.image, this.frame * this.spriteWidth, 0, this.spriteWidth, this.spriteHeight, this.x, this.y, this.width, this.height); 
  }

}

let explosions = []; //to hold all active animated explosions obj
class Explosions {
  constructor(x,y,size){
    this.image = new Image();
    this.image.src = 'boom.png';
    this.spriteHeight= 179;
    this.spriteWidth = 200;
    this.size = size;
    this.x = x;
    this.y = y;
    this.frame = 0;
    this.sound = new Audio();
    this.sound.src = 'boom.mp3';
    this.timeSinceLastFrame = 0;
    this.frameInterval = 200;
    this.markedForDeletion = false;
  }
  update(deltatime){
    if (this.frame === 0) this.sound.play();
    this.timeSinceLastFrame += deltatime;
    if (this.timeSinceLastFrame > this.frameInterval){
      this.frame++;
      this.timeSinceLastFrame = 0;
      if (this.frame > 5) this.markedForDeletion = true; //if all the explosion images are shown mark for deletion is set to true
    }
  }
  draw(){
    ctx.drawImage(this.image, this.frame * this.spriteWidth, 0, this.spriteWidth, this.spriteHeight, this.x,this.y - this.size/4, this.size, this.size );
  }

}

let particles = [];
class Particle {
  constructor(x, y, size, color){
    this.size = size;
    this.x = x + this.size/2 + Math.random() * 50 -25;
    this.y= y + this.size/3 + Math.random() * 50 -25;
    this.radius= Math.random() * this.size/10;
    this.maxRadius = Math.random() * 20 +35;
    this.markedForDeletion = false;
    this.speedX = Math.random() * 1 + 0.5;
    this.color= color;
    }
  
  update(){
    this.x += this.speedX;
    this.radius += 0.3;
    if (this.radius > this.maxRadius -5) this.markedForDeletion = true;
  }

  draw(){
    ctx.save();
    ctx.globalAlpha = 1 - this.radius/this.maxRadius;
    ctx.beginPath();
    ctx.fillStyle = this.color;
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  
  }
}

function drawScore(){
  ctx.fillStyle = 'black';
  ctx.fillText('Score: '+ score, 50, 75);
  ctx.fillStyle = 'white';
  ctx.fillText('Score: '+ score, 50, 80);

}

function drawGameOver(){
  ctx.textAlign = 'center';
  ctx.fillStyle = 'black';
  ctx.fillText('GAME OVER, your score is ' + score, canvas.width/2, canvas.height/2);
  ctx.fillStyle = 'white';
  ctx.fillText('GAME OVER, your score is ' + score, canvas.width/2, canvas.height/2 +5);
  // Draw Retry button
  ctx.fillStyle = 'red';
  ctx.fillRect(canvas.width/2 - 100, canvas.height/2 + 50, 200, 50);
  ctx.fillStyle = 'white';
  ctx.fillText('Retry', canvas.width/2, canvas.height/2 + 85);

}



window.addEventListener('click', function(e){
  const detectPixelColor = collisionCtx.getImageData(e.x, e.y, 1, 1);
  console.log(detectPixelColor);
  const pc = detectPixelColor.data;
  if (!gameOver) { // Check if the game is over
    ravens.forEach(object => {
      if (object.randomColors[0] === pc[0] && object.randomColors[1] === pc[1] && object.randomColors[2] === pc[2]){
        object.markedForDeletion = true ;
        score++;
        explosions.push(new Explosions(object.x, object.y, object.width));
        console.log(explosions);
      }
    });
  } else {
    // Check if click is within the Retry button area
    if (e.x >= canvas.width/2 - 100 && e.x <= canvas.width/2 + 100 && e.y >= canvas.height/2 + 50 && e.y <= canvas.height/2 + 100) {
      // Reset game variables
      score = 0;
      gameOver = false;
      ravens = [];
      particles = [];
      explosions = [];
      animate(0);
    } else {
      // Ignore click when the game is over and outside the Retry button area
      return;
    }
  }
});


function animate(timestamp){ 
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  collisionCtx.clearRect(0, 0, canvas.width, canvas.height);
  let deltatime = timestamp - lastTime;
  lastTime = timestamp;
  timeToNextRaven += deltatime;
  if (timeToNextRaven > ravenInterval){
    ravens.push(new Raven());
    timeToNextRaven = 0;
    ravens.sort(function(a,b){
        return a.width - b.width; // this will sort the ravens based on their width, hence the bigger ones will be on wrong (ASC order)
    });
  };
  drawScore();
  [...particles,...ravens, ...explosions].forEach(object => object.update(deltatime)); //array literal and spread operator
  [ ...particles,...ravens, ...explosions].forEach(object => object.draw());
  ravens = ravens.filter(object => !object.markedForDeletion);
  explosions = explosions.filter(object => !object.markedForDeletion);
  particles = particles.filter(object => !object.markedForDeletion);
  if (!gameOver) requestAnimationFrame(animate);
  else drawGameOver();

}


animate(0)