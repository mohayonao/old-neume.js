"use strict";

var _ = require("./utils");

var INIT  = 0;
var START = 1;
var STOP  = 2;
var BUFFER_SIZE = 1024;

function NeuInterval(context, interval, callback) {
  interval = _.finite(interval);

  this.$context = context;

  this._interval = _.finite(interval);
  this._callback = callback;
  this._state = INIT;
  this._stateString = "init";
  this._startTime = 0;
  this._stopTime  = Infinity;
  this._nextTime  = 0;
  this._count     = 0;
  this._currentTimeIncr = BUFFER_SIZE / context.sampleRate;

  Object.defineProperties(this, {
    context: {
      value: _.findAudioContext(this.$context),
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

NeuInterval.prototype.start = function(t) {
  t = _.defaults(t, this.$context.currentTime);

  if (this._state === INIT) {
    this._state = START;
    this._stateString = "ready";

    this._startTime = t;
    this._nextTime  = t;

    if (0 < this._interval && _.isFunction(this._callback)) {
      this.$context.sched(t, function() {
        this._stateString = "start";
      }, this);
      this._scriptProcessor = this.$context.createScriptProcessor(BUFFER_SIZE, 0, 1);
      this._scriptProcessor.onaudioprocess = onaudioprocess.bind(this);
      this._scriptProcessor.connect(this.$context.destination);
    }

    this.$context.start(); // auto start(?)
  }

  return this;
};

NeuInterval.prototype.stop = function(t) {
  t = _.defaults(t, this.$context.currentTime);

  if (this._state === START) {
    this._state = STOP;
    this._stopTime = t;
  }

  return this;
};

function onaudioprocess(e) {
  // Safari 7.0.6 does not support e.playbackTime
  var currentTime = e.playbackTime || /* istanbul ignore next */ this._scriptProcessor.context.currentTime;
  var nextCurrentTime = currentTime + this._currentTimeIncr;

  while (this._nextTime < nextCurrentTime) {
    this._callback({ playbackTime: this._nextTime, count: this._count++ });
    this._nextTime = this._startTime + this._count * this._interval;
  }
  if (this._stopTime <= nextCurrentTime) {
    this._stateString = "stop";
    this._scriptProcessor.disconnect();
  }
}

module.exports = NeuInterval;
