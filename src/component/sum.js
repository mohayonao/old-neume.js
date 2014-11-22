"use strict";

var _ = require("../utils");
var NeuComponent = require("./component");

function NeuSum(context, inputs) {
  NeuComponent.call(this, context);
  this._inputs = [].concat(inputs);
}
_.inherits(NeuSum, NeuComponent);

NeuSum.$name = "NeuSum";

NeuSum.prototype.add = function(value) {
  return this.$context.createSum(this._inputs.concat(value));
};

NeuSum.prototype.toAudioNode = function() {
  if (this.$outlet === null) {
    if (this._inputs.length === 1) {
      this.$outlet = this.$context.toAudioNode(this._inputs[0]);
    } else {
      this.$outlet = createSumNode(this.$context, this._inputs);
    }
  }
  return this.$outlet;
};

NeuSum.prototype.connect = function(to) {
  var context = this.$context;
  var number = 0;
  var param = null;
  var inputs = this._inputs;

  for (var i = 0, imax = inputs.length; i < imax; i++) {
    if (typeof inputs[i] === "number") {
      number += _.finite(inputs[i]);
    } else if (inputs[i] instanceof _.NeuDC) {
      number += inputs[i].valueOf();
    } else if (!param && inputs[i] instanceof _.NeuParam) {
      param = inputs[i];
    } else {
      context.connect(context.toAudioNode(inputs[i]), to);
    }
  }

  if (param) {
    context.connect(param, to);
    if (number !== 0) {
      context.connect(context.createDC(number).toAudioNode(), to);
    }
  } else if (number !== 0) {
    context.connect(number, to);
  }

  return this;
};

function createSumNode(context, inputs) {
  var node = null;
  var number = 0;

  for (var i = 0, imax = inputs.length; i < imax; i++) {
    if (typeof inputs[i] === "number") {
      number += _.finite(inputs[i]);
    } else if (inputs[i] instanceof _.NeuDC) {
      number += inputs[i].valueOf();
    } else {
      if (node === null) {
        node = context.createGain();
      }
      context.connect(inputs[i], node);
    }
  }

  if (node) {
    if (number !== 0) {
      context.connect(context.createDC(number), node);
    }
  } else {
    node = context.createDC(number).toAudioNode();
  }

  return node;
}

NeuSum.prototype.disconnect = function() {
  var context = this.$context;
  var inputs = this._inputs;

  for (var i = 0, imax = inputs.length; i < imax; i++) {
    context.disconnect(inputs[i]);
  }

  return this;
};

module.exports = _.NeuSum = NeuSum;
