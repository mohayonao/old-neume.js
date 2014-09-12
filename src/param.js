"use strict";

var _ = require("./utils");

_.NeuUGen = require("./ugen");
_.NeuDC   = require("./dc");

function NeuParam(synth, name, value) {
  this.name = name;

  this.$synth   = synth;
  this.$context = synth.$context;
  this.$outlet  = null;

  this._params = [];
  this._value  = _.finite(value);
}
_.inherits(NeuParam, _.NeuUGen);

NeuParam.prototype._connect = function(to) {
  var param;

  if (_.isAudioParam(to)) {
    param = to;
  } else {
    this.$outlet = this.$context.createGain();
    _.connect({ from: new _.NeuDC(this.$context, 1), to: this.$outlet });
    param = this.$outlet.gain;
  }

  this._params.push(param);
  param.setValueAtTime(this._value, 0);
};

NeuParam.prototype.valueOf = function() {
  return this._params.length ? this._params[0].value : /* istanbul ignore next */ 0;
};

NeuParam.prototype.set = function(value) {
  value = _.finite(value);

  var startTime = this.$context.currentTime;

  this._params.forEach(function(param) {
    param.setValueAtTime(value, startTime);
  });

  return this;
};

NeuParam.prototype.setAt = function(value, startTime) {
  value     = _.finite(value);
  startTime = _.finite(startTime);

  this._params.forEach(function(param) {
    param.setValueAtTime(value, startTime);
  });

  return this;
};

NeuParam.prototype.linTo = function(value, endTime) {
  value   = _.finite(value);
  endTime = _.finite(endTime);

  this._params.forEach(function(param) {
    param.linearRampToValueAtTime(value, endTime);
  });

  return this;
};

NeuParam.prototype.expTo = function(value, endTime) {
  value   = _.finite(value);
  endTime = _.finite(endTime);

  this._params.forEach(function(param) {
    param.exponentialRampToValueAtTime(value, endTime);
  });

  return this;
};

NeuParam.prototype.targetAt = function(target, startTime, timeConstant) {
  target       = _.finite(target);
  startTime    = _.finite(startTime);
  timeConstant = _.finite(timeConstant);

  this._params.forEach(function(param) {
    param.setTargetAtTime(target, startTime, timeConstant);
  });

  return this;
};

NeuParam.prototype.curveAt = function(values, startTime, duration) {
  startTime = _.finite(startTime);
  duration  = _.finite(duration);

  this._params.forEach(function(param) {
    param.setValueCurveAtTime(values, startTime, duration);
  });

  return this;
};

NeuParam.prototype.cancel = function(startTime) {
  startTime = _.finite(startTime);

  this._params.forEach(function(param) {
    param.cancelScheduledValues(startTime);
  });

  return this;
};

module.exports = NeuParam;
