"use strict";

var neume = require("../namespace");

var C = require("../const");
var util = require("../util");

function NeuAudioBus(context, index) {
  this.context = context;
  this.index = index;

  this._outlet = context.createGain();
  this._maxNodes = C.DEFAULT_MAX_NODES_OF_BUS;
  this._inputs = [];

  Object.defineProperties(this, {
    maxNodes: {
      set: function(value) {
        this._maxNodes = Math.max(0, util.int(value));
      },
      get: function() {
        return this._maxNodes;
      }
    },
    nodes: {
      get: function() {
        return this._inputs.slice();
      }
    }
  });
}

NeuAudioBus.$$name = "NeuAudioBus";

NeuAudioBus.prototype.append = function(synth) {
  this.context.connect(synth.toAudioNode(this.index), this._outlet);

  this._inputs.push(synth);

  if (this._maxNodes < this._inputs.length) {
    this._inputs.shift().stop();
  }

  return this;
};

NeuAudioBus.prototype.remove = function(synth) {
  var index = this._inputs.indexOf(synth);

  if (index !== -1) {
    this._inputs.splice(index, 1);
  }

  return this;
};

NeuAudioBus.prototype.toAudioNode = function() {
  return this._outlet;
};

module.exports = neume.AudioBus = NeuAudioBus;
