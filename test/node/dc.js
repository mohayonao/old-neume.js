"use strict";

var _ = require("../../src/utils");
var NeuContext = require("../../src/context");
var NeuDC = require("../../src/node/dc");

describe("NeuDC", function() {
  var context = null;

  beforeEach(function() {
    context = new NeuContext(new window.AudioContext().destination);
  });

  describe("(context, value)", function() {
    it("returns an instance of NeuDC", function() {
      assert(new NeuDC(context, 220) instanceof NeuDC);
    });
    it("has link to AudioNode", function() {
      var outlet = _.findAudioNode(new NeuDC(context, 0));

      assert(outlet instanceof window.AudioNode);
      assert.deepEqual(outlet.toJSON(), DC(0));
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
