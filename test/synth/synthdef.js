"use strict";

var neume = require("../../src");

var util = neume.util;
var NOP = function() {};

describe("neume.SynthDef", function() {
  var context = null;

  beforeEach(function() {
    context = new neume.Context(new global.AudioContext().destination);
  });

  describe("constructor", function() {
    it("(context: neume.Context, func: function): function", function() {
      assert(typeof new neume.SynthDef(context, NOP) === "function");
    });
    it("(context: neume.Context, func: !function): throw error", function() {
      assert.throws(function() {
        new neume.SynthDef(context, null);
      });
    });

    describe("#context", function() {
      it("\\getter: neume.Context", function() {
        var synthDef = new neume.SynthDef(context, NOP);
        assert(synthDef.context instanceof neume.Context);
      });
    });

    describe("function", function() {
      it("(...arguments: Array<any>): neume.Synth", sinon.test(function() {
        this.stub(util, "NeuSynth");

        var synthDef = new neume.SynthDef(context, NOP);

        synthDef("a", "b", "c");

        assert(util.NeuSynth.calledWithNew() === true);
        assert.deepEqual(util.NeuSynth.args[0], [ context, NOP, [ "a", "b", "c" ] ]);
      }));
      it("(context, ...arguments: Array<any>): neume.Synth", sinon.test(function() {
        this.stub(util, "NeuSynth");

        var synthDef = new neume.SynthDef(context, NOP);
        var newContext = new global.AudioContext();

        newContext.marked = true;

        synthDef(newContext, "d", "e", "f");

        assert(util.NeuSynth.calledWithNew() === true);
        assert.deepEqual(util.NeuSynth.args[0], [ newContext, NOP, [ "d", "e", "f" ] ]);
      }));
    });
  });

});
