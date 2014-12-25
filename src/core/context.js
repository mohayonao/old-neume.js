"use strict";

var C = require("../const");
var util = require("../util");
var neume = require("../namespace");

require("./transport");

var INIT = 0, START = 1, STOP = 2;

function NeuContext(destination, duration) {
  this.context = this;
  this.destination = destination;
  this.audioContext = destination.context;
  this.sampleRate = this.audioContext.sampleRate;
  this.listener = this.audioContext.listener;
  this.analyser = this.audioContext.createAnalyser();

  this._transport = new neume.Transport(this, duration);
  this._audioBuses = [];

  this.connect(this.analyser, this.destination);

  Object.defineProperties(this, {
    currentTime: {
      get: function() {
        return this._transport.currentTime;
      },
      enumerable: true
    },
    bpm: {
      get: function() {
        return this._transport.bpm;
      },
      set: function(value) {
        this._transport.bpm = value;
      },
      enumerable: true
    },
  });

  this.reset();
}
NeuContext.$$name = "NeuContext";

Object.keys(neume.webaudio.AudioContext.prototype).forEach(function(key) {
  var desc = Object.getOwnPropertyDescriptor(neume.webaudio.AudioContext.prototype, key);

  /* istanbul ignore next */
  if (typeof desc.value !== "function") {
    return;
  }

  var method = neume.webaudio.AudioContext.prototype[key];

  NeuContext.prototype[key] = function() {
    return method.apply(this.audioContext, arguments);
  };
});

NeuContext.prototype.getAudioBus = function(index) {
  index = util.clip(util.int(util.defaults(index, 0)), 0, C.AUDIO_BUS_CHANNELS);
  if (!this._audioBuses[index]) {
    this._audioBuses[index] = new neume.AudioBus(this);
  }
  return this._audioBuses[index];
};

NeuContext.prototype.start = function() {
  if (this._state === INIT) {
    this._state = START;
    this._transport.start();
    this.connect(this.getAudioBus(0).outlet, this.analyser);
  }
  return this;
};

NeuContext.prototype.stop = function() {
  if (this._state === START) {
    this._state = STOP;
    this._transport.stop();
  }
  return this;
};

NeuContext.prototype.reset = function() {
  this._transport.reset();

  this._audioBuses.splice(0).forEach(function(bus) {
    bus.toAudioNode().disconnect();
  }, this);
  this._state = INIT;

  return this;
};

NeuContext.prototype.sched = function(time, callback, context) {
  return this._transport.sched(time, callback, context);
};

NeuContext.prototype.unsched = function(id) {
  return this._transport.unsched(id);
};

NeuContext.prototype.nextTick = function(callback, context) {
  this._transport.nextTick(callback, context);
  return this;
};

NeuContext.prototype.toAudioNode = function(obj) {
  if (obj && obj.toAudioNode) {
    obj = obj.toAudioNode();
  } else if (typeof obj === "number") {
    obj = new neume.DC(this, obj).toAudioNode();
  }
  if (!(obj instanceof neume.webaudio.AudioNode)) {
    obj = null;
  }
  return obj;
};

NeuContext.prototype.toAudioBuffer = function(obj) {
  if (obj && obj.toAudioBuffer) {
    return obj.toAudioBuffer();
  }
  if (!(obj instanceof neume.webaudio.AudioBuffer)) {
    obj = null;
  }
  return obj;
};

NeuContext.prototype.connect = function(from, to) {
  if (to) {
    if (Array.isArray(from)) {
      if (from.length) {
        new neume.Sum(this, from).connect(to);
      }
    } else if (from instanceof neume.Component || from instanceof neume.UGen) {
      from.connect(to);
    } else if (to instanceof neume.webaudio.AudioParam) {
      if (typeof from === "number") {
        to.value = util.finite(from);
      } else {
        from = this.toAudioNode(from);
        if (from) {
          from.connect(to);
        }
      }
    } else if (to instanceof neume.webaudio.AudioNode) {
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

NeuContext.prototype.disconnect = function(node) {
  if (node) {
    if (typeof node.disconnect === "function") {
      node.disconnect();
      if (node.$$outputs) {
        node.$$outputs.forEach(function(to) {
          return to.ondisconnected && to.ondisconnected(node);
        });
      }
    } else if (Array.isArray(node)) {
      node.forEach(function(node) {
        this.disconnect(node);
      }, this);
    }
  }
  return this;
};

NeuContext.prototype.toSeconds = function(value) {
  return this._transport.toSeconds(value);
};

module.exports = neume.Context = NeuContext;
