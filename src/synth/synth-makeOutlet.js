"use strict";

var _       = require("../utils");
var NeuDC   = require("../node/dc");
var NeuUGen = require("../node/ugen");

function makeOutlet(context, ugen) {
  var outlet = null;

  if (ugen instanceof NeuUGen) {
    var offset = _.finite(ugen.$offset);

    if (offset === 0) {
      outlet = ugen.$outlet;
    } else {
      var dc = createGainDC(context, offset);
      if (ugen.$outlet) {
        outlet = sum(context, ugen.$outlet, dc);
      } else {
        outlet = dc;
      }
    }
  }

  return outlet;
}

function createGainDC(context, offset) {
  var gain = context.createGain();

  gain.gain.value = offset;

  _.connect({ from: new NeuDC(context, 1), to: gain });

  return gain;
}

function sum(context, outlet, dc) {
  var gain = context.createGain();

  _.connect({ from: outlet, to: gain });
  _.connect({ from: dc    , to: gain });

  return gain;
}

module.exports = makeOutlet;
