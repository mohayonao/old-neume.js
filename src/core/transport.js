"use strict";

var neume = require("../namespace");
var timerAPI = require("./timer");
var WebAudioScheduler = require("web-audio-scheduler");

var C = require("../const");
var util = require("../util");

var INIT = 0, START = 1, STOP = 2;
var MAX_RENDERING_SEC = C.MAX_RENDERING_SEC;

var offlineTimerAPI = {
  setInterval: function(callback) {
    callback();
  },
  clearInterval: function() {
  }
};

function NeuTransport(context, spec) {
  spec = spec || /* istanbul ignore next */ {};

  Object.defineProperties(this, {
    context: {
      value: context,
      enumerable: true
    },
    audioContext: {
      value: context.audioContext,
      enumerable: true
    },
    sampleRate: {
      value: context.sampleRate,
      enumerable: true
    },
  });

  this._bpm = 120;
  this._state = INIT;
  this._scheduler = new WebAudioScheduler({
    context: this.audioContext
  });
  this._scheduleInterval = util.defaults(spec.scheduleInterval, 0.025);
  this._scheduleAheadTime = util.defaults(spec.scheduleAheadTime, 0.1);
  this._scheduleOffsetTime = util.defaults(spec.scheduleOffsetTime, 0.005);
  this._timerAPI = spec.timerAPI || timerAPI;
  this._duration = util.defaults(spec.duration, Infinity);

  Object.defineProperties(this, {
    currentTime: {
      get: function() {
        return this._scheduler.currentTime;
      },
      enumerable: true
    },
    bpm: {
      get: function() {
        return this._bpm;
      },
      set: function(value) {
        this._bpm = Math.max(1e-6, util.finite(value));
      },
      enumerable: true
    },
  });
}
NeuTransport.$$name = "NeuTransport";

NeuTransport.prototype.start = function() {
  if (this._state === INIT) {
    this._state = START;

    if (this.audioContext instanceof neume.webaudio.OfflineAudioContext) {
      this._scheduler.interval = 0;
      this._scheduler.aheadTime = util.clip(util.finite(this._duration), 0, MAX_RENDERING_SEC);
      this._scheduler.offsetTime = 0;
      this._scheduler.timerAPI = offlineTimerAPI;
    } else {
      this._scheduler.interval = this._scheduleInterval;
      this._scheduler.aheadTime = this._scheduleAheadTime;
      this._scheduler.offsetTime = this._scheduleOffsetTime;
      this._scheduler.timerAPI = this._timerAPI;
    }

    this._scheduler.start();
  }
  return this;
};

NeuTransport.prototype.stop = function() {
  if (this._state === START) {
    this._state = STOP;
    this.reset();
  }
  return this;
};

NeuTransport.prototype.reset = function() {
  this._scheduler.stop(true);
  this._state = INIT;

  return this;
};

NeuTransport.prototype.sched = function(time, callback) {
  if (typeof callback !== "function") {
    return 0;
  }

  time = util.finite(time);

  return this._scheduler.insert(time, callback);
};

NeuTransport.prototype.unsched = function(id) {
  id = util.finite(id);

  if (id !== 0) {
    return this._scheduler.remove(id);
  }

  return id;
};

NeuTransport.prototype.nextTick = function(callback) {
  return this._scheduler.nextTick(callback);
};

NeuTransport.prototype.toSeconds = function(value) {
  if (typeof value === "number") {
    return util.finite(value);
  }

  if (value && typeof value.playbackTime === "number") {
    return util.finite(value.playbackTime);
  }

  if (typeof value === "string") {
    var m, offset = 0, time = 0;

    if (value.charAt(0) === "+") {
      offset = this.currentTime;
      value = value.slice(1);
    }

    var components = value.split(/[\(\)\-\+\/\*]/);

    if (components.length > 1) {
      var oringalTime = value;
      var expr = value;

      for (var i = 0, imax = components.length; i < imax; i++) {
        var symb = components[i].trim();
        if (symb !== "") {
          expr = expr.replace(symb, this.toSeconds(symb));
        }
      }

      try {
        time = eval(expr); // jshint ignore:line
      } catch (e) {
        throw new EvalError("Invalid Time Value Syntax: " + oringalTime);
      }

    } else if (value === "now") {
      return this.currentTime;
    } else if ((m = /^(\d+)ms$/.exec(value)) !== null) {
      time = +m[1] * 0.001;
    } else if ((m = /^(\d+(?:\.\d+)?)hz$/.exec(value)) !== null) {
      time = util.finite(1 / +m[1]);
    } else if ((m = /^(\d+)ticks$/.exec(value)) !== null) {
      time = ticks2sec(+m[1], this._bpm);
    } else if ((m = /^(\d+)(n[td]?)$/.exec(value)) !== null) {
      time = note2sec(+m[1], m[2], this._bpm);
    } else if ((m = /^(\d+)\.(\d+)\.(\d+)$/.exec(value)) !== null) {
      time = ticks2sec((+m[1] * 4 + (+m[2])) * 480 + (+m[3]), this._bpm);
    } else if ((m = /^(\d\d):(\d\d):(\d\d)(?:\.(\d+))?$/.exec(value)) !== null) {
      time = ((+m[1] * 3600) + (+m[2] * 60) + (+m[3]) + (((m[4] || "") + "000").substr(0, 3) * 0.001));
    } else if ((m = /^(\d+)samples$/.exec(value)) !== null) {
      time = (+m[1] / this.sampleRate);
    } else {
      time = util.finite(+value);
    }

    return time + offset;
  }

  return value;
};

function ticks2sec(ticks, bpm) {
  return 60 / bpm * (ticks / 480);
}

function note2sec(num, note, bpm) {
  var acc = {
    nt: 2 / 3,
    nd: 3 / 2,
  }[note] || 1;
  return num === 0 ? 0 : ticks2sec((4 / num) * 480 * acc, bpm);
}

module.exports = neume.Transport = NeuTransport;
