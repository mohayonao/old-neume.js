"use strict";

var util = require("../util");
var neume = require("../namespace");

function NeuSynthDef(defaultContext, func) {
  if (!util.isFunction(func)) {
    throw new TypeError("NeuSynthDef func is not a function");
  }

  function SynthDef() {
    var context = defaultContext;
    var args = util.toArray(arguments);

    if (args[0] instanceof global.AudioContext) {
      context = args.shift();
    }

    return new neume.Synth(context, func, args);
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
