import {
	simpleLevelPlan,
	GAME_LEVELS
} from './levels/level-plans.js';

// Assumes the plan is valid (add validation for production)
function Level(plan) {
	this.width = plan[0].length;
	this.height = plan.length;
	// Array of arrays, each position containing null or a character
	this.grid = [];
	// Contains all of the dynamic objects (lava, coin or player),
	// along with their position and state
	this.actors = [];

	for (let y = 0; y < this.height; y++) {
		let line = plan[y],
			gridLine = [];
		for (let x = 0; x < this.width; x++) {
			let ch = line[x],
				fieldType = null;
			let Actor = actorChars[ch];
			if (Actor)

				// This constructs the referenced moving object in
				// actorChars and pushes it to the actors array
				this.actors.push(new Actor(new Vector(x, y), ch));
			else if (ch == 'x')
				// Wall
				fieldType = 'wall';
			else if (ch == '!')
				// Stationary lava
				fieldType = 'lava';
			gridLine.push(fieldType);
		}
		this.grid.push(gridLine);
	}

	// Find the Player actor
	this.player = this.actors.filter(function (actor) {
		return actor.type == 'player';
	})[0];

	// Track whether the player has won or lost;
	// finishDelay keeps the level active for a brief period of time
	this.status = this.finishDelay = null;
};

// Figure out if the level is finished
Level.prototype.isFinished = function () {
	return this.status != null && this.finishDelay < 0
};

// Figure out the collision area of an actor
Level.prototype.obstacleAt = function (pos, size) {
	let xStart = Math.floor(pos.x);
	let xEnd = Math.ceil(pos.x + size.x);
	let yStart = Math.floor(pos.y);
	let yEnd = Math.ceil(pos.y + size.y);

	// The upper and side bounds of the level return a wall
	if (xStart < 0 || xEnd > this.width || yStart < 0) return 'wall';

	// The bottom bound returns lava
	if (yEnd > this.height) return 'lava';

	// Check what's on the grid around the collision box
	for (let y = yStart; y < yEnd; y++) {
		for (let x = xStart; x < xEnd; x++) {
			let fieldType = this.grid[y][x];
			// returns 'wall' or 'lava'
			if (fieldType) return fieldType;
		}
	}
};

// Track what actors overlap a given actor
Level.prototype.actorAt = function (actor) {
	for (let i = 0; i < this.actors.length; i++) {
		let other = this.actors[i];

		if (other != actor &&
			actor.pos.x + actor.size.x > other.pos.x &&
			actor.pos.x < other.pos.x + other.size.x &&
			actor.pos.y + actor.size.y > other.pos.y &&
			actor.pos.y < other.pos.y + other.size.y)

			return other;
	}
};

// Time increment for Level.animate()
let maxStep = 0.05;

// Animate the level
// step will be given in seconds, keys is an object that
// contains info about the arrow keys the player has pressed.
Level.prototype.animate = function (step, keys) {

	// Used for the delay at the end of a game
	if (this.status != null)
		this.finishDelay -= step;

	while (step > 0) {
		let thisStep = Math.min(step, maxStep);
		this.actors.forEach(function (actor) {
			actor.act(thisStep, this, keys);
		}, this);
		step -= thisStep;
	}
};

// Handle collisions between actors
Level.prototype.playerTouched = function (type, actor) {
	// Lava's been touched
	if (type == 'lava' && this.status == null) {
		this.status = 'lost';
		this.finishDelay = 1;
	} else if (type == 'coin') { // a coin's been touched
		// Remove the coin that's been collected from actors array
		this.actors = this.actors.filter(function (other) {
			return other != actor;
		});
		// No more coins = you've won
		if (!this.actors.some(function (actor) {
				return actor.type == 'coin';
			})) {
			this.status = 'won';
			this.finishDelay = 1;
		}
	}
}

let actorChars = {
	'@': Player,
	'o': Coin,
	'=': Lava,
	'|': Lava,
	'v': Lava
};

// Vector stores the position and size of an actor
function Vector(x, y) {
	this.x = x;
	this.y = y;
}
Vector.prototype.plus = function (other) {
	return new Vector(this.x + other.x, this.y + other.y);
}
Vector.prototype.times = function (factor) {
	return new Vector(this.x * factor, this.y * factor);
}

// Player constructor
function Player(pos) {
	// This properly aligns the bottom of the player
	// to the square below (adjusts for player height)
	this.pos = pos.plus(new Vector(0, -0.5));
	this.size = new Vector(0.8, 1.5);
	this.speed = new Vector(0, 0);
}
Player.prototype.type = 'player';

// X and Y movement are handled independently because
// a wall shouldn't stop the up and down motion of jumping
// and a floor shouldn't stop side to side movement
let playerXSpeed = 7;
Player.prototype.moveX = function (step, level, keys) {
	this.speed.x = 0;
	if (keys.left) this.speed.x -= playerXSpeed;
	if (keys.right) this.speed.x += playerXSpeed;

	let motion = new Vector(this.speed.x * step, 0);
	let newPos = this.pos.plus(motion);
	let obstacle = level.obstacleAt(newPos, this.size);

	if (obstacle) level.playerTouched(obstacle);
	else this.pos = newPos;
};

let gravity = 30;
let jumpSpeed = 17;

Player.prototype.moveY = function (step, level, keys) {
	this.speed.y += step * gravity;
	let motion = new Vector(0, this.speed.y * step);
	let newPos = this.pos.plus(motion);
	let obstacle = level.obstacleAt(newPos, this.size);
	if (obstacle) {
		level.playerTouched(obstacle);
		if (keys.up && this.speed.y > 0)
			this.speed.y = -jumpSpeed;
		else
			this.speed.y = 0;
	} else {
		this.pos = newPos;
	}
};
Player.prototype.act = function (step, level, keys) {
	this.moveX(step, level, keys);
	this.moveY(step, level, keys);

	let otherActor = level.actorAt(this);
	if (otherActor)
		level.playerTouched(otherActor.type, otherActor);

	// Losing animation
	if (level.status == 'lost') {
		this.pos.y += step;
		this.size.y -= step;
	}
};

// Lava constructor
function Lava(pos, ch) {
	this.pos = pos;
	this.size = new Vector(1, 1);
	if (ch == "=") {
		// I'm guessing that speed will be added to this.pos
		// in a moving method added later
		this.speed = new Vector(2, 0);
	} else if (ch == '|') {
		this.speed = new Vector(0, 2);
	} else if (ch == 'v') {
		this.speed = new Vector(0, 3);
		this.repeatPos = pos;
	}
}
Lava.prototype.type = 'lava';
// Action
Lava.prototype.act = function (step, level) {
	let newPos = this.pos.plus(this.speed.times(step));
	if (!level.obstacleAt(newPos, this.size))
		this.pos = newPos;
	else if (this.repeatPos)
		this.pos = this.repeatPos;
	else
		this.speed = this.speed.times(-1);
};

// Coin constructor
function Coin(pos) {
	this.basePos = this.pos = pos.plus(new Vector(0.2, 0.1));
	this.size = new Vector(0.6, 0.6);
	this.wobble = Math.random() * Math.PI * 2;
}
Coin.prototype.type = 'coin';
let wobbleSpeed = 8,
	wobbleDist = 0.07;
// Action
Coin.prototype.act = function (step) {
	this.wobble += step * wobbleSpeed;
	let wobblePos = Math.sin(this.wobble) * wobbleDist;
	this.pos = this.basePos.plus(new Vector(0, wobblePos));
};

// Helper function that creates an element
// and gives it a class
function elt(name, className) {
	let elt = document.createElement(name);
	if (className) elt.className = className;
	return elt;
}

// Tracking keypresses for player movement
let arrowCodes = {
	37: 'left',
	38: 'up',
	39: 'right'
};

//TODO !!BOOKMARK ARROW KEYS

function trackKeys(codes) {
	let pressed = Object.create(null);

	function handler(event) {
		if (codes.hasOwnProperty(event.keyCode)) {
			let down = event.type == 'keydown';
			pressed[codes[event.keyCode]] = down;
			event.preventDefault();
		}
	}
	addEventListener('keydown', handler);
	addEventListener('keyup', handler);

	pressed.unregister = function () {
		removeEventListener('keydown', handler);
		removeEventaListener('keydown', keyDown);
		removeEventaListener('keyup', keyDown);
		removeEventListener('keyup', handler);
	};

	return pressed;
}

// Run the animation
function runAnimation(frameFunc) {
	let lastTime = null;

	function frame(time) {
		let stop = false;
		if (lastTime != null) {
			let timeStep = Math.min(time - lastTime, 100) / 1000;
			stop = frameFunc(timeStep) === false;
		}
		lastTime = time;
		if (!stop)
			requestAnimationFrame(frame);
	}
	requestAnimationFrame(frame);
}

// Run the level
let arrows = trackKeys(arrowCodes);

function runLevel(level, Display, andThen) {
	let display = new Display(document.body, level);
	// Used for storing pause state of the game
	let running = 'yes';

	function handleKey(event) {
		if (event.keyCode == 27) {
			if (running == 'no') {
				running = 'yes';
				runAnimation(animation);
			} else if (running == 'pausing') {
				running = 'yes';
			} else if (running == 'yes') {
				running = 'pausing';
			}
		}
	}
	addEventListener('keydown', handleKey);

	function animation(step) {
		if (running == 'pausing') {
			running = 'no';
			return false;
		}

		level.animate(step, arrows);
		display.drawFrame(step);
		if (level.isFinished()) {
			display.clear();
			// Remove the watch on the esc key
			//removeEventListener('keydown', handleKey);
			// Unregister the arrow key listeners
			//arrows.unregister();
			if (andThen)
				andThen(level.status);
			return false;
		}
	}

	runAnimation(animation);
}

// Run the game
function runGame(plans, Display) {
	let lives = 3;
	let livesSpan = document.getElementById('lives');
	let gameStatus = document.getElementById('status');

	function startLevel(n) {
		livesSpan.textContent = lives;
		runLevel(new Level(plans[n]), Display, function (status) {
			if (status == 'lost') {
				lives--;
				if (lives == 0) {
					gameStatus.textContent = 'Game Over';
					console.log('Game over');
				} else
					startLevel(n);
			} else if (n < plans.length - 1)
				startLevel(n + 1);
			else
				console.log('You win!');
		});
	}
	startLevel(0);
}


// DOMDisplay uses the DOM to draw the program out
function DOMDisplay(parent, level) {
	this.wrap = parent.appendChild(elt('div', 'game'));
	this.level = level;
	const keyDown = (e) => {
		const evt = e.detail.event
		app.dispatchEvent(evt);
		console.log('in ga,e', evt);
	}
	this.wrap.addEventListener('keydown', keyDown)
	// Background is drawn only once
	this.wrap.appendChild(this.drawBackground());
	// The actorLayer is animated in the drawFrame() method
	this.actorLayer = null;
	this.drawFrame();
}
// Set the scale of 1 grid unit
let scale = 20;
// Draw the background
DOMDisplay.prototype.drawBackground = function () {
	let table = elt('table', 'background');
	table.style.width = this.level.width * scale + 'px';
	this.level.grid.forEach(function (row) {
		let rowElt = table.appendChild(elt('tr'));
		rowElt.style.height = scale + 'px';
		row.forEach(function (type) {
			rowElt.appendChild(elt('td', type));
		});
	});
	return table;
};
// Draw the actors
DOMDisplay.prototype.drawActors = function () {
	let wrap = elt('div');
	this.level.actors.forEach(function (actor) {
		let rect = wrap.appendChild(elt('div', 'actor ' + actor.type));
		rect.style.width = actor.size.x * scale + 'px';
		rect.style.height = actor.size.y * scale + 'px';
		rect.style.left = actor.pos.x * scale + 'px';
		rect.style.top = actor.pos.y * scale + 'px';
	});
	return wrap;
};
// Redraw the actors
DOMDisplay.prototype.drawFrame = function () {
	if (this.actorLayer)
		this.wrap.removeChild(this.actorLayer);
	this.actorLayer = this.wrap.appendChild(this.drawActors());
	// The status class is used to style the player based on
	// the state of the game (won or lost)
	this.wrap.className = 'game ' + (this.level.status || '');
	this.scrollPlayerIntoView();
};
// Make sure the player's always on screen
DOMDisplay.prototype.scrollPlayerIntoView = function () {
	let width = this.wrap.clientWidth;
	let height = this.wrap.clientHeight;
	let margin = width / 3;

	// The viewport
	let left = this.wrap.scrollLeft,
		right = left + width;
	let top = this.wrap.scrollTop,
		bottom = top + height;

	// center makes use of the Vector methods defined earlier
	let player = this.level.player;
	let center = player.pos.plus(player.size.times(0.5))
		.times(scale);

	if (center.x < left + margin)
		this.wrap.scrollLeft = center.x - margin;
	else if (center.x > right - margin)
		this.wrap.scrollLeft = center.x + margin - width;
	if (center.y < top + margin)
		this.wrap.scrollTop = center.y - margin;
	else if (center.y > bottom - margin)
		this.wrap.scrollTop = center.y + margin - height;
}
// Clear the level
DOMDisplay.prototype.clear = function () {
	this.wrap.parentNode.removeChild(this.wrap);
};


runGame(GAME_LEVELS, DOMDisplay);


// Pick up here: http://eloquentjavascript.net/15_game.html#p_GkkSB/bDtt