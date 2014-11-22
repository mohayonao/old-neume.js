"use strict";

var util = require("../util");
var NeuComponent = require("../component/component");
var SelectorParser = require("../parser/selector");

function NeuUGen(synth, key, spec, inputs) {
  NeuComponent.call(this, synth.$context);

  var parsed = SelectorParser.parse(key);

  if (!NeuUGen.registered.hasOwnProperty(parsed.key)) {
    throw new Error("unknown key: " + key);
  }

  this.$synth = synth;
  this.$key = parsed.key;
  this.$class = parsed.class;
  this.$id = parsed.id;

  var unit = NeuUGen.registered[parsed.key](this, spec, inputs);

  this._node = unit.$outlet;
  this._node = this.$context.createMul(this._node, util.defaults(spec.mul, 1));
  this._node = this.$context.createAdd(this._node, util.defaults(spec.add, 0));
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
util.inherits(NeuUGen, NeuComponent);

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

NeuUGen.prototype.toAudioNode = function() {
  if (this.$outlet === null && this._node !== null) {
    this.$outlet = this._node.toAudioNode();
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

module.exports = NeuUGen;
