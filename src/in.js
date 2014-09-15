"use strict";

var _ = require("./utils");

_.NeuUGen = require("./ugen");

function NeuIn(synth) {
  this.$synth   = synth;
  this.$context = synth.$context;
  this.$outlet  = this.$context.createGain();
  this.$offset  = 0;
}
_.inherits(NeuIn, _.NeuUGen);

module.exports = NeuIn;
