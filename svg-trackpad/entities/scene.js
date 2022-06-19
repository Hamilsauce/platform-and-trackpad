import { toTrackPoint, toScenePoint, addVectors } from '../lib.js';
import { Pawn } from './pawn.js';
import { Crosshair } from './crosshair.js';

const { combineLatest, iif, ReplaySubject, AsyncSubject, BehaviorSubject, Subject, interval, of, fromEvent, merge, empty, delay, from } = rxjs;
const { sampleTime, throttleTime, mergeMap, switchMap, scan, take, takeWhile, map, tap, startWith, filter, mapTo } = rxjs.operators;


// export const toTrackPoint = (svg=document.querySelector('svg'),x,y,) => {
//   let domPoint = new DOMPoint(Math.round(x), Math.round(y));
//   domPoint = domPoint.matrixTransform(svg.getScreenCTM().inverse());
//   return {
//     x: Math.round(domPoint.x),
//     y: Math.round(domPoint.y),
//   }
// }
// export const toScenePoint = (svg=document.querySelector('svg'),{ x, y }) => {
//   let domPoint = new DOMPoint(x, y)
//   domPoint = domPoint.matrixTransform(svg.getScreenCTM().inverse());
//   return {
//     x: Math.round(domPoint.x),
//     y: Math.round(domPoint.y),
//   }
// }

// export const addVectors = (a, b) => {
//   return {
//     x: a.x + b.x,
//     y: a.y + b.y,
//   }
// }



export class Scene extends EventTarget {
  constructor(svg = document.createElement('svg'), parent, config) {
    super();
    this.canvas = svg;
    this.canvas.id = 'canvas';
    this.parent = this.canvas.parentElement ? this.canvas.parentElement : null;

    this.entities = new Map();
    this.padSurface = document.querySelector('#surface');
    this.crosshair = new Crosshair({ x: 0, y: 0 });
    this.crosshairEl = document.querySelector('#crosshair-path');
    this.pawn = new Pawn({ x: 0, y: 0 });
    this.actorEl = document.querySelector('#actor');
    this.addEntity(this.crosshair.name, this.crosshairEl);
    this.addEntity(this.pawn.name, this.actorEl);


    this.width = getComputedStyle(this.parent).width;
    this.height = getComputedStyle(this.parent).height;
    /*
     * CONNECT INPUT STREAMS TO ENTITIES
     * CONNECT ENTITY UPDATES TO SCENE
     */
    const grabPress$ = fromEvent(this, 'grabAction')
      .pipe(
        map(({ detail }) => detail.action),
      );
    this.collisions$ = new BehaviorSubject(null)
      .pipe(
        filter((_) => _),
        filter(({ crosshair, pawn }) => this.detectEnclosure(crosshair, pawn)),
        switchMap(({ crosshair, pawn }) => grabPress$
          .pipe(
            filter((e) => this.detectEnclosure(crosshair, pawn)),
            tap(action => {
              if (action == 'capture') {
                this.capture(crosshair, pawn);
                this.crosshairEl.setAttribute('transform', 'translate(0,0)');
                this.actorEl.setAttribute('fill', '#A83535');

              } else {
                this.release(pawn);

              }

            }),
            tap((x, crosshair, pawn) => {
              // this.getEntityElement.bind(this)(pawn.name).style.fill='red'
              console.log(x, crosshair, pawn);
              // this.crosshairEl.setAttribute('', 'rotate(9')
              // this.actorEl.fill.baseVal.value = 'red'//..setAttribute('', 'red')
              // this.capture(crosshair, pawn)
              // console.log('this.getEntityElement(pawn.name)', this.getEntityElement.bind(this)(pawn.name))

            }),
          )

        )
      );


    this.collisions$.subscribe();

    this.enclosures$ = new Subject();

    this.crosshair$ = (this.crosshair.watch()).pipe();

    this.crosshair.connectInput(
      fromEvent(this.padSurface, 'pointermove')
        .pipe(map(({ clientX, clientY }) => toTrackPoint(this.trackpad, clientX, clientY)),)
    );

    this.pawn$ = this.pawn.watch().pipe(
    );


    this.scene$ = combineLatest(
      this.crosshair$,
      this.pawn$.pipe(startWith({})),
      (crosshair, pawn) => ({ crosshair, pawn })
    ).pipe(
      sampleTime(16),
      tap(({ crosshair, pawn }) => {
        this.collisions$.next({ crosshair, pawn });
      })
    );

    this.scene$.subscribe(this.render.bind(this));
  }

  set width(w) {
    this.canvas.setAttribute('width', w);
  }
  set height(h) {
    this.canvas.setAttribute('height', h);
  }


  static create(parent, config = {}) {
    return Object.assign(new Game(parent), config).init();
  }

  init() {
    this.crosshair.connectInput(this.pawn$);
    this.scene$.subscribe(this.render.bind(this));
    return this;
  }

  handleGrab(e) {
    console.log('grab');
    // this.addEventListener('drop', this.handleDrop.bind(this))
    // this.removeEventListener('grab', this.handleGrab.bind(this))
  }
  handleDrop(e) {
    console.log('srop');
    // this.addEventListener('grab', this.handleGrab.bind(this))
    // this.removeEventListener('drop', this.handleDrop.bind(this))

  }

  createEl(tag, config = {}) {
    const el = document.createElementNS(SVG_NS, tag);
    el.id = config.id;
    el.setAttribute('transform', 'translate(0,0)');
    return Object.assign(el, config);
  }


  render({ crosshair, pawn }) {
    this.paintEntity(this.crosshairEl, crosshair);
    this.paintEntity(this.actorEl, pawn);
  }

  gameOver(crosshair, pawns) { }

  collision(target1, target2) {
    return (
      target1.x > target2.x - 20 &&
      target1.x < target2.x + 20 &&
      (target1.y > target2.y - 20 && target1.y < target2.y + 20)
    );
  }

  detectEnclosure(a, b) {
    let bel = this.actorEl;
    let ael = this.crosshairEl;
    return (
      b.top > a.top &&
      b.bottom < a.bottom &&
      b.right < a.right &&
      b.left > a.left
    );

  }

  capture(capturer, targ) {

    if (!capturer || !targ) return;
    let capturer$;
    let targ$;
    if (capturer.name = 'crosshair') {

      capturer$ = (this.crosshair.watch()).pipe();
    }
    if (capturer.name = 'pawn') {

      // const capturer$ = (capturer.watch()).pipe()
      this.pawn.connectInput(
        capturer$.pipe(map(({ point }) => ({ ...point })))
      );

    }

  }
  release(targ) {
    console.log('targ', targ);

    if (targ.name === 'pawn') {
      this.pawn.disconnectInput();

    }
  }

  paintEntity(el, attrs = {}) {
    Object.entries(attrs)
      .forEach(([k, v], i) => {
        el.setAttribute(k, v);
      });
  }

  getEntityElement(name, el) {
    return this.entities.get(name);
  }

  addEntity(name, el) {
    return this.entities.set(name, el);
    return this.entities.get(name);
  }


}
