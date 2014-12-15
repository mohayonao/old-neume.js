"use strict";

var util = require("../util");
var neume = require("../namespace");

function NeuSched(context, schedTime, callback) {
  this.$context = context;

  this._schedTime = schedTime;
  this._callback = callback;

  this._state = NeuSched.STATE_INIT;
  this._stateString = "UNSCHEDULED";
  this._startTime = 0;
  this._stopTime = Infinity;
  this._count = 0;

  Object.defineProperties(this, {
    context: {
      value: this.$context,
      enumerable: true
    },
    state: {
      get: function() {
        return this._stateString;
      },
      enumerable: true
    },
  });
}
NeuSched.$name = "NeuSched";

NeuSched.STATE_INIT = 0;
NeuSched.STATE_START = 1;
NeuSched.STATE_STOP = 2;

NeuSched.prototype.start = function(t0) {
  var context = this.$context;

  t0 = util.finite(util.defaults(context.toSeconds(t0), context.currentTime));

  if (this._state === NeuSched.STATE_INIT) {
    if (util.isFunction(this._callback)) {
      this._state = NeuSched.STATE_START;
      this._stateString = "SCHEDULED";
      this._startTime = t0;

      context.sched(t0, this._onsched, this);
    } else {
      this._state = NeuSched.STATE_STOP;
      this._stateString = "FINISHED";
    }

    context.start(); // auto start(?)
  }

  return this;
};

NeuSched.prototype.stop = function(t0) {
  var context = this.$context;

  t0 = util.finite(util.defaults(context.toSeconds(t0), context.currentTime));

  if (this._state === NeuSched.STATE_START) {
    this._state = NeuSched.STATE_STOP;
    this._stopTime = t0;
    this.$context.sched(this._stopTime, function() {
      this._stateString = "FINISHED";
    }, this);
  }

  return this;
};

NeuSched.prototype._onsched = function(t0) {
  if (this._stopTime <= t0) {
    this._state = NeuSched.STATE_STOP;
    this._stateString = "FINISHED";
    return;
  }

  this._stateString = "PLAYING";

  var result = this._callback({
    playbackTime: t0,
    count: this._count++
  });

  var context = this.$context;

  /* istanbul ignore else */
  if (typeof result === "object") {
    var schedTime = util.finite(context.toSeconds(result.next));

    if (t0 < schedTime) {
      if (util.isFunction(result.callback)) {
        this._callback = result.callback;
      }
      this._schedTime = schedTime;

      return context.sched(this._schedTime, this._onsched, this);
    }
  }

  this._state = NeuSched.STATE_STOP;
  this._stopTime = t0;
  this._stateString = "FINISHED";
};

module.exports = neume.Sched = NeuSched;
