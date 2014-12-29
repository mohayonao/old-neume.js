"use strict";

var neume = require("../namespace");

require("./component");

var util = require("../util");

function NeuSum(context, inputs) {
  neume.Component.call(this, context);

  var number = 0;
  var hasNumber = false;
  var param = null;
  var nodes = [];

  inputs = util.flatten(inputs);

  for (var i = 0, imax = inputs.length; i < imax; i++) {
    var x = inputs[i].valueOf();

    if (typeof x === "number") {
      number += util.finite(x);
      hasNumber = true;
    } else if (!param && x instanceof neume.Param) {
      param = x;
    } else {
      nodes.push(x);
    }
  }

  if (nodes.length === 0) {
    if (param) {
      return param;
    }
    return new neume.DC(context, number);
  }

  if (number === 0 && param === null && nodes.length === 1) {
    return new neume.Component(context, nodes[0]);
  }

  this._hasNumber = hasNumber;
  this._number = number;
  this._param = param;
  this._nodes = nodes;
  this._inputs = inputs;
}
util.inherits(NeuSum, neume.Component);

NeuSum.$$name = "NeuSum";

NeuSum.prototype.add = function(value) {
  return new neume.Sum(this.context, this._inputs.concat(value));
};

NeuSum.prototype.toAudioNode = function() {
  if (this._outlet === null) {
    var context = this.context;
    var nodes = this._nodes;

    var sumNode = context.createGain();

    for (var i = 0, imax = nodes.length; i < imax; i++) {
      context.connect(nodes[i], sumNode);
    }
    if (this._param)  {
      context.connect(this._param, sumNode);
    }
    if (this._number) {
      context.connect(this._number, sumNode);
    }

    this._outlet = sumNode;
  }

  return this._outlet;
};

NeuSum.prototype.connect = function(to) {
  var context = this.context;
  var number = this._number;
  var param = this._param;
  var nodes = this._nodes;

  for (var i = 0, imax = nodes.length; i < imax; i++) {
    context.connect(context.toAudioNode(nodes[i]), to);
  }

  if (param) {
    context.connect(param, to);
    if (number !== 0) {
      context.connect(new neume.DC(context, number).toAudioNode(), to);
    }
  } else if (number !== 0) {
    context.connect(number, to);
  }

  return this;
};

NeuSum.prototype.disconnect = function() {
  this.context.disconnect(this._inputs);
  return this;
};

module.exports = neume.Sum = NeuSum;
