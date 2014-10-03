"use strict";

var _       = require("../utils");
var NeuNode = require("./node");

function NeuIn(synth) {
  NeuNode.call(this, synth);

  this.$outlet  = this.$context.createGain();
  this.$offset  = 0;
}
_.inherits(NeuIn, NeuNode);

NeuIn.$name = "NeuIn";

module.exports = _.NeuIn = NeuIn;
