"use strict";

var _ = require("../utils");
var C = require("../const");
var NeuComponent = require("./component");

var DC_BUF_SIZE = C.DC_BUF_SIZE;
var filled0 = _.fill(new Float32Array(DC_BUF_SIZE), 0);
var filled1 = _.fill(new Float32Array(DC_BUF_SIZE), 1);

function NeuDC(context, value) {
  NeuComponent.call(this, context);
  this._value = _.finite(value);
}
_.inherits(NeuDC, NeuComponent);

NeuDC.$name = "NeuDC";

NeuDC.prototype.toAudioNode = function() {
  if (this.$outlet === null) {
    this.$outlet = createDCNode(this.$context, this._value);
  }
  return this.$outlet;
};

NeuDC.prototype.connect = function(to) {
  if (to instanceof window.AudioParam) {
    to.value = this._value;
  } else {
    this.$context.connect(this.toAudioNode(), to);
  }
  return this;
};

NeuDC.prototype.disconnect = function() {
  this.$context.disconnect(this.$outlet);
  return this;
};

NeuDC.prototype.valueOf = function() {
  return this._value;
};

function createDCNode(context, value) {
  var node   = null;
  var buf    = context.createBuffer(1, DC_BUF_SIZE, context.sampleRate);
  var bufSrc = (node = context.createBufferSource());

  buf.getChannelData(0).set(value === 0 ? filled0 : filled1);

  bufSrc.buffer = buf;
  bufSrc.loop   = true;
  bufSrc.start(0);

  if (value !== 0 && value !== 1) {
    node = context.createGain();
    node.gain.value = _.finite(value);
    context.connect(bufSrc, node);
  }

  return node;
}

module.exports = _.NeuDC = NeuDC;
