"use strict";

var _ = require("./utils");
var Emitter = require("./emitter");
var NeuUnit = require("./unit");
var makeOutlet = require("./ugen-makeOutlet");

function NeuUGen(synth, key, spec, inputs) {
  Emitter.call(this);

  this.$synth   = synth;
  this.$context = synth.$context;
  this.$key = key;
  this.$class = _.defaults(spec.class);
  this.$id  = _.defaults(spec.id, null);

  var unit = NeuUGen.registered[key](this, spec, inputs);

  if (!(unit instanceof NeuUnit)) {
    throw new Error("invalid key: " + key);
  }

  this.$unit   = unit;
  this.$outlet = makeOutlet(this.$context, unit, spec);

  Object.defineProperties(this, {
    context: {
      value: _.findAudioContext(this.$context),
      enumerable: true
    },
    outlet: {
      value: _.findAudioNode(this.$outlet),
      enumerable: true
    },
  });
}
_.inherits(NeuUGen, Emitter);

NeuUGen.registered = {};

NeuUGen.register = function(name, func) {
  if (!isValidUGenName(name)) {
    throw new Error("invalid ugen name: " + name);
  }
  if (!_.isFunction(func)) {
    throw new TypeError("ugen must be a function");
  }
  NeuUGen.registered[name] = func;
};

NeuUGen.build = function(synth, key, spec, inputs) {
  if (!_.isString(key)) {
    spec.value = key;
    key = _.typeOf(key);
  }

  if (_.has(NeuUGen.registered, key)) {
    return new NeuUGen(synth, key, spec, inputs);
  }

  throw new Error("unknown key: " + key);
};

NeuUGen.prototype.start = function(t) {
  this.$unit.start(t);
  return this;
};

NeuUGen.prototype.stop = function(t) {
  this.$unit.stop(t);
  return this;
};

NeuUGen.prototype.add = function(node) {
  return new NeuUGen(this.$synth, "+", {}, [ this, _.defaults(node, 0) ]);
};

NeuUGen.prototype.mul = function(node) {
  return new NeuUGen(this.$synth, "*", {}, [ this, _.defaults(node, 1) ]);
};

NeuUGen.prototype.madd = function(mul, add) {
  return this.mul(_.defaults(mul, 1)).add(_.defaults(add, 0));
};

function isValidUGenName(name) {
  return /^([a-zA-Z](-?[a-zA-Z0-9]+)*|[-+*\/%<=>!?&|@]+)$/.test(name);
}

module.exports = NeuUGen;
