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
    var inputs = args.reduce(function(a, b) {
      return a.concat(b);
    }, []);
    var ugen = _.NeuUGen.build(_this, key, spec, inputs);

    db.append(ugen);

    return ugen;
  }

  var params  = {};
  var inputs  = [];
  var outputs = [];

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

  $.in = function(index) {
    index = Math.max(0, _.int(index));

    if (!inputs[index]) {
      inputs[index] = context.createGain();
    }

    return inputs[index];
  };

  $.out = function(index, ugen) {
    index = Math.max(0, _.int(index));

    if (ugen instanceof _.NeuUGen) {
      outputs[index] = ugen;
    }

    return null;
  };

  var result = _.findAudioNode(func.apply(null, [ $ ].concat(args)));

  if (outputs[0] == null && _.isAudioNode(result)) {
    outputs[0] = result;
  }

  this.$inputs  = inputs;
  this.$outputs = outputs;
  this._routing = [];
  this._db = outputs.length ? db : EMPTY_DB;
  this._state = INIT;
  this._stateString = "init";

  this._db.all().forEach(function(ugen) {
    _.keys(ugen.$unit.$methods).forEach(function(method) {
      if (!this.hasOwnProperty(method)) {
        Object.defineProperty(this, method, {
          value: function() {
            return this.apply(method, _.toArray(arguments));
          }
        });
      }
    }, this);
  }, this);

  Object.defineProperties(this, {
    context: {
      value: _.findAudioContext(this.$context),
      enumerable: true
    },
    outlet: {
      value: _.findAudioNode(this.$outputs[0]),
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

      if (this._routing.length === 0) {
        _.connect({ from: this.$outputs[0], to: this.$context.$outlet });
      } else {
        this._routing.forEach(function(destinations, output) {
          destinations.forEach(function(destination) {
            _.connect({ from: this.$outputs[output], to: destination });
          }, this);
        }, this);
      }

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
        this.$outputs.forEach(function(output) {
          _.disconnect({ from: output });
        });
      }, this);

      _.each(this._db.all(), function(ugen) {
        ugen.stop(t);
      });
    }, this);
  }

  return this;
};

NeuSynth.prototype.apply = function(method, args) {
  iterateOverTargetss(this._db, method, function(ugen, method) {
    ugen.apply(method, args);
  });
  return this;
};

NeuSynth.prototype.call = function() {
  var args = _.toArray(arguments);
  var method = args.shift();

  return this.apply(method, args);
};

NeuSynth.prototype.connect = function(destination, output, input) {
  output = Math.max(0, _.int(output));
  input  = Math.max(0, _.int(input));

  if (destination instanceof NeuSynth && this.$outputs[output] && destination.$inputs[input]) {
    if (!this._routing[output]) {
      this._routing[output] = [];
    }
    this._routing[output].push(destination.$inputs[input]);
  }

  return this;
};

NeuSynth.prototype.hasListeners = function(event) {
  var result = false;

  iterateOverTargetss(this._db, event, function(ugen, event) {
    result = result || ugen.hasListeners(event);
  });

  return result;
};

NeuSynth.prototype.listeners = function(event) {
  var listeners = [];

  iterateOverTargetss(this._db, event, function(ugen, event) {
    _.each(ugen.listeners(event), function(listener) {
      if (listeners.indexOf(listener) === -1) {
        listeners.push(listener);
      }
    });
  });

  return listeners;
};

NeuSynth.prototype.on = function(event, listener) {
  iterateOverTargetss(this._db, event, function(ugen, event) {
    ugen.on(event, listener);
  });
  return this;
};

NeuSynth.prototype.once = function(event, listener) {
  iterateOverTargetss(this._db, event, function(ugen, event) {
    ugen.once(event, listener);
  });
  return this;
};

NeuSynth.prototype.off = function(event, listener) {
  iterateOverTargetss(this._db, event, function(ugen, event) {
    ugen.off(event, listener);
  });
  return this;
};

function iterateOverTargetss(db, event, callback) {
  var parsed = parseEvent(event);

  if (parsed) {
    var targets = parsed.selector ? db.find(parsed.selector) : db.all();
    _.each(targets, function(ugen) {
      callback(ugen, parsed.name);
    });
  }
}

function parseEvent(event) {
  var matched = /^(?:(.*?):([a-z]+)|([a-z]+))$/.exec(event);

  if (!matched) {
    return null;
  }

  if (matched[3] != null) {
    return { selector: null, name: matched[3]};
  }

  return { selector: matched[1], name: matched[2] };
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
