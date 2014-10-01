"use strict";

var _ = require("../utils");

var NeuNode = require("../node");
var NeuDC   = require("../node/dc");

function NeuParam(synth, name, value) {
  NeuNode.call(this, synth);

  this.name = name;

  this.$outlet = null;
  this.$offset = 0;

  this._params = [];
  this._connected = [];
  this._value = _.finite(value);
}
_.inherits(NeuParam, NeuNode);

NeuParam.$name = "NeuParam";

NeuParam.prototype.valueOf = function() {
  return this._params.length ? this._params[0].value : /* istanbul ignore next */ this._value;
};

NeuParam.prototype.set = function(value) {
  value = _.finite(value);

  var startTime = this.$context.currentTime;
  var params = this._params;

  this._value = value;

  for (var i = 0, imax = params.length; i < imax; i++) {
    params[i].value = value;
    params[i].setValueAtTime(value, startTime);
  }

  return this;
};

NeuParam.prototype.setAt = function(value, startTime) {
  value     = _.finite(value);
  startTime = _.finite(startTime);

  var params = this._params;

  for (var i = 0, imax = params.length; i < imax; i++) {
    params[i].setValueAtTime(value, startTime);
  }

  return this;
};

NeuParam.prototype.linTo = function(value, endTime) {
  value   = _.finite(value);
  endTime = _.finite(endTime);

  var params = this._params;

  for (var i = 0, imax = params.length; i < imax; i++) {
    params[i].linearRampToValueAtTime(value, endTime);
  }

  return this;
};

NeuParam.prototype.expTo = function(value, endTime) {
  value   = _.finite(value);
  endTime = _.finite(endTime);

  var params = this._params;

  for (var i = 0, imax = params.length; i < imax; i++) {
    params[i].exponentialRampToValueAtTime(value, endTime);
  }

  return this;
};

NeuParam.prototype.targetAt = function(target, startTime, timeConstant) {
  target       = _.finite(target);
  startTime    = _.finite(startTime);
  timeConstant = _.finite(timeConstant);

  var params = this._params;

  for (var i = 0, imax = params.length; i < imax; i++) {
    params[i].setTargetAtTime(target, startTime, timeConstant);
  }

  return this;
};

NeuParam.prototype.curveAt = function(values, startTime, duration) {
  startTime = _.finite(startTime);
  duration  = _.finite(duration);

  var params = this._params;

  for (var i = 0, imax = params.length; i < imax; i++) {
    params[i].setValueCurveAtTime(values, startTime, duration);
  }

  return this;
};

NeuParam.prototype.cancel = function(startTime) {
  startTime = _.finite(startTime);

  var params = this._params;

  for (var i = 0, imax = params.length; i < imax; i++) {
    params[i].cancelScheduledValues(startTime);
  }

  return this;
};

NeuParam.prototype._connect = function(to, output, input) {
  if (this._connected.indexOf(to) !== -1) {
    return; // if already connected
  }
  this._connected.push(to);

  if (to instanceof window.AudioParam) {
    to.value = this._value;
    to.setValueAtTime(this._value, 0);
    this._params.push(to);
  } else {
    if (this.$outlet == null) {
      this.$outlet = this.$context.createGain();
      this.$outlet.gain.setValueAtTime(this._value, 0);
      this._params.push(this.$outlet.gain);
      _.connect({ from: new NeuDC(this.$context, 1), to: this.$outlet });
    }
    _.connect({ from: this.$outlet, to: to, input: input });
  }
};

module.exports = _.NeuParam = NeuParam;
