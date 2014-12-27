"use strict";

var C = require("../const");
var util = require("../util");
var neume = require("../namespace");

require("./component");

var filled0 = new FilledFloat32Array(C.DC_BUF_SIZE, 0);
var filled1 = new FilledFloat32Array(C.DC_BUF_SIZE, 1);
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
  if (this.outlet === null) {
    var context = this.context;
    var value = this._value;
    var buf, bufSrc, gain;

    if (value === 0 || value === 1) {
      buf = context.createBuffer(1, C.DC_BUF_SIZE, context.sampleRate);
      buf.getChannelData(0).set(value ? filled1 : filled0);

      bufSrc = context.createBufferSource();
      bufSrc.buffer = buf;
      bufSrc.loop = true;
      bufSrc.start(0);

      this._bufSrc = bufSrc;
      this._state = START;
      this.outlet = bufSrc;
    } else {
      bufSrc = new NeuDC(context, 1).toAudioNode();

      gain = context.createGain();
      gain.gain.value = value;
      bufSrc.connect(gain);

      this.outlet = gain;
    }
  }
  return this.outlet;
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
  this.context.disconnect(this.outlet);
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

function FilledFloat32Array(size, value) {
  var result = new Float32Array(size);

  for (var i = 0; i < size; i++) {
    result[i] = value;
  }

  return result;
}

module.exports = neume.DC = NeuDC;
