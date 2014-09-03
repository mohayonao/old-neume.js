"use strict";

var utils = {};

utils.isArray = function(value) {
  return Array.isArray(value);
};

utils.isBoolean = function(value) {
  return typeof value === "boolean";
};

utils.isDictionary = function(value) {
  return value != null && value.constructor === Object;
};

utils.isFunction = function(value) {
  return typeof value === "function";
};

utils.isFinite = function(value) {
  return typeof value === "number" && isFinite(value);
};

utils.isNaN = function(value) {
  return value !== value;
};

utils.isNull = function(value) {
  return value === null;
};

utils.isNumber = function(value) {
  return typeof value === "number" && !isNaN(value);
};

module.exports = utils;
