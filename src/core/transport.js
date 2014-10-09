"use strict";

var _ = require("../utils");

function NeuTransport(context) {
  this.$context = context;
  this._bpm  = 120;
  this._ramp = null;
}
NeuTransport.$name = "NeuTransport";

NeuTransport.prototype.getBpm = function() {
  var ramp = this._ramp;

  if (ramp !== null) {
    var t = this.$context.currentTime;
    if (ramp.t1 <= t) {
      this._bpm  = ramp.v1;
      this._ramp = null;
    } else {
      var dt = (t - ramp.t0) / (ramp.t1 - ramp.t0);
      this._bpm = ramp.v0 * Math.pow(ramp.v1 / ramp.v0, dt);
    }
  }

  return this._bpm;
};

NeuTransport.prototype.setBpm = function(value, rampTime) {
  rampTime = this.toSeconds(_.defaults(rampTime, 0));

  var bpm = Math.max(1, Math.min(_.finite(value), 1000));

  if (rampTime <= 0) {
    this._bpm  = bpm;
    this._ramp = null;
  } else {
    var t0 = this.$context.currentTime;
    this._ramp = {
      v0: this.getBpm(),
      t0: t0,
      v1: bpm,
      t1: t0 + rampTime
    };
  }

  return this;
};

NeuTransport.prototype.toSeconds = function(value) {
  if (typeof value === "number") {
    return _.finite(value);
  }

  if (typeof value === "string") {
    var m, offset = 0, time = 0;

		if (value.charAt(0) === "+") {
			offset = this.$context.currentTime;
			value  = value.slice(1);
		}

    var components = value.split(/[\(\)\-\+\/\*]/);

		if (components.length > 1) {
			var oringalTime = value;
      var expr = value;

			for (var i = 0, imax = components.length; i < imax; i++) {
        var symb = components[i].trim();
        if (symb !== "") {
					expr = expr.replace(symb, this.toSeconds(symb));
				}
			}

			try {
				time = eval(expr); // jshint ignore:line
			} catch (e){
				throw new EvalError("Invalid Time Value Syntax: " + oringalTime);
			}

    } else if ((m = /^(\d+)ms$/.exec(value)) !== null) {
      time = +m[1] * 0.001;
    } else if ((m = /^(\d+(?:\.\d+)?)hz$/.exec(value)) !== null) {
      time = _.finite(1 / +m[1]);
    } else if ((m = /^(\d+)ticks$/.exec(value)) !== null) {
      time = ticks2sec(+m[1], this.getBpm());
    } else if ((m = /^(\d+)(n[td]?)$/.exec(value)) !== null) {
      time = note2sec(+m[1], m[2], this.getBpm());
    } else if ((m = /^(\d+)\.(\d+)\.(\d+)$/.exec(value)) !== null) {
      time = ticks2sec((+m[1] * 4 + (+m[2])) * 480 + (+m[3]), this.getBpm());
    } else if ((m = /^(\d\d):(\d\d):(\d\d)(?:\.(\d+))?$/.exec(value)) !== null) {
      time = ((+m[1] * 3600) + (+m[2] * 60) + (+m[3]) + (((m[4] || "") + "000").substr(0, 3) * 0.001));
    } else if ((m = /^(\d+)samples$/.exec(value)) !== null) {
      time = (+m[1] / this.$context.sampleRate);
    } else if (value === "now") {
      return this.$context.currentTime;
    } else {
      time = _.finite(+value);
    }

    return time + offset;
  }

  return value;
};

NeuTransport.prototype.toFrequency = function(value) {
  if (typeof value === "number") {
    return _.finite(value);
  }
  if (typeof value === "string") {
    return _.finite(1 / this.toSeconds(value));
  }
  return value;
};

function ticks2sec(ticks, bpm) {
  return 60 / bpm * (ticks / 480);
}

function note2sec(num, note, bpm) {
  var acc = {
    nt: 2 / 3,
    nd: 3 / 2,
  }[note] || 1;
  return num === 0 ? 0 : ticks2sec((4 / num) * 480 * acc, bpm);
}

module.exports = NeuTransport;
