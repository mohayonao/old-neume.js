"use strict";

var util = require("../util");

var NeuSched = require("./sched");

function NeuTimeout(context, schedTime, callback) {
  NeuSched.call(this, context, schedTime, callback);
}
util.inherits(NeuTimeout, NeuSched);

NeuTimeout.$name = "NeuTimeout";

NeuTimeout.prototype._onsched = function(t0) {
  if (this._count > 1 || this._stopTime <= t0) {
    this._state = NeuSched.STATE_STOP;
    this._stateString = "FINISHED";
    return;
  }

  this._stateString = "PLAYING";
  this._callback({
    playbackTime: t0,
    count: this._count++
  });

  var context = this.$context;
  var schedTime = util.finite(context.toSeconds(this._schedTime));

  schedTime = Math.max(1 / context.sampleRate, schedTime);

  context.sched(t0 + schedTime, this._onsched, this);
};

module.exports = NeuTimeout;
