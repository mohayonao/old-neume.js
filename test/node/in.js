"use strict";

var neume = require("../../src");

var _          = neume._;
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
    it("has outlet-link", function() {
      assert(_.findAudioNode(_in) instanceof window.GainNode);
    });
  });

});
