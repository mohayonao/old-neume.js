"use strict";

var neume = require("../../src");

neume.use(require("../../src/ugen/shaper"));

describe("ugen/shaper", function() {
  var Neume = null;

  before(function() {
    Neume = neume.exports(new window.AudioContext());
  });

  describe("$(shaper)", function() {
    it("return a WaveShaperNode", function() {
      var synth = new Neume(function($) {
        return $("shaper");
      })();

      assert.deepEqual(synth.toAudioNode().toJSON(), {
        name: "GainNode",
        gain: {
          value: 1,
          inputs: []
        },
        inputs: [
          {
            name: "WaveShaperNode",
            oversample: "none",
            inputs: []
          }
        ]
      });
    });
  });

  describe("$(shaper curve:curve)", function() {
    it("return a WaveShaperNode", function() {
      var synth = new Neume(function($) {
        return $("shaper", { curve: new Float32Array([ -1, +1 ]) });
      })();

      assert.deepEqual(synth.toAudioNode().toJSON(), {
        name: "GainNode",
        gain: {
          value: 1,
          inputs: []
        },
        inputs: [
          {
            name: "WaveShaperNode",
            oversample: "none",
            inputs: []
          }
        ]
      });
      assert.deepEqual(synth.toAudioNode().$inputs[0].curve, new Float32Array([ -1, +1 ]));
    });
    it("return a WaveShaperNode with curve number", function() {
      var synth1 = new Neume(function($) {
        return $("shaper", { curve: 1 });
      })();
      var synth2 = new Neume(function($) {
        return $("shaper", { curve: 1 });
      })();
      var synth3 = new Neume(function($) {
        return $("shaper", { curve: 0.5 });
      })();

      assert.deepEqual(synth1.toAudioNode().toJSON(), {
        name: "GainNode",
        gain: {
          value: 1,
          inputs: []
        },
        inputs: [
          {
            name: "WaveShaperNode",
            oversample: "none",
            inputs: []
          }
        ]
      });
      assert(synth1.toAudioNode().$inputs[0].curve === synth2.toAudioNode().$inputs[0].curve);
      assert(synth2.toAudioNode().$inputs[0].curve !== synth3.toAudioNode().$inputs[0].curve);
    });
  });

  describe("$(shaper, $(shaper), $(shaper))", function() {
    it("return a WaveShaperNode", function() {
      var synth = new Neume(function($) {
        return $("shaper", $("shaper"), $("shaper"));
      })();

      assert.deepEqual(synth.toAudioNode().toJSON(), {
        name: "GainNode",
        gain: {
          value: 1,
          inputs: []
        },
        inputs: [
          {
            name: "WaveShaperNode",
            oversample: "none",
            inputs: [
              {
                name: "WaveShaperNode",
                oversample: "none",
                inputs: []
              },
              {
                name: "WaveShaperNode",
                oversample: "none",
                inputs: []
              }
            ]
          }
        ]
      });
    });
  });

  describe("$(clip)", function() {
    it("return a WaveShaperNode", function() {
      var synth1 = new Neume(function($) {
        return $("clip");
      })();
      var synth2 = new Neume(function($) {
        return $("clip");
      })();

      assert.deepEqual(synth1.toAudioNode().toJSON(), {
        name: "GainNode",
        gain: {
          value: 1,
          inputs: []
        },
        inputs: [
          {
            name: "WaveShaperNode",
            oversample: "none",
            inputs: []
          }
        ]
      });
      assert(synth1.toAudioNode().$inputs[0].curve === synth2.toAudioNode().$inputs[0].curve);
    });

  });
});
