"use strict";

var _ = require("../src/utils");
var NeuContext = require("../src/context");
var NeuUGen = require("../src/ugen");
var NeuUnit = require("../src/unit");
var Emitter = require("../src/emitter");

require("../src/ugen/osc");
require("../src/ugen/add");
require("../src/ugen/mul");

var NOP = function() {};

describe("NeuUGen", function() {
  var context = null;
  var synth = null;
  var ugen0 = null;
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

  beforeEach(function() {
    var audioContext = new window.AudioContext();
    context = new NeuContext(audioContext);
    synth = {
      $context: audioContext
    };
    ugen0 = NeuUGen.build(synth, "sin.kr.lfo#ugen0", {}, []);
    _.findAudioNode(ugen0).$id = "ugen0";
  });

  describe("(synth, key, spec, inputs)", function() {
    it("returns an instance of NeuUGen", function() {
      assert(ugen0 instanceof NeuUGen);
    });
    it("has been inherited from Emitter", function() {
      assert(ugen0 instanceof Emitter);
    });
    it("should set id from the key", function() {
      assert(ugen0.$id === "ugen0");
    });
    it("should set classes from the key", function() {
      assert.deepEqual(ugen0.$class, [ "kr", "lfo" ]);
    });
    it("throw an error if given invalid key", function() {
      assert.throws(function() {
        NeuUGen.build(synth, "#id", {}, []);
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
      assert(ugen0.context instanceof window.AudioContext);
    });
  });

  describe("#outlet", function() {
    it("is an instance of AudioNode", function() {
      assert(ugen0.outlet instanceof window.AudioNode);
    });
  });

  describe("#add(node)", function() {
    it("returns a new NeuUGen that is (this + node)", function() {
      var ugen2 = NeuUGen.build(synth, "sin#ugen2", {}, []);
      var ugen3 = ugen0.add(ugen2);

      _.findAudioNode(ugen2).$id = "ugen2";
      _.findAudioNode(ugen3).$id = "ugen3";

      assert(ugen3 instanceof NeuUGen);
      assert(ugen3 !== ugen0);
      assert.deepEqual(ugen3.$outlet.toJSON(), {
        name: "GainNode#ugen3",
        gain: {
          value: 1,
          inputs: []
        },
        inputs: [
          {
            name: "OscillatorNode#ugen0",
            type: "sine",
            frequency: {
              value: 440,
              inputs: [],
            },
            detune: {
              value: 0,
              inputs: []
            },
            inputs: []
          },
          {
            name: "OscillatorNode#ugen2",
            type: "sine",
            frequency: {
              value: 440,
              inputs: [],
            },
            detune: {
              value: 0,
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
      var ugen2 = NeuUGen.build(synth, "sin#ugen2", {}, []);
      var ugen3 = ugen0.mul(ugen2);

      _.findAudioNode(ugen2).$id = "ugen2";
      _.findAudioNode(ugen3).$id = "ugen3";

      assert(ugen3 instanceof NeuUGen);
      assert(ugen3 !== ugen0);

      assert.deepEqual(ugen3.$outlet.toJSON(), {
        name: "GainNode#ugen3",
        gain: {
          value: 0,
          inputs: [
            {
              name: "OscillatorNode#ugen2",
              type: "sine",
              frequency: {
                value: 440,
                inputs: []
              },
              detune: {
                value: 0,
                inputs: []
              },
              inputs: []
            }
          ]
        },
        inputs: [
          {
            name: "OscillatorNode#ugen0",
            type: "sine",
            frequency: {
              value: 440,
              inputs: []
            },
            detune: {
              value: 0,
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
      var ugen2 = NeuUGen.build(synth, "sin#ugen2", {}, []);
      var ugen3 = NeuUGen.build(synth, "sin#ugen3", {}, []);
      var ugen4 = ugen0.madd(ugen2, ugen3);

      assert(ugen4 instanceof NeuUGen);
      assert(ugen4 !== ugen0);

      assert.deepEqual(ugen4.$outlet.toJSON(), {
        name: "GainNode",
        gain: {
          value: 1,
          inputs: []
        },
        inputs: [
          {
            name: "GainNode",
            gain: {
              value: 0,
              inputs: [
                {
                  name: "OscillatorNode",
                  type: "sine",
                  frequency: {
                    value: 440,
                    inputs: []
                  },
                  detune: {
                    value: 0,
                    inputs: []
                  },
                  inputs: []
                }
              ]
            },
            inputs: [
              {
                name: "OscillatorNode#ugen0",
                type: "sine",
                frequency: {
                  value: 440,
                  inputs: []
                },
                detune: {
                  value: 0,
                  inputs: []
                },
                inputs: []
              }
            ]
          },
          {
            name: "OscillatorNode",
            type: "sine",
            frequency: {
              value: 440,
              inputs: []
            },
            detune: {
              value: 0,
              inputs: []
            },
            inputs: []
          }
        ]
      });
    });
  });

});
