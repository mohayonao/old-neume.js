"use strict";

var neume = require("../namespace");

require("./dollar");
require("./context");

var util = require("../util");
var DB = require("../util/db");
var Emitter = require("../util/emitter");
var Parser = require("./parser");

var EMPTY_DB = new DB();
var INIT = 0, START = 1, STOP = 2;

function NeuSynth(context, func, args) {
  Emitter.call(this);

  context = new neume.SynthContext(context);

  Object.defineProperties(this, {
    context: {
      value: context,
      enumerable: true
    },
  });

  var $ = new neume.SynthDollar(this);

  this.builder = $.builder;

  this.__scheds = [];
  this.__nodes = [];

  var param = new neume.Param(context, 1, { curve: "lin" });
  var result = func.apply(this, [ $.builder ].concat(args));

  if (result && result.toAudioNode && !result.isOutput) {
    this._dispatchNode(result, 0);
  }

  this._nodes = this.__nodes.map(function(node) {
    var gain = context.createGain();

    context.connect(node, gain);
    context.connect(param, gain.gain);

    return gain;
  });
  this.__nodes = null;

  this._scheds = this.__scheds.map(function(set) {
    return new neume.Sched(context, set[0], set[1]);
  });
  this.__scheds = null;

  this._db = this._nodes.length ? $.db : /* istanbul ignore next */ EMPTY_DB;
  this._state = INIT;
  this._param = param;

  var methods = getMethods(this._db).filter(function(methodName) {
    return !this.hasOwnProperty(methodName);
  }, this).sort();

  methods.forEach(function(methodName) {
    Object.defineProperty(this, methodName, {
      value: function() {
        var args = util.toArray(arguments);
        this._db.all().forEach(function(ugen) {
          if (typeof ugen[methodName] === "function") {
            ugen[methodName].apply(ugen, args);
          }
        });
        return this;
      },
      enumerable: false
    });
  }, this);

  Object.defineProperties(this, {
    methods: {
      get: function() {
        return methods.slice();
      },
      enumerable: true
    }
  });
}
util.inherits(NeuSynth, Emitter);

NeuSynth.$$name = "NeuSynth";

NeuSynth.prototype.hasClass = function(className) {
  return this._db.all().some(function(ugen) {
    return ugen.hasClass(className);
  });
};

NeuSynth.prototype.query = function(selector) {
  var array = this._db.find(Parser.parse(selector));

  [
    "on", "once", "off", "hasClass", "trig"
  ].concat(this.methods).forEach(function(methodName) {
    array[methodName] = function() {
      var args = util.toArray(arguments);
      array.forEach(function(ugen) {
        if (typeof ugen[methodName] === "function") {
          ugen[methodName].apply(ugen, args);
        }
      });
      return array;
    };
  });

  return array;
};

NeuSynth.prototype.start = function(startTime) {
  var _this = this;

  if (this._state !== INIT) {
    return this;
  }

  var context = this.context;
  startTime = util.defaults(context.toSeconds(startTime), context.currentTime);
  startTime = util.finite(startTime);

  this._state = START;

  context.sched(startTime, function(t0) {
    _this._nodes.forEach(function(_, index) {
      context.getAudioBus(index).append(_this);
    });

    _this._db.all().concat(_this._scheds).forEach(function(item) {
      item.start(t0);
    });

    _this.emit("start", {
      type: "start",
      playbackTime: startTime
    });
  });

  context.start(); // auto start(?)

  return this;
};

NeuSynth.prototype.stop = function(stopTime) {
  var _this = this;

  if (this._state !== START) {
    return this;
  }

  var context = this.context;
  stopTime = util.defaults(context.toSeconds(stopTime), context.currentTime);
  stopTime = util.finite(stopTime);

  this._state = STOP;

  context.sched(stopTime, function(t0) {
    _this._nodes.forEach(function(_, index) {
      context.getAudioBus(index).remove(_this);
    });

    context.nextTick(function() {
      context.dispose();
    });

    _this._db.all().concat(_this._scheds).forEach(function(item) {
      item.stop(t0);
    });

    _this.emit("stop", {
      type: "stop",
      playbackTime: t0
    });
  });

  return this;
};

NeuSynth.prototype.trig = function(startTime) {
  this._db.all().forEach(function(ugen) {
    ugen.trig(startTime);
  });
  return this;
};

NeuSynth.prototype.fadeIn = function(startTime, duration) {
  var _this = this;

  if (this._state !== INIT) {
    return this;
  }

  var context = this.context;
  startTime = util.defaults(context.toSeconds(startTime), context.currentTime);
  startTime = util.finite(startTime);

  if (this._nodes.length) {
    duration = util.defaults(context.toSeconds(duration), 0.5);
    duration = util.finite(duration);

    this._param.value = 0;
    context.sched(startTime, function(t0) {
      _this._param.update(1, t0, duration);
    });
  }
  this.start(startTime);

  return this;
};

NeuSynth.prototype.fadeOut = function(startTime, duration) {
  var _this = this;

  if (this._state !== START) {
    return this;
  }

  var context = this.context;

  startTime = util.defaults(context.toSeconds(startTime), context.currentTime);
  startTime = util.finite(startTime);

  duration = util.defaults(context.toSeconds(duration), 0.5);
  duration = util.finite(duration);

  if (this._nodes.length) {
    context.sched(startTime, function(t0) {
      _this._param.update(0, t0, duration);
    });
  }
  this.stop(startTime + duration);

  return this;
};

NeuSynth.prototype.fade = function(startTime, value, duration) {
  var _this = this;

  if (this._state !== START) {
    return this;
  }

  var context = this.context;

  if (this._nodes.length) {
    startTime = util.defaults(context.toSeconds(startTime), context.currentTime);
    startTime = util.finite(startTime);

    value = util.finite(value);

    duration = util.defaults(context.toSeconds(duration), 0.5);
    duration = util.finite(duration);

    context.sched(startTime, function(t0) {
      _this._param.update(value, t0, duration);
    });
  }

  return this;
};

NeuSynth.prototype.toAudioNode = function(index) {
  index = util.int(index);
  if (this._nodes[index]) {
    return this.context.toAudioNode(this._nodes[index]);
  }
  return null;
};

NeuSynth.prototype._dispatchNode = function(node, index) {
  if (this.__nodes) {
    index = Math.max(0, util.int(index));
    if (!this.__nodes[index]) {
      this.__nodes[index] = [];
    }
    this.__nodes[index].push(node);
  }
};

NeuSynth.prototype._dispatchSched = function(schedIter, callback) {
  if (this.__scheds && util.isIterator(schedIter) && typeof callback === "function") {
    this.__scheds.push([ schedIter, callback ]);
  }
};

function getMethods(db) {
  var methodNames = {};

  db.all().forEach(function(ugen) {
    ugen.methods.forEach(function(methodName) {
      methodNames[methodName] = true;
    });
  });

  return Object.keys(methodNames).sort();
}

module.exports = neume.Synth = NeuSynth;
