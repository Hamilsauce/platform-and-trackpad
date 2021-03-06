import {
  toTrackPoint,
  toScenePoint,
  addVectors
} from '../svg-trackpad/lib.js';

// import { Crosshair } from './entities/crosshair.js'
import { Scene } from './entities/scene.js'

const { forkJoin, Observable, iif, BehaviorSubject, AsyncSubject, Subject, interval, of , fromEvent, merge, empty, delay, from } = rxjs;
const { flatMap, reduce, groupBy, toArray, mergeMap, switchMap, scan, map, tap, filter } = rxjs.operators;
const { fromFetch } = rxjs.fetch;

const app = document.querySelector('#app');
const appBody = document.querySelector('#appBody')
const appHeader = document.querySelector('#appHeader')
const coordsDisplay = document.querySelector('#coordsDisplay')
const coordsDisplay2 = document.querySelector('#coordsDisplay2')

const sceneEl = document.querySelector('#scene')
const sceneContainer = document.querySelector('#scene-container')
const actor = document.querySelector('#actor')
const crosshairEl = document.querySelector('#crosshair-path')
const trackpad = document.querySelector('#trackpad')
const padSurface = document.querySelector('#surface');
const pointerMarker = document.querySelector('#pointer-marker');
const grabButton = document.querySelector('#grab-button');
const grabButtonText = document.querySelector('#grab-button-text');

const scene = new Scene(sceneEl)
window.scene = scene
let isMoving



function isTrackpadTarget(e,padEl = trackpad) {
  e.preventDefault()
  return e.path.some(_=>_===padEl)
  // const tile = e.target.closest('.tile');
  // const gridPoint = this.toTrackPoint(e)
  // this.self.dispatchEvent(new CustomEvent('tile:active', { bubbles: true, detail: { gridPoint } }));
}

function handleGrabPress(e) {
  e.preventDefault()
  e.stopPropagation()
  console.log('grab!');
}

const onGrabPressed = (e) => {
console.log('isTrackpadTarget(e, trackpad)',isTrackpadTarget(e, trackpad));
  if ((e.target.id === 'grab-button' || e.target.id === 'grab-button-text')
  || isTrackpadTarget(e, trackpad)) {
    if (grabButtonText.textContent.trim() === 'GRAB') {
      scene.dispatchEvent(new CustomEvent('grabAction', { bubbles: true, detail: { action: 'release' } }))
      grabButtonText.textContent = 'DROP'
    } else {
      // scene.dispatchEvent(new CustomEvent('drop'))
      scene.dispatchEvent(new CustomEvent('grabAction', { bubbles: true, detail: { action: 'capture' } }))
      grabButtonText.textContent = 'GRAB'
    }
  }
}

document.addEventListener('pointerdown', onGrabPressed);

const onTrackpadStart = (e) => {
  pointerMarker.classList.add('active')
  pointerMarker.r.baseVal.value = pointerMarker.r.baseVal.value * 1.5

  padSurface.addEventListener('pointermove', onTrackpadDrag);
  app.addEventListener('pointerup', onTrackpadStop);
}

const onTrackpadStop = (e) => {
  pointerMarker.r.baseVal.value = pointerMarker.r.baseVal.value / 1.5
  pointerMarker.classList.remove('active')
  // pointerMarker.setAttribute('transform', `translate(${0},${0})`)
  trackpad.removeEventListener('pointermove', onTrackpadDrag);
  app.removeEventListener('pointerup', onTrackpadStop);
}

const onTrackpadDrag = (e) => {
  const tp = toTrackPoint(sceneEl, e.clientX, e.clientY)
  // const deltaX = point.x + (point.x - tp.x)
  // const deltaY = point.y + (point.y - tp.y)
  const np = { x: Math.round(tp.x), y: Math.round(tp.y) };
  // if (
  //   isMoving && (Math.abs(Math.abs(point.x) - Math.abs(tp.x)) > 0.5 ||
  //     Math.abs(Math.abs(point.y) - Math.abs(tp.y)) > 0.5)
  // ) {
  const trackpoint = { x: Math.round(tp.x ), y: Math.round(tp.y)}// + (Math.round(tp.y)*1.75) }


  // const scenepoint = toScenePoint(trackpoint)
  coordsDisplay.textContent = `pad: [ ${trackpoint.x} , ${trackpoint.y} ]`
  // coordsDisplay.textContent = `deltas: [ ${deltaX} , ${deltaY} ]`
  pointerMarker.setAttribute('transform', `translate(${trackpoint.x},${trackpoint.y})`)
  // coordsDisplay2.textContent = `point: [ ${trackpoint.x} , ${trackpoint.y} ]`;
  // }
};

padSurface.addEventListener('pointerdown', onTrackpadStart);
