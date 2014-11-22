"use strict";

var neume = require("../../src");

var util = neume.util;
var NeuContext = neume.Context;
var NeuSynthDef = neume.SynthDef;
var NOP = function() {};

describe("NeuSynthDef", function() {
  var context = null;

  beforeEach(function() {
    context = new NeuContext(new global.AudioContext().destination);
  });

  describe("(context, func)", function() {
    it("returns a function that returns an instance of NeuSynth", function() {
      assert(typeof new NeuSynthDef(context, NOP) === "function");
    });

    describe("#context", function() {
      it("is an instance of AudioContext", function() {
        var synthDef = new NeuSynthDef(context, NOP);
        assert(synthDef.context instanceof neume.Context);
      });
    });

    describe("(...args)", function() {
      it("calls new NeuSynth(default context, func, ...args)", sinon.test(function() {
        this.stub(util, "NeuSynth");

        var synthDef = new NeuSynthDef(context, NOP);

        synthDef("a", "b", "c");

        assert(util.NeuSynth.calledWithNew() === true);
        assert.deepEqual(util.NeuSynth.args[0], [ context, NOP, [ "a", "b", "c" ] ]);
      }));
    });

    describe("(context, ...args)", function() {
      it("calls new NeuSynth(received context, func, ...args)", sinon.test(function() {
        this.stub(util, "NeuSynth");

        var synthDef = new NeuSynthDef(context, NOP);
        var newContext = new global.AudioContext();

        newContext.marked = true;

        synthDef(newContext, "d", "e", "f");

        assert(util.NeuSynth.calledWithNew() === true);
        assert.deepEqual(util.NeuSynth.args[0], [ newContext, NOP, [ "d", "e", "f" ] ]);
      }));

    });
  });

  describe("(context, notAFunc)", function() {
    it("throws an error", function() {
      assert.throws(function() {
        new NeuSynthDef(context, null);
      });
    });
  });

});
