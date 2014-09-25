"use strict";

var _ = require("./utils");
var C = require("./const");

var DC_BUF_SIZE = C.DC_BUF_SIZE;
var filled0 = _.fill(new Float32Array(DC_BUF_SIZE), 0);
var filled1 = _.fill(new Float32Array(DC_BUF_SIZE), 1);

/**
 * Create a constant amplitude signal
 *
 * @param {AudioContext} context
 * @param {number}       value
 */
function NeuDC(context, value) {
  value = _.num(value);

  var buf = context.createBuffer(1, DC_BUF_SIZE, context.sampleRate);
  var bufSrc = context.createBufferSource();

  buf.getChannelData(0).set(
    value === 0 ? filled0 :
    value === 1 ? filled1 :
    _.fill(new Float32Array(DC_BUF_SIZE), value)
  );

  bufSrc.buffer = buf;
  bufSrc.loop   = true;
  bufSrc.start(0);

  this._bufSrc = bufSrc;
  this.$context = this._bufSrc.context;
  this.$outlet  = this._bufSrc;
}
NeuDC.$name = "NeuDC";

/**
 * @return {number} value
 */
NeuDC.prototype.valueOf = function() {
  return this._bufSrc.buffer.getChannelData(0)[0];
};

module.exports = NeuDC;
