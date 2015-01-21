"use strict";

var neume = require("../namespace");

var util = require("../util");
var Emitter = require("../util/emitter");
var Parser = require("./parser");

function NeuUGen(synth, key, spec, inputs) {
  Emitter.call(this);

  var parsed = Parser.parse(key);

  if (!NeuUGen.registered.hasOwnProperty(parsed.key)) {
    throw new Error("unknown key: " + key);
  }

  var listOfClass = parsed.classes;
  var classes = {};

  if (typeof spec.class === "string" && spec.class.trim()) {
    listOfClass = listOfClass.concat(spec.class.split(/\s+/));
  }

  listOfClass.forEach(function(className) {
    classes[className] = true;
  });

  Object.defineProperties(this, {
    context: {
      value: synth.context,
      enumerable: true
    },
    synth: {
      value: synth,
      enumerable: true
    },
    key: {
      value: parsed.key,
      enumerable: true
    },
    id: {
      value: util.defaults(spec.id, parsed.id),
      enumerable: true
    },
    class: {
      value: Object.keys(classes).sort().join(" "),
      enumerable: true
    },
  });

  this._classes = classes;

  if (this.hasClass("mute")) {
    this._unit = new neume.Unit({});
    this._node = this.context.createGain();
  } else if (this.hasClass("bypass")) {
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

  this._outlet = null;
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

NeuUGen.prototype.hasClass = function(className) {
  return !!this._classes[className];
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
  if (!this.hasClass("trig")) {
    this._unit.start(startTime);
  }
  return this;
};

NeuUGen.prototype.stop = function(startTime) {
  this._unit.stop(startTime);
  return this;
};

NeuUGen.prototype.patch = function(patcher) {
  var args = util.toArray(arguments).slice(1);
  var $ = this.synth.builder;

  if (typeof patcher === "function") {
    var builder = function() {
      return $.apply(null, arguments);
    };
    builder.timeout = $.timeout;
    builder.interval = $.interval;
    builder.stop = $.stop;
    builder.inputs = [ this ];

    return patcher.apply(this.synth, [ builder ].concat(args));
  }

  return $("+", this);
};

NeuUGen.prototype.trig = function(startTime) {
  var _this = this;
  var context = this.context;

  startTime = util.finite(context.toSeconds(startTime));

  context.sched(startTime, function(e) {
    _this._unit.start(e.playbackTime);
  });

  return this;
};

NeuUGen.prototype.sched = function(schedIter, callback) {
  var _this = this;

  this.synth._dispatchSched(schedIter, function(e) {
    if (e.type === "start" || (e.type === "stop" && !e.done)) {
      return;
    }
    e = Object.create(e);
    e.synth = _this.synth;
    callback.call(_this, e);
  });

  return this;
};

NeuUGen.prototype.toAudioNode = function() {
  if (this._outlet === null) {
    this._outlet = this.context.toAudioNode(this._node);
  }
  return this._outlet;
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

module.exports = neume.UGen = NeuUGen;
