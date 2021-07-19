import ham from 'https://hamilsauce.github.io/hamhelper/hamhelper1.0.0.js'

const header = document.querySelector('#header')
const divs = [...header.querySelectorAll('div')]

console.log(divs);
// console.log(Array.isArray(divs));
// console.log(Array.isArray([...divs]));
// console.log(typeof [...divs]);


const divs2 = divs.map((div, i) => {
	return [div, { index: i }];
})


let domMap = new Map(divs2);

console.log(domMap.get(divs[2]) == domMap.get(divs[1]));


console.log('creating newEl');

const attributes = {
	id: 'my-el',
	classList: ['cool', 'awesome', 'poop'],
	data: {
		x: 20,
		y: 50,
		groupId: 10,
		lastChange: 'never'
	}
};

const children = [
	document.createElement('div'),
	document.createElement('div'),
	document.createElement('div'),
	document.createElement('div'),
];

const newb = ham.newElement('div', attributes, ...children);
console.log('newb', newb);