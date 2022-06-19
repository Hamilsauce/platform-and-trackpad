import ham from 'https://hamilsauce.github.io/hamhelper/hamhelper1.0.0.js';
import { trackpad, padAndButton$ } from '/RxTrackPad/trackpad.js';

const { forkJoin, Observable, iif, BehaviorSubject, AsyncSubject, Subject, interval, of , fromEvent, merge, empty, delay, from } = rxjs;
const { flatMap, reduce, groupBy, toArray, mergeMap, switchMap, scan, map, tap, filter } = rxjs.operators;
const { fromFetch } = rxjs.fetch;


const { date, array, utils, text } = ham;
const padEl = document.querySelector('.trackpad');
const appHeader = document.querySelector('.app-header');
const app = document.querySelector('.app');
const coordsDisplay = document.querySelector('.coords-display');
const fire = document.querySelector('.fire-button');
// const pad = trackpad({width: 376, height: 376},padEl,fire)
const trackpad$ = trackpad({ width: 376, height: 376 }, padEl)

trackpad$.pipe(
  // map(x => x),
  tap(x => console.error('trackpad$', x)),
  tap(p => {
    coordsDisplay.textContent = `[ ${p.x} , ${p.y} ]`
  }),
) //.subscribe()

let point = {
  x: padEl.innerWidth / 2,
  y: 376 / 2
}

const handlePointerDown = (e) => {
  const p = { x: Math.round(e.clientX), y: Math.round(e.clientY) };
  // console.log(p);
  // coordsDisplay.textContent = `[ ${p.x} , ${p.y} ]`

}
const handlePointerMove = (e) => {
  const np = { x: Math.round(e.clientX), y: Math.round(e.clientY) };
  point = {
    x: np.x > point.x ? np.x - point.x : point.x - np.x,
    y: np.y > point.y ? np.y - point.y : point.y - np.y,

  }
  // console.log(p);
  coordsDisplay.textContent = `[ ${point.x} , ${point.y} ]`
}
const handlePointerUp = () => {}


padEl.addEventListener('pointerdown', handlePointerDown);
app.addEventListener('pointermove', handlePointerMove);
// app.addEventListener('pointerup', handlePointerUp);
