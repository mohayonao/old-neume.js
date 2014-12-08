"use strict";

var C = require("../const");
var util = require("../util");
var neume = require("../namespace");

var INIT = 0;
var START = 1;
var MAX_RENDERING_SEC = C.MAX_RENDERING_SEC;

var schedId = 1;

function NeuContext(destination, duration, spec) {
  spec = spec || {};
  this.$context = destination.context;
  this.$destination = destination;

  this._transport = new neume.Transport(this);
  this.$analyser = this.$context.createAnalyser();
  this.connect(this.$analyser, this.$destination);
  this._scriptProcessor = null;
  this._audioBuses = [];
  this._processBufSize = util.int(util.defaults(spec.processBufSize, C.PROCESS_BUF_SIZE));

  this.$inlet = null;
  this.$outlet = this.$analyser;

  Object.defineProperties(this, {
    context: {
      value: this,
      enumerable: true
    },
    audioContext: {
      value: this.$context,
      enumerable: true
    },
    sampleRate: {
      value: this.$context.sampleRate,
      enumerable: true
    },
    currentTime: {
      get: function() {
        return this._currentTime || this.$context.currentTime;
      },
      enumerable: true
    },
    bpm: {
      get: function() {
        return this._transport.getBpm();
      },
      set: function(value) {
        this._transport.setBpm(value);
      },
      enumerable: true
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

Object.keys(global.AudioContext.prototype).forEach(function(key) {
  var desc = Object.getOwnPropertyDescriptor(global.AudioContext.prototype, key);

  /* istanbul ignore next */
  if (typeof desc.value !== "function") {
    return;
  }

  var method = global.AudioContext.prototype[key];

  NeuContext.prototype[key] = function() {
    return method.apply(this.$context, arguments);
  };
});

/**
 * @deprecated since version 0.3.0
 */
NeuContext.prototype.createNeuComponent = function(node) {
  return new neume.Component(this, node);
};

/**
* @deprecated since version 0.3.0
*/
NeuContext.prototype.createNeuDC = function(value) {
  return new neume.DC(this, util.finite(value));
};

/**
* @deprecated since version 0.3.0
*/
NeuContext.prototype.createNeuMul = function(a, b) {
  return new neume.Mul(this, a, b);
};

/**
* @deprecated since version 0.3.0
*/
NeuContext.prototype.createNeuSum = function(inputs) {
  return new neume.Sum(this, inputs);
};

/**
* @deprecated since version 0.3.0
*/
NeuContext.prototype.createNeuParam = function(value, spec) {
  return new neume.Param(this, util.finite(value), spec);
};

/**
* @deprecated since version 0.3.0
*/
NeuContext.prototype.createNeuDryWet = function(dryIn, wetIn, mixIn) {
  return new neume.DryWet(this, dryIn, wetIn, mixIn);
};

NeuContext.prototype.getAudioBus = function(index) {
  index = util.clip(util.int(util.defaults(index, 0)), 0, C.AUDIO_BUS_CHANNELS);
  if (!this._audioBuses[index]) {
    this._audioBuses[index] = new neume.AudioBus(this);
  }
  return this._audioBuses[index];
};

NeuContext.prototype.reset = function() {
  if (this.$inlet) {
    this.$inlet.disconnect();
  }

  this._audioBuses = [];

  this.$inlet = this._audioBuses[0] = this.getAudioBus(0);
  this.connect(this.$inlet, this.$analyser);

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
    if (this.$context instanceof global.OfflineAudioContext) {
      startRendering.call(this);
    } else {
      startAudioTimer.call(this);
    }
  }
  return this;
};

function startRendering() {
  this._currentTimeIncr = util.clip(util.finite(this._duration), 0, MAX_RENDERING_SEC);
  onaudioprocess.call(this, { playbackTime: 0 });
}

function startAudioTimer() {
  var context = this.$context;
  var scriptProcessor = context.createScriptProcessor(this._processBufSize, 1, 1);
  var bufferSource = context.createBufferSource();

  this._currentTimeIncr = this._processBufSize / context.sampleRate;
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
  time = util.finite(time);

  if (!util.isFunction(callback)) {
    return 0;
  }

  var events = this._events;
  var event = {
    id: schedId++,
    time: time,
    callback: callback,
    context: ctx || this
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

NeuContext.prototype.unsched = function(id) {
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

NeuContext.prototype.nextTick = function(callback, ctx) {
  this._nextTicks.push(callback.bind(ctx || this));
  return this;
};

NeuContext.prototype.toAudioNode = function(obj) {
  if (obj && obj.toAudioNode) {
    obj = obj.toAudioNode();
  } else if (typeof obj === "number") {
    obj = new neume.DC(this, obj).toAudioNode();
  }
  if (!(obj instanceof global.AudioNode)) {
    obj = null;
  }
  return obj;
};

NeuContext.prototype.toAudioBuffer = function(obj) {
  if (obj && obj.toAudioBuffer) {
    return obj.toAudioBuffer();
  }
  if (!(obj instanceof global.AudioBuffer)) {
    obj = null;
  }
  return obj;
};

NeuContext.prototype.connect = function(from, to) {
  if (to) {
    if (Array.isArray(from)) {
      new neume.Sum(this, from).connect(to);
    } else if (from instanceof neume.Component || from instanceof neume.UGen) {
      from.connect(to);
    } else if (to instanceof global.AudioParam) {
      if (typeof from === "number") {
        to.value = util.finite(from);
      } else {
        from = this.toAudioNode(from);
        if (from) {
          from.connect(to);
        }
      }
    } else if (to instanceof global.AudioNode) {
      from = this.toAudioNode(from);
      if (from) {
        from.connect(to);
      }
    } else if (to instanceof neume.AudioBus) {
      this.connect(from, to.toAudioNode());
    }
    if (to.onconnected) {
      to.onconnected(from);
    }
  }
  return this;
};

NeuContext.prototype.disconnect = function(from) {
  if (from && from.disconnect) {
    from.disconnect();
    if (from.$outputs) {
      from.$outputs.forEach(function(to) {
        return to.ondisconnected && to.ondisconnected(from);
      });
    }
  }
  return this;
};

NeuContext.prototype.getBpm = function() {
  return this._transport.getBpm();
};

NeuContext.prototype.setBpm = function(value, rampTime) {
  this._transport.setBpm(value, rampTime);
  return this;
};

NeuContext.prototype.toSeconds = function(value) {
  return this._transport.toSeconds(value);
};

NeuContext.prototype.toFrequency = function(value) {
  return this._transport.toFrequency(value);
};

function onaudioprocess(e) {
  // Safari 7.0.6 does not support e.playbackTime
  var currentTime = e.playbackTime || /* istanbul ignore next */ this.$context.currentTime;
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
