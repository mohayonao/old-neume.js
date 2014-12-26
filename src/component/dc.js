"use strict";

var C = require("../const");
var util = require("../util");
var neume = require("../namespace");

require("./component");

var filled0 = new FilledFloat32Array(C.DC_BUF_SIZE, 0);
var filled1 = new FilledFloat32Array(C.DC_BUF_SIZE, 1);
var INIT = 0, START = 1, STOP = 2;

function NeuDC(context, value) {
  neume.Component.call(this, context);
  this._value = util.finite(value);
  this._bufSrc = null;
  this._state = INIT;
}
util.inherits(NeuDC, neume.Component);

NeuDC.$$name = "NeuDC";

NeuDC.prototype.toAudioNode = function() {
  if (this.outlet === null) {
    var context = this.context;
    var value = this._value;
    var buf = context.createBuffer(1, C.DC_BUF_SIZE, context.sampleRate);

    buf.getChannelData(0).set(value ? filled1 : filled0);

    this._bufSrc = context.createBufferSource();
    this._bufSrc.buffer = buf;
    this._bufSrc.loop = true;
    this._bufSrc.start(0);
    this._state = START;

    if (value !== 0 && value !== 1) {
      var gain = context.createGain();
      gain.gain.value = value;
      this._bufSrc.connect(gain);
      this.outlet = gain;
    } else {
      this.outlet = this._bufSrc;
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
