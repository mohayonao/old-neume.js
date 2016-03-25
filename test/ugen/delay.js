"use strict";

var neume = require("../../src");

neume.use(require("../../src/ugen/osc"));
neume.use(require("../../src/ugen/delay"));

describe("ugen/delay", function() {
  var neu = null;

  beforeEach(function() {
    neu = neume({
      scheduleInterval: 0.05,
      scheduleAheadTime: 0.05,
      scheduleOffsetTime: 0.00,
    });
  });

  describe("graph", function() {
    it("$('delay')", function() {
      var synth = neu.Synth(function($) {
        return $("delay");
      });

      assert.deepEqual(synth.toAudioNode().toJSON(), {
        name: "GainNode",
        gain: {
          value: 1,
          inputs: []
        },
        inputs: [
          {
            name: "DelayNode",
            delayTime: {
              value: 0,
              inputs: []
            },
            inputs: []
          }
        ]
      });
    });
    it("$('delay', $('sin'))", function() {
      var synth = neu.Synth(function($) {
        return $("delay", $("sin"));
      });

      assert.deepEqual(synth.toAudioNode().toJSON(), {
        name: "GainNode",
        gain: {
          value: 1,
          inputs: []
        },
        inputs: [
          {
            name: "DelayNode",
            delayTime: {
              value: 0,
              inputs: []
            },
            inputs: [ OSCILLATOR("sine", 440) ]
          }
        ]
      });
    });
    it("$('delay', { feedback: 0.5 })", function() {
      var synth = neu.Synth(function($) {
        return $("delay", { feedback: 0.5 });
      });

      assert.deepEqual(synth.toAudioNode().toJSON(), {
        name: "GainNode",
        gain: {
          value: 1,
          inputs: []
        },
        inputs: [
          {
            name: "DelayNode",
            delayTime: {
              value: 0,
              inputs: []
            },
            inputs: [
              {
                name: "GainNode",
                gain: {
                  value: 0.5,
                  inputs: []
                },
                inputs: [
                  "<circular:DelayNode>"
                ]
              }
            ]
          }
        ]
      });
    });

    it("$('delay', { feedback: 0.5 })", function() {
      var synth = neu.Synth(function($) {
        return $("delay", { feedback: 0.5 }, $("sin"));
      });

      assert.deepEqual(synth.toAudioNode().toJSON(), {
        name: "GainNode",
        gain: {
          value: 1,
          inputs: []
        },
        inputs: [
          {
            name: "DelayNode",
            delayTime: {
              value: 0,
              inputs: []
            },
            inputs: [
              OSCILLATOR("sine", 440),
              {
                name: "GainNode",
                gain: {
                  value: 0.5,
                  inputs: []
                },
                inputs: [
                  "<circular:DelayNode>"
                ]
              }
            ]
          }
        ]
      });
    });
  });

  describe("parameters", function() {
    it("full name", function() {
      var json = neu.Synth(function($) {
        return $("delay", { delayTime: 1 });
      }).toAudioNode().toJSON().inputs[0];

      assert(json.delayTime.value === 1);

      var synth = neu.Synth(function($) {
        return $("delay", { delay: $("sin"), maxDelayTime: 2 });
      });

      assert(synth.toAudioNode().$inputs[0].$maxDelayTime === 2);
    });
    it("short name", function() {
      var json = neu.Synth(function($) {
        return $("delay", { delay: 1 });
      }).toAudioNode().toJSON().inputs[0];

      assert(json.delayTime.value === 1);

      var synth = neu.Synth(function($) {
        return $("delay", { delay: $("sin"), maxDelay: 2 });
      });

      assert(synth.toAudioNode().$inputs[0].$maxDelayTime === 2);
    });
  });

});
