"use strict";

var neume = require("../namespace");

require("./transport");

var util = require("../util");

var INIT = 0, START = 1;

function NeuContext(destination, spec) {
  spec = spec || /* istanbul ignore next */ {};

  var audioContext = destination.context;

  Object.defineProperties(this, {
    context: {
      value: this,
      enumerable: true
    },
    audioContext: {
      value: audioContext,
      enumerable: true
    },
    destination: {
      value: destination,
      enumerable: true
    },
    sampleRate: {
      value: audioContext.sampleRate,
      enumerable: true
    },
    listener: {
      value: audioContext.listener,
      enumerable: true
    },
    analyser: {
      value: audioContext.createAnalyser(),
      enumerable: true
    },
  });

  this._transport = new neume.Transport(this, spec);
  this._nodes = [];
  this._audioBuses = [];

  this.$$neuDC = null;

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

[
  "createBuffer",
  "decodeAudioData",
  "createPeriodicWave",
  "startRendering",
].forEach(function(methodName) {
  var method = neume.webaudio.AudioContext.prototype[methodName];

  NeuContext.prototype[methodName] = function() {
    return method.apply(this.audioContext, arguments);
  };
});

[
  "createBufferSource",
  "createMediaElementSource",
  "createMediaStreamSource",
  "createMediaStreamDestination",
  "createGain",
  "createDelay",
  "createBiquadFilter",
  "createWaveShaper",
  "createPanner",
  "createConvolver",
  "createDynamicsCompressor",
  "createAnalyser",
  "createScriptProcessor",
  "createOscillator",
  "createChannelSplitter",
  "createChannelMerger",
].forEach(function(methodName) {
  var method = neume.webaudio.AudioContext.prototype[methodName];

  NeuContext.prototype[methodName] = function() {
    var node = method.apply(this.audioContext, arguments);

    this._nodes.push(node);

    return node;
  };
});

NeuContext.prototype.getAudioBus = function(index) {
  index = Math.max(0, util.int(index));
  if (!this._audioBuses[index]) {
    this._audioBuses[index] = new neume.AudioBus(this, index);
  }
  return this._audioBuses[index];
};

NeuContext.prototype.start = function() {
  if (this._state === INIT) {
    this._state = START;
    this._transport.start();
    this.connect(this.getAudioBus(0).toAudioNode(), this.analyser);
  }
  return this;
};

NeuContext.prototype.stop = function() {
  if (this._state === START) {
    this.reset();
    this._transport.stop();
  }
  return this;
};

NeuContext.prototype.reset = function() {
  this.dispose();
  this._audioBuses = [];
  this._transport.reset();
  this._state = INIT;
  return this;
};

NeuContext.prototype.dispose = function() {
  if (this.$$neuDC) {
    var neuDC = this.$$neuDC;
    var t = this.currentTime;
    Object.keys(neuDC).forEach(function(value) {
      neuDC[value].stop(t);
    });
    this.$$neuDC = null;
  }
  this._nodes.splice(0).forEach(function(node) {
    node.disconnect();
  });
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
