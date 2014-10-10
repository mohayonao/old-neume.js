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

function NeuDryWet(context, dryNode, wetNode, mix) {
  if (typeof mix === "number") {
    return new DryWetNumber(context, dryNode, wetNode, mix);
  }
  return new DryWetNode(context, dryNode, wetNode, mix);
}

function DryWetNode(context, dryNode, wetNode, mix) {
  var gainWet = context.createGain();
  var gainDry = context.createGain();
  var gainMix = context.createGain();
  var wsWet = context.createWaveShaper();
  var wsDry = context.createWaveShaper();

  wsWet.curve = curveWet;
  wsDry.curve = curveDry;

  context.connect(mix, wsWet);
  context.connect(mix, wsDry);

  gainWet.gain.value = 0;
  gainDry.gain.value = 0;

  context.connect(wsWet, gainWet.gain);
  context.connect(wsDry, gainDry.gain);

  context.connect(dryNode, gainDry);
  context.connect(wetNode, gainWet);
  context.connect(gainWet, gainMix);
  context.connect(gainDry, gainMix);

  return context.createComponent(gainMix);
}

function DryWetNumber(context, dryNode, wetNode, mix) {
  mix = _.clip(_.finite(mix), 0, 1);

  var wet = mix;
  var dry = 1 - mix;

  if (wet === 1) {
    return context.createComponent(wetNode);
  }

  if (dry === 1) {
    return context.createComponent(dryNode);
  }

  var gainWet = context.createGain();
  var gainDry = context.createGain();
  var gainMix = context.createGain();

  gainWet.gain.value = wet;
  gainDry.gain.value = dry;

  context.connect(dryNode, gainDry);
  context.connect(wetNode, gainWet);
  context.connect(gainWet, gainMix);
  context.connect(gainDry, gainMix);

  return context.createComponent(gainMix);
}

module.exports = _.NeuDryWet = NeuDryWet;
