"use strict";

var _ = require("../utils");
var C = require("../const");

var NeuComponent = require("../component/component");
var NeuDC = require("../component/dc");
var NeuMul = require("../component/mul");
var NeuAdd = require("../component/add");
var NeuSum = require("../component/sum");
var NeuParam = require("../component/param");
var NeuDryWet = require("../component/drywet");

var INIT  = 0;
var START = 1;
var PROCESS_BUF_SIZE   = C.PROCESS_BUF_SIZE;
var MAX_RENDERING_SEC = C.MAX_RENDERING_SEC;

var schedId = 1;

function NeuContext(destination, duration) {
  this.$context = destination.context;
  this.$destination = destination;

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
      value: destination,
      enumerable: true
    },
    listener: {
      value: this.$context.listener,
      enumerable: true
    }
  });

  this._duration = duration;
  this.reset();
}
NeuContext.$name = "NeuContext";

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
  "createPeriodicWave",
  "decodeAudioData",
], function(methodName) {
  NeuContext.prototype[methodName] = function() {
    return this.$context[methodName].apply(this.$context, arguments);
  };
});

NeuContext.prototype.createComponent = function(node) {
  return new NeuComponent(this, node);
};

NeuContext.prototype.createDC = function(value) {
  return new NeuDC(this, _.finite(value));
};

NeuContext.prototype.createMul = function(a, b) {
  return new NeuMul(this, a, b);
};

NeuContext.prototype.createAdd = function(a, b) {
  return new NeuAdd(this, a, b);
};

NeuContext.prototype.createSum = function(inputs) {
  return new NeuSum(this, inputs);
};

NeuContext.prototype.createParam = function(value) {
  return new NeuParam(this, _.finite(value));
};

NeuContext.prototype.createDryWet = function(inputs, node, mix) {
  return new NeuDryWet(this, inputs, node, mix);
};

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

  this.connect(this._masterGain, this._analyser);
  this.connect(this._analyser  , this.$destination);

  this.$outlet = this._masterGain;

  this.disconnect(this._scriptProcessor);

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
    if (this.$context instanceof window.OfflineAudioContext) {
      startRendering.call(this);
    } else {
      startAudioTimer.call(this);
    }
  }
  return this;
};

function startRendering() {
  this._currentTimeIncr = _.clip(_.finite(this._duration), 0, MAX_RENDERING_SEC);
  onaudioprocess.call(this, { playbackTime: 0 });
}

function startAudioTimer() {
  var context = this.$context;
  var scriptProcessor = context.createScriptProcessor(PROCESS_BUF_SIZE, 1, 1);
  var bufferSource    = context.createBufferSource();

  this._currentTimeIncr = PROCESS_BUF_SIZE / context.sampleRate;
  this._scriptProcessor = scriptProcessor;
  scriptProcessor.onaudioprocess = onaudioprocess.bind(this);

  // this is needed for iOS Safari
  bufferSource.start(0);
  this.connect(bufferSource, scriptProcessor);

  this.connect(scriptProcessor, context.destination);
}

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

NeuContext.prototype.toAudioNode = function(obj) {
  if (obj && obj.toAudioNode) {
    obj = obj.toAudioNode();
  } else if (typeof obj === "number") {
    obj = this.createDC(obj).toAudioNode();
  }
  if (!(obj instanceof window.AudioNode)) {
    obj = null;
  }
  return obj;
};

NeuContext.prototype.toAudioBuffer = function(obj) {
  if (obj && obj.toAudioBuffer) {
    return obj.toAudioBuffer();
  }
  if (!(obj instanceof window.AudioBuffer)) {
    obj = null;
  }
  return obj;
};

NeuContext.prototype.connect = function(from, to) {
  if (to) {
    if (from instanceof NeuComponent) {
      from.connect(to);
    } else if (to instanceof window.AudioParam) {
      if (typeof from === "number") {
        to.value = _.finite(from);
      } else {
        from = this.toAudioNode(from);
        if (from) {
          return from.connect(to);
        }
      }
    } else if (to instanceof window.AudioNode) {
      from = this.toAudioNode(from);
      if (from) {
        return from.connect(to);
      }
    }
  }
  return this;
};

NeuContext.prototype.disconnect = function(from) {
  if (from && from.disconnect) {
    from.disconnect();
  }
};

function onaudioprocess(e) {
  // Safari 7.0.6 does not support e.playbackTime
  var currentTime     = e.playbackTime || /* istanbul ignore next */ this.$context.currentTime;
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
