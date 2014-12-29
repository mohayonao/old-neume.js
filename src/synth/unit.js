"use strict";

var neume = require("../namespace");

var util = require("../util");
var INIT = 0, START = 1, STOP = 2;

function NeuUnit(spec) {
  this.outlet = util.defaults(spec.outlet, null);
  this.methods = util.defaults(spec.methods, {});
  this.isOutput = !!spec.isOutput;

  this._spec = spec;
  this._state = INIT;
}
NeuUnit.$$name = "NeuUnit";

NeuUnit.prototype.start = function(t) {
  if (this._state === INIT && typeof this._spec.start === "function") {
    this._state = START;
    this._spec.start(util.finite(t));
  }
};

NeuUnit.prototype.stop = function(t) {
  if (this._state === START && typeof this._spec.stop === "function") {
    this._state = STOP;
    this._spec.stop(util.finite(t));
  }
};

module.exports = neume.Unit = NeuUnit;
