"use strict";

var _ = require("./utils");

var NeuDC = require("./dc");

function NeuDryWet(context, inputs, wetNode, mix) {
  if (typeof mix === "number") {
    return new DryWetNumber(context, inputs, wetNode, mix);
  }
  return new DryWetNode(context, inputs, wetNode, mix);
}

function DryWetNode(context, inputs, wetNode, mix) {
  var dc1 = new NeuDC(context, 1);

  var wetGain = context.createGain();
  var dryGain = context.createGain();
  var negGain = context.createGain();
  var mixGain = context.createGain();

  wetGain.gain.value = 0;
  dryGain.gain.value = 0;
  negGain.gain.value = -1;

  for (var i = 0, imax = inputs.length; i < imax; i++) {
    _.connect({ from: inputs[i], to: wetNode });
    _.connect({ from: inputs[i], to: dryGain });
  }

  _.connect({ from: wetNode, to: wetGain });
  _.connect({ from: wetGain, to: mixGain });
  _.connect({ from: dryGain, to: mixGain });

  _.connect({ from: mix, to: wetGain.gain });
  _.connect({ from: mix, to: negGain });
  _.connect({ from: dc1    , to: dryGain.gain }); // +1
  _.connect({ from: negGain, to: dryGain.gain }); // -mix

  mixGain.$maddOptimizable = true;

  return mixGain;
}

function DryWetNumber(context, inputs, wetNode, mix) {
  mix = _.clip(mix, 0, 1);

  var wet = mix;
  var dry = 1 - mix;
  var i, imax;

  if (wet === 1) {
    for (i = 0, imax = inputs.length; i < imax; i++) {
      _.connect({ from: inputs[i], to: wetNode });
    }
    return wetNode;
  }

  if (dry === 1) {
    if (inputs.length === 1) {
      return inputs[0];
    }
    return sum(context, inputs);
  }

  var wetGain = context.createGain();
  var dryGain = context.createGain();
  var mixGain = context.createGain();

  wetGain.gain.value = wet;
  dryGain.gain.value = dry;

  for (i = 0, imax = inputs.length; i < imax; i++) {
    _.connect({ from: inputs[i], to: wetNode });
    _.connect({ from: inputs[i], to: dryGain });
  }
  _.connect({ from: wetNode, to: wetGain });
  _.connect({ from: wetGain, to: mixGain });
  _.connect({ from: dryGain, to: mixGain });

  mixGain.$maddOptimizable = true;

  return mixGain;
}

function sum(context, inputs) {
  var result = context.createGain();

  for (var i = 0, imax = inputs.length; i < imax; i++) {
    _.connect({ from: inputs[i], to: result });
  }
  result.$maddOptimizable = true;

  return result;
}

module.exports = NeuDryWet;
