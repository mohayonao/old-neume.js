"use strict";

// Safari 7.0.6  needs webkit prefix
window.AudioContext = window.AudioContext || /* istanbul ignore next */ window.webkitAudioContext;
window.OfflineAudioContext = window.OfflineAudioContext || /* istanbul ignore next */ window.webkitOfflineAudioContext;

var _ = require("./utils");

var neume = function(context) {
  function Neume(spec) {
    return neume.build(context, spec);
  }

  var audioContext = _.findAudioContext(context);

  Object.defineProperties(Neume, {
    context: {
      value: audioContext,
      enumerable: true
    },
    outlet: {
      value: _.findAudioNode(context),
      enumerable: true
    },
    sampleRate: {
      value: audioContext.sampleRate,
      enumerable: true
    },
    currentTime: {
      get: function() {
        return context.currentTime;
      },
      enumerable: true
    },
    Buffer: {
      value: Object.defineProperties({}, {
        create: {
          value: function(channels, length, sampleRate) {
            return neume.Buffer.create(context, channels, length, sampleRate);
          },
          enumerable: true
        },
        fill: {
          value: function(length, func) {
            return neume.Buffer.fill(context, length, func);
          },
          enumerable: true
        },
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
  });

  return Neume;
};

neume._ = _;
neume.Context  = require("./context");
neume.SynthDef = require("./synthdef");
neume.Synth    = require("./synth");
neume.UGen     = require("./ugen");
neume.Param    = require("./param");
neume.Unit     = require("./unit");
neume.DC       = require("./dc");
neume.Buffer   = require("./buffer");
neume.DryWet   = require("./drywet");
neume.Interval = require("./interval");

neume.build = function(context, spec) {
  return new neume.SynthDef(context, spec);
};

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
    var audioContext = new window.OfflineAudioContext(2, length, sampleRate);
    audioContext.oncomplete = function(e) {
      resolve(new neume.Buffer(context, e.renderedBuffer));
    };
    func(neume(new neume.Context(audioContext, duration)));
    audioContext.startRendering();
  });
};

var context = new neume.Context(new window.AudioContext());

neume.Neume = Object.defineProperties(
  neume(context), {
    render: {
      value: function(duration, func) {
        return neume.render(context, duration, func);
      },
      enumerable: true
    },
    use: {
      value: neume.use,
      enumerable: true
    },
    master: {
      value: context.getMasterGain(),
      enumerable: true
    },
    analyer: {
      value: context.getAnalyser(),
      enumerable: true
    }
  }
);

module.exports = neume;
