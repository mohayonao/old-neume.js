"use strict";

var _ = require("../utils");
var NeuComponent = require("./component");

function NeuMul(context, a, b) {
  if (a instanceof _.NeuDC) {
    a = a.valueOf();
  }
  if (b instanceof _.NeuDC) {
    b = b.valueOf();
  }
  if (typeof a === "number" && typeof b === "number") {
    return context.createDC(a * b);
  }
  NeuComponent.call(this, context);

  if (typeof a === "number") {
    var t = a; a = b; b = t;
  }
  if (b === 0) {
    return context.createDC(0);
  } else if (b === 1) {
    return context.createComponent(a);
  }
  this._a = a;
  this._b = b;
}
_.inherits(NeuMul, NeuComponent);

NeuMul.$name = "NeuMul";

NeuMul.prototype.mul = function(value) {
  if (value instanceof _.NeuDC) {
    value = value.valueOf();
  }
  if (typeof this._b === "number" && typeof value === "number") {
    return this.$context.createMul(this._a, _.finite(this._b * value));
  }
  return this.$context.createMul(this.toAudioNode(), value);
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

module.exports = _.NeuMul = NeuMul;
