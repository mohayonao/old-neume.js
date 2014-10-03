"use strict";

var _ = require("../utils");

var INIT  = 0;
var START = 1;
var STOP  = 2;

function NeuTimeout(context, interval, callback) {
  interval = _.finite(interval);

  this.$context = context;

  this._interval = Math.max(0, interval);
  this._callback = callback;
  this._state = INIT;
  this._stateString = "UNSCHEDULED";
  this._startTime = 0;
  this._stopTime = Infinity;
  this._count = 0;

  Object.defineProperties(this, {
    context: {
      value: this.$context,
      enumerable: true
    },
    outlet: {
      value: null,
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
NeuTimeout.$name = "NeuTimeout";

NeuTimeout.prototype.start = function(t) {
  t = _.defaults(t, this.$context.currentTime);

  if (this._state === INIT) {
    this._state = START;
    this._stateString = "SCHEDULED";
    this._startTime = t + this._interval;

    if (_.isFunction(this._callback)) {
      this.$context.sched(this._startTime, function(t) {
        if (t < this._stopTime) {
          this._stateString = "PLAYING";
          this._callback({ playbackTime: t, count: 0 });
        }
        this._state = STOP;
        this._stopTime = t;
        this._stateString = "FINISHED";
      }, this);
    }

    this.$context.start(); // auto start(?)
  }

  return this;
};

NeuTimeout.prototype.stop = function(t) {
  t = _.defaults(t, this.$context.currentTime);

  if (this._state === START) {
    this._state = STOP;
    this._stopTime = t;
    this.$context.sched(this._stopTime, function() {
      this._stateString = "FINISHED";
    }, this);
  }

  return this;
};

module.exports = NeuTimeout;
