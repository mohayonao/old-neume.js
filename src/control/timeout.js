"use strict";

var neume = require("../namespace");

require("./sched");

var util = require("../util");

function NeuTimeout(context, schedTime, callback) {
  var schedIter = {
    next: function() {
      var timeout = util.finite(context.toSeconds(schedTime));
      return { value: timeout, done: true };
    }
  };
  neume.Sched.call(this, context, schedIter);

  this.on("stop", callback);
}
util.inherits(NeuTimeout, neume.Sched);

NeuTimeout.$$name = "NeuTimeout";

module.exports = neume.Timeout = NeuTimeout;
