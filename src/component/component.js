"use strict";

var _ = require("../utils");
var Emitter = require("../event/emitter");

function NeuComponent(context, node) {
  Emitter.call(this);
  this.$context = context;
  this.$outlet = null;
  this._node = _.defaults(node, null);
}
_.inherits(NeuComponent, Emitter);

NeuComponent.$name = "NeuComponent";

NeuComponent.prototype.mul = function(value) {
  return this.$context.createMul(_.defaults(this._node, this), _.defaults(value, 1));
};

NeuComponent.prototype.add = function(value) {
  return this.$context.createAdd(_.defaults(this._node, this), _.defaults(value, 0));
};

NeuComponent.prototype.madd = function(mul, add) {
  return this.mul(_.defaults(mul, 1)).add(_.defaults(add, 0));
};

NeuComponent.prototype.toAudioNode = function() {
  if (this.$outlet === null) {
    this.$outlet = this.$context.toAudioNode(_.defaults(this._node, this));
  }
  return this.$outlet;
};

NeuComponent.prototype.connect = function(to) {
  this.$context.connect(_.defaults(this._node, this), to);
  return this;
};

NeuComponent.prototype.disconnect = function() {
  this.$context.disconnect(_.defaults(this._node, this));
  return this;
};

module.exports = _.NeuComponent = NeuComponent;
