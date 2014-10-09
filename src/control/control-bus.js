"use strict";

var _ = require("../utils");

function NeuControlBus(context) {
  this.$context = context;
  this.$outlet = null;
  this._value  = 0;
  this._params = [];
}

NeuControlBus.$name = "NeuControlBus";

NeuControlBus.prototype.valueOf = function() {
  return this._params.length ? this._params[0].value : /* istanbul ignore next */ this._value;
};

NeuControlBus.prototype.setValue = function(value, timeConstant) {
  value = _.finite(value);
  timeConstant = _.finite(this.$context.toSeconds(timeConstant));

  var startTime = this.$context.currentTime;
  var params = this._params;

  this._value = value;

  for (var i = 0, imax = params.length; i < imax; i++) {
    params[i].setTargetAtTime(value, startTime, timeConstant);
  }

  return this;
};

NeuControlBus.prototype.toAudioNode = function() {
  if (this.$outlet == null) {
    this.$outlet = this.$context.createGain();
    this.$outlet.gain.value = this._value;
    this._params.push(this.$outlet.gain);
    this.$context.connect(this.$context.createDC(1), this.$outlet);
  }
  return this.$outlet;
};

NeuControlBus.prototype.connect = function(to) {
  if (to instanceof window.AudioParam) {
    to.value = this._value;
    to.setValueAtTime(this._value, 0);
    this._params.push(to);
  } else {
    this.$context.connect(this.toAudioNode(), to);
  }
  return this;
};

NeuControlBus.prototype.disconnect = function() {
  return this;
};

module.exports = NeuControlBus;
