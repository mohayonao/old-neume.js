"use strict";

var _       = require("../utils");
var Emitter = require("../event/emitter");

function NeuNode(synth) {
  Emitter.call(this);

  this.$synth   = synth;
  this.$context = synth.$context;
}
_.inherits(NeuNode, Emitter);

NeuNode.$name = "NeuNode";

NeuNode.prototype.add = function(node) {
  return new _.NeuUGen(this.$synth, "+", {}, [ this, _.defaults(node, 0) ]);
};

NeuNode.prototype.mul = function(node) {
  return new _.NeuUGen(this.$synth, "*", {}, [ this, _.defaults(node, 1) ]);
};

NeuNode.prototype.madd = function(mul, add) {
  return this.mul(_.defaults(mul, 1)).add(_.defaults(add, 0));
};

module.exports = _.NeuNode = NeuNode;
