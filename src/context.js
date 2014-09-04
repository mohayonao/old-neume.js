"use strict";

var _ = require("./utils");

var INIT  = 0;
var START = 1;
var BUFFER_SIZE = 1024;

var schedId = 1;

function NeuContext(context) {
  this.$context = _.findAudioContext(context);

  Object.defineProperties(this, {
    sampleRate: {
      value: this.$context.sampleRate,
      enumerable: true
    },
    currentTime: {
      get: function() {
        return this._currentTime || this.$context.currentTime;
      },
      enumarable: true
    },
    destination: {
      value: this.$context.destination,
      enumerable: true
    },
    listener: {
      value: this.$context.listener,
      enumerable: true
    }
  });

  this._currentTimeIncr = BUFFER_SIZE / context.sampleRate;
  this.reset();
}

_.each([
  "createBuffer",
  "createBufferSource",
  "createMediaElementSource",
  "createMediaStreamSource",
  "createMediaStreamDestination",
  "createScriptProcessor",
  "createAnalyser",
  "createGain",
  "createDelay",
  "createBiquadFilter",
  "createWaveShaper",
  "createPanner",
  "createConvolver",
  "createChannelSplitter",
  "createChannelMerger",
  "createDynamicsCompressor",
  "createOscillator",
  "createPeriodicWave"
], function(methodName) {
  NeuContext.prototype[methodName] = function() {
    return this.$context[methodName].apply(this.$context, arguments);
  };
});

NeuContext.prototype.getMasterGain = function() {
  return this._masterGain;
};

NeuContext.prototype.getAnalyser = function() {
  return this._analyser;
};

NeuContext.prototype.reset = function() {
  if (this.$outlet) {
    this.$outlet.disconnect();
  }

  this._masterGain = this.$context.createGain();
  this._analyser   = this.$context.createAnalyser();

  _.connect({ from: this._masterGain, to: this._analyser });
  _.connect({ from: this._analyser  , to: this.$context.destination });

  this.$outlet = this._analyser;

  if (this._scriptProcessor) {
    this._scriptProcessor.disconnect();
  }
  this._events = [];
  this._nextTicks = [];
  this._state = INIT;
  this._currentTime = 0;
  this._scriptProcessor = null;

  return this;
};

NeuContext.prototype.start = function() {
  if (this._state === INIT) {
    this._state = START;

    this._scriptProcessor = this.$context.createScriptProcessor(BUFFER_SIZE, 1, 1);
    this._scriptProcessor.onaudioprocess = onaudioprocess.bind(this);
    this._scriptProcessor.connect(this.$context.destination);

    // This is needed for iOS Safari
    this._bufSrc = this.$context.createBufferSource();
    this._bufSrc.start(0);

    _.connect({ from: this._bufSrc, to: this._scriptProcessor });
  }
  return this;
};

NeuContext.prototype.stop = function() {
  return this;
};

NeuContext.prototype.sched = function(time, callback, ctx) {
  time = _.finite(time);

  if (!_.isFunction(callback)) {
    return 0;
  }

  var events = this._events;
  var event  = {
    id      : schedId++,
    time    : time,
    callback: callback,
    context : ctx || this
  };

  if (events.length === 0 || _.last(events).time <= time) {
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

NeuContext.prototype.unsched = function(id) {
  id = _.finite(id);

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

NeuContext.prototype.nextTick = function(callback, ctx) {
  this._nextTicks.push(callback.bind(ctx || this));
  return this;
};

function onaudioprocess(e) {
  // Safari 7.0.6 does not support e.playbackTime
  var currentTime     = e.playbackTime || /* istanbul ignore next */ this._scriptProcessor.context.currentTime;
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

module.exports = NeuContext;
