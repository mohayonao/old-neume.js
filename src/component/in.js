"use strict";

var _ = require("../utils");
var NeuComponent = require("./component");

function NeuIn(context) {
  NeuComponent.call(this, context);
  this.$outlet = this.$context.createGain();
}
_.inherits(NeuIn, NeuComponent);

NeuIn.$name = "NeuIn";

NeuIn.prototype.toAudioNode = function() {
  return this.$outlet;
};

NeuIn.prototype.connect = function(to) {
  this.$context.connect(this.$outlet, to);
  return this;
};

NeuIn.prototype.disconnect = function() {
  this.$context.disconnect(this.$outlet);
  return this;
};

module.exports = _.NeuIn = NeuIn;
