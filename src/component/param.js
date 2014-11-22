"use strict";

var _ = require("../utils");
var NeuComponent = require("./component");

function NeuParam(context, value, spec) {
  spec = spec || {};
  NeuComponent.call(this, context);
  this._value = _.finite(value);
  this._params = [];

  if (/\d+(ticks|n)|\d+\.\d+\.\d+/.test(spec.timeConstant)) {
    this._relative = true;
    this._timeConstant = spec.timeConstant;
  } else {
    this._relative = false;
    this._timeConstant = Math.max(0, _.finite(spec.timeConstant));
  }
}
_.inherits(NeuParam, NeuComponent);

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
  value = _.finite(value);
  startTime = _.finite(this.$context.toSeconds(startTime));

  var params = this._params;

  for (var i = 0, imax = params.length; i < imax; i++) {
    params[i].setValueAtTime(value, startTime);
  }

  return this;
};

NeuParam.prototype.linTo = function(value, endTime) {
  value = _.finite(value);
  endTime = _.finite(this.$context.toSeconds(endTime));

  var params = this._params;

  for (var i = 0, imax = params.length; i < imax; i++) {
    params[i].linearRampToValueAtTime(value, endTime);
  }

  return this;
};

NeuParam.prototype.expTo = function(value, endTime) {
  value = _.finite(value);
  endTime = _.finite(this.$context.toSeconds(endTime));

  var params = this._params;

  for (var i = 0, imax = params.length; i < imax; i++) {
    params[i].exponentialRampToValueAtTime(value, endTime);
  }

  return this;
};

NeuParam.prototype.targetAt = function(target, startTime, timeConstant) {
  target = _.finite(target);
  startTime = _.finite(this.$context.toSeconds(startTime));
  timeConstant = _.finite(this.$context.toSeconds(timeConstant));

  var params = this._params;

  for (var i = 0, imax = params.length; i < imax; i++) {
    params[i].setTargetAtTime(target, startTime, timeConstant);
  }

  return this;
};

NeuParam.prototype.curveAt = function(values, startTime, duration) {
  startTime = _.finite(this.$context.toSeconds(startTime));
  duration = _.finite(this.$context.toSeconds(duration));

  var params = this._params;

  for (var i = 0, imax = params.length; i < imax; i++) {
    params[i].setValueCurveAtTime(values, startTime, duration);
  }

  return this;
};

NeuParam.prototype.cancel = function(startTime) {
  startTime = _.finite(this.$context.toSeconds(startTime));

  var params = this._params;

  for (var i = 0, imax = params.length; i < imax; i++) {
    params[i].cancelScheduledValues(startTime);
  }

  return this;
};

NeuParam.prototype.update = function(t0, v1, v0) {
  t0 = _.finite(this.$context.toSeconds(t0));
  v1 = _.finite(v1);
  v0 = _.finite(_.defaults(v0, v1));

  if (this._timeConstant === 0 || v0 === v1) {
    this.setAt(v1, t0);
  } else {
    var timeConstant;
    if (this._relative) {
      timeConstant = this.$context.toSeconds(this._timeConstant);
    } else {
      timeConstant = this._timeConstant;
    }
    this.targetAt(v1, t0, timeConstant);
  }

  return this;
};

NeuParam.prototype.toAudioNode = function() {
  if (this.$outlet == null) {
    this.$outlet = this.$context.createGain();
    this.$outlet.gain.value = this._value;
    this.$outlet.gain.setValueAtTime(this._value, 0);
    this._params.push(this.$outlet.gain);
    this.$context.connect(this.$context.createDC(1), this.$outlet);
  }
  return this.$outlet;
};

NeuParam.prototype.connect = function(to) {
  if (to instanceof global.AudioParam) {
    to.value = this._value;
    to.setValueAtTime(this._value, 0);
    this._params.push(to);
  } else {
    this.$context.connect(this.toAudioNode(), to);
  }
  return this;
};

NeuParam.prototype.disconnect = function() {
  this.$context.disconnect(this.$outlet);
  return this;
};

module.exports = _.NeuParam = NeuParam;
