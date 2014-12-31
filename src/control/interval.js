"use strict";

var neume = require("../namespace");

require("./sched");

var util = require("../util");

function NeuInterval(context, schedTime, callback) {
  var minSchedTime = 1 / context.sampleRate;
  var schedIter = {
    next: function() {
      var interval = Math.max(minSchedTime, util.finite(context.toSeconds(schedTime)));
      return { value: interval, done: false };
    }
  };
  neume.Sched.call(this, context, schedIter);

  this.on("start", callback).on("sched", callback);
}
util.inherits(NeuInterval, neume.Sched);

NeuInterval.$$name = "NeuInterval";

module.exports = neume.Interval = NeuInterval;
