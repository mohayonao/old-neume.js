"use strict";

var util = require("../util");
var neume = require("../namespace");
var Emitter = require("../util/emitter");
var Parser = require("./parser");

function NeuUGen(synth, key, spec, inputs) {
  Emitter.call(this);

  var parsed = Parser.parse(key);

  if (!NeuUGen.registered.hasOwnProperty(parsed.key)) {
    throw new Error("unknown key: " + key);
  }

  this.context = synth.context;
  this.synth = synth;
  this.key = parsed.key;
  this.classes = parsed.classes;
  this.id = parsed.id;
  this.outlet = null;

  if (hasClass(this, "mute")) {
    this._unit = new neume.Unit({});
    this._node = this.context.createGain();
  } else if (hasClass(this, "bypass")) {
    this._unit = NeuUGen.registered["+"](this, {}, inputs);
    this._node = this._unit.outlet;
  } else {
    this._unit = NeuUGen.registered[parsed.key](this, spec, inputs);
    this._node = this._unit.outlet;
    this._node = mul(this.context, this._node, util.defaults(spec.mul, 1));
    this._node = add(this.context, this._node, util.defaults(spec.add, 0));
  }

  this.isOutput = !!this._unit.isOutput;
  this.methods = Object.keys(this._unit.methods).sort();

  this.methods.forEach(function(methodName) {
    var method = this._unit.methods[methodName];
    util.definePropertyIfNotExists(this, methodName, {
      value: function() {
        var context = this.context;
        var args = util.toArray(arguments);
        context.sched(context.toSeconds(args[0]), function() {
          method.apply(null, args);
        });
        return this;
      }
    });
  }, this);

  this._scheds = [];
}
util.inherits(NeuUGen, Emitter);

NeuUGen.$$name = "NeuUGen";

NeuUGen.registered = {};

NeuUGen.register = function(name, func) {
  if (!Parser.isValidUGenName(name)) {
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

NeuUGen.prototype.$ = function() {
  var args = util.toArray(arguments);
  var key = args.shift();
  var spec = util.isPlainObject(args[0]) ? args.shift() : {};
  var inputs = Array.prototype.concat.apply([ this ], args);

  return this.synth.builder(key, spec, inputs);
};

NeuUGen.prototype.mul = function(value) {
  return this.synth.builder("*", this, util.defaults(value, 1));
};

NeuUGen.prototype.add = function(value) {
  return this.synth.builder("+", this, util.defaults(value, 0));
};

NeuUGen.prototype.start = function(startTime) {
  if (!hasClass(this, "trig")) {
    this._unit.start(startTime);
  }
  return this;
};

NeuUGen.prototype.stop = function(startTime) {
  this._unit.stop(startTime);
  return this;
};

NeuUGen.prototype.trig = function(startTime) {
  var context = this.context;

  startTime = util.finite(context.toSeconds(startTime));

  context.sched(startTime, function() {
    this._unit.start(startTime);
  }, this);

  return this;
};

NeuUGen.prototype.sched = function(schedIter, callback) {
  if (util.isIterator(schedIter) && typeof callback === "function") {
    var synth = this.synth;
    synth.scheds.push([ schedIter, function(e) {
      if (e.type === "start" || (e.type === "stop" && !e.done)) {
        return;
      }
      callback.call(synth, e);
    } ]);
  }
  return this;
};

NeuUGen.prototype.toAudioNode = function() {
  if (this.outlet === null) {
    this.outlet = this.context.toAudioNode(this._node);
  }
  return this.outlet;
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

function hasClass(_this, className) {
  return _this.classes.indexOf(className) !== -1;
}

module.exports = neume.UGen = NeuUGen;
