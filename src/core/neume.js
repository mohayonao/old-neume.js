"use strict";

require("./shim");

var _ = require("../utils");
var VERSION = "0.0.22";

var neume = function(context) {
  function Neume(spec) {
    return new neume.SynthDef(context, spec);
  }

  Object.defineProperties(Neume, {
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
    Synth: {
      value: function(func) {
        return new neume.SynthDef(context, func).apply(null, _.toArray(arguments).slice(1));
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
    Interval: {
      value: function(interval, callback) {
        return new neume.Interval(context, interval, callback);
      },
      enumerable: true
    },
    Timeout: {
      value: function(interval, callback) {
        return new neume.Timeout(context, interval, callback);
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

  return Neume;
};

neume._        = _;
neume.Context  = require("./context");
neume.Transport = require("./transport");
neume.Component = require("../component/component");
neume.Add      = require("../component/add");
neume.DC       = require("../component/dc");
neume.DryWet   = require("../component/drywet");
neume.Mul      = require("../component/mul");
neume.Sum      = require("../component/sum");
neume.Param    = require("../component/param");
neume.AudioBus = require("../control/audio-bus");
neume.Buffer   = require("../control/buffer");
neume.Interval = require("../control/interval");
neume.Timeout  = require("../control/timeout");
neume.FFT      = require("../dsp/fft");
neume.Emitter  = require("../event/emitter");
neume.SynthDB  = require("../synth/db");
neume.Synth    = require("../synth/synth");
neume.SynthDef = require("../synth/synthdef");
neume.UGen     = require("../synth/ugen");
neume.Unit     = require("../synth/unit");

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
    fn(neume, _);
    neume.use.used.push(fn);
  }
  return neume;
};
neume.use.used = [];

neume.render = function(context, duration, func) {
  var sampleRate = context.sampleRate;
  var length     = _.int(sampleRate * duration);

  return new Promise(function(resolve) {
    var audioContext = new global.OfflineAudioContext(2, length, sampleRate);
    audioContext.oncomplete = function(e) {
      resolve(new neume.Buffer(context, e.renderedBuffer));
    };
    func(neume(new neume.Context(audioContext.destination, duration)));
    audioContext.startRendering();
  });
};

neume.exports = function(destination, spec) {
  if (destination instanceof global.AudioContext) {
    destination = destination.destination;
  }
  if (!(destination instanceof global.AudioNode)) {
    throw new TypeError("neume(): illegal argument");
  }

  var context = new neume.Context(destination, Infinity, spec);

  return Object.defineProperties(
    neume(context), {
      render: {
        value: function(duration, func) {
          return neume.render(context, duration, func);
        }
      },
      analyser: {
        value: context.$analyser,
        enumerable: true
      }
    }
  );
};

neume.exports.use = neume.use;
neume.exports.version = VERSION;

module.exports = neume;
