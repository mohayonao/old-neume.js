"use strict";

var C = require("../const");
var util = require("../util");
var neume = require("../namespace");

function NeuAudioBus(context) {
  this.context = context;
  this.outlet = context.createGain();

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

NeuAudioBus.prototype.toAudioNode = function() {
  return this.outlet;
};

NeuAudioBus.prototype.connect = function(to) {
  this.context.connect(this.outlet, to);
  return this;
};

NeuAudioBus.prototype.disconnect = function() {
  return this;
};

NeuAudioBus.prototype.onconnected = function(from) {
  var index = this._inputs.indexOf(from);

  if (index !== -1) {
    this._inputs.splice(index, 1);
  }
  this._inputs.push(from);

  while (this._maxNodes < this._inputs.length) {
    this.context.disconnect(this._inputs.shift());
  }

  from.$$outputs = from.$$outputs || [];
  if (from.$$outputs.indexOf(this) === -1) {
    from.$$outputs.push(this);
  }
};

NeuAudioBus.prototype.ondisconnected = function(from) {
  var index = this._inputs.indexOf(from);

  if (index !== -1) {
    this._inputs.splice(index, 1);
  }

  /* istanbul ignore else */
  if (from.$$outputs) {
    index = from.$$outputs.indexOf(this);
    /* istanbul ignore else */
    if (index !== -1) {
      from.$$outputs.splice(index, 1);
    }
  }
};

module.exports = neume.AudioBus = NeuAudioBus;
