"use strict";

var neume = require("../../src");

describe("neume.Unit", function() {
  var spec = null;
  var unit = null;

  beforeEach(function() {
    spec = {
      outlet: new global.AudioContext().createGain(),
      start: function() {},
      stop: function() {},
      methods: {
        bang: function() {}
      }
    };
    unit = new neume.Unit(spec);
  });

  describe("#start", function() {
    it("(t: number): self", function() {
      var spy = sinon.spy(spec, "start");

      unit.start(10);
      unit.start(20);
      unit.start(30);

      assert(spy.calledOnce === true);
      assert.deepEqual(spy.firstCall.args, [ 10 ]);
    });
  });

  describe("#stop", function() {
    it("(t: number): self", function() {
      var spy = sinon.spy(spec, "stop");

      unit.stop(10);
      assert(spec.stop.called === false, "call without calling start first");

      unit.start(10);

      unit.stop(20);
      unit.stop(30);

      assert(spy.calledOnce === true);
      assert.deepEqual(spy.firstCall.args, [ 20 ]);
    });
  });

  describe("#apply", function() {
    it("(method: string, args: Array<any>): self", function() {
      var spy = sinon.spy(spec.methods, "bang");

      unit.apply("bang", [ 1, 2, 3 ]);
      unit.apply("bong", [ 4, 5, 6 ]);

      assert(spy.calledOnce === true);
      assert.deepEqual(spy.firstCall.args, [ 1, 2, 3 ]);
    });
  });

  describe("#toAudioNode", function() {
    it("(): AudioNode", function() {
      assert(unit.toAudioNode() instanceof global.AudioNode);
    });
  });

});
