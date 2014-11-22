"use strict";

var _ = require("../utils");

var INIT = 0;
var START = 1;
var STOP = 2;

function NeuUnit(spec) {
  this._spec = spec;
  this._state = INIT;
  this.$outlet = _.defaults(spec.outlet, null);
  this.$methods = _.defaults(spec.methods, {});
  this.$isOutput = !!spec.isOutput;
}
NeuUnit.$name = "NeuUnit";

NeuUnit.prototype.start = function(t) {
  if (this._state === INIT && _.isFunction(this._spec.start)) {
    this._state = START;
    this._spec.start(_.finite(t));
  }
};

NeuUnit.prototype.stop = function(t) {
  if (this._state === START && _.isFunction(this._spec.stop)) {
    this._state = STOP;
    this._spec.stop(_.finite(t));
  }
};

NeuUnit.prototype.apply = function(method, args) {
  if (this.$methods[method]) {
    this.$methods[method].apply(null, args);
  }
};

NeuUnit.prototype.toAudioNode = function() {
  return this.$outlet;
};

module.exports = NeuUnit;
