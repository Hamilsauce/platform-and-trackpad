const { combineLatest, range, iif, ReplaySubject, AsyncSubject, Subject, interval, of , fromEvent, merge, empty, delay, from } = rxjs;
const { distinctUntilChanged, timestamp, sampleTime, reduce, throttleTime, mergeMap, switchMap, scan, take, takeWhile, map, tap, startWith, filter, mapTo, flatMap, toArray } = rxjs.operators;

let canvasWidth, canvasHeight, padWidth, padHeight

setTimeout(() => {
  canvasWidth = parseInt(document.querySelector('svg').width)
  canvasHeight = parseInt(document.querySelector('svg').height)
  padWidth = parseInt(getComputedStyle(document.querySelector('.trackpad')).width)
  padWidth = parseInt(getComputedStyle(document.querySelector('.trackpad')).height)
}, 0)

/* TODO
  IDEAS: 
  1. Hold down fire to save up shots and rapid fire
  2. Double clock + touchstart to auto fire
  3. Add Y move
  TODO */

// const firing = (fireButton, trackpad) =>merge(fromEvent(trackpad, 'click'), fromEvent(fireButton, 'touchstart'))  .pipe(
//     tap(e => e.stopPropagation()),
//     tap(() => {
//       fireButton.classList.add('pressed');
//       setTimeout(() => {
//         fireButton.classList.remove('pressed')
//       }, 40)
//     }),
//     startWith({}),
//     sampleTime(300),
//     timestamp(),
//   );

export const trackpad = (viewDimensions = { width: window.innerWidth, height: window.innerHeight - 280 }, trackpad) =>
  // fromEvent(trackpad, 'touchstart')
  // .pipe(
  // mergeMap(({ touches }) => {
  //   let spot;// = document.querySelector('.spot') ? document.querySelector('.spot') : document.createElement('div');
  //   spot.classList.add('spot')
  //   if (!document.querySelector('.spot')) {
  //     spot = document.createElement('div');
  //     trackpad.appendChild(spot)
  //     // spot.classList.add('spot')
  //   } else {
  //     spot = document.querySelector('.spot');
  //   }
  //   spot.style.top `${touches.y}px`
  //   spot.style.top `${touches.x}px`
  //   return
  fromEvent(trackpad, 'pointermove').pipe(
    tap(e => e.stopPropagation()),

    map(({ clientX, clientY }) => {
      return {
        x: Math.round(clientX),
        y: Math.round(clientY),
      }
      return {
        x: (((clientX / padWidth) * 100) / 100) * canvasWidth,
        y: (((clientY / padHeight) * 100) / 100) * canvasHeight,
      }
    }),
    // tap(point => console.warn({point})),
    scan(({ x, y }, currCoords) => {
      const newCoords = {
        x: currCoords.x + (currCoords.x - x),
        y: currCoords.y + (currCoords.y - y),
      }

      console.log('currCoords, newCoords')
      console.log(currCoords, newCoords)
      return newCoords
      if (currCoords.x + 15 <= currCoords.x && currCoords.y - 15 >= 0) {
        return { x: currCoords.x, y: currCoords.y }
      }
      else return { x, y }
    }, { x: viewDimensions.width / 2, y: viewDimensions.height / 2 }),
    // scan(({ x, y }, canvasPixels) => {
    //   console.log('{ x, y }, canvasPixels', { x, y }, canvasPixels)
    //   if (canvasPixels.x + 15 <= canvasPixels.x && canvasPixels.y - 15 >= 0) {
    //     return { x: canvasPixels.x, y: canvasPixels.y }
    //   }
    //   else return { x, y }
    // }, { x: viewDimensions.width / 2, y: viewDimensions.height / 2 }),
    tap(x => console.warn('AFRTER COORD SCAN', x)),
    startWith({ x: viewDimensions.width / 2, y: viewDimensions.height / 2 }),
    sampleTime(40)
  )
// })
// )

export const padAndButton$ = (coords, trackpad, fireButton, ) => {
  const ship = spaceship(coords, trackpad);
  return {
    ship: ship,
    shots: combineLatest(
      // firing(fireButton, trackpad),
      ship,
      (fireEvents, spaceship) =>
      ({ timestamp: fireEvents.timestamp, x: spaceship.x, y: spaceship.y })
    ).pipe(
      distinctUntilChanged((lastShot, newShot) => lastShot.timestamp === newShot.timestamp),
      scan((shots, shot) => [...shots, { x: shot.x, y: shot.y }], []),
    )
  }
}