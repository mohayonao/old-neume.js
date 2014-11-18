"use strict";

var _ = require("../utils");

// TODO: FIX ME
_.NeuSynth = require("./synth");

function NeuSynthDef(defaultContext, func) {
  if (!_.isFunction(func)) {
    throw new TypeError("NeuSynthDef func is not a function");
  }

  function SynthDef() {
    var context = defaultContext;
    var args = _.toArray(arguments);

    if (args[0] instanceof global.AudioContext) {
      context = args.shift();
    }

    return new _.NeuSynth(context, func, args);
  }

  Object.defineProperties(SynthDef, {
    context: {
      value: defaultContext,
      enumerable: true
    }
  });

  return SynthDef;
}

module.exports = NeuSynthDef;
