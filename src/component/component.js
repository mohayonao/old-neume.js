"use strict";

var util = require("../util");
var Emitter = require("../event/emitter");

function NeuComponent(context, node) {
  Emitter.call(this);
  this.$context = context;
  this.$outlet = null;
  this._node = util.defaults(node, null);
}
util.inherits(NeuComponent, Emitter);

NeuComponent.$name = "NeuComponent";

NeuComponent.prototype.mul = function(value) {
  return this.$context.createNeuMul(util.defaults(this._node, this), util.defaults(value, 1));
};

NeuComponent.prototype.add = function(value) {
  return this.$context.createNeuSum([ util.defaults(this._node, this), util.defaults(value, 0) ]);
};

NeuComponent.prototype.madd = function(mul, add) {
  return this.mul(util.defaults(mul, 1)).add(util.defaults(add, 0));
};

NeuComponent.prototype.toAudioNode = function() {
  if (this.$outlet === null) {
    this.$outlet = this.$context.toAudioNode(util.defaults(this._node, this));
  }
  return this.$outlet;
};

NeuComponent.prototype.connect = function(to) {
  this.$context.connect(util.defaults(this._node, this), to);
  return this;
};

NeuComponent.prototype.disconnect = function() {
  this.$context.disconnect(util.defaults(this._node, this));
  return this;
};

module.exports = util.NeuComponent = NeuComponent;
