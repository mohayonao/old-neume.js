"use strict";

var _ = require("./utils");

_.NeuSynth = require("./synth");

function NeuSynthDef(defaultContext, spec) {
  spec = _.defaults(spec, {});

  if (_.isFunction(spec)) {
    spec = {
      def   : spec,
      params: []
    };
  }

  function SynthDef() {
    var context = defaultContext;
    var args = _.toArray(arguments);

    if (_.isAudioContext(_.first(args))) {
      context = _.first(args);
      args = _.rest(args);
    }

    return new _.NeuSynth(context, spec, args);
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
