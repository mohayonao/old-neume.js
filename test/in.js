"use strict";

var _ = require("../src/utils");
var NeuContext = require("../src/context");
var NeuNode = require("../src/node");
var NeuIn = require("../src/in");

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
