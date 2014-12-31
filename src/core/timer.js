"use strict";

var neume = require("../namespace");

var NeuTimer;

/* istanbul ignore else */
if (typeof global.window === "undefined") {
  NeuTimer = (function() {
    function NodeNeuTimer(callback, interval) {
      this._callback = callback;
      this._interval = interval;
      this._timerId = 0;
    }
    NodeNeuTimer.$$name = "NeuTimer";

    NodeNeuTimer.prototype.start = function() {
      clearInterval(this._timerId);
      this._timerId = setInterval(this._callback, this._interval);
      return this;
    };

    NodeNeuTimer.prototype.stop = function() {
      this._timerId = clearInterval(this._timerId)|0;
      return this;
    };

    return NodeNeuTimer;
  })();
} else {
  NeuTimer = (function() {
    var timerJS = global.URL.createObjectURL(
      new global.Blob([
        "var t=0;onmessage=function(e){clearInterval(t);if(e.data)t=setInterval(function(){postMessage(0)},e.data)}"
      ], { type: "text/javascript" })
    );

    function WorkerNeuTimer(callback, interval) {
      this._callback = callback;
      this._interval = interval;
      this._worker = new global.Worker(timerJS);
      this._worker.onmessage = callback;
    }
    WorkerNeuTimer.$$name = "NeuTimer";

    WorkerNeuTimer.prototype.start = function() {
      this._worker.postMessage(this._interval);
      return this;
    };

    WorkerNeuTimer.prototype.stop = function() {
      this._worker.postMessage(0);
      return this;
    };

    return WorkerNeuTimer;
  })();
}


module.exports = neume.Timer = NeuTimer;
