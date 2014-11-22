"use strict";

var util = require("../util");
var selectorParser = require("../parser/selector");

function NeuSynthDB() {
  this._all = [];
  this._ids = {};
}

NeuSynthDB.prototype.append = function(obj) {
  if (util.isObject(obj)) {
    this._all.push(obj);
    if (obj.hasOwnProperty("$id")) {
      this._ids[obj.$id] = obj;
    }
  }
  return this;
};
NeuSynthDB.$name = "NeuSynthDB";

NeuSynthDB.prototype.all = function() {
  return this._all;
};

NeuSynthDB.prototype.find = function(selector) {
  var result = null;
  var parsed = selectorParser.parse(selector);

  if (parsed.id) {
    result = this._ids[parsed.id] ? [ this._ids[parsed.id] ] : [];
  } else {
    result = this._all;
  }

  parsed.class.forEach(function(cls) {
    result = result.filter(function(obj) {
      return obj.$class.indexOf(cls) !== -1;
    });
  });

  if (parsed.key) {
    result = result.filter(function(obj) {
      return obj.$key === parsed.key;
    });
  }

  return result;
};

module.exports = NeuSynthDB;
