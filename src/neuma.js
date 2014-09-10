"use strict";

// Safari 7.0.6  needs webkit prefix
window.AudioContext = window.AudioContext || /* istanbul ignore next */ window.webkitAudioContext;
window.OfflineAudioContext = window.OfflineAudioContext || /* istanbul ignore next */ window.webkitOfflineAudioContext;

var _ = require("./utils");

var neuma = function(context) {
  function Neuma(spec) {
    return neuma.build(context, spec);
  }

  var audioContext = _.findAudioContext(context);

  Object.defineProperties(Neuma, {
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
            return neuma.Buffer.create(context, channels, length, sampleRate);
          },
          enumerable: true
        },
        fill: {
          value: function(length, func) {
            return neuma.Buffer.fill(context, func);
          },
          enumerable: true
        },
        from: {
          value: function(data) {
            return neuma.Buffer.from(context, data);
          },
          enumerable: true
        },
        load: {
          value: function(url) {
            return neuma.Buffer.load(context, url);
          },
          enumerable: true
        }
      }),
      enumerable: true
    },
    Interval: {
      value: function(interval, callback) {
        return new neuma.Interval(context, interval, callback);
      },
      enumerable: true
    },
  });

  return Neuma;
};

neuma._ = _;
neuma.Context  = require("./context");
neuma.SynthDef = require("./synthdef");
neuma.Synth    = require("./synth");
neuma.UGen     = require("./ugen");
neuma.Param    = require("./param");
neuma.Unit     = require("./unit");
neuma.DC       = require("./dc");
neuma.Buffer   = require("./buffer");
neuma.Interval = require("./interval");

var context = new neuma.Context(new window.AudioContext());

neuma.Neuma = Object.defineProperties(
  neuma(context), {
    use: {
      value: neuma.use,
      enumerable: true
    },
    render: {
      value: neuma.render,
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


neuma.build = function(context, spec) {
  return new neuma.SynthDef(context, spec);
};

neuma.register = function(name, func) {
  neuma.UGen.register(name, func);
  return neuma;
};

neuma.use = function(fn) {
  /* istanbul ignore else */
  if (neuma.use.used.indexOf(fn) === -1) {
    fn(neuma, _);
    neuma.use.used.push(fn);
  }
  return neuma;
};
neuma.use.used = [];

neuma.render = function(duration, func) {
  var sampleRate = neuma.Neuma.audioContext.sampleRate;
  var length = _.int(sampleRate * duration);

  return new Promise(function(resolve) {
    var audioContext = new window.OfflineAudioContext(2, length, sampleRate);
    audioContext.oncomplete = function(e) {
      resolve(new neuma.Buffer(e.renderedBuffer));
    };
    audioContext.startRendering();
    func(neuma(new neuma.Context(audioContext)));
  });
};

module.exports = neuma;
