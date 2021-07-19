const header = document.querySelector('#header')
const divs = [...header.querySelectorAll('div')]

console.log(divs);
// console.log(Array.isArray(divs));
// console.log(Array.isArray([...divs]));
// console.log(typeof [...divs]);


const divs2 = divs.map((div, i) => {
	return [div, {index: i}];
})


let domMap = new Map(divs2);

console.log(domMap.get(divs[2]) == domMap.get(divs[1]));


