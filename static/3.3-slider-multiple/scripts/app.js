(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

require("./shims");

// IMPORTS =========================================================================================
var Cycle = require("cyclejs");
var Model = require("./model");
var View = require("./view");
var Intent = require("./intent");

// APP =============================================================================================
var DOM = Cycle.createDOMUser("main");

DOM.inject(View).inject(Model).inject(Intent).inject(DOM);

},{"./intent":3,"./model":5,"./shims":6,"./view":7,"cyclejs":"cyclejs"}],2:[function(require,module,exports){
"use strict";

// IMPORTS =========================================================================================
var Cycle = require("cyclejs");
var Rx = Cycle.Rx;
var h = Cycle.h;

// ELEMENTS ========================================================================================
Cycle.registerCustomElement("Footer", function (User) {
  var View = Cycle.createView(function () {
    return {
      vtree$: Rx.Observable["return"](h("div", null, ["=== footer ==="]))
    };
  });

  User.inject(View);
});

},{"cyclejs":"cyclejs"}],3:[function(require,module,exports){
"use strict";

// IMPORTS =========================================================================================
var Cycle = require("cyclejs");
var Rx = Cycle.Rx;

// EXPORTS =========================================================================================
var Intent = Cycle.createIntent(function (DOM) {
  return {
    add$: DOM.event$(".add", "click").map(function (event) {
      return 1;
    }),
    remove$: DOM.event$(".item", "remove").map(function (event) {
      return event.data;
    }),
    changeWidth$: DOM.event$(".item", "changeWidth").map(function (event) {
      return event.data;
    }) };
});

module.exports = Intent;

},{"cyclejs":"cyclejs"}],4:[function(require,module,exports){
"use strict";

// IMPORTS =========================================================================================
var Cycle = require("cyclejs");
var Rx = Cycle.Rx;
var h = Cycle.h;

// ELEMENTS ========================================================================================
Cycle.registerCustomElement("item", function (DOM, Props) {
  var View = Cycle.createView(function (Model) {
    var id$ = Model.get("id$");
    var width$ = Model.get("width$");
    return {
      vtree$: Rx.Observable.combineLatest(id$, width$, function (id, width) {
        return h("div", { className: "item", style: { width: width + "px" } }, [h("div", null, [h("input", { className: "width-slider", type: "range", min: "200", max: "1000", value: width })]), h("button", { className: "remove" }, ["Remove"])]);
      }) };
  });

  var Model = Cycle.createModel(function (Intent, Props) {
    return {
      id$: Props.get("id$").shareReplay(1),
      width$: Props.get("width$") };
  });

  var Intent = Cycle.createIntent(function (DOM) {
    return {
      changeWidth$: DOM.event$(".width-slider", "input").map(function (event) {
        return parseInt(event.target.value);
      }),
      remove$: DOM.event$(".remove", "click").map(function (event) {
        return true;
      }) };
  });

  DOM.inject(View).inject(Model).inject(Intent, Props)[0].inject(DOM);

  return {
    changeWidth$: Intent.get("changeWidth$").withLatestFrom(Model.get("id$"), function (width, id) {
      return { id: id, width: width };
    }),

    remove$: Intent.get("remove$").withLatestFrom(Model.get("id$"), function (_, id) {
      return id;
    }) };
});

},{"cyclejs":"cyclejs"}],5:[function(require,module,exports){
"use strict";

var _defineProperty = function (obj, key, value) { return Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); };

// IMPORTS =========================================================================================
var uuid = require("node-uuid");
var Cycle = require("cyclejs");
var Rx = Cycle.Rx;

// EXPORTS =========================================================================================
var Model = Cycle.createModel(function (Intent) {
  var add$ = Intent.get("add$").map(function () {
    return function transform(state) {
      var model = createRandom();
      var state = Object.assign({}, state);
      state[model.id] = model;
      return state;
    };
  });

  var remove$ = Intent.get("remove$").map(function (id) {
    return function transform(state) {
      var state = Object.assign({}, state);
      delete state[id];
      return state;
    };
  });

  var changeWidth$ = Intent.get("changeWidth$").map(function (model) {
    return function transform(state) {
      state[model.id].width = model.width;
      return state;
    };
  });

  var transforms = Rx.Observable.merge(add$, remove$, changeWidth$);

  return {
    state$: transforms.startWith(seedState()).scan(function (state, transform) {
      return transform(state);
    })
  };
});

function createRandom(withData) {
  return Object.assign({
    id: uuid.v4(),
    width: Math.floor(Math.random() * 800 + 200) }, withData);
}

function seedState() {
  var model = createRandom();
  var state = _defineProperty({}, model.id, model);
  return state;
}

module.exports = Model;

},{"cyclejs":"cyclejs","node-uuid":"node-uuid"}],6:[function(require,module,exports){
"use strict";

require("object.assign").shim();

console.error = console.log;

},{"object.assign":"object.assign"}],7:[function(require,module,exports){
"use strict";

// IMPORTS =========================================================================================
var sortBy = require("lodash.sortby");
var values = require("lodash.values");
var Cycle = require("cyclejs");
var Rx = Cycle.Rx;
var h = Cycle.h;

var Footer = require("./footer");
var Item = require("./item");

// EXPORTS =========================================================================================
var View = Cycle.createView(function (Model) {
  var state$ = Model.get("state$");
  return {
    vtree$: state$.map(function (models) {
      return h("div", { className: "everything" }, [h("div", { className: "topButtons" }, [h("button", { className: "add" }, ["Add Random"])]), h("div", null, [sortBy(values(models), function (model) {
        return model.id;
      }).map(function (model) {
        return h("Item.item", { id: model.id, width: model.width, key: model.id });
      })]), h("Footer")]);
    }) };
});

module.exports = View;

},{"./footer":2,"./item":4,"cyclejs":"cyclejs","lodash.sortby":"lodash.sortby","lodash.values":"lodash.values"}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3Vzci9sb2NhbC9saWIvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsImJ1aWxkLzMuMy1zbGlkZXItbXVsdGlwbGUvYXBwLmpzIiwiYnVpbGQvMy4zLXNsaWRlci1tdWx0aXBsZS9mb290ZXIuanMiLCJidWlsZC8zLjMtc2xpZGVyLW11bHRpcGxlL2ludGVudC5qcyIsImJ1aWxkLzMuMy1zbGlkZXItbXVsdGlwbGUvaXRlbS5qcyIsImJ1aWxkLzMuMy1zbGlkZXItbXVsdGlwbGUvbW9kZWwuanMiLCJidWlsZC8zLjMtc2xpZGVyLW11bHRpcGxlL3NoaW1zLmpzIiwiYnVpbGQvMy4zLXNsaWRlci1tdWx0aXBsZS92aWV3LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7QUNBQSxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUM7OztBQUduQixJQUFJLEtBQUssR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUM7QUFDL0IsSUFBSSxLQUFLLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQy9CLElBQUksSUFBSSxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUM3QixJQUFJLE1BQU0sR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUM7OztBQUdqQyxJQUFJLEdBQUcsR0FBRyxLQUFLLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxDQUFDOztBQUV0QyxHQUFHLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDOzs7Ozs7QUNWMUQsSUFBSSxLQUFLLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQzFCLEVBQUUsR0FBTyxLQUFLLENBQWQsRUFBRTtJQUFFLENBQUMsR0FBSSxLQUFLLENBQVYs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S0FBSyxDQUFDLEVBQUUsRUFBQyxDQUFDLENBQUM7T0FDMUUsQ0FBQyxDQUNILENBQUMsRUFDRixDQUFDLENBQUMsUUFBUSxDQUFDLENBQ1osQ0FBQyxDQUNGO0tBQ0gsQ0FBQyxFQUNILENBQUM7Q0FDSCxDQUFDLENBQUM7O0FBRUgsTUFBTSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwicmVxdWlyZShcIi4vc2hpbXNcIik7XG5cbi8vIElNUE9SVFMgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbmxldCBDeWNsZSA9IHJlcXVpcmUoXCJjeWNsZWpzXCIpO1xubGV0IE1vZGVsID0gcmVxdWlyZShcIi4vbW9kZWxcIik7XG5sZXQgVmlldyA9IHJlcXVpcmUoXCIuL3ZpZXdcIik7XG5sZXQgSW50ZW50ID0gcmVxdWlyZShcIi4vaW50ZW50XCIpO1xuXG4vLyBBUFAgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5sZXQgRE9NID0gQ3ljbGUuY3JlYXRlRE9NVXNlcihcIm1haW5cIik7XG5cbkRPTS5pbmplY3QoVmlldykuaW5qZWN0KE1vZGVsKS5pbmplY3QoSW50ZW50KS5pbmplY3QoRE9NKTsiLCIvLyBJTVBPUlRTID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5sZXQgQ3ljbGUgPSByZXF1aXJlKFwiY3ljbGVqc1wiKTtcbmxldCB7UngsIGh9ID0gQ3ljbGU7XG5cbi8vIEVMRU1FTlRTID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbkN5Y2xlLnJlZ2lzdGVyQ3VzdG9tRWxlbWVudChcIkZvb3RlclwiLCBmdW5jdGlvbihVc2VyKSB7XG4gIGxldCBWaWV3ID0gQ3ljbGUuY3JlYXRlVmlldyhmdW5jdGlvbigpIHtcbiAgICByZXR1cm4ge1xuICAgICAgdnRyZWUkOiBSeC5PYnNlcnZhYmxlLnJldHVybihcbiAgICAgICAgaCgnZGl2JywgbnVsbCwgW1wiPT09IGZvb3RlciA9PT1cIl0pXG4gICAgICApXG4gICAgfTtcbiAgfSk7XG5cbiAgVXNlci5pbmplY3QoVmlldyk7XG59KTsiLCIvLyBJTVBPUlRTID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5sZXQgQ3ljbGUgPSByZXF1aXJlKFwiY3ljbGVqc1wiKTtcbmxldCB7Unh9ID0gQ3ljbGU7XG5cbi8vIEVYUE9SVFMgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbmxldCBJbnRlbnQgPSBDeWNsZS5jcmVhdGVJbnRlbnQoRE9NID0+IHtcbiAgcmV0dXJuIHtcbiAgICBhZGQkOiBET00uZXZlbnQkKFwiLmFkZFwiLCBcImNsaWNrXCIpLm1hcChldmVudCA9PiAxKSxcbiAgICByZW1vdmUkOiBET00uZXZlbnQkKFwiLml0ZW1cIiwgXCJyZW1vdmVcIikubWFwKGV2ZW50ID0+IGV2ZW50LmRhdGEpLFxuICAgIGNoYW5nZVdpZHRoJDogRE9NLmV2ZW50JChcIi5pdGVtXCIsIFwiY2hhbmdlV2lkdGhcIikubWFwKGV2ZW50ID0+IGV2ZW50LmRhdGEpLFxuICB9O1xufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gSW50ZW50OyIsIi8vIElNUE9SVFMgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbmxldCBDeWNsZSA9IHJlcXVpcmUoXCJjeWNsZWpzXCIpO1xubGV0IHtSeCwgaH0gPSBDeWNsZTtcblxuLy8gRUxFTUVOVFMgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuQ3ljbGUucmVnaXN0ZXJDdXN0b21FbGVtZW50KFwiaXRlbVwiLCAoRE9NLCBQcm9wcykgPT4ge1xuICBsZXQgVmlldyA9IEN5Y2xlLmNyZWF0ZVZpZXcoTW9kZWwgPT4ge1xuICAgIGxldCBpZCQgPSBNb2RlbC5nZXQoXCJpZCRcIik7XG4gICAgbGV0IHdpZHRoJCA9IE1vZGVsLmdldChcIndpZHRoJFwiKTtcbiAgICByZXR1cm4ge1xuICAgICAgdnRyZWUkOiBSeC5PYnNlcnZhYmxlLmNvbWJpbmVMYXRlc3QoaWQkLCB3aWR0aCQsIChpZCwgd2lkdGgpID0+IHtcbiAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgaCgnZGl2Jywge2NsYXNzTmFtZTogXCJpdGVtXCIsIHN0eWxlOiB7d2lkdGg6IHdpZHRoICsgXCJweFwifX0sIFtcbiAgICAgICAgICAgICAgaCgnZGl2JywgbnVsbCwgW1xuICAgICAgICAgICAgICAgIGgoJ2lucHV0Jywge2NsYXNzTmFtZTogXCJ3aWR0aC1zbGlkZXJcIiwgdHlwZTogXCJyYW5nZVwiLCBtaW46IFwiMjAwXCIsIG1heDogXCIxMDAwXCIsIHZhbHVlOiB3aWR0aH0pXG4gICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICBoKCdidXR0b24nLCB7Y2xhc3NOYW1lOiBcInJlbW92ZVwifSwgW1wiUmVtb3ZlXCJdKVxuICAgICAgICAgICAgXSlcbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICApLFxuICAgIH07XG4gIH0pO1xuXG4gIGxldCBNb2RlbCA9IEN5Y2xlLmNyZWF0ZU1vZGVsKChJbnRlbnQsIFByb3BzKSA9PiB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGlkJDogUHJvcHMuZ2V0KFwiaWQkXCIpLnNoYXJlUmVwbGF5KDEpLFxuICAgICAgd2lkdGgkOiBQcm9wcy5nZXQoXCJ3aWR0aCRcIiksXG4gICAgfTtcbiAgfSk7XG5cbiAgbGV0IEludGVudCA9IEN5Y2xlLmNyZWF0ZUludGVudChET00gPT4ge1xuICAgIHJldHVybiB7XG4gICAgICBjaGFuZ2VXaWR0aCQ6IERPTS5ldmVudCQoXCIud2lkdGgtc2xpZGVyXCIsIFwiaW5wdXRcIikubWFwKGV2ZW50ID0+IHBhcnNlSW50KGV2ZW50LnRhcmdldC52YWx1ZSkpLFxuICAgICAgcmVtb3ZlJDogRE9NLmV2ZW50JChcIi5yZW1vdmVcIiwgXCJjbGlja1wiKS5tYXAoZXZlbnQgPT4gdHJ1ZSksXG4gICAgfTtcbiAgfSk7XG5cbiAgRE9NLmluamVjdChWaWV3KS5pbmplY3QoTW9kZWwpLmluamVjdChJbnRlbnQsIFByb3BzKVswXS5pbmplY3QoRE9NKTtcblxuICByZXR1cm4ge1xuICAgIGNoYW5nZVdpZHRoJDogSW50ZW50LmdldChcImNoYW5nZVdpZHRoJFwiKVxuICAgICAgLndpdGhMYXRlc3RGcm9tKE1vZGVsLmdldChcImlkJFwiKSwgKHdpZHRoLCBpZCkgPT4gKHtpZCwgd2lkdGh9KSksXG5cbiAgICByZW1vdmUkOiBJbnRlbnQuZ2V0KFwicmVtb3ZlJFwiKVxuICAgICAgLndpdGhMYXRlc3RGcm9tKE1vZGVsLmdldChcImlkJFwiKSwgKF8sIGlkKSA9PiBpZCksXG4gIH07XG59KTtcbiIsIi8vIElNUE9SVFMgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbmxldCB1dWlkID0gcmVxdWlyZShcIm5vZGUtdXVpZFwiKTtcbmxldCBDeWNsZSA9IHJlcXVpcmUoXCJjeWNsZWpzXCIpO1xubGV0IHtSeH0gPSBDeWNsZTtcblxuLy8gRVhQT1JUUyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxubGV0IE1vZGVsID0gQ3ljbGUuY3JlYXRlTW9kZWwoSW50ZW50ID0+IHtcbiAgbGV0IGFkZCQgPSBJbnRlbnQuZ2V0KFwiYWRkJFwiKS5tYXAoKCkgPT4ge1xuICAgIHJldHVybiBmdW5jdGlvbiB0cmFuc2Zvcm0oc3RhdGUpIHtcbiAgICAgIGxldCBtb2RlbCA9IGNyZWF0ZVJhbmRvbSgpO1xuICAgICAgbGV0IHN0YXRlID0gT2JqZWN0LmFzc2lnbih7fSwgc3RhdGUpO1xuICAgICAgc3RhdGVbbW9kZWwuaWRdID0gbW9kZWw7XG4gICAgICByZXR1cm4gc3RhdGU7XG4gICAgfTtcbiAgfSk7XG5cbiAgbGV0IHJlbW92ZSQgPSBJbnRlbnQuZ2V0KFwicmVtb3ZlJFwiKS5tYXAoaWQgPT4ge1xuICAgIHJldHVybiBmdW5jdGlvbiB0cmFuc2Zvcm0oc3RhdGUpIHtcbiAgICAgIGxldCBzdGF0ZSA9IE9iamVjdC5hc3NpZ24oe30sIHN0YXRlKTtcbiAgICAgIGRlbGV0ZSBzdGF0ZVtpZF07XG4gICAgICByZXR1cm4gc3RhdGU7XG4gICAgfTtcbiAgfSk7XG5cbiAgbGV0IGNoYW5nZVdpZHRoJCA9IEludGVudC5nZXQoXCJjaGFuZ2VXaWR0aCRcIikubWFwKG1vZGVsID0+IHtcbiAgICByZXR1cm4gZnVuY3Rpb24gdHJhbnNmb3JtKHN0YXRlKSB7XG4gICAgICBzdGF0ZVttb2RlbC5pZF0ud2lkdGggPSBtb2RlbC53aWR0aDtcbiAgICAgIHJldHVybiBzdGF0ZTtcbiAgICB9O1xuICB9KTtcblxuICBsZXQgdHJhbnNmb3JtcyA9IFJ4Lk9ic2VydmFibGUubWVyZ2UoXG4gICAgYWRkJCxcbiAgICByZW1vdmUkLFxuICAgIGNoYW5nZVdpZHRoJFxuICApO1xuXG4gIHJldHVybiB7XG4gICAgc3RhdGUkOiB0cmFuc2Zvcm1zXG4gICAgICAuc3RhcnRXaXRoKHNlZWRTdGF0ZSgpKVxuICAgICAgLnNjYW4oZnVuY3Rpb24oc3RhdGUsIHRyYW5zZm9ybSkge1xuICAgICAgICByZXR1cm4gdHJhbnNmb3JtKHN0YXRlKTtcbiAgICAgIH0pXG4gIH07XG59KTtcblxuZnVuY3Rpb24gY3JlYXRlUmFuZG9tKHdpdGhEYXRhKSB7XG4gIHJldHVybiBPYmplY3QuYXNzaWduKHtcbiAgICBpZDogdXVpZC52NCgpLFxuICAgIHdpZHRoOiBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiA4MDAgKyAyMDApLFxuICB9LCB3aXRoRGF0YSk7XG59XG5cbmZ1bmN0aW9uIHNlZWRTdGF0ZSgpIHtcbiAgbGV0IG1vZGVsID0gY3JlYXRlUmFuZG9tKCk7XG4gIGxldCBzdGF0ZSA9IHtcbiAgICBbbW9kZWwuaWRdOiBtb2RlbCxcbiAgfTtcbiAgcmV0dXJuIHN0YXRlO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IE1vZGVsOyIsInJlcXVpcmUoXCJvYmplY3QuYXNzaWduXCIpLnNoaW0oKTtcblxuY29uc29sZS5lcnJvciA9IGNvbnNvbGUubG9nOyIsIi8vIElNUE9SVFMgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbmxldCBzb3J0QnkgPSByZXF1aXJlKFwibG9kYXNoLnNvcnRieVwiKTtcbmxldCB2YWx1ZXMgPSByZXF1aXJlKFwibG9kYXNoLnZhbHVlc1wiKTtcbmxldCBDeWNsZSA9IHJlcXVpcmUoXCJjeWNsZWpzXCIpO1xubGV0IHtSeCwgaH0gPSBDeWNsZTtcbmxldCBGb290ZXIgPSByZXF1aXJlKFwiLi9mb290ZXJcIik7XG5sZXQgSXRlbSA9IHJlcXVpcmUoXCIuL2l0ZW1cIik7XG5cbi8vIEVYUE9SVFMgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbmxldCBWaWV3ID0gQ3ljbGUuY3JlYXRlVmlldyhNb2RlbCA9PiB7XG4gIGxldCBzdGF0ZSQgPSBNb2RlbC5nZXQoXCJzdGF0ZSRcIik7XG4gIHJldHVybiB7XG4gICAgdnRyZWUkOiBzdGF0ZSQubWFwKG1vZGVscyA9PiB7XG4gICAgICByZXR1cm4gKFxuICAgICAgICBoKCdkaXYnLCB7Y2xhc3NOYW1lOiBcImV2ZXJ5dGhpbmdcIn0sIFtcbiAgICAgICAgICBoKCdkaXYnLCB7Y2xhc3NOYW1lOiBcInRvcEJ1dHRvbnNcIn0sIFtcbiAgICAgICAgICAgIGgoJ2J1dHRvbicsIHtjbGFzc05hbWU6IFwiYWRkXCJ9LCBbXCJBZGQgUmFuZG9tXCJdKVxuICAgICAgICAgIF0pLFxuICAgICAgICAgIGgoJ2RpdicsIG51bGwsIFtcbiAgICAgICAgICAgIHNvcnRCeSh2YWx1ZXMobW9kZWxzKSwgbW9kZWwgPT4gbW9kZWwuaWQpLm1hcChtb2RlbCA9PiB7XG4gICAgICAgICAgICAgIHJldHVybiBoKFwiSXRlbS5pdGVtXCIsIHtpZDogbW9kZWwuaWQsIHdpZHRoOiBtb2RlbC53aWR0aCwga2V5OiBtb2RlbC5pZH0pO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICBdKSxcbiAgICAgICAgICBoKFwiRm9vdGVyXCIpXG4gICAgICAgIF0pXG4gICAgICApO1xuICAgIH0pLFxuICB9O1xufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gVmlldzsiXX0=
