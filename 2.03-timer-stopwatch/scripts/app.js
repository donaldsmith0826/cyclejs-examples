// IMPORTS =========================================================================================
import Class from "classnames";
import Cycle from "cyclejs";
let {Rx} = Cycle;
let {Observable, Subject} = Rx;

// CONSTANTS =======================================================================================
const TICK_MS = 100;
const MINUTE_MS = 600 * TICK_MS;

// APP =============================================================================================
function Intent(interactions) {
  return {
    // TODO: how to debounce without delay
    trigger$: interactions.get(".btn.trigger", "click").map(true)
  }
}

function Model(intentions) {
  let triggerSubject$ = new Subject();
  let trigger$ = triggerSubject$.scan(0, (state, trigger) => trigger ? (state + 1) % 3 : 0);

  let running$ = trigger$.map(state => state == 1);
  let stop$ = trigger$.filter(state => state == 0);

  let tick$ = Observable.interval(TICK_MS)
    .pausable(running$)
    .map(() => {
      return function (state) {
        return state > TICK_MS ? state - TICK_MS : 0;
      }
    });

  let reset$ = stop$.startWith(true).map(() => {
    return function (state) {
      return MINUTE_MS;
    }
  });

  let transform$ = Rx.Observable.merge(
    tick$, reset$
  );

  let value$ = transform$
    .scan(MINUTE_MS, (state, transform) => transform(state));

  let timerStopped$ = value$.filter(v => v == 0);

  intentions.trigger$.subscribe(() => {
    triggerSubject$.onNext(true);
  });
  timerStopped$.subscribe(() => {
    triggerSubject$.onNext(false);
  });

  return {
    value$: value$.map(v => MINUTE_MS - v),
  };
}

function View(state) {
  return Observable.combineLatest(
    state.value$,
    function (value) {
      let second = (value / 1000).toFixed(1);
      let angle = secondToAngle(second);
      return (
        <div>
          <div className="stopWatch frame">
            <div className="stopWatch arrow" style={{
              "transform": `rotate(${angle}deg)`,
              "transform-origin": "bottom",
            }}>
            </div>
          </div>
          <div className="btn-group stopWatch trigger">
            <button className="btn btn-default trigger">Trigger</button>
          </div>
        </div>
      );
    }
  );
}

function secondToAngle(second) {
  return ((second % 60) * 90) / 15;
}

Cycle.applyToDOM("#main", interactions => View(Model(Intent(interactions))));
