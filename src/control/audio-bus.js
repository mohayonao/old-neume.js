"use strict";

function NeuAudioBus(context) {
  this.$context = context;
  this.$outlet = context.createGain();
}

NeuAudioBus.$name = "NeuAudioBus";

NeuAudioBus.prototype.toAudioNode = function() {
  return this.$outlet;
};

NeuAudioBus.prototype.connect = function(to) {
  this.$context.connect(this.$outlet, to);
  return this;
};

NeuAudioBus.prototype.disconnect = function() {
  return this;
};

module.exports = NeuAudioBus;
