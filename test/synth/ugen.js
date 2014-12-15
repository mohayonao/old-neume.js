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

  beforeEach(function() {
    context = new neume.Context(new global.AudioContext().destination);
    synth = new neume.Synth(context, NOP, []);
  });

  describe("constructor", function() {
    it("(synth: neume.Synth, key: string, spec: object, inputs: Array<any>)", function() {
      var ugen = neume.UGen.build(synth, "sin.kr.lfo#ugen0", {}, []);

      assert(ugen instanceof neume.UGen);
      assert(ugen instanceof neume.Emitter);
      assert(ugen.$id === "ugen0");
      assert.deepEqual(ugen.$class, [ "kr", "lfo" ]);
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
    it("(key:string): neume.UGen", sinon.test(function() {
      var spy = this.spy(synth, "$builder");
      var ugen = neume.UGen.build(synth, "sin", {}, []);

      ugen.$("lpf");

      assert(spy.calledOnce);
      assert(spy.calledWith("lpf", {}, [ ugen ]));
    }));
    it("(key:string, spec:object): neume.UGen", sinon.test(function() {
      var spy = this.spy(synth, "$builder");
      var ugen = neume.UGen.build(synth, "sin", {}, []);

      ugen.$("lpf", { freq: 200 });

      assert(spy.calledOnce);
      assert(spy.calledWith("lpf", { freq: 200 }, [ ugen ]));
    }));
    it("(key:string, ...args:any): neume.UGen", sinon.test(function() {
      var spy = this.spy(synth, "$builder");
      var node = context.createGain();
      var ugen = neume.UGen.build(synth, "sin", {}, []);

      ugen.$("lpf", node);

      assert(spy.calledOnce);
      assert(spy.calledWith("lpf", {}, [ ugen, node ]));
    }));
    it("(key:string, spec:object, ...args: any): neume.UGen", sinon.test(function() {
      var spy = this.spy(synth, "$builder");
      var node = context.createGain();
      var ugen = neume.UGen.build(synth, "sin", {}, []);

      ugen.$("lpf", { freq: 200 }, node);

      assert(spy.calledOnce);
      assert(spy.calledWith("lpf", { freq: 200 }, [ ugen, node ]));
    }));
  });

  describe("#mul", function() {
    it("(value: any): neume.UGen", sinon.test(function() {
      var spy = this.spy(synth, "$builder");
      var node = context.createGain();
      var ugen = neume.UGen.build(synth, "sin", {}, []);

      ugen.mul(1000);

      assert(spy.calledOnce);
      assert(spy.calledWith("*", ugen, 1000));
    }));
  });

  describe("#add", function() {
    it("(value: any): neume.UGen", sinon.test(function() {
      var spy = this.spy(synth, "$builder");
      var node = context.createGain();
      var ugen = neume.UGen.build(synth, "sin", {}, []);

      ugen.add(1000);

      assert(spy.calledOnce);
      assert(spy.calledWith("+", ugen, 1000));
    }));
  });

  describe("#start", function() {
    it("(startTime: number)", function() {
      var ugen = neume.UGen.build(synth, "sin", {}, []);
      var spy = sinon.spy(ugen.$unit, "start");

      assert(ugen.start(10) === ugen);
      assert(spy.calledOnce);
      assert(spy.calledWith(10));
    });
  });

  describe("#stop", function() {
    it("(startTime: number)", function() {
      var ugen = neume.UGen.build(synth, "sin", {}, []);
      var spy = sinon.spy(ugen.$unit, "stop");

      assert(ugen.stop(10) === ugen);
      assert(spy.calledOnce);
      assert(spy.calledWith(10));
    });
  });

  describe("#trig", function() {
    it("(startTime: timevalue): self", function() {
      var ugen = neume.UGen.build(synth, "sin.trig", {}, []);
      var spy = sinon.spy(ugen.$unit, "start");

      assert(ugen.start(0) === ugen);
      assert(ugen.trig(0.1) === ugen);

      context.start();

      context.audioContext.$processTo("00:00.050");
      assert(!spy.called);

      context.audioContext.$processTo("00:00.100");

      assert(spy.calledOnce);
      assert(spy.calledWith(0.1));
    });
  });

  describe("#toAudioNode", function() {
    it("(): AudioNode", function() {
      var ugen = neume.UGen.build(synth, "sin", {}, []);
      assert(ugen.toAudioNode() instanceof global.AudioNode);
      assert(ugen.toAudioNode() === ugen.toAudioNode());
    });
  });

  describe("#connect", function() {
    it("(to: AudioNode): self", function() {
      var node = context.createGain();

      neume.UGen.build(synth, "sin", {}, []).connect(node);

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

      neume.UGen.build(synth, "sin", { add: 880 }, []).connect(node);

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

      neume.UGen.build(synth, "sin", {}, []).connect(node.gain);

      assert.deepEqual(node.toJSON(), {
        name: "GainNode",
        gain: {
          value: 1,
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

      neume.UGen.build(synth, "sin", { add: 880 }, []).connect(node.gain);

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

      neume.UGen.build(synth, "sin", {}, []).connect(node).disconnect();

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
      var ugen = neume.UGen.build(synth, "adsr", {}, []);

      assert(ugen.release() === ugen);
      assert(ugen.release(10) === ugen);
      assert(ugen.release({}) === ugen);
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
