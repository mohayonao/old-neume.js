"use strict";

var C = require("../const");
var util = require("../util");
var neume = require("../namespace");

var INIT = 0, START = 1, STOP = 2;
var MAX_RENDERING_SEC = C.MAX_RENDERING_SEC;

var schedId = 1;

function NeuTransport(context, duration) {
  this.context = context;
  this.audioContext = context.audioContext;
  this.sampleRate = context.sampleRate;

  this._bpm = 120;
  this._processBufSize = C.PROCESS_BUF_SIZE;
  this._events = [];
  this._nextTicks = [];
  this._state = INIT;
  this._currentTime = 0;
  this._scriptProcessor = null;

  Object.defineProperties(this, {
    currentTime: {
      get: function() {
        return this._currentTime || this.audioContext.currentTime;
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

  this._duration = duration;
}
NeuTransport.$$name = "NeuTransport";

NeuTransport.prototype.start = function() {
  if (this._state === INIT) {
    this._state = START;
    if (this.audioContext instanceof neume.webaudio.OfflineAudioContext) {
      startRendering.call(this);
    } else {
      startAudioTimer.call(this);
    }
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
  this.context.disconnect(this._scriptProcessor);

  this._events = [];
  this._nextTicks = [];
  this._state = INIT;
  this._currentTime = 0;
  this._scriptProcessor = null;

  return this;
};

function startRendering() {
  this._currentTimeIncr = util.clip(util.finite(this._duration), 0, MAX_RENDERING_SEC);
  onaudioprocess.call(this, { playbackTime: 0 });
}

function startAudioTimer() {
  var context = this.audioContext;
  var scriptProcessor = context.createScriptProcessor(this._processBufSize, 1, 1);
  var bufferSource = context.createBufferSource();

  this._currentTimeIncr = this._processBufSize / context.sampleRate;
  this._scriptProcessor = scriptProcessor;
  scriptProcessor.onaudioprocess = onaudioprocess.bind(this);

  // this is needed for iOS Safari
  bufferSource.start(0);
  bufferSource.connect(scriptProcessor);

  scriptProcessor.connect(context.destination);
}

NeuTransport.prototype.sched = function(time, callback, context) {
  if (typeof callback !== "function") {
    return 0;
  }

  time = util.finite(time);

  var events = this._events;
  var event = {
    id: schedId++,
    time: time,
    callback: callback,
    context: context || this
  };

  if (events.length === 0 || events[events.length - 1].time <= time) {
    events.push(event);
  } else {
    for (var i = 0, imax = events.length; i < imax; i++) {
      if (time < events[i].time) {
        events.splice(i, 0, event);
        break;
      }
    }
  }

  return event.id;
};

NeuTransport.prototype.unsched = function(id) {
  id = util.finite(id);

  if (id !== 0) {
    var events = this._events;
    for (var i = 0, imax = events.length; i < imax; i++) {
      if (id === events[i].id) {
        events.splice(i, 1);
        break;
      }
    }
  }

  return id;
};

NeuTransport.prototype.nextTick = function(callback, context) {
  this._nextTicks.push(callback.bind(context || this));
  return this;
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

function onaudioprocess(e) {
  // Safari 7.0.6 does not support e.playbackTime
  var currentTime = e.playbackTime || /* istanbul ignore next */ this.audioContext.currentTime;
  var nextCurrentTime = currentTime + this._currentTimeIncr;
  var events = this._events;

  this._currentTime = currentTime;

  this._nextTicks.splice(0).forEach(function(callback) {
    callback(currentTime);
  });

  while (events.length && events[0].time <= nextCurrentTime) {
    var event = events.shift();

    this._currentTime = Math.max(this._currentTime, event.time);

    event.callback.call(event.context, event.time);
  }
}

module.exports = neume.Transport = NeuTransport;
