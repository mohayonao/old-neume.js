"use strict";

var _ = require("./utils");

_.NeuUGen    = require("./ugen");
_.NeuParam   = require("./param");
_.NeuSynthDB = require("./synthdb");

var EMPTY_DB = new _.NeuSynthDB();
var INIT  = 0;
var START = 1;
var STOP  = 2;

function NeuSynth(context, func, args) {
  var _this = this;

  this.$context = context;

  var db = new _.NeuSynthDB();

  function $() {
    var args = _.toArray(arguments);
    var key  = args.shift();
    var spec = _.isDictionary(_.first(args)) ? args.shift() : {};
    var ugen = _.NeuUGen.build(_this, key, spec, args);

    db.append(ugen);

    return ugen;
  }

  var params = {};

  $.param = function(name, defaultValue) {
    if (_.has(params, name)) {
      return params[name];
    }

    defaultValue = _.finite(_.defaults(defaultValue, 0));

    validateParam(name, defaultValue);

    var param = new _.NeuParam(_this, name, defaultValue);

    Object.defineProperty(_this, name, {
      set: function(value) {
        param.set(value);
      },
      get: function() {
        return param;
      }
    });

    params[name] = param;

    return param;
  };

  this.$outlet = _.findAudioNode(func.apply(null, [ $ ].concat(args)));
  this._db = _.isAudioNode(this.$outlet) ? db : EMPTY_DB;
  this._state = INIT;
  this._stateString = "init";

  Object.defineProperties(this, {
    context: {
      value: _.findAudioContext(this.$context),
      enumerable: true
    },
    outlet: {
      value: _.findAudioNode(this.$outlet),
      enumerable: true
    },
    state: {
      get: function() {
        return this._stateString;
      },
      enumerable: true
    },
  });
}

NeuSynth.prototype.start = function(t) {
  t = _.defaults(t, this.$context.currentTime);

  if (this._state === INIT) {
    this._state = START;
    this._stateString = "ready";

    this.$context.sched(t, function(t) {
      this._stateString = "start";

      // TODO: fix 'to'
      _.connect({ from: this, to: this.$context.$outlet });

      _.each(this._db.all(), function(ugen) {
        ugen.start(t);
      });
    }, this);

    this.$context.start(); // auto start(?)
  }

  return this;
};

NeuSynth.prototype.stop = function(t) {
  t = _.defaults(t, this.$context.currentTime);

  if (this._state === START) {
    this._state = STOP;

    this.$context.sched(t, function(t) {
      this._stateString = "stop";

      this.$context.nextTick(function() {
        _.disconnect({ from: this });
      }, this);

      _.each(this._db.all(), function(ugen) {
        ugen.stop(t);
      });
    }, this);
  }

  return this;
};

NeuSynth.prototype.hasListeners = function(event) {
  var result = false;

  iterateOverEventTargets(this._db, event, function(ugen, event) {
    result = result || ugen.hasListeners(event);
  });

  return result;
};

NeuSynth.prototype.listeners = function(event) {
  var listeners = [];

  iterateOverEventTargets(this._db, event, function(ugen, event) {
    _.each(ugen.listeners(event), function(listener) {
      if (listeners.indexOf(listener) === -1) {
        listeners.push(listener);
      }
    });
  });

  return listeners;
};

NeuSynth.prototype.on = function(event, listener) {
  iterateOverEventTargets(this._db, event, function(ugen, event) {
    ugen.on(event, listener);
  });
  return this;
};

NeuSynth.prototype.once = function(event, listener) {
  iterateOverEventTargets(this._db, event, function(ugen, event) {
    ugen.once(event, listener);
  });
  return this;
};

NeuSynth.prototype.off = function(event, listener) {
  iterateOverEventTargets(this._db, event, function(ugen, event) {
    ugen.off(event, listener);
  });
  return this;
};

function iterateOverEventTargets(db, event, callback) {
  var parsed = parseEvent(event);

  if (parsed) {
    var targets = parsed.selector ? db.find(parsed.selector) : db.all();
    _.each(targets, function(ugen) {
      callback(ugen, parsed.event);
    });
  }
}

function parseEvent(event) {
  var matched = /^(?:(.*?):([a-z]+)|([a-z]+))$/.exec(event);

  if (!matched) {
    return null;
  }

  if (matched[3] != null) {
    return { selector: null, event: matched[3]};
  }

  return { selector: matched[1], event: matched[2] };
}

function validateParam(name) {
  if (!/^[a-z]\w*$/.test(name)) {
    throw new TypeError(_.format(
      "invalid parameter name: #{name}", {
        name: name
      }
    ));
  }
}

module.exports = NeuSynth;
