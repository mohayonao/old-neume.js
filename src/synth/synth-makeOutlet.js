"use strict";

var _       = require("../utils");
var NeuDC   = require("../component/dc");
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

  context.connect(new NeuDC(context, 1), gain);

  return gain;
}

function sum(context, outlet, dc) {
  var gain = context.createGain();

  context.connect(outlet, gain);
  context.connect(dc    , gain);

  return gain;
}

module.exports = makeOutlet;
