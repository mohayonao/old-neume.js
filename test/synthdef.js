"use strict";

var _ = require("../src/utils");
var NeuContext = require("../src/context");
var NeuSynthDef = require("../src/synthdef");

describe("NeuSynthDef", function() {
  var context = null;

  beforeEach(function() {
    context = new NeuContext(new window.AudioContext());
  });

  describe("(context, spec)", function() {
    it("returns a function that returns an instance of NeuSynth", function() {
      assert(typeof new NeuSynthDef(context, {}) === "function");
    });

    describe("#context", function() {
      it("is an instance of AudioContext", function() {
        var def = new NeuSynthDef(context, {});
        assert(def.context instanceof window.AudioContext);
      });
    });

    describe("(...args)", function() {
      it("calls new NeuSynth(default context, spec, ...args)", sinon.test(function() {
        this.stub(_, "NeuSynth");

        var spec = { a: 10, b : 20 };
        var def  = new NeuSynthDef(context, spec);

        def("a", "b", "c");

        assert(_.NeuSynth.calledWithNew() === true);
        assert.deepEqual(_.NeuSynth.args[0], [ context, spec, [ "a", "b", "c" ] ]);
      }));
    });

    describe("(context, ...args)", function() {
      it("calls new NeuSynth(received context, spec, ...args)", sinon.test(function() {
        this.stub(_, "NeuSynth");

        var spec = { a: 10, b : 20 };
        var def  = new NeuSynthDef(context, spec);
        var newContext = new window.AudioContext();

        newContext.marked = true;

        def(newContext, "d", "e", "f");

        assert(_.NeuSynth.calledWithNew() === true);
        assert.deepEqual(_.NeuSynth.args[0], [ newContext, spec, [ "d", "e", "f" ] ]);
      }));

    });
  });

  describe("(context, func)", function() {
    it("converts the received function into a spec object", sinon.test(function() {
      this.stub(_, "NeuSynth");

      var def = new NeuSynthDef(context, it);

      def();

      assert.deepEqual(_.NeuSynth.args[0][1], {
        def   : it,
        params: []
      });
    }));
  });

});
