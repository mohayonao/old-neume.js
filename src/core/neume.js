"use strict";

require("./shim");

var util = require("../util");

var VERSION = "0.2.0";

function Neume(context) {
  function fn(spec) {
    return new neume.SynthDef(context, spec);
  }

  Object.defineProperties(fn, {
    audioContext: {
      value: context.audioContext,
      enumerable: true
    },
    context: {
      value: context,
      enumerable: true
    },
    destination: {
      value: context.$destination,
      enumerable: true
    },
    sampleRate: {
      value: context.sampleRate,
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
    Synth: {
      value: function(func) {
        return new neume.SynthDef(context, func).apply(null, util.toArray(arguments).slice(1));
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
    toSeconds: {
      value: function(value) {
        return context.toSeconds(value);
      }
    },
    toFrequency: {
      value: function(value) {
        return context.toFrequency(value);
      }
    },
  });

  return fn;
}

var neume = function(destination, spec) {
  if (destination instanceof global.AudioContext) {
    destination = destination.destination;
  }
  if (!(destination instanceof global.AudioNode)) {
    throw new TypeError("neume(): illegal argument");
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
      analyser: {
        value: context.$analyser,
        enumerable: true
      }
    }
  );
};

neume.util = util;
neume.Context = require("./context");
neume.Transport = require("./transport");
neume.Component = require("../component/component");
neume.DC = require("../component/dc");
neume.DryWet = require("../component/drywet");
neume.Mul = require("../component/mul");
neume.Sum = require("../component/sum");
neume.Param = require("../component/param");
neume.AudioBus = require("../control/audio-bus");
neume.Buffer = require("../control/buffer");
neume.Sched = require("../control/sched");
neume.Interval = require("../control/interval");
neume.Timeout = require("../control/timeout");
neume.FFT = require("../dsp/fft");
neume.Emitter = require("../event/emitter");
neume.SynthDB = require("../synth/db");
neume.Synth = require("../synth/synth");
neume.SynthDef = require("../synth/synthdef");
neume.UGen = require("../synth/ugen");
neume.Unit = require("../synth/unit");

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

neume.version = VERSION;

module.exports = neume;
