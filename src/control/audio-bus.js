"use strict";

var _ = require("../utils");
var C = require("../const");

function NeuAudioBus(context) {
  this.$context = context;
  this.$outlet = context.createGain();
  this.$maxNodes = C.DEFAULT_MAX_NODES_OF_BUS;
  this.$inputs = [];

  Object.defineProperties(this, {
    maxNodes: {
      set: function(value) {
        this.$maxNodes = Math.max(0, _.int(value));
      },
      get: function() {
        return this.$maxNodes;
      }
    },
    nodes: {
      get: function() {
        return this.$inputs.slice();
      }
    }
  });
}

NeuAudioBus.$name = "NeuAudioBus";

NeuAudioBus.prototype.fade = function(t, val, dur) {
  t = _.finite(this.$context.toSeconds(t)) || this.$context.currentTime;
  val = _.finite(val);
  dur = _.finite(this.$context.toSeconds(dur));

  var v0 = this.$outlet.gain.value;
  var v1 = val;
  var vT = v0 + (v1 - v0) * 0.99;
  var tC = -Math.max(1e-6, dur) / Math.log((vT - v1) / (v0 - v1));

  this.$outlet.gain.setTargetAtTime(v1, t, tC);
  this.$outlet.gain.setValueAtTime(v1, t + dur);

  return this;
};

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

NeuAudioBus.prototype.onconnected = function(from) {
  var index = this.$inputs.indexOf(from);

  if (index !== -1) {
    this.$inputs.splice(index, 1);
  }
  this.$inputs.push(from);

  while (this.$maxNodes < this.$inputs.length) {
    this.$context.disconnect(this.$inputs.shift());
  }

  from.$outputs = from.$outputs || [];
  if (from.$outputs.indexOf(this) === -1) {
    from.$outputs.push(this);
  }
};

NeuAudioBus.prototype.ondisconnected = function(from) {
  var index = this.$inputs.indexOf(from);

  if (index !== -1) {
    this.$inputs.splice(index, 1);
  }

  /* istanbul ignore else */
  if (from.$outputs) {
    index = from.$outputs.indexOf(this);
    /* istanbul ignore else */
    if (index !== -1) {
      from.$outputs.splice(index, 1);
    }
  }
};

module.exports = NeuAudioBus;
