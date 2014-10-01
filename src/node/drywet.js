"use strict";

var _ = require("../utils");
var C = require("../const");

var WS_CURVE_SIZE = C.WS_CURVE_SIZE;
var halfSize = WS_CURVE_SIZE >> 1;

var curveWet = new Float32Array(WS_CURVE_SIZE);
var curveDry = new Float32Array(WS_CURVE_SIZE);

for (var i = 0; i < halfSize; i++) {
  curveWet[i] = 0;
  curveDry[i] = 1;
  curveWet[i + halfSize] = Math.sin(i / halfSize * Math.PI * 0.5);
  curveDry[i + halfSize] = Math.cos(i / halfSize * Math.PI * 0.5);
}

function NeuDryWet(context, inputs, wetNode, mix) {
  if (typeof mix === "number") {
    return new DryWetNumber(context, inputs, wetNode, mix);
  }
  return new DryWetNode(context, inputs, wetNode, mix);
}

function DryWetNode(context, inputs, wetNode, mix) {
  var gainWet = context.createGain();
  var gainDry = context.createGain();
  var gainMix = context.createGain();
  var wsWet = context.createWaveShaper();
  var wsDry = context.createWaveShaper();

  wsWet.curve = curveWet;
  wsDry.curve = curveDry;

  _.connect({ from: mix, to: wsWet });
  _.connect({ from: mix, to: wsDry });

  gainWet.gain.value = 0;
  gainDry.gain.value = 0;

  wsWet.connect(gainWet.gain);
  wsDry.connect(gainDry.gain);

  for (var i = 0, imax = inputs.length; i < imax; i++) {
    _.connect({ from: inputs[i], to: wetNode });
    _.connect({ from: inputs[i], to: gainDry });
  }

  _.connect({ from: wetNode, to: gainWet });
  _.connect({ from: gainWet, to: gainMix });
  _.connect({ from: gainDry, to: gainMix });

  gainMix.$maddOptimizable = true;

  return gainMix;
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

  var gainWet = context.createGain();
  var gainDry = context.createGain();
  var gainMix = context.createGain();

  gainWet.gain.value = wet;
  gainDry.gain.value = dry;

  for (i = 0, imax = inputs.length; i < imax; i++) {
    _.connect({ from: inputs[i], to: wetNode });
    _.connect({ from: inputs[i], to: gainDry });
  }
  _.connect({ from: wetNode, to: gainWet });
  _.connect({ from: gainWet, to: gainMix });
  _.connect({ from: gainDry, to: gainMix });

  gainMix.$maddOptimizable = true;

  return gainMix;
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
