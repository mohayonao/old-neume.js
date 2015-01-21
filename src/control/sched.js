"use strict";

var neume = require("../namespace");

var util = require("../util");
var Emitter = require("../util/emitter");

var STATE_INIT = 0;
var STATE_START = 1;
var STATE_RUNNING = 2;
// var STATE_STOP = 3;
var STATE_DONE = 4;

function NeuSched(context, schedIter, callback) {
  Emitter.call(this);

  Object.defineProperties(this, {
    context: {
      value: context,
      enumerable: true
    },
  });

  this._schedIter = schedIter;
  this._state = STATE_INIT;
  this._count = 0;

  this.on("start", callback).on("sched", callback).on("stop", callback);
}
util.inherits(NeuSched, Emitter);

NeuSched.$$name = "NeuSched";

NeuSched.prototype.start = function(startTime) {
  var _this = this;

  if (this._state !== STATE_INIT) {
    return this;
  }

  var context = this.context;

  startTime = util.defaults(context.toSeconds(startTime), context.currentTime);
  startTime = util.finite(startTime);

  this._state = STATE_START;

  context.sched(startTime, function(t0) {
    _this._state = STATE_RUNNING;
    emit(_this, t0, false);
  });

  context.start(); // auto start

  return this;
};

NeuSched.prototype.stop = function(startTime) {
  var _this = this;

  if (this._state !== STATE_RUNNING && this._state !== STATE_START) {
    return this;
  }

  var context = this.context;

  startTime = util.defaults(context.toSeconds(startTime), context.currentTime);
  startTime = util.finite(startTime);

  context.sched(startTime, function(t0) {
    _this.emit("stop", {
      type: "stop",
      playbackTime: t0,
      duration: 0,
      count: _this._count,
      done: false
    });
    _this._state = STATE_DONE;
  });

  return this;
};

function emit(_this, t0, done) {
  if (_this._state !== STATE_RUNNING) {
    return;
  }

  var context = _this.context;
  var type = done ? "stop" : _this._count ? "sched" : "start";
  var result = _this._schedIter.next();
  var duration = done ? 0 : util.finite(context.toSeconds(result.value));

  _this.emit(type, {
    type: type,
    playbackTime: t0,
    duration: duration,
    count: _this._count++,
    done: done
  });

  if (done) {
    _this._state = STATE_DONE;
  } else {
    context.sched(t0 + duration, function(t0) {
      emit(_this, t0, result.done);
    });
  }

}

module.exports = neume.Sched = NeuSched;
