"use strict";

require("./shim");

var util = require("../util");
var neume = require("../namespace");

require("../component");
require("../control");
require("../synth");

function Neume(context) {
  function fn(spec) {
    return new neume.SynthDef(context, spec);
  }

  Object.defineProperties(fn, {
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
    destination: {
      value: context.$destination,
      enumerable: true
    },
    currentTime: {
      get: function() {
        return context.currentTime;
      },
      enumerable: true
    },
    bpm: {
      get: function() {
        return context.bpm;
      },
      set: function(value) {
        context.bpm = value;
      },
      enumerable: true
    },
    toSeconds: {
      value: context.toSeconds.bind(context),
      enumerable: true
    },
    toFrequency: {
      value: context.toFrequency.bind(context),
      enumerable: true
    },
    Synth: {
      value: function(func) {
        return new neume.Synth(context, func, util.toArray(arguments).slice(1));
      },
      enumerable: true
    },
    Buffer: {
      value: Object.defineProperties(function(channels, length, sampleRate) {
        return neume.Buffer.create(context, channels, length, sampleRate);
      }, {
        from: {
          value: function(data) {
            return neume.Buffer.from(context, data);
          },
          enumerable: true
        },
        load: {
          value: function(url) {
            return neume.Buffer.load(context, url);
          },
          enumerable: true
        }
      }),
      enumerable: true
    },
    Sched: {
      value: function(callback) {
        return new neume.Sched(context, 0, callback);
      },
      enumerable: true
    },
    Interval: {
      value: function(schedTime, callback) {
        return new neume.Interval(context, schedTime, callback);
      },
      enumerable: true
    },
    Timeout: {
      value: function(schedTime, callback) {
        return new neume.Timeout(context, schedTime, callback);
      },
      enumerable: true
    },
  });

  return fn;
}

neume.impl = function(destination, spec) {
  if (destination instanceof global.AudioContext) {
    destination = destination.destination;
  }
  if (!(destination instanceof global.AudioNode)) {
    throw new TypeError("neume(): Illegal arguments");
  }

  var context = new neume.Context(destination, Infinity, spec);

  return Object.defineProperties(
    new Neume(context), {
      render: {
        value: function(duration, func) {
          var sampleRate = context.sampleRate;
          var length = util.int(sampleRate * duration);

          return new Promise(function(resolve) {
            var audioContext = new global.OfflineAudioContext(2, length, sampleRate);
            audioContext.oncomplete = function(e) {
              resolve(new neume.Buffer(context, e.renderedBuffer));
            };
            func(new Neume(new neume.Context(audioContext.destination, duration)));
            audioContext.startRendering();
          });
        }
      },
      start: {
        value: function() {
          context.start();
          return this;
        },
        enumerable: true
      },
      stop: {
        value: function() {
          context.stop();
          return this;
        },
        enumerable: true
      },
      reset: {
        value: function() {
          context.reset();
          return this;
        },
        enumerable: true
      },
      analyser: {
        value: context.$analyser,
        enumerable: true
      }
    }
  );
};

neume.util = util;
neume.KVS = require("./kvs");
neume.Context = require("./context");
neume.Transport = require("./transport");
neume.FFT = require("../dsp/fft");
neume.Emitter = require("../event/emitter");

(function(C) {
  Object.keys(C).forEach(function(key) {
    neume[key] = C[key];
  });
})(require("../const"));

neume.register = function(name, func) {
  neume.UGen.register(name, func);
  return neume;
};

neume.use = function(fn) {
  /* istanbul ignore else */
  if (neume.use.used.indexOf(fn) === -1) {
    fn(neume, util);
    neume.use.used.push(fn);
  }
  return neume;
};
neume.use.used = [];

module.exports = neume;
