"use strict";

var neume = require("../namespace");

var NeuTimer;

/* istanbul ignore else */
if (typeof global.window === "undefined") {
  NeuTimer = (function() {
    function NodeNeuTimer(callback, interval) {
      this.callback = callback;
      this.interval = interval;
      this._timerId = 0;
    }
    NodeNeuTimer.$$name = "NeuTimer";

    NodeNeuTimer.prototype.start = function() {
      clearInterval(this._timerId);
      this._timerId = setInterval(this.callback, this.interval);
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
    var timerSource = (function(onmessage, postMessage) {
      var timerId = 0;
      onmessage = function(e) {
        clearInterval(timerId);
        if (e.data > 0) {
          timerId = setInterval(function() {
            postMessage(0);
          }, e.data);
        }
      };
    }).toString().trim().match(
      /^function\s*\w*\s*\([\w\s,]*\)\s*{([\w\W]*?)}$/
    )[1];

    var timerJS = global.URL.createObjectURL(
      new global.Blob([ timerSource ], { type: "text/javascript" })
    );

    function WorkerNeuTimer(callback, interval) {
      this.callback = callback;
      this.interval = interval;
      this._worker = new global.Worker(timerJS);
      this._worker.onmessage = function() {
        callback();
      };
    }
    WorkerNeuTimer.$$name = "NeuTimer";

    WorkerNeuTimer.prototype.start = function() {
      this._worker.postMessage(this.interval);
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
