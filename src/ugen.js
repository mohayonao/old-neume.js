"use strict";

var _ = require("./utils");
var Emitter = require("./emitter");
var NeuUnit = require("./unit");
var makeOutlet = require("./ugen-makeOutlet");

function NeuUGen(synth, key, spec, inputs) {
  Emitter.call(this);

  var parsed = parseKey(key);

  this.$synth   = synth;
  this.$context = synth.$context;
  this.$key   = parsed.key;
  this.$class = parsed.class;
  this.$id    = parsed.id;

  if (!NeuUGen.registered.hasOwnProperty(parsed.key)) {
    throw new Error("unknown key: " + key);
  }

  var unit = NeuUGen.registered[parsed.key](this, spec, inputs);

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

  return new NeuUGen(synth, key, spec, inputs);
};

NeuUGen.prototype.start = function(t) {
  this.$unit.start(t);
  return this;
};

NeuUGen.prototype.stop = function(t) {
  this.$unit.stop(t);
  return this;
};

NeuUGen.prototype.apply = function(method, args) {
  this.$unit.apply(method, args);
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

function parseKey(key) {
  key = String(key);

  var parsed = { key: "", class: [], id: null };

  var keyMatched = key.match(/^([a-zA-Z](-?[a-zA-Z0-9]+)*|[-+*\/%<=>!?&|@]+)/);
  if (keyMatched) {
    parsed.key = keyMatched[0];
  }

  var idMatched = key.match(/#[a-zA-Z](-?[a-zA-Z0-9]+)*/);
  if (idMatched) {
    parsed.id = idMatched[0].substr(1);
  }

  var clsMatched = key.match(/\.[a-zA-Z](-?[a-zA-Z0-9]+)*/g);
  if (clsMatched) {
    parsed.class = clsMatched.map(function(cls) {
      return cls.substr(1);
    });
  }

  return parsed;
}

module.exports = NeuUGen;
