// G A M E   C O D E -->  Hi-Speed Cyber Space Ignition // check 29 for adding a new type of enemy (or canvas)
//falta: sonidos y colisión
//alert('Space Game Project // Developed by Plex3000');

var canvasBg = document.getElementById('canvasBg');
var ctxBg = canvasBg.getContext('2d');

var canvasJet = document.getElementById('canvasJet');
var ctxJet = canvasJet.getContext('2d');

var canvasEnemy = document.getElementById('canvasEnemy');
var ctxEnemy = canvasEnemy.getContext('2d');

var canvasHUD = document.getElementById('canvasHUD');
var ctxHUD = canvasHUD.getContext('2d');
ctxHUD.fillStyle = "hsla(99, 100%, 50%, 0.85)"; // hue, saturation, light, alpha

var imgSprite = new Image();
imgSprite.src = 'res/sprite.png';
imgSprite.addEventListener('load',init,false);

var imgSpaceBg = new Image();
imgSpaceBg.src = 'res/bg.png';
imgSpaceBg.addEventListener('load',init,false);

var bgmusic = 'res/bgm.mp3';
var shoot = 'res/shoot.mp3';
var boom = 'res/boom.mp3';
var death = 'res/death.mp3';


// V A R I A B L E S ----------------------------------------->

var jet1;
var btnPlay = new Button(350, 524, 350, 402); //xLeft, xRight, yTop, yBottom
var btnHowToPlay = new Button(70, 235, 356, 375);
var btnCredits = new Button(70, 235, 377, 396);
var btnReturnToMenu = new Button(320, 544, 445, 466);
var currentScreen;
var gameWidth = canvasBg.width;
var gameHeight = canvasBg.height;
var mouseX = 0;
var mouseY = 0;
var isPlaying = false;
var requestAnimFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.msRequestAnimationFrame || window.oRequestAnimationFrame || 
	function(callback) { window.setTimeout(callback, 1000 / 60); };

var enemies;
var enemyAmount = 5;
var gameSpeed = 4; //default is 4
var escapedEnemies;
var enemiesToInvade = 5;  //Limit of escaped enemies at which the player loses
var causeOfDeath; // possible values: 0 ship is not dead; 1 planet invasion; 2 collision death;

// F U N C T I O N S ----------------------------------------->

function init(){
	document.removeEventListener('keydown',checkContinue,false);
	document.removeEventListener('keydown',checkPause,false);
	ctxHUD.clearRect(0,0,gameWidth,gameHeight);
	ctxBg.clearRect(0,0,gameWidth,gameHeight);
	ctxJet.clearRect(0,0,gameWidth,gameHeight);
	ctxEnemy.clearRect(0,0,gameWidth,gameHeight);
	enemies = [];
	escapedEnemies = 0;
	ctxHUD.font = "20px 'Arial'";
	jet1 = new Jet();
	causeOfDeath = 0;

	//playSound(bgmusic);
	
	spawnEnemy(enemyAmount);
	//drawHowToPlay();
	//drawCredits();
	drawMenu();
	document.addEventListener('click',mouseClicked,false);
	
	ctxHUD.fillText("In development (v0.8) : by Plex3000", 50, 495);
}

function drawMenu(){
	ctxBg.drawImage(imgSpaceBg,0,500,gameWidth,gameHeight,0,0,gameWidth,gameHeight);
	currentScreen = 0;
}

function drawHowToPlay(){
	ctxBg.drawImage(imgSpaceBg,0,1065,gameWidth,gameHeight,0,0,gameWidth,gameHeight);
	currentScreen = 1;
}

function drawCredits(){
	ctxBg.drawImage(imgSpaceBg,0,1565,gameWidth,gameHeight,0,0,gameWidth,gameHeight);
	currentScreen = 2;
}

function playGame(){
	currentScreen = 3; //
	document.removeEventListener('click',mouseClicked,false);
	document.addEventListener('keydown',checkPause,false);
	drawBg();
	startLoop();
	updateHUD();
	document.addEventListener('keydown',checkKeyDown,false);
	document.addEventListener('keyup',checkKeyUp,false);
}

function pauseGame(){
	if (isPlaying){
		isPlaying = false;
		ctxHUD.fillText("Pause", 272, 100);
	}
	else if (!isPlaying && causeOfDeath == 0){
		ctxHUD.clearRect(0,0,gameWidth,gameHeight);
		isPlaying = true;
		playGame();
	}
}
function playSound(url){
  var audio = document.createElement('audio');
  audio.style.display = "none";
  audio.src = url;
  audio.autoplay = true;
  audio.onended = function(){
    audio.remove() //Remove when played.
  };
  document.body.appendChild(audio);
}
function gameOver(){
	isPlaying = false;
	playSound(death);
	ctxHUD.clearRect(0,0,gameWidth,gameHeight);
	ctxHUD.font = "30px 'Arial'";
	ctxHUD.fillText("Game Over", 220, 130); //text, X position, Y position
	if (causeOfDeath == 1) ctxHUD.fillText("Your ship has been destroyed!", 98, 200);
	if (causeOfDeath == 2) ctxHUD.fillText("Your planet has been invaded!", 98, 200);
	ctxHUD.fillText("Score: " +jet1.score, 100, 330);
	ctxHUD.fillText("Press X to continue", 100, 365);
	document.addEventListener('keydown',checkContinue,false);
}

function spawnEnemy(number){
	for (var i = 0; i < number; i++){
		enemies[enemies.length] = new Enemy();
	}
}

function drawAllEnemies(){
	clearCtxEnemy();
	for (var i = 0; i < enemies.length; i++){
		enemies[i].draw();
	}
}

function loop(){
	if (isPlaying) {
		scrollBg();
		jet1.draw();
		drawAllEnemies();
		requestAnimFrame(loop);
	}
}

function updateHUD(){
	ctxHUD.clearRect(0,0,gameWidth,gameHeight);
	ctxHUD.fillText("Invaders: " +escapedEnemies +"/" +enemiesToInvade, 470, 30); //text, X position, Y position
	ctxHUD.fillText("Score: " +jet1.score, 15, 30);
}

function drawBg(){
	ctxBg.clearRect(0,0,gameWidth,gameHeight);
	ctxBg.drawImage(imgSpaceBg,0,0,gameWidth,gameHeight,0,bgDrawY1,gameWidth,gameHeight);
	ctxBg.drawImage(imgSpaceBg,0,0,gameWidth,gameHeight,0,bgDrawY2,gameWidth,gameHeight);
	ctxBg.drawImage(imgSpaceBg,0,1000,gameWidth,65,0,435,gameWidth,65); // draw the atmosphere
}

var bgDrawY1 = 0;
var bgDrawY2 = -500;
var bgScrollSpeed = 10;
function scrollBg(){
	bgDrawY1 += bgScrollSpeed;
	bgDrawY2 += bgScrollSpeed;
	if (bgDrawY1 >= 500){
		bgDrawY1 = -500;
	} else if (bgDrawY2 >= 500){
		bgDrawY2 = -500;
	}
	drawBg();
}

//////////////////////////////////////////////////////////////

function startLoop(){
	isPlaying = true;
	loop();
}

function stopLoop(){
	isPlaying = false;
	stopSpawningEnemies();
}

//////////////////////////////////////////////////////////////

function Jet(){
	//positioning stuff
	this.srcX = 0; this.srcY = 0;
	this.width = 44; this.height = 64;
	this.drawX = 278; this.drawY = 400;
	this.isUpKey = false;
	this.isDownKey = false;
	this.isLeftKey = false;
	this.isRightKey = false;
	this.leftX = this.drawX;
	this.rightX = this.drawX + this.width;
	this.topY = this.drawY;
	this.bottomY = this.drawY + this.height;
	//shooting stuff
	this.cannonX = this.drawX + 16;
	this.cannonY = this.drawY + 0;
	this.isSpacebar = false;
	this.isShooting = false;
	this.bullets = [];
	this.currentBullet = 0;
	for (var i = 0; i < 25; i++){
		this.bullets[this.bullets.length] = new Bullet(this);
	}
	this.score = 0;
}

Jet.prototype.draw = function(){
	clearCtxJet();
	this.updateCoords();
	this.checkKeys();
	this.checkShooting();
	this.drawAllBullets();
	ctxJet.drawImage(imgSprite,this.srcX,this.srcY,this.width,this.height,this.drawX,this.drawY,this.width,this.height);
};

Jet.prototype.updateCoords = function(){
	this.cannonX = this.drawX + 16;
	this.cannonY = this.drawY + 4;
	this.leftX = this.drawX;
	this.rightX = this.drawX + this.width;
	this.topY = this.drawY;
	this.bottomY = this.drawY + this.height;
}

Jet.prototype.drawAllBullets = function(){
	for (var i = 0; i < this.bullets.length; i++){
		if (this.bullets[i].drawX >= 0) this.bullets[i].draw();
		if (this.bullets[i].explosion.hasHit) this.bullets[i].explosion.draw();
	}
};

Jet.prototype.checkShooting = function(){
	if (this.isSpacebar && !this.isShooting){
		this.isShooting = true;
		playSound(shoot);
		this.bullets[this.currentBullet].fire(this.cannonX, this.cannonY);
		this.currentBullet++;
		if (this.currentBullet >= this.bullets.length) this.currentBullet = 0;
	} else if (!this.isSpacebar){
		this.isShooting = false;
	}
};

Jet.prototype.checkKeys = function(){
	if (this.isUpKey && this.topY > 5) {
		this.drawY -= gameSpeed+1;
	}
	if (this.isDownKey && this.bottomY < gameHeight-5) {
		this.drawY += gameSpeed+1;
	}
	if (this.isLeftKey && this.leftX > 3) {
		this.drawX -= gameSpeed+1;
	}
	if (this.isRightKey && this.rightX < gameWidth-3) {
		this.drawX += gameSpeed+1;
	}
};

Jet.prototype.updateScore = function(points){
	this.score += points;
	updateHUD();
};

//////////////////////////////////////////////////////////////

function Bullet(j){
	this.jet = j;
	this.srcX = 0;
	this.srcY = 64;
	this.drawX = -12;
	this.drawY = 0;
	this.width = 12;
	this.height = 12;
	this.explosion = new Explosion();
}

Bullet.prototype.draw = function(){
	this.drawY -= gameSpeed+2;
	ctxJet.drawImage(imgSprite,this.srcX,this.srcY,this.width,this.height,this.drawX,this.drawY,this.width,this.height);
	this.checkHitEnemy();
	if (this.drawY < -12) this.recycle();
};

Bullet.prototype.fire = function(startX, startY){
	this.drawX = startX;
	this.drawY = startY;
};

Bullet.prototype.checkHitEnemy = function(){
	for (var i = 0; i < enemies.length; i++){
		if (this.drawX >= enemies[i].drawX &&
			this.drawX <= enemies[i].drawX + enemies[i].width &&
			this.drawY >= enemies[i].drawY &&
			this.drawY <= enemies[i].drawY + enemies[i].height){
				this.explosion.drawX = enemies[i].drawX;
				this.explosion.drawY = enemies[i].drawY;
				this.explosion.hasHit = true;
				this.recycle();
				enemies[i].recycleEnemy();
				this.jet.updateScore(enemies[i].rewardPoints);
				playSound(boom);
		}
	}
};

Bullet.prototype.recycle = function(){
	this.drawX = -12;
};

//////////////////////////////////////////////////////////////

function Explosion(){
	this.srcX = 44;
	this.srcY = 48;
	this.drawX = 0;
	this.drawY = 0;
	this.width = 52;
	this.height = 52;
	this.hasHit = false;
	this.currentFrame = 0;
	this.totalFrames = 15;
}

Explosion.prototype.draw = function(){
	if (this.currentFrame <= this.totalFrames){
		ctxJet.drawImage(imgSprite,this.srcX,this.srcY,this.width,this.height,this.drawX,this.drawY,this.width,this.height);
		this.currentFrame++;
	} else{
		this.hasHit = false;
		this.currentFrame = 0;
	}
};

//////////////////////////////////////////////////////////////

function Enemy(){
	this.srcX = 44; this.srcY = 0;
	this.width = 52; this.height = 48;
	this.drawX = Math.floor(Math.random() * 556);
	this.drawY = Math.floor(Math.random() * 450) - gameHeight;
	this.speed = gameSpeed;
	this.rewardPoints = 2;
}

Enemy.prototype.draw = function(){
	this.drawY += this.speed;
	ctxEnemy.drawImage(imgSprite,this.srcX,this.srcY,this.width,this.height,this.drawX,this.drawY,this.width,this.height);
	this.checkEscaped();
};

Enemy.prototype.checkEscaped = function(){
	if (this.drawY >= gameHeight){
		this.recycleEnemy();
		escapedEnemies++;
		updateHUD();
		if (escapedEnemies >= enemiesToInvade) {
			causeOfDeath = 2;
			gameOver();
		}
	}
};

Enemy.prototype.recycleEnemy = function(){
	this.drawX = Math.floor(Math.random() * 438);
	this.drawY = Math.floor(Math.random() * 450) - gameHeight;
};

//////////////////////////////////////////////////////////////

function Button(xL, xR, yT, yB){ // PLAY
	this.xLeft = xL;
	this.xRight = xR;
	this.yTop = yT;
	this.yBottom = yB;
}

Button.prototype.checkClicked = function(){
	if (this.xLeft <= mouseX && mouseX <= this.xRight && this.yTop <= mouseY && mouseY <= this.yBottom) return true;
};

function Btn1(xL, xR, yT, yB){ // HOW TO PLAY
	this.xLeft = xL;
	this.xRight = xR;
	this.yTop = yT;
	this.yBottom = yB;
}

Btn1.prototype.checkClicked = function(){
	if (this.xLeft <= mouseX && mouseX <= this.xRight && this.yTop <= mouseY && mouseY <= this.yBottom) return true;
};

function Btn2(xL, xR, yT, yB){ // CREDITS
	this.xLeft = xL;
	this.xRight = xR;
	this.yTop = yT;
	this.yBottom = yB;
}

Btn2.prototype.checkClicked = function(){
	if (this.xLeft <= mouseX && mouseX <= this.xRight && this.yTop <= mouseY && mouseY <= this.yBottom) return true;
};
//////////////////////////////////////////////////////////////

function clearCtxJet(){
	ctxJet.clearRect(0,0,gameWidth,gameHeight);
}

function clearCtxEnemy(){
	ctxEnemy.clearRect(0,0,gameWidth,gameHeight);
}

//////////////////////////////////////////////////////////////

function mouseClicked(e){
	mouseX = e.pageX - canvasBg.offsetLeft;
	mouseY = e.pageY - canvasBg.offsetTop;
	if (!isPlaying && currentScreen == 0){ //on Main Menu
		if (btnPlay.checkClicked()) playGame();
		if (btnHowToPlay.checkClicked()) drawHowToPlay();
		if (btnCredits.checkClicked()) drawCredits();
	}
	if (!isPlaying && currentScreen == 1 || currentScreen == 2){ //on How To Play or Credits
		if (btnReturnToMenu.checkClicked()){
			ctxBg.clearRect(0,0,gameWidth,gameHeight);
			drawMenu();
		}
	}
}

// KEY PRESSED-->
function checkKeyDown(e){
	var keyID = e.keyCode || e.which;
	if (keyID === 38 || keyID === 87) { // up arrow key OR w key
		jet1.isUpKey = true;
		e.preventDefault();
	}
	if (keyID === 37 || keyID === 65) { // left arrow key OR a key
		jet1.isLeftKey = true;
		e.preventDefault();
	}
	if (keyID === 40 || keyID === 83) { // down arrow key OR s key
		jet1.isDownKey = true;
		e.preventDefault();
	}
	if (keyID === 39 || keyID === 68) { // right arrow key OR d key
		jet1.isRightKey = true;
		e.preventDefault();
	}
	if (keyID === 32) { // Spacebar
		jet1.isSpacebar = true;
		e.preventDefault();
	}
} // END OF KEY PRESSED

// KEY RELEASED-->
function checkKeyUp(e){
	var keyID = e.keyCode || e.which;
	if (keyID === 38 || keyID === 87) { // up arrow key OR w key
		jet1.isUpKey = false;
		e.preventDefault();
	}
	if (keyID === 37 || keyID === 65) { // left arrow key OR a key
		jet1.isLeftKey = false;
		e.preventDefault();
	}
	if (keyID === 40 || keyID === 83) { // down arrow key OR s key
		jet1.isDownKey = false;
		e.preventDefault();
	}
	if (keyID === 39 || keyID === 68) { // right arrow key OR d key
		jet1.isRightKey = false;
		e.preventDefault();
	}
	if (keyID === 32) { // Spacebar
		jet1.isSpacebar = false;
		e.preventDefault();
	}
} // END OF KEY RELEASED

function checkContinue(x){
	var keyID = x.keyCode || x.which;
	if (keyID === 88) { // x key
		init(); // reset game
		x.preventDefault();
	}
}

function checkPause(p){
	var keyID = p.keyCode || p.which;
	if (keyID === 80) { // p key
		pauseGame();
		p.preventDefault();
	}
}


function playSound(url){
  var audio = document.createElement('audio');
  audio.style.display = "none";
  audio.src = url;
  audio.autoplay = true;
  audio.onended = function(){
    //audio.play()
    audio.remove() //Remove when played.
  };
  document.body.appendChild(audio);
}

// E N D   O F   G A M E   C O D E ------------------------->
