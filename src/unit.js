"use strict";

var _ = require("./utils");

var INIT  = 0;
var START = 1;
var STOP  = 2;

function NeuUnit(spec) {
  this._spec   = spec;
  this._state  = INIT;
  this.$outlet  = spec.outlet || null;
  this.$methods = spec.methods || {};
}

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

module.exports = NeuUnit;
