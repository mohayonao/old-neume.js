"use strict";

var util = require("../util");
var neume = require("../namespace");

require("./ugen");

function NeuUGenPromise(synth, id) {
  this.$context = synth.$context;
  this.$synth = synth;
  this.$key = "";
  this.$class = [];
  this.$id = id;
  this.$outlet = null;
  this.$builder = synth.$builder;

  this._resolved = false;
  this._to = [];
  this._from = [];
}
util.inherits(NeuUGenPromise, neume.UGen);

NeuUGenPromise.prototype.resolve = function(ugen) {

  this._to.forEach(function(node) {
    this.$context.connect(ugen, node);
  }, this);
  this._from.forEach(function(node) {
    this.$context.connect(node, ugen);
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