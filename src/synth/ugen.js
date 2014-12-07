"use strict";

var util = require("../util");
var neume = require("../namespace");
var Emitter = require("../event/emitter");
var SelectorParser = require("../parser/selector");

function NeuUGen(synth, key, spec, inputs) {
  Emitter.call(this);

  var parsed = SelectorParser.parse(key);

  if (!NeuUGen.registered.hasOwnProperty(parsed.key)) {
    throw new Error("unknown key: " + key);
  }

  this.$context = synth.$context;
  this.$synth = synth;
  this.$key = parsed.key;
  this.$class = parsed.class;
  this.$id = parsed.id;
  this.$outlet = null;

  this.$builder = synth.$builder;

  var unit = NeuUGen.registered[parsed.key](this, spec, inputs);

  this._node = unit.$outlet;
  this._node = mul(this.$context, this._node, util.defaults(spec.mul, 1));
  this._node = add(this.$context, this._node, util.defaults(spec.add, 0));

  this.$isOutput = unit.$isOutput;

  this.$unit = unit;

  Object.keys(unit.$methods).forEach(function(name) {
    var method = unit.$methods[name];
    util.definePropertyIfNotExists(this, name, {
      value: function() {
        method.apply(this, arguments);
        return this;
      }
    });
  }, this);
}
util.inherits(NeuUGen, Emitter);

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
    var type = util.typeOf(key);

    if (typeof key === "object" && !NeuUGen.registered.hasOwnProperty(type)) {
      type = "object";
    }

    spec.value = key;
    key = type;
  }

  return new NeuUGen(synth, key, spec, inputs);
};

NeuUGen.prototype.mul = function(value) {
  return this.$builder("*", this, util.defaults(value, 1));
};

NeuUGen.prototype.add = function(value) {
  return this.$builder("+", this, util.defaults(value, 0));
};

NeuUGen.prototype.toAudioNode = function() {
  if (this.$outlet === null) {
    this.$outlet = this.$context.toAudioNode(this._node);
  }
  return this.$outlet;
};

NeuUGen.prototype.connect = function(to) {
  this._node.connect(to);
  return this;
};

NeuUGen.prototype.disconnect = function() {
  this._node.disconnect();
  return this;
};

function mul(context, a, b) {
  if (b === 1) {
    return a;
  }
  if (b === 0) {
    return new neume.DC(context, 0);
  }

  var mulNode = context.createGain();

  mulNode.gain.value = 0;

  context.connect(a, mulNode);
  context.connect(b, mulNode.gain);

  return mulNode;
}

function add(context, a, b) {
  return new neume.Sum(context, [ a, b ]);
}

module.exports = NeuUGen;
