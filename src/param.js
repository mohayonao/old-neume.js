"use strict";

var _ = require("./utils");

_.NeuUGen = require("./ugen");
_.NeuDC   = require("./dc");

/**
 *
 * @param {NeuSynth} synth
 * @param {string}   name
 * @param {number}   value
 */
function NeuParam(synth, name, value) {
  this.name = name;

  this.$synth   = synth;
  this.$context = synth.$context;
  this.$outlet  = this.$context.createGain();

  this._param = this.$outlet.gain;

  _.connect({ from: new _.NeuDC(this.$context, 1), to: this.$outlet });

  this.set(value);
}
_.inherits(NeuParam, _.NeuUGen);

NeuParam.prototype.valueOf = function() {
  return this._param.value;
};

/**
 * Change the value immediately
 *
 * @param {number} value
 * @return {NeuParam} self
 */
NeuParam.prototype.set = function(value) {
  var t0 = this.$context.currentTime;

  this._param.setValueAtTime(_.num(value), t0);

  return this;
};

/**
 * Schedules the value change after the duration
 *
 * @param {number} value
 * @param {number} duration
 * @return {NeuParam} self
 */
NeuParam.prototype.setAt = function(value, duration) {
  var t0 = this.$context.currentTime;
  var t1 = t0 + _.defaults(duration, 0);

  this._param.setValueAtTime(_.num(value), t1);

  return this;
};

/**
 * Schedules the value change linearly
 *
 * @param {number} value
 * @param {number} duration
 * @return {NeuParam} self
 */
NeuParam.prototype.linTo = function(value, duration) {
  var t0 = this.$context.currentTime;
  var t1 = t0 + _.defaults(duration, 0);

  this._param.setValueAtTime(this._param.value, t0);
  this._param.linearRampToValueAtTime(_.num(value), t1);

  return this;
};

/**
 * Schedules the value change exponentially
 *
 * @param {number} value
 * @param {number} duration
 * @return {NeuParam} self
 */
NeuParam.prototype.expTo = function(value, duration) {
  var t0 = this.$context.currentTime;
  var t1 = t0 + _.defaults(duration, 0);

  this._param.setValueAtTime(this._param.value, t0);
  this._param.exponentialRampToValueAtTime(_.num(value), t1);

  return this;
};

/**
 * Cancels all schedules
 * @return {NeuParam} self
 */
NeuParam.prototype.cancel = function() {
  this._param.cancelScheduledValues(0);

  return this;
};

module.exports = NeuParam;
