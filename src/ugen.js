"use strict";

var _ = require("./utils");

var Emitter = require("./emitter");
var NeuDC   = require("./dc");
var NeuUnit = require("./unit");

var SelectorParser = require("./selector-parser");
var makeOutlet = require("./ugen-makeOutlet");

function NeuUGen(synth, key, spec, inputs) {
  Emitter.call(this);
  var parsed = SelectorParser.parse(key);

  if (!NeuUGen.registered.hasOwnProperty(parsed.key)) {
    throw new Error("unknown key: " + key);
  }

  this.$synth   = synth;
  this.$context = synth.$context;
  this.$key   = parsed.key;
  this.$class = parsed.class;
  this.$id    = parsed.id;

  var items = partitionSumAndElse(inputs);
  var unit  = NeuUGen.registered[parsed.key](this, spec, items[1], items[0], inputs);

  if (!(unit instanceof NeuUnit)) {
    throw new Error("invalid key: " + key);
  }

  var outlet = makeOutlet(this.$context, unit, spec);

  this.$unit   = unit;
  this.$outlet = outlet.outlet;
  this.$offset = outlet.offset;

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

  _.each(unit.$methods, function(method, name) {
    _.definePropertyIfNotExists(this, name, {
      value: method
    });
  }, this);
}
_.inherits(NeuUGen, Emitter);

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

NeuUGen.prototype.add = function(node) {
  return new NeuUGen(this.$synth, "+", {}, [ this, _.defaults(node, 0) ]);
};

NeuUGen.prototype.mul = function(node) {
  return new NeuUGen(this.$synth, "*", {}, [ this, _.defaults(node, 1) ]);
};

NeuUGen.prototype.madd = function(mul, add) {
  return this.mul(_.defaults(mul, 1)).add(_.defaults(add, 0));
};

NeuUGen.prototype._connect = function(to) {
  _.connect({ from: this.$outlet, to: to });
  if (this.$offset !== 0) {
    if (to instanceof window.AudioParam) {
      to.value = this.$offset;
    } else {
      _.connect({ from: createGainDC(this.$context, this.$offset), to: to });
    }
  }
};

function partitionSumAndElse(inputs) {
  var sum = 0;
  var els = [];

  for (var i = 0, imax = inputs.length; i < imax; i++) {
    if (typeof inputs[i] === "number") {
      sum += inputs[i];
    } else {
      els.push(inputs[i]);
    }
  }

  return [ sum, els ];
}

function createGainDC(context, offset) {
  var gain = context.createGain();

  gain.gain.value = offset;

  _.connect({ from: new NeuDC(context, 1), to: gain });

  return gain;
}

module.exports = NeuUGen;
