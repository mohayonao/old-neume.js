"use strict";

var neume = require("../namespace");

require("../core/context");

var util = require("../util");

function NeuSynthContext(context) {
  Object.defineProperties(this, {
    context: {
      value: this,
      enumerable: true
    },
    audioContext: {
      value: context.audioContext,
      enumerable: true
    },
    sampleRate: {
      value: context.sampleRate,
      enumerable: true
    },
  });
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

NeuSynthContext.prototype.sched = function(time, callback) {
  return this._context.sched(time, callback);
};

NeuSynthContext.prototype.unsched = function(id) {
  return this._context.unsched(id);
};

NeuSynthContext.prototype.nextTick = function(callback) {
  this._context.nextTick(callback);
  return this;
};

NeuSynthContext.prototype.getAudioBus = function(index) {
  return this._context.getAudioBus(index);
};

NeuSynthContext.prototype.toSeconds = function(value) {
  return this._context.toSeconds(value);
};

module.exports = neume.SynthContext = NeuSynthContext;
