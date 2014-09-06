"use strict";

var _ = require("./utils");

function NeuSynthDB() {
  this._all = [];
  this._ids = {};
}

NeuSynthDB.prototype.append = function(obj) {
  if (_.isObject(obj)) {
    this._all.push(obj);
    if (_.has(obj, "$id")) {
      this._ids[obj.$id] = obj;
    }
  }
  return this;
};

NeuSynthDB.prototype.all = function() {
  return this._all;
};

NeuSynthDB.prototype.find = function(selector) {
  var result = null;

  var id = (selector.match(/#\w+/) || [ "" ])[0].substr(1);
  if (id !== "") {
    result = this._ids[id] ? [ this._ids[id] ] : [];
  } else {
    result = this._all;
  }

  var cls = (selector.match(/\.\w+/) || [ "" ])[0].substr(1);
  if (cls !== "") {
    result = _.select(result, function(obj) {
      return obj.$class === cls;
    });
  }

  var key = (selector.match(/^\w*/))[0];
  if (key !== "") {
    result = _.select(result, function(obj) {
      return obj.$key === key;
    });
  }

  return result;
};

module.exports = NeuSynthDB;
