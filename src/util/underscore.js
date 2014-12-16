"use strict";

var util = require("./");

var _ = {};

_.exports = function() {
  return Object.create(_);
};

_.asInt = util.int;

_.midicps = function(midi) {
  return 440 * Math.pow(2, (midi - 69) / 12);
};

_.mtof = _.midicps;

_.cpsmidi = function(cps) {
  return Math.log(cps / 440) * Math.LOG2E * 12 + 69;
};

_.ftom = _.cpsmidi;

_.midiratio = function(midi) {
  return Math.pow(2, midi / 12);
};

_.ratiomidi = function(ratio) {
  return Math.log(Math.abs(ratio)) * Math.LOG2E * 12;
};

_.dbamp = function(db) {
  return Math.pow(10, db * 0.05);
};

_.ampdb = function(amp) {
  return Math.log(amp) * Math.LOG10E * 20;
};

_.linlin = function(value, inMin, inMax, outMin, outMax) {
  return (value - inMin) / (inMax - inMin) * (outMax - outMin) + outMin;
};

_.linexp = function(value, inMin, inMax, outMin, outMax) {
  return Math.pow(outMax / outMin, (value - inMin) / (inMax - inMin)) * outMin;
};

_.explin = function(value, inMin, inMax, outMin, outMax) {
  return (((Math.log(value / inMin)) / (Math.log(inMax / inMin))) * (outMax - outMin)) + outMin;
};

_.expexp = function(value, inMin, inMax, outMin, outMax) {
  return Math.pow(outMax / outMin, Math.log(value / inMin) / Math.log(inMax / inMin)) * outMin;
};

_.coin = function(value, random) {
  value = util.finite(util.defaults(value, 0.5));
  random = util.defaults(random, Math.random);
  return random() < value;
};

_.rand = function(value, random) {
  value = util.finite(util.defaults(value, 1.0));
  random = util.defaults(random, Math.random);
  return random() * value;
};

_.rand2 = function(value, random) {
  value = util.finite(util.defaults(value, 1.0));
  random = util.defaults(random, Math.random);
  return (random() * 2 - 1) * value;
};

_.rrand = function(lo, hi, random) {
  lo = util.finite(util.defaults(lo, 0.0));
  hi = util.finite(util.defaults(hi, 1.0));
  random = util.defaults(random, Math.random);
  return _.linlin(random(), 0, 1, lo, hi);
};

_.exprand = function(lo, hi, random) {
  lo = util.finite(util.defaults(lo, 1e-6));
  hi = util.finite(util.defaults(hi, 1.00));
  random = util.defaults(random, Math.random);
  return _.linexp(random(), 0, 1, lo, hi);
};

_.at = function(list, index) {
  return list[index|0];
};

_.clipAt = function(list, index) {
  return list[Math.max(0, Math.min(index|0, list.length - 1))];
};

_.wrapAt = function(list, index) {
  index = index|0;

  index %= list.length;
  if (index < 0) {
    index += list.length;
  }

  return list[index];
};

_.foldAt = function(list, index) {
  index = index|0;

  var len2 = list.length * 2 - 2;

  index = index % len2;

  if (index < 0) {
    index += len2;
  }

  if (list.length <= index) {
    index = len2 - index;
  }

  return list[index];
};

module.exports = _;
