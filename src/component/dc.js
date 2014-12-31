"use strict";

var neume = require("../namespace");

require("./component");

var util = require("../util");

var FILLED1 = (function() {
  var result = new Float32Array(128);
  for (var i = 0, imax = result.length; i < imax; i++) {
    result[i] = 1;
  }
  return result;
})();

var INIT = 0, START = 1, STOP = 2;

function NeuDC(context, value) {
  value = util.finite(value);

  context.$$neuDC = context.$$neuDC || {};
  if (context.$$neuDC[value]) {
    return context.$$neuDC[value];
  }
  context.$$neuDC[value] = this;

  neume.Component.call(this, context);
  this._value = value;
  this._bufSrc = null;
  this._state = INIT;
}
util.inherits(NeuDC, neume.Component);

NeuDC.$$name = "NeuDC";

NeuDC.prototype.toAudioNode = function() {
  var value = this._value;

  if (this._outlet === null && value !== 0) {
    var context = this.context;
    var buf, bufSrc, gain;

    if (value === 1) {
      buf = context.createBuffer(1, FILLED1.length, context.sampleRate);
      buf.getChannelData(0).set(FILLED1);

      bufSrc = context.createBufferSource();
      bufSrc.buffer = buf;
      bufSrc.loop = true;
      bufSrc.start(0);

      this._bufSrc = bufSrc;
      this._state = START;
      this._outlet = bufSrc;
    } else {
      bufSrc = new NeuDC(context, 1).toAudioNode();

      gain = context.createGain();
      gain.gain.value = value;
      bufSrc.connect(gain);

      this._outlet = gain;
    }
  }
  return this._outlet;
};

NeuDC.prototype.connect = function(to) {
  if (to instanceof neume.webaudio.AudioParam) {
    to.value = this._value;
  } else {
    this.context.connect(this.toAudioNode(), to);
  }
  return this;
};

NeuDC.prototype.disconnect = function() {
  this.stop(this.context.currentTime);
  this.context.disconnect(this._outlet);
  return this;
};

NeuDC.prototype.stop = function(t) {
  if (this._state === START) {
    this._bufSrc.stop(util.finite(t));
    this._state = STOP;
  }
  return this;
};

NeuDC.prototype.valueOf = function() {
  return this._value;
};

module.exports = neume.DC = NeuDC;
