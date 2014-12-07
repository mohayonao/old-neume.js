"use strict";

var util = require("../util");
var neume = require("../namespace");
var NeuComponent = require("./component");

function NeuMul(context, a, b) {
  a = a.valueOf();
  b = b.valueOf();

  if (typeof a === "number" && typeof b === "number") {
    return new neume.DC(context, a * b);
  }

  NeuComponent.call(this, context);

  if (typeof a === "number") {
    var t = a; a = b; b = t;
  }
  if (b === 0) {
    return new neume.DC(context, 0);
  } else if (b === 1) {
    return new neume.Component(context, a);
  }
  this._a = a;
  this._b = b;
}
util.inherits(NeuMul, NeuComponent);

NeuMul.$name = "NeuMul";

NeuMul.prototype.mul = function(value) {
  value = value.valueOf();

  if (typeof this._b === "number" && typeof value === "number") {
    return new neume.Mul(this.$context, this._a, util.finite(this._b * value));
  }

  return new neume.Mul(this.$context, this.toAudioNode(), value);
};

NeuMul.prototype.toAudioNode = function() {
  if (this.$outlet === null) {
    this.$outlet = this.$context.createGain();
    this.$outlet.gain.value = 0;
    this.$context.connect(this._a, this.$outlet);
    this.$context.connect(this._b, this.$outlet.gain);
  }
  return this.$outlet;
};

NeuMul.prototype.connect = function(to) {
  this.$context.connect(this.toAudioNode(), to);
  return this;
};

NeuMul.prototype.disconnect = function() {
  this.$context.disconnect(this.$outlet);
  return this;
};

module.exports = NeuMul;
