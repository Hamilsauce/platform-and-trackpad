import { toTrackPoint } from '/svg-trackpad/lib.js';

const { forkJoin, Observable, iif, BehaviorSubject, AsyncSubject, Subject, interval, of, fromEvent, merge, empty, delay, from } = rxjs;
const { flatMap, reduce, groupBy, toArray, mergeMap, switchMap, scan, map, tap, filter } = rxjs.operators;
const { fromFetch } = rxjs.fetch;

export class Crosshair {
  #inputSubscription;

  constructor(initialPoint = { x: 0, y: 0 }, el) {
    this.name = 'crosshair';
    this.basePoint = { x: 0, y: 0 };
    this.size = 11;
    this.d = '';

    this.state = new BehaviorSubject(initialPoint)
      .pipe(

        scan((prevPoint, newPoint) => {
          newPoint.y = newPoint.y+(newPoint.y/2)
          const point = { ...prevPoint, ...newPoint };
          return {
            ...prevPoint,
            ...newPoint
          };
        }),
        map(this.update.bind(this)),
      );
  }

  connectInput(controlStream$) {
    this.$inputSubscription = controlStream$
      .pipe().subscribe(this.state);
    return this.$inputSubscription;
  }

  watch() {
    return this.state.asObservable();
  }

  get bounds() {
    return {
      top: (this.basePoint.y - (this.size )),
      bottom: (this.basePoint.y + (this.size )),
      left: (this.basePoint.x - (this.size )),
      right: (this.basePoint.x + (this.size )),
    };
  }

  update(point = { x: 0, y: 0 }) {
    this.basePoint = point; //addVectors(this.basePoint, point)

    let d = `
     M ${ this.bounds.left },${ this.basePoint.y/0.2 }
       -50,${ this.basePoint.y/0.2 }
     M ${ this.bounds.right },${ this.basePoint.y/0.2 }
       50,${ this.basePoint.y/0.2 }
     M ${ this.basePoint.x },${ this.bounds.top }
       ${ this.basePoint.x },-75
     M ${ this.basePoint.x },${ this.bounds.bottom }
       ${ this.basePoint.x },75
     M ${ this.bounds.left },${ this.bounds.top }
       ${ this.bounds.right },${ this.bounds.top }
       ${ this.bounds.right },${ this.bounds.bottom }
       ${ this.bounds.left },${ this.bounds.bottom }
    z`.trim();

    this.d = d;

    return {
      name: this.name,
      point,
      d,
      ...this.bounds,
    };
  }
}
