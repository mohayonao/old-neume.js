"use strict";

var neume = require("../../src");

var NeuContext = neume.Context;
var NeuNode    = neume.Node;
var NeuIn      = neume.In;

describe("NeuIn", function() {
  var audioContext = null;
  var context = null;
  var _in = null;

  beforeEach(function() {
    audioContext = new window.AudioContext();
    context = new NeuContext(audioContext.destination);
    _in = new NeuIn({ $context: context });
  });

  describe("(synth)", function() {
    it("returns an instance of NeuIn", function() {
      assert(_in instanceof NeuIn);
      assert(_in instanceof NeuNode);
    });
  });

  describe("#toAudioNode()", function() {
    it("returns an AudioNode", function() {
      assert(_in.toAudioNode() instanceof window.AudioNode);
    });
  });

});
