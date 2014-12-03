"use strict";

var util = require("../util");
var NeuComponent = require("./component");

function NeuParam(context, value, spec) {
  spec = spec || {};
  NeuComponent.call(this, context);
  this._value = util.finite(value);
  this._params = [];

  if (/\d+(ticks|n)|\d+\.\d+\.\d+/.test(spec.timeConstant)) {
    this._relative = true;
    this._timeConstant = spec.timeConstant;
  } else {
    this._relative = false;
    this._timeConstant = Math.max(0, util.finite(spec.timeConstant));
  }
}
util.inherits(NeuParam, NeuComponent);

NeuParam.$name = "NeuParam";

NeuParam.prototype.valueOf = function() {
  return this._params.length ? this._params[0].value : /* istanbul ignore next */ this._value;
};

NeuParam.prototype.set = function(value) {
  value = util.finite(value);

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
  value = util.finite(value);
  startTime = util.finite(this.$context.toSeconds(startTime));

  var params = this._params;

  for (var i = 0, imax = params.length; i < imax; i++) {
    params[i].setValueAtTime(value, startTime);
  }

  return this;
};

NeuParam.prototype.linTo = function(value, endTime) {
  value = util.finite(value);
  endTime = util.finite(this.$context.toSeconds(endTime));

  var params = this._params;

  for (var i = 0, imax = params.length; i < imax; i++) {
    params[i].linearRampToValueAtTime(value, endTime);
  }

  return this;
};

NeuParam.prototype.expTo = function(value, endTime) {
  value = util.finite(value);
  endTime = util.finite(this.$context.toSeconds(endTime));

  var params = this._params;

  for (var i = 0, imax = params.length; i < imax; i++) {
    params[i].exponentialRampToValueAtTime(value, endTime);
  }

  return this;
};

NeuParam.prototype.targetAt = function(target, startTime, timeConstant) {
  target = util.finite(target);
  startTime = util.finite(this.$context.toSeconds(startTime));
  timeConstant = util.finite(this.$context.toSeconds(timeConstant));

  var params = this._params;

  for (var i = 0, imax = params.length; i < imax; i++) {
    params[i].setTargetAtTime(target, startTime, timeConstant);
  }

  return this;
};

NeuParam.prototype.curveAt = function(values, startTime, duration) {
  startTime = util.finite(this.$context.toSeconds(startTime));
  duration = util.finite(this.$context.toSeconds(duration));

  var params = this._params;

  for (var i = 0, imax = params.length; i < imax; i++) {
    params[i].setValueCurveAtTime(values, startTime, duration);
  }

  return this;
};

NeuParam.prototype.cancel = function(startTime) {
  startTime = util.finite(this.$context.toSeconds(startTime));

  var params = this._params;

  for (var i = 0, imax = params.length; i < imax; i++) {
    params[i].cancelScheduledValues(startTime);
  }

  return this;
};

NeuParam.prototype.update = function(t0, v1, v0) {
  t0 = util.finite(this.$context.toSeconds(t0));
  v1 = util.finite(v1);
  v0 = util.finite(util.defaults(v0, v1));

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
    this.$context.connect(this.$context.createNeuDC(1), this.$outlet);
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

module.exports = util.NeuParam = NeuParam;
