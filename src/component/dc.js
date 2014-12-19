"use strict";

var C = require("../const");
var util = require("../util");
var neume = require("../namespace");

require("./component");

var filled0 = new FilledFloat32Array(C.DC_BUF_SIZE, 0);
var filled1 = new FilledFloat32Array(C.DC_BUF_SIZE, 1);

function NeuDC(context, value) {
  neume.Component.call(this, context);
  this._value = util.finite(value);
}
util.inherits(NeuDC, neume.Component);

NeuDC.$$name = "NeuDC";

NeuDC.prototype.toAudioNode = function() {
  if (this.outlet === null) {
    this.outlet = createDCNode(this.context, this._value);
  }
  return this.outlet;
};

NeuDC.prototype.connect = function(to) {
  if (to instanceof global.AudioParam) {
    to.value = this._value;
  } else {
    this.context.connect(this.toAudioNode(), to);
  }
  return this;
};

NeuDC.prototype.disconnect = function() {
  this.context.disconnect(this.outlet);
  return this;
};

NeuDC.prototype.valueOf = function() {
  return this._value;
};

function FilledFloat32Array(size, value) {
  var result = new Float32Array(size);

  for (var i = 0; i < size; i++) {
    result[i] = value;
  }

  return result;
}

function createDCNode(context, value) {
  var node = null;
  var buf = context.createBuffer(1, C.DC_BUF_SIZE, context.sampleRate);
  var bufSrc = (node = context.createBufferSource());

  buf.getChannelData(0).set(value === 0 ? filled0 : filled1);

  bufSrc.buffer = buf;
  bufSrc.loop = true;
  bufSrc.start(0);

  if (value !== 0 && value !== 1) {
    node = context.createGain();
    node.gain.value = util.finite(value);
    context.connect(bufSrc, node);
  }

  return node;
}

module.exports = neume.DC = NeuDC;
