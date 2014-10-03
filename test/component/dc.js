"use strict";

var neume = require("../../src");

var _          = neume._;
var NeuContext = neume.Context;
var NeuDC      = neume.DC;

describe("NeuDC", function() {
  var context = null;

  beforeEach(function() {
    context = new NeuContext(new window.AudioContext().destination);
  });

  describe("(context, value)", function() {
    it("returns an instance of NeuDC", function() {
      assert(new NeuDC(context, 220) instanceof NeuDC);
    });
  });

  describe("#toAudioNode()", function() {
    it("returns an AudioNode", function() {
      assert(new NeuDC(context, 0).toAudioNode() instanceof window.AudioNode);
    });
  });

  describe("#valueOf()", function() {
    it("returns the value", function() {
      assert(new NeuDC(context, 0).valueOf() === 0);
      assert(new NeuDC(context, 1).valueOf() === 1);
      assert(new NeuDC(context, 2).valueOf() === 2);
    });
  });

});
