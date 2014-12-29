"use strict";

var neume = require("../../src");

neume.use(require("../../src/ugen"));

describe("neume.UGen", function() {
  var context = null;
  var synth = null;

  beforeEach(function() {
    context = new neume.Context(new global.AudioContext().destination, {
      scheduleInterval: 0.05, scheduleAheadTime: 0.05
    });
    synth = new neume.Synth(context, NOP, []);
  });

  describe("constructor", function() {
    it("(synth: neume.Synth, key: string, spec: object, inputs: Array<any>)", function() {
      var ugen = neume.UGen.build(synth, "sin.kr.lfo#ugen0", {}, []);

      assert(ugen instanceof neume.UGen);
      assert(ugen instanceof neume.Emitter);
      assert(ugen.id === "ugen0");
      assert.deepEqual(ugen.classes, [ "kr", "lfo" ]);
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
    it("(synth: neume.Synth, key: Float32Array, spec: object, inputs: Array<any>): neume.UGen", function() {
      var ugen = neume.UGen.build(synth, new Float32Array(16), {}, []);

      assert(ugen instanceof neume.UGen);
      assert(ugen.key === "Float32Array");
    });
    it("(synth: neume.Synth, key: object, spec: object, inputs: Array<any>): neume.UGen", function() {
      var ugen = neume.UGen.build(synth, new Date(), {}, []);

      assert(ugen instanceof neume.UGen);
      assert(ugen.key === "object");
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
        "fb-sin", "DX7", "OD-1", "<*-*>"
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
      var spy = this.spy(synth, "builder");
      var ugen = neume.UGen.build(synth, "sin", {}, []);

      ugen.$("lpf");

      assert(spy.calledOnce);
      assert(spy.calledWith("lpf", {}, [ ugen ]));
    }));
    it("(key:string, spec:object): neume.UGen", sinon.test(function() {
      var spy = this.spy(synth, "builder");
      var ugen = neume.UGen.build(synth, "sin", {}, []);

      ugen.$("lpf", { freq: 200 });

      assert(spy.calledOnce);
      assert(spy.calledWith("lpf", { freq: 200 }, [ ugen ]));
    }));
    it("(key:string, ...args:any): neume.UGen", sinon.test(function() {
      var spy = this.spy(synth, "builder");
      var node = context.createGain();
      var ugen = neume.UGen.build(synth, "sin", {}, []);

      ugen.$("lpf", node);

      assert(spy.calledOnce);
      assert(spy.calledWith("lpf", {}, [ ugen, node ]));
    }));
    it("(key:string, spec:object, ...args: any): neume.UGen", sinon.test(function() {
      var spy = this.spy(synth, "builder");
      var node = context.createGain();
      var ugen = neume.UGen.build(synth, "sin", {}, []);

      ugen.$("lpf", { freq: 200 }, node);

      assert(spy.calledOnce);
      assert(spy.calledWith("lpf", { freq: 200 }, [ ugen, node ]));
    }));
  });

  describe("#mul", function() {
    it("(value: any): neume.UGen", sinon.test(function() {
      var spy = this.spy(synth, "builder");
      var node = context.createGain();
      var ugen = neume.UGen.build(synth, "sin", {}, []);

      ugen.mul(1000);

      assert(spy.calledOnce);
      assert(spy.calledWith("*", ugen, 1000));
    }));
  });

  describe("#add", function() {
    it("(value: any): neume.UGen", sinon.test(function() {
      var spy = this.spy(synth, "builder");
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
      var spy = sinon.spy(ugen._unit, "start");

      assert(ugen.start(10) === ugen);
      assert(spy.calledOnce);
      assert(spy.calledWith(10));
    });
  });

  describe("#stop", function() {
    it("(startTime: number)", function() {
      var ugen = neume.UGen.build(synth, "sin", {}, []);
      var spy = sinon.spy(ugen._unit, "stop");

      assert(ugen.stop(10) === ugen);
      assert(spy.calledOnce);
      assert(spy.calledWith(10));
    });
  });

  describe("#trig", function() {
    it("(startTime: timevalue): self", function() {
      var ugen = neume.UGen.build(synth, "sin.trig", {}, []);
      var spy = sinon.spy(ugen._unit, "start");

      useTimer(context, function(tick) {
        assert(ugen.start(0) === ugen);
        assert(ugen.trig(0.1) === ugen);

        context.start();

        tick(50);
        assert(!spy.called);

        tick(50);
        assert(spy.calledOnce);
        assert(spy.calledWith(0.1));
      });
    });
  });

  describe("#sched", function() {
    it("(schedIter: iterator, callback: function): self", function() {
      var ugen = neume.UGen.build(synth, "sin", {}, []);

      assert(ugen.sched() === ugen);
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
        inputs: [ OSCILLATOR("sine", 440) ]
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
          OSCILLATOR("sine", 440),
          {
            name: "GainNode",
            gain: {
              value: 880,
              inputs: []
            },
            inputs: [ BUFSRC(128) ]
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
          inputs: [ OSCILLATOR("sine", 440) ]
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
          inputs: [ OSCILLATOR("sine", 440) ]
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

  describe("class: bypass", function() {
    it("works", function() {
      var a = context.createOscillator();
      var b = context.createDelay();
      var ugen = neume.UGen.build(synth, "delay.bypass", {}, [ a, b ]);

      assert.deepEqual(ugen.toAudioNode().toJSON(), {
        name: "GainNode",
        gain: {
          value: 1,
          inputs: []
        },
        inputs: [ a.toJSON(), b.toJSON() ]
      });
    });
  });

  describe("class: mute", function() {
    it("works", function() {
      var ugen = neume.UGen.build(synth, "sin.mute", {}, []);

      assert.deepEqual(ugen.toAudioNode().toJSON(), {
        name: "GainNode",
        gain: {
          value: 1,
          inputs: []
        },
        inputs: []
      });
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
        inputs: [ OSCILLATOR("sine", 440) ]
      });
    });
    it("return 0 when a * 0", function() {
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
        inputs: []
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
              inputs: [ OSCILLATOR("sine", 440) ]
            },
            inputs: [ OSCILLATOR("sine", 440) ]
          }
        ]
      });
    });
  });

});
