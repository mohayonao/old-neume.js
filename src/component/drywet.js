"use strict";

var C = require("../const");
var util = require("../util");
var neume = require("../namespace");

require("./component");

var WS_CURVE_SIZE = C.WS_CURVE_SIZE;
var curveWet = new Float32Array(WS_CURVE_SIZE);
var curveDry = new Float32Array(WS_CURVE_SIZE);

(function() {
  var halfSize = WS_CURVE_SIZE >> 1;

  for (var i = 0; i < halfSize; i++) {
    curveWet[i] = 0;
    curveDry[i] = 1;
    curveWet[i + halfSize] = Math.sin(i / halfSize * Math.PI * 0.5);
    curveDry[i + halfSize] = Math.cos(i / halfSize * Math.PI * 0.5);
  }
})();

function NeuDryWet(context, dryIn, wetIn, mixIn) {
  neume.Component.call(this, context);

  mixIn = mixIn.valueOf();

  if (typeof mixIn === "number") {
    if (mixIn === 0) {
      return new neume.Component(context, dryIn);
    }
    if (mixIn === 1) {
      return new neume.Component(context, wetIn);
    }
  }

  this._dryIn = dryIn;
  this._wetIn = wetIn;
  this._mixIn = mixIn;
}
util.inherits(NeuDryWet, neume.Component);

NeuDryWet.$$name = "NeuDryWet";

NeuDryWet.prototype.toAudioNode = function() {
  if (this.outlet === null) {
    var context = this.context;
    var outlet;

    if (typeof this._mixIn === "number") {
      outlet = createMixNodeWithNumber(context, this._dryIn, this._wetIn, this._mixIn);
    } else {
      outlet = createMixNodeWithNode(context, this._dryIn, this._wetIn, this._mixIn);
    }

    this.outlet = context.toAudioNode(outlet);
    this._dryIn = null;
    this._wetIn = null;
    this._mixIn = null;
  }
  return this.outlet;
};

NeuDryWet.prototype.connect = function(to) {
  this.context.connect(this.toAudioNode(), to);
  return this;
};

function createMixNodeWithNumber(context, dryIn, wetIn, mix) {
  mix = util.clip(util.finite(mix), 0, 1);

  var wetNode = context.createGain();
  var dryNode = context.createGain();
  var mixNode = context.createGain();

  wetNode.gain.value = mix;
  dryNode.gain.value = 1 - mix;

  context.connect(dryIn, dryNode);
  context.connect(wetIn, wetNode);
  context.connect(wetNode, mixNode);
  context.connect(dryNode, mixNode);

  return mixNode;
}

function createMixNodeWithNode(context, dryIn, wetIn, mixIn) {
  var wetNode = context.createGain();
  var dryNode = context.createGain();
  var mixNode = context.createGain();
  var wsWet = context.createWaveShaper();
  var wsDry = context.createWaveShaper();

  wsWet.curve = curveWet;
  wsDry.curve = curveDry;

  context.connect(mixIn, wsWet);
  context.connect(mixIn, wsDry);

  wetNode.gain.value = 0;
  dryNode.gain.value = 0;

  context.connect(wsWet, wetNode.gain);
  context.connect(wsDry, dryNode.gain);

  context.connect(dryIn, dryNode);
  context.connect(wetIn, wetNode);
  context.connect(wetNode, mixNode);
  context.connect(dryNode, mixNode);

  return mixNode;
}

module.exports = neume.DryWet = NeuDryWet;
