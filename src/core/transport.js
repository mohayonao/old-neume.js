"use strict";

var C = require("../const");
var util = require("../util");
var neume = require("../namespace");
var toSeconds = require("../util/toSeconds");

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

NeuTransport.prototype.reset = function() {
  this.context.disconnect(this._scriptProcessor);

  this._events = [];
  this._nextTicks = [];
  this._state = INIT;
  this._currentTime = 0;
  this._scriptProcessor = null;

  return this;
};

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
  return toSeconds(value, this._bpm, this.sampleRate, this.currentTime);
};

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
