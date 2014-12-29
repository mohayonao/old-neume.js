"use strict";

var neume = require("../namespace");

var util = require("../util");
var Emitter = require("../util/emitter");

function NeuComponent(context, node) {
  Emitter.call(this);
  this.context = context;
  this._outlet = null;
  this._node = util.defaults(node, null);
}
util.inherits(NeuComponent, Emitter);

NeuComponent.$$name = "NeuComponent";

NeuComponent.prototype.mul = function(value) {
  return new neume.Mul(this.context, util.defaults(this._node, this), util.defaults(value, 1));
};

NeuComponent.prototype.add = function(value) {
  return new neume.Sum(this.context, [ util.defaults(this._node, this), util.defaults(value, 0) ]);
};

NeuComponent.prototype.toAudioNode = function() {
  if (this._outlet === null) {
    this._outlet = this.context.toAudioNode(util.defaults(this._node, this));
  }
  return this._outlet;
};

NeuComponent.prototype.connect = function(to) {
  this.context.connect(util.defaults(this._node, this), to);
  return this;
};

NeuComponent.prototype.disconnect = function() {
  this.context.disconnect(util.defaults(this._node, this));
  return this;
};

module.exports = neume.Component = NeuComponent;
