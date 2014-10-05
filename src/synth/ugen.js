"use strict";

var _ = require("../utils");
var NeuComponent = require("../component/component");
var NeuMul = require("../component/mul");
var NeuAdd = require("../component/add");
var NeuUnit = require("./unit");
var SelectorParser = require("../parser/selector");

function NeuUGen(synth, key, spec, inputs) {
  NeuComponent.call(this, synth.$context);

  var parsed = SelectorParser.parse(key);

  if (!NeuUGen.registered.hasOwnProperty(parsed.key)) {
    throw new Error("unknown key: " + key);
  }

  this.$key   = parsed.key;
  this.$class = parsed.class;
  this.$id    = parsed.id;

  var unit = NeuUGen.registered[parsed.key](this, spec, inputs);

  /* istanbul ignore if */
  if (!(unit instanceof NeuUnit)) {
    throw new Error("Invalid UGen: " + key);
  }

  this.$synth = synth;
  this.$unit  = unit;
  this.$spec  = spec;

  _.each(unit.$methods, function(method, name) {
    _.definePropertyIfNotExists(this, name, {
      value: method
    });
  }, this);
}
_.inherits(NeuUGen, NeuComponent);

NeuUGen.$name = "NeuUGen";

NeuUGen.registered = {};

NeuUGen.register = function(name, func) {
  if (!SelectorParser.isValidUGenName(name)) {
    throw new Error("invalid ugen name: " + name);
  }
  if (typeof func !== "function") {
    throw new TypeError("ugen must be a function");
  }
  NeuUGen.registered[name] = func;
};

NeuUGen.build = function(synth, key, spec, inputs) {
  if (typeof key !== "string") {
    spec.value = key;
    key = _.typeOf(key);
  }

  return new NeuUGen(synth, key, spec, inputs);
};

NeuUGen.prototype.toAudioNode = function() {
  if (this.$outlet === null) {
    this.$outlet = madd(this.$context, this.$spec, this.$unit.$outlet).toAudioNode();
  }
  return this.$outlet;
};

NeuUGen.prototype.connect = function(to) {
  madd(this.$context, this.$spec, this.$unit.$outlet).connect(to);
  return this;
};

function madd(context, spec, outlet) {
  outlet = new NeuMul(context, outlet, _.defaults(spec.mul, 1));
  outlet = new NeuAdd(context, outlet, _.defaults(spec.add, 0));
  return outlet;
}

module.exports = NeuUGen;
