"use strict";

var neume = require("../namespace");

require("./ugen");

var util = require("../util");

function NeuUGenPromise(synth, id) {
  this.context = synth.context;
  this.synth = synth;
  this.key = "";
  this.classes = [];
  this.id = id;

  this._outlet = null;
  this._resolved = false;
  this._to = [];
  this._from = [];
}
util.inherits(NeuUGenPromise, neume.UGen);

NeuUGenPromise.$$name = "NeuUGenPromise";

NeuUGenPromise.prototype.resolve = function(ugen) {

  this._to.forEach(function(node) {
    this.context.connect(ugen, node);
  }, this);
  this._from.forEach(function(node) {
    this.context.connect(node, ugen);
  }, this);

  this._to = this._from = null;

  return this;
};

NeuUGenPromise.prototype.connect = function(to) {
  this._to.push(to);
  return this;
};

NeuUGenPromise.prototype.onconnected = function(from) {
  this._from.push(from);
};

module.exports = neume.UGenPromise = NeuUGenPromise;
