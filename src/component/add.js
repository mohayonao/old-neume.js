"use strict";

var util = require("../util");
var NeuComponent = require("./component");

function NeuAdd(context, a, b) {
  if (a instanceof util.NeuDC) {
    a = a.valueOf();
  }
  if (b instanceof util.NeuDC) {
    b = b.valueOf();
  }
  if (typeof a === "number" && typeof b === "number") {
    return context.createDC(a + b);
  }
  NeuComponent.call(this, context);

  if (typeof a === "number") {
    var t = a; a = b; b = t;
  }
  if (b === 0) {
    return context.createComponent(a);
  }
  this._a = a;
  this._b = b;
}
util.inherits(NeuAdd, NeuComponent);

NeuAdd.$name = "NeuAdd";

NeuAdd.prototype.add = function(value) {
  if (value instanceof util.NeuDC) {
    value = value.valueOf();
  }
  if (typeof this._b === "number" && typeof value === "number") {
    return this.$context.createAdd(this._a, util.finite(this._b + value));
  }
  return this.$context.createSum([ this._a, this._b, value ]);
};

NeuAdd.prototype.toAudioNode = function() {
  if (this.$outlet === null) {
    this.$outlet = this.$context.createGain();
    this.$context.connect(this._a, this.$outlet);
    this.$context.connect(this._b, this.$outlet);
  }
  return this.$outlet;
};

NeuAdd.prototype.connect = function(to) {
  if (this._a instanceof util.NeuParam) {
    this.$context.connect(this._a, to);
    this.$context.connect(this.$context.toAudioNode(this._b), to);
  } else {
    this.$context.connect(this.$context.toAudioNode(this._a), to);
    this.$context.connect(this._b, to);
  }
  return this;
};

NeuAdd.prototype.disconnect = function() {
  this.$context.disconnect(this._a);
  this.$context.disconnect(this._b);
  return this;
};

module.exports = util.NeuAdd = NeuAdd;
