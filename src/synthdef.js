"use strict";

var _ = require("./utils");

_.NeuSynth = require("./synth");

function NeuSynthDef(defaultContext, func) {
  if (!_.isFunction(func)) {
    throw new TypeError("NeuSynthDef func is not a function");
  }

  function SynthDef() {
    var context = defaultContext;
    var args = _.toArray(arguments);

    if (_.isAudioContext(_.first(args))) {
      context = _.first(args);
      args = _.rest(args);
    }

    return new _.NeuSynth(context, func, args);
  }

  Object.defineProperties(SynthDef, {
    context: {
      value: _.findAudioContext(defaultContext),
      enumerable: true
    }
  });

  return SynthDef;
}

module.exports = NeuSynthDef;
