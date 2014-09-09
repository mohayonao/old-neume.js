"use strict";

var _ = require("../src/utils");
var NeuContext = require("../src/context");
var NeuUGen = require("../src/ugen");
var NeuUnit = require("../src/unit");
var Emitter = require("../src/emitter");
var NOP = function() {};

describe("NeuUGen", function() {
  var context = null;
  var synth = null;
  var unit0 = null;
  var registered = null;

  function make(id) {
    return function(unit, spec, inputs) {
      var gain = context.createGain();

      gain.$id = unit.$id || id;

      inputs.forEach(function(node) {
        _.connect({ from: node, to: gain });
      });

      return new NeuUnit({ outlet: gain });
    };
  }

  before(function() {
    registered = NeuUGen.registered;
    NeuUGen.registered = {};
    NeuUGen.register("number" , make("number"));
    NeuUGen.register("sin"    , make("sin"));
    NeuUGen.register("+"      , make("add"));
    NeuUGen.register("*"      , make("mul"));
    NeuUGen.register("invalid", function() {
      return null;
    });
  });

  beforeEach(function() {
    var audioContext = new window.AudioContext();
    context = new NeuContext(audioContext);
    synth = {
      $context: audioContext
    };
    unit0 = new NeuUGen(synth, "sin.kr.lfo#unit0", {}, []);
  });

  after(function() {
    NeuUGen.registered = registered;
  });

  describe("(synth, key, spec, inputs)", function() {
    it("returns an instance of NeuUGen", function() {
      assert(unit0 instanceof NeuUGen);
    });
    it("has been inherited from Emitter", function() {
      assert(unit0 instanceof Emitter);
    });
    it("should set id from the key", function() {
      assert(unit0.$id === "unit0");
    });
    it("should set classes from the key", function() {
      assert.deepEqual(unit0.$class, [ "kr", "lfo" ]);
    });
    it("throw an error if given invalid key", function() {
      assert.throws(function() {
        new NeuUGen(synth, "#id", {}, []);
      }, Error);
    });
  });

  describe(".build(synth, key, spec, inputs)", function() {
    it("returns an instance of NeuUGen", function() {
      var unit = NeuUGen.build(synth, "sin", {}, []);

      assert(unit instanceof NeuUGen);
    });
    it("converts to a string-key if given a non-string key", function() {
      var unit = NeuUGen.build(synth, 100, {}, []);

      assert(unit instanceof NeuUGen);
      assert(unit.$outlet.$id === "number");
    });
    it("throws an error if given an unknown key", function() {
      assert.throws(function() {
        NeuUGen.build(synth, "unknown", {}, []);
      }, Error);
    });
    it("throws an error if given an invalid key", function() {
      assert.throws(function() {
        NeuUGen.build(synth, "invalid", {}, []);
      }, Error);
    });
  });

  describe(".register(name, func)", function() {
    it("throw an error if given invalid name", function() {
      [
        "fb-sin", "DX7", "OD-1", "<@-@>"
      ].forEach(function(ok) {
        assert.doesNotThrow(function() {
          NeuUGen.register(ok, NOP);
        });
      });

      [
        "0", "sin.kr", "sin#lfo",
        "-fb", "fb-", "fb--sin", "<@-@>b"
      ].forEach(function(ng) {
        assert.throws(function() {
          NeuUGen.register(ng, NOP);
        }, Error);
      });
    });
    it("throw an error if given not a function", function() {
      assert.throws(function() {
        NeuUGen.register("not-a-function", { call: NOP, apply: NOP });
      }, TypeError);
    });
  });

  describe("#context", function() {
    it("is an instance of AudioContext", function() {
      assert(unit0.context instanceof window.AudioContext);
    });
  });

  describe("#outlet", function() {
    it("is an instance of AudioNode", function() {
      assert(unit0.outlet instanceof window.AudioNode);
    });
  });

  describe("#start(t)", function() {
    it("returns self", function() {
      assert(unit0.start(0) === unit0);
    });
    it("calls ugen.start(t)", function() {
      var spy = sinon.spy(unit0.$unit, "start");

      unit0.start(10);

      assert(spy.calledOnce === true);
      assert.deepEqual(spy.firstCall.args, [ 10 ]);
    });
  });

  describe("#stop(t)", function() {
    it("returns self", function() {
      assert(unit0.stop(0) === unit0);
    });
    it("calls ugen.stop(t)", function() {
      var spy = sinon.spy(unit0.$unit, "stop");

      unit0.stop(10);

      assert(spy.calledOnce === true);
      assert.deepEqual(spy.firstCall.args, [ 10 ]);
    });
  });

  describe("#apply(method, args)", function() {
    it("returns self", function() {
      assert(unit0.apply("a", []) === unit0);
    });
    it("calls ugen.apply(method, args)", function() {
      var spy = sinon.spy(unit0.$unit, "apply");

      unit0.apply("method", [ 10 ]);

      assert(spy.calledOnce === true);
      assert.deepEqual(spy.firstCall.args, [ "method", [ 10 ]]);
    });
  });

  describe("#add(node)", function() {
    it("returns a new NeuUGen that is (this + node)", function() {
      var unit2 = new NeuUGen(synth, "sin#unit2", {}, []);
      var unit3 = unit0.add(unit2);

      assert(unit3 instanceof NeuUGen);
      assert(unit3 !== unit0);
      assert.deepEqual(unit3.$outlet.toJSON(), {
        name: "GainNode#add",
        gain: {
          value: 1,
          inputs: []
        },
        inputs: [
          {
            name: "GainNode#unit0",
            gain: {
              value: 1,
              inputs: []
            },
            inputs: []
          },
          {
            name: "GainNode#unit2",
            gain: {
              value: 1,
              inputs: []
            },
            inputs: []
          }
        ]
      });
    });
  });

  describe("#mul(node)", function() {
    it("returns a new NeuUGen that is (this * node)", function() {
      var unit2 = new NeuUGen(synth, "sin#unit2", {}, []);
      var unit3 = unit0.mul(unit2);

      assert(unit3 instanceof NeuUGen);
      assert(unit3 !== unit0);
      assert.deepEqual(unit3.$outlet.toJSON(), {
        name: "GainNode#mul",
        gain: {
          value: 1,
          inputs: []
        },
        inputs: [
          {
            name: "GainNode#unit0",
            gain: {
              value: 1,
              inputs: []
            },
            inputs: []
          },
          {
            name: "GainNode#unit2",
            gain: {
              value: 1,
              inputs: []
            },
            inputs: []
          }
        ]
      });
    });
  });

  describe("#madd(mul, add)", function() {
    it("returns a new NeuUGen that is (this * mul + add)", function() {
      var unit2 = new NeuUGen(synth, "sin#unit2", {}, []);
      var unit3 = new NeuUGen(synth, "sin#unit3", {}, []);
      var unit4 = unit0.madd(unit2, unit3);

      assert(unit4 instanceof NeuUGen);
      assert(unit4 !== unit0);
      assert.deepEqual(unit4.$outlet.toJSON(), {
        name: "GainNode#add",
        gain: {
          value: 1,
          inputs: []
        },
        inputs: [
          {
            name: "GainNode#mul",
            gain: {
              value: 1,
              inputs: []
            },
            inputs: [
              {
                name: "GainNode#unit0",
                gain: {
                  value: 1,
                  inputs: []
                },
                inputs: []
              },
              {
                name: "GainNode#unit2",
                gain: {
                  value: 1,
                  inputs: []
                },
                inputs: []
              }
            ]
          },
          {
            name: "GainNode#unit3",
            gain: {
              value: 1,
              inputs: []
            },
            inputs: []
          }
        ]
      });
    });
  });

});
