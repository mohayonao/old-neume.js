"use strict";

var util = require("../util");
var neume = require("../namespace");

var INIT = 0;
var START = 1;
var STOP = 2;

function NeuUnit(spec) {
  this._spec = spec;
  this._state = INIT;
  this.$outlet = util.defaults(spec.outlet, null);
  this.$methods = util.defaults(spec.methods, {});
  this.$isOutput = !!spec.isOutput;
}
NeuUnit.$name = "NeuUnit";

NeuUnit.prototype.start = function(t) {
  if (this._state === INIT && util.isFunction(this._spec.start)) {
    this._state = START;
    this._spec.start(util.finite(t));
  }
};

NeuUnit.prototype.stop = function(t) {
  if (this._state === START && util.isFunction(this._spec.stop)) {
    this._state = STOP;
    this._spec.stop(util.finite(t));
  }
};

module.exports = neume.Unit = NeuUnit;
