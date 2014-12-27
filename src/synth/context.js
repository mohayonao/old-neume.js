"use strict";

var util = require("../util");
var neume = require("../namespace");

require("../core/context");

function NeuSynthContext(context) {
  this.context = this;
  this.audioContext = context.audioContext;
  this.sampleRate = context.sampleRate;
  this._context = context;
  this._nodes = [];
}
util.inherits(NeuSynthContext, neume.Context);

NeuSynthContext.$$name = "NeuSynthContext";

NeuSynthContext.prototype.start = function() {
  this._context.start();
  return this;
};

NeuSynthContext.prototype.stop = function() {
  this._context.stop();
  return this;
};

NeuSynthContext.prototype.reset = function() {
  this._context.reset();
  return this;
};

NeuSynthContext.prototype.sched = function(time, callback, context) {
  return this._context.sched(time, callback, context);
};

NeuSynthContext.prototype.unsched = function(id) {
  return this._context.unsched(id);
};

NeuSynthContext.prototype.nextTick = function(callback, context) {
  this._context.nextTick(callback, context);
  return this;
};

NeuSynthContext.prototype.getAudioBus = function(index) {
  return this._context.getAudioBus(index);
};

NeuSynthContext.prototype.toSeconds = function(value) {
  return this._context.toSeconds(value);
};

module.exports = neume.SynthContext = NeuSynthContext;
