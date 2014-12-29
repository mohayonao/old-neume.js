"use strict";

var neume = require("../../src");

neume.use(require("../../src/ugen/inout"));
neume.use(require("../../src/ugen/osc"));

describe("ugen/inout", function() {
  var neu = null;

  beforeEach(function() {
    neu = neume(new global.AudioContext(), {
      scheduleInterval: 0.05, scheduleAheadTime: 0.05
    });
  });

  describe("$(in)", function() {
    it("graph", function() {
      var synth = neu.Synth(function($) {
        return $("in", { bus: 1 });
      });

      assert.deepEqual(synth.toAudioNode().toJSON(), {
        name: "GainNode",
        gain: {
          value: 1,
          inputs: []
        },
        inputs: [
          {
            name: "GainNode",
            gain: {
              value: 1,
              inputs: []
            },
            inputs: []
          }
        ]
      });
      assert(synth.toAudioNode().$inputs[0] === synth.context.getAudioBus(1).toAudioNode());
    });
  });

  describe("$(out)", function() {
    it("graph", function() {
      var synth = neu.Synth(function($) {
        return $("out", { bus: 1 }, $("osc"));
      });

      useTimer(neu.context, function(tick) {
        synth.start(0);

        tick(50);
      });

      assert.deepEqual(synth.context.getAudioBus(1).toAudioNode().toJSON(), {
        name: "GainNode",
        gain: {
          value: 1,
          inputs: []
        },
        inputs: [
          {
            name: "GainNode",
            gain: {
              value: 1,
              inputs: []
            },
            inputs: [ OSCILLATOR("sine", 440) ]
          }
        ]
      });
    });
  });

});
