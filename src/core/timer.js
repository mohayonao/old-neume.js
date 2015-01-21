"use strict";

/* istanbul ignore else */
if (typeof global.window === "undefined") {
  module.exports = global;
} else {
  module.exports = (function() {
    var timerJS = global.URL.createObjectURL(
      new global.Blob([
        "var t=0;onmessage=function(e){clearInterval(t);if(e.data)t=setInterval(function(){postMessage(0)},e.data)}"
      ], { type: "text/javascript" })
    );
    var timerId = 0;
    var timers = {};

    function WorkerTimer() {
      var worker = new global.Worker(timerJS);
      return {
        set: function(callback, interval) {
          worker.onmessage = callback;
          worker.postMessage(interval);
        },
        clear: function() {
          worker.postMessage(0);
        },
      };
    }

    return {
      setInterval: function(callback, interval) {
        timerId += 1;

        timers[timerId] = new WorkerTimer();
        timers[timerId].set(callback, interval);

        return timerId;
      },
      clearInterval: function(timerId) {
        if (timers[timerId]) {
          timers[timerId].clear();
          delete timers[timerId];
        }
      },
    };
  })();
}
