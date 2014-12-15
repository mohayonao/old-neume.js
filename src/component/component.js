"use strict";

var util = require("../util");
var neume = require("../namespace");
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
  return new neume.Mul(this.$context, util.defaults(this._node, this), util.defaults(value, 1));
};

NeuComponent.prototype.add = function(value) {
  return new neume.Sum(this.$context, [ util.defaults(this._node, this), util.defaults(value, 0) ]);
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

module.exports = neume.Component = NeuComponent;
