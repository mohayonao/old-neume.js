"use strict";

var util = require("../util");
var neume = require("../namespace");

require("./sched");

function NeuTimeout(context, schedTime, callback) {
  var schedIter = {
    next: function() {
      var timeout = util.finite(context.toSeconds(schedTime));
      return { value: timeout, done: true };
    }
  };
  neume.Sched.call(this, context, schedIter, callback);
}
util.inherits(NeuTimeout, neume.Sched);

NeuTimeout.$$name = "NeuTimeout";

module.exports = neume.Timeout = NeuTimeout;
