"use strict";

var neume = require("../../src");

var util = neume.util;
var NeuContext = neume.Context;
var NeuUGen = neume.UGen;
var NeuUnit = neume.Unit;
var Emitter = neume.Emitter;

require("../../src/ugen/osc");
require("../../src/ugen/add");
require("../../src/ugen/mul");
require("../../src/ugen/env");

var NOP = function() {};

describe("NeuUGen", function() {
  var context = null;
  var synth = null;
  var ugen0 = null;
  var registered = null;

  beforeEach(function() {
    var audioContext = new global.AudioContext();
    context = new NeuContext(audioContext.destination);
    synth = {
      $context: context
    };
    ugen0 = NeuUGen.build(synth, "sin.kr.lfo#ugen0", {}, []);
    ugen0.toAudioNode().$id = "ugen0";
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
      var ugen = NeuUGen.build(synth, "sin", {}, []);

      assert(ugen instanceof NeuUGen);
    });
    it("converts to a string-key if given a primitive", function() {
      var ugen = NeuUGen.build(synth, 100, {}, []);

      assert(ugen instanceof NeuUGen);
      assert(ugen.$key === "number");
    });
    it("converts to a string-key if given a non-string key", function() {
      var ugen = NeuUGen.build(synth, new Date(), {}, []);

      assert(ugen instanceof NeuUGen);
      assert(ugen.$key === "object");
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

  describe("#mul(value)", function() {
    it("works", function() {
      var node = context.createGain();
      var spy = sinon.spy();

      var a = NeuUGen.build({
        $context: context,
        $builder: spy
      }, "sin", { add: 880 }, []);

      a.mul(1000);

      assert(spy.calledOnce);
      assert(spy.calledWith("*", a, 1000));
    });
  });

  describe("#add(value)", function() {
    it("works", function() {
      var node = context.createGain();
      var spy = sinon.spy();

      var a = NeuUGen.build({
        $context: context,
        $builder: spy
      }, "sin", { add: 880 }, []);

      a.add(1000);

      assert(spy.calledOnce);
      assert(spy.calledWith("+", a, 1000));
    });
  });

  describe("#toAudioNode()", function() {
    it("returns an AudioNode", function() {
      assert(ugen0.toAudioNode() instanceof global.AudioNode);
    });
  });

  describe("#connect(to)", function() {
    it("connect to an AudioNode without offset", function() {
      var node = context.createGain();

      NeuUGen.build(synth, "sin#ugen0", {}, []).connect(node);

      assert.deepEqual(node.toJSON(), {
        name: "GainNode",
        gain: {
          value: 1,
          inputs: []
        },
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
      });
    });
    it("connect to an AudioNode with offset", function() {
      var node = context.createGain();

      NeuUGen.build(synth, "sin#ugen0", { add: 880 }, []).connect(node);

      assert.deepEqual(node.toJSON(), {
        name: "GainNode",
        gain: {
          value: 1,
          inputs: []
        },
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
          },
          {
            name: "GainNode",
            gain: {
              value: 880,
              inputs: []
            },
            inputs: [ DC(1) ]
          }
        ]
      });
      assert(node.$inputs[1].$inputs[0].buffer.getChannelData(0)[0] === 1);
    });
    it("connect to an AudioParam without offset", function() {
      var node = context.createGain();

      node.gain.value = 0;

      NeuUGen.build(synth, "sin#ugen0", {}, []).connect(node.gain);

      assert.deepEqual(node.toJSON(), {
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
        inputs: []
      });
    });
    it("connect to an AudioParam with offset", function() {
      var node = context.createGain();

      node.gain.value = 0;

      NeuUGen.build(synth, "sin#ugen0", { add: 880 }, []).connect(node.gain);

      assert.deepEqual(node.toJSON(), {
        name: "GainNode",
        gain: {
          value: 880,
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
        inputs: []
      });
    });
  });

  describe("#disconnect()", function() {
    it("works", function() {
      var node = context.createGain();

      NeuUGen.build(synth, "sin#ugen0", {}, []).connect(node).disconnect();

      assert.deepEqual(node.toJSON(), {
        name: "GainNode",
        gain: {
          value: 1,
          inputs: []
        },
        inputs: []
      });
    });
  });

  describe("method bindings", function() {
    it("works", function() {
      var ugen1 = NeuUGen.build(synth, "adsr", {}, []);

      assert(ugen1.release() === ugen1);
    });
  });

  describe("mul(a, b)", function() {
    it("return a when a * 1", function() {
      var node = context.createGain();

      var b = 1;
      var a = NeuUGen.build(synth, "sin", { mul: b }, []);

      a.connect(node);

      assert.deepEqual(node.toJSON(), {
        name: "GainNode",
        gain: {
          value: 1,
          inputs: []
        },
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
      });
    });
    it("return DC(0) when a * 0", function() {
      var node = context.createGain();

      var b = 0;
      var a = NeuUGen.build(synth, "sin", { mul: b }, []);

      a.connect(node);

      assert.deepEqual(node.toJSON(), {
        name: "GainNode",
        gain: {
          value: 1,
          inputs: []
        },
        inputs: [ DC(0) ]
      });
    });
    it("return a * b", function() {
      var node = context.createGain();

      var b = NeuUGen.build(synth, "sin", {}, []);
      var a = NeuUGen.build(synth, "sin", { mul: b }, []);

      a.connect(node);

      assert.deepEqual(node.toJSON(), {
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
          }
        ]
      });
    });
  });

});
