"use strict";

var neume = require("../../src");

require("../../src/ugen/osc");
require("../../src/ugen/add");
require("../../src/ugen/mul");
require("../../src/ugen/env");

var util = neume.util;
var NOP = function() {};

describe("neume.UGen", function() {
  var context = null;
  var synth = null;
  var ugen0 = null;
  var registered = null;

  beforeEach(function() {
    var audioContext = new global.AudioContext();
    context = new neume.Context(audioContext.destination);
    synth = {
      $context: context
    };
    ugen0 = neume.UGen.build(synth, "sin.kr.lfo#ugen0", {}, []);
    ugen0.toAudioNode().$id = "ugen0";
  });

  describe("constructor", function() {
    it("(synth: neume.Synth, key: string, spec: object, inputs: Array<any>)", function() {
      assert(ugen0 instanceof neume.UGen);
      assert(ugen0 instanceof neume.Emitter);
      assert(ugen0.$id === "ugen0");
      assert.deepEqual(ugen0.$class, [ "kr", "lfo" ]);
    });
    it("throw an error if given invalid key", function() {
      assert.throws(function() {
        neume.UGen.build(synth, "#id", {}, []);
      }, Error);
    });
  });

  describe(".build", function() {
    it("(synth: neume.Synth, key: string, spec: object, inputs: Array<any>): neume.UGen", function() {
      var ugen = neume.UGen.build(synth, "sin", {}, []);

      assert(ugen instanceof neume.UGen);
    });
    it("(synth: neume.Synth, key: number, spec: object, inputs: Array<any>): neume.UGen", function() {
      var ugen = neume.UGen.build(synth, 100, {}, []);

      assert(ugen instanceof neume.UGen);
      assert(ugen.$key === "number");
    });
    it("(synth: neume.Synth, key: object, spec: object, inputs: Array<any>): neume.UGen", function() {
      var ugen = neume.UGen.build(synth, new Date(), {}, []);

      assert(ugen instanceof neume.UGen);
      assert(ugen.$key === "object");
    });
    it("(synth: neume.Synth, unknownKey: string, spec: object, inputs: Array<any>): throws an error", function() {
      assert.throws(function() {
        neume.UGen.build(synth, "unknown", {}, []);
      }, Error);
    });
  });

  describe(".register", function() {
    it("(name: string, func: function): void", function() {
      [
        "fb-sin", "DX7", "OD-1", "<@-@>"
      ].forEach(function(ok) {
        assert.doesNotThrow(function() {
          neume.UGen.register(ok, NOP);
        });
      });
    });
    it("(invalidName: string, func: function): throw an error", function() {
      [
        "0", "sin.kr", "sin#lfo",
        "-fb", "fb-", "fb--sin", "<@-@>b"
      ].forEach(function(ng) {
        assert.throws(function() {
          neume.UGen.register(ng, NOP);
        }, Error);
      });
    });
    it("(name: string, func: !function): throw an error", function() {
      assert.throws(function() {
        neume.UGen.register("not-a-function", { call: NOP, apply: NOP });
      }, TypeError);
    });
  });

  describe("#$", function() {
    it("(key:string): neume.UGen", function() {
      var node = context.createGain();
      var spy = sinon.spy();

      var a = neume.UGen.build({
        $context: context,
        $builder: spy
      }, "sin", { add: 880 }, []);

      a.$("lpf");

      assert(spy.calledOnce);
      assert(spy.calledWith("lpf", {}, [ a ]));
    });
    it("(key:string, spec:object): neume.UGen", function() {
      var node = context.createGain();
      var spy = sinon.spy();

      var a = neume.UGen.build({
        $context: context,
        $builder: spy
      }, "sin", { add: 880 }, []);

      a.$("lpf", { freq: 200 });

      assert(spy.calledOnce);
      assert(spy.calledWith("lpf", { freq: 200 }, [ a ]));
    });
    it("(key:string, ...args:any): neume.UGen", function() {
      var node = context.createGain();
      var spy = sinon.spy();

      var a = neume.UGen.build({
        $context: context,
        $builder: spy
      }, "sin", { add: 880 }, []);

      a.$("lpf", ugen0);

      assert(spy.calledOnce);
      assert(spy.calledWith("lpf", {}, [ a, ugen0 ]));
    });
    it("(key:string, spec:object, ...args: any): neume.UGen", function() {
      var node = context.createGain();
      var spy = sinon.spy();

      var a = neume.UGen.build({
        $context: context,
        $builder: spy
      }, "sin", { add: 880 }, []);

      a.$("lpf", { freq: 200 }, ugen0);

      assert(spy.calledOnce);
      assert(spy.calledWith("lpf", { freq: 200 }, [ a, ugen0 ]));
    });
  });

  describe("#mul", function() {
    it("(value: any): neume.UGen", function() {
      var node = context.createGain();
      var spy = sinon.spy();

      var a = neume.UGen.build({
        $context: context,
        $builder: spy
      }, "sin", { add: 880 }, []);

      a.mul(1000);

      assert(spy.calledOnce);
      assert(spy.calledWith("*", a, 1000));
    });
  });

  describe("#add", function() {
    it("(value: any): neume.UGen", function() {
      var node = context.createGain();
      var spy = sinon.spy();

      var a = neume.UGen.build({
        $context: context,
        $builder: spy
      }, "sin", { add: 880 }, []);

      a.add(1000);

      assert(spy.calledOnce);
      assert(spy.calledWith("+", a, 1000));
    });
  });

  describe("#toAudioNode", function() {
    it("(): AudioNode", function() {
      assert(ugen0.toAudioNode() instanceof global.AudioNode);
    });
  });

  describe("#connect", function() {
    it("(to: AudioNode): self", function() {
      var node = context.createGain();

      neume.UGen.build(synth, "sin#ugen0", {}, []).connect(node);

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
    it("(to: AudioNode): self // when with offset", function() {
      var node = context.createGain();

      neume.UGen.build(synth, "sin#ugen0", { add: 880 }, []).connect(node);

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
    it("(to: AudioParam): self", function() {
      var node = context.createGain();

      node.gain.value = 0;

      neume.UGen.build(synth, "sin#ugen0", {}, []).connect(node.gain);

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
    it("(to: AudioParam): self // when with offset", function() {
      var node = context.createGain();

      node.gain.value = 0;

      neume.UGen.build(synth, "sin#ugen0", { add: 880 }, []).connect(node.gain);

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

  describe("#disconnect", function() {
    it("(): self", function() {
      var node = context.createGain();

      neume.UGen.build(synth, "sin#ugen0", {}, []).connect(node).disconnect();

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
      var ugen1 = neume.UGen.build(synth, "adsr", {}, []);

      assert(ugen1.release() === ugen1);
      assert(ugen1.release(0) === ugen1);
    });
  });

  describe("mul(a, b)", function() {
    it("return a when a * 1", function() {
      var node = context.createGain();

      var b = 1;
      var a = neume.UGen.build(synth, "sin", { mul: b }, []);

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
      var a = neume.UGen.build(synth, "sin", { mul: b }, []);

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

      var b = neume.UGen.build(synth, "sin", {}, []);
      var a = neume.UGen.build(synth, "sin", { mul: b }, []);

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
