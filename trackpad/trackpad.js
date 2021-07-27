const keys = document.querySelectorAll('.arrow-key')
const kb = document.querySelector('.keyboard')
const app = document.querySelector('.app')
const block = document.querySelector('#block')
const stage = document.querySelector('.stage')
const trackpad = document.querySelector('.trackpad')
const tester = document.querySelector('.test-input')
const gameEl = document.querySelector('.game')

var arrowCodes = { 37: 'left', 38: 'up', 39: 'right' };
var codes = new Map(Object.entries({ 'left': 37, 'up': 38, 'right': 39 }))


trackpad.addEventListener('touchmove', e => {
	let stageStyles = window.getComputedStyle(stage);
	let blockStyles = window.getComputedStyle(block);
	let stageHeight = parseInt(stageStyles.height);
	let blockHeight = parseInt(blockStyles.height);
	// if (touch.pageY + blockHeight  >= stageHeight) {
	// 	console.log('limit');
	// 	return
	// }


	const touch = e.touches[0];
	const evt = new CustomEvent('trackMove', { bubbles: true, detail: { x: touch.clientX, y: touch.clientY } })
	trackpad.dispatchEvent(evt);
});

trackpad.addEventListener('dblclick', e => {
	let blockStyles = window.getComputedStyle(block);
	let blockHeight = parseInt(blockStyles.height);
	let blockWidth = parseInt(blockStyles.width);
	let stageStyles = window.getComputedStyle(stage);


	const newHeight = (blockHeight + 40) > 200 ? 50 : blockHeight += 40;
	const newWidth = (blockWidth + 40) > 200 ? 50 : blockWidth += 40;

	block.style.height = `${newHeight}px`
	block.style.width = `${newWidth}px`
});

keys.forEach(k => {
	k.addEventListener('click', e => {
		//simulate key ptess
		const eName = `Arrow${k.id[0].toUpperCase()}${k.id.slice(1)}`
		const evt = new KeyboardEvent('keydown', { bubbles: true, key: eName, keyCode: codes.get(k.id) })
		k.dispatchEvent(evt);
	})
})

document.addEventListener('keydown', e => {});
console.log('block y', parseInt(window.getComputedStyle(block).top));
//app touch listener
app.addEventListener('trackMove', e => {
	let blockStyles = window.getComputedStyle(block);
	let stageStyles = window.getComputedStyle(stage);
	const { x, y } = e.detail
	// console.log(blockStyles);

	let blockHeight = parseInt(blockStyles.height);
	let blockCurrentX = parseInt(blockStyles.left);
	let blockCurrentY = parseInt(blockStyles.top);

	let stageHeight = parseInt(stageStyles.height);
	let stageWidth = parseInt(stageStyles.width);
	stage.style.width = '360px';

	if (blockCurrentX <= 0) {
		block.style.left = `1px`
		console.log('left limit');
		// block.style.top = `1px`
		return

	}

	if (blockCurrentY <= 0) {
		block.style.top = `1px`
		console.log('top limit');
		return
	}

	// if ((y - stageHeight) + blockHeight >= stageHeight) {
	// 	block.style.left = `${x}px`
	// 	console.log('y limit');
	// 	return
	// }

	// if (x + blockHeight >= stageWidth) {
	// 	console.log('x limit');
	// 	block.style.top = `${blockCurrentY + (y - stageHeight)}px`
	// 	return
	// }

	if (x > blockCurrentX + 30) {
		block.style.left = `${blockCurrentX + (x - blockCurrentX)}px`
		// console.log(`${blockCurrentX + (x - blockCurrentX)}px`)
	} else if (x < blockCurrentX + 30) {
		block.style.left = `${blockCurrentX - (blockCurrentX - x)}px`
		// block.style.left = `${blockCurrentX - (blockCurrentX - x)}px`
	}

	// if (y > blockCurrentY) {
	// 	block.style.top = `${blockCurrentY + ((y - stageHeight) - blockCurrentY)}px`
	// } else if (y < blockCurrentY) {
	// 	block.style.top = `${blockCurrentY - (blockCurrentY - (y - stageHeight))}px`
	// }

	// if (y > blockCurrentY) {
	// 	block.style.top = `${blockCurrentY - (y - stageHeight)}px`
	// } else {
	// 	// console.log('y <');
	// 	block.style.top = `${blockCurrentY + (y - stageHeight)}px`
	// }
	// block.style.left = `${blockCurrentX + x}px`
	// block.style.top = `${blockCurrentY + (y - stageHeight)}px`






	/*
		if (e.key === 'ArrowLeft') {
			let startLeft = parseInt(blockStyles.left);
			block.style.left = `${startLeft - 75}px`

		} else if (e.key === 'ArrowRight') {
			let startLeft = parseInt(blockStyles.left);
			block.style.left = `${startLeft + 75}px`
		} else if (e.key === 'ArrowUp') {
			let startTop = parseInt(blockStyles.top);
			block.style.top = `${startTop - 75}px`
		} else if (e.key === 'ArrowDown') {
			let startTop = parseInt(blockStyles.top);
			block.style.top = `${startTop + 75}px`
		}
	*/
});

//app key listener
app.addEventListener('keydown', e => {
	let blockStyles = window.getComputedStyle(block);
	if (e.key === 'ArrowLeft') {
		let startLeft = parseInt(blockStyles.left);
		block.style.left = `${startLeft - 75}px`

	} else if (e.key === 'ArrowRight') {
		let startLeft = parseInt(blockStyles.left);
		block.style.left = `${startLeft + 75}px`
	} else if (e.key === 'ArrowUp') {
		let startTop = parseInt(blockStyles.top);
		block.style.top = `${startTop - 75}px`
	} else if (e.key === 'ArrowDown') {
		let startTop = parseInt(blockStyles.top);
		block.style.top = `${startTop + 75}px`
	}
});

block.addEventListener('keydown', e => {});
stage.addEventListener('keydown', e => {});

// TODO 

var arrowCodes = { 37: 'left', 38: 'up', 39: 'right' };

//TODO !!BOOKMARK ARROW KEYS

function trackKeys(codes) {
	var pressed = Object.create(null);

	function handler(event) {
		if (codes.hasOwnProperty(event.keyCode)) {
			var down = event.type == 'keydown';
			pressed[codes[event.keyCode]] = down;
			event.preventDefault();
		}
	}
	addEventListener('keydown', handler);
	addEventListener('keyup', handler);

	pressed.unregister = function() {
		removeEventListener('keydown', handler);
		removeEventaListener('keydown', keyDown);
		removeEventaListener('keyup', keyDown);
		removeEventListener('keyup', handler);
	};

	return pressed;
}

// Run the animation
function runAnimation(frameFunc) {
	var lastTime = null;

	function frame(time) {
		var stop = false;
		if (lastTime != null) {
			var timeStep = Math.min(time - lastTime, 100) / 1000;
			stop = frameFunc(timeStep) === false;
		}
		lastTime = time;
		if (!stop)
			requestAnimationFrame(frame);
	}
	requestAnimationFrame(frame);
}

// Run the level
var arrows = trackKeys(arrowCodes);

function runLevel(level, Display, andThen) {
	var display = new Display(document.body, level);
	// Used for storing pause state of the game
	var running = 'yes';

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