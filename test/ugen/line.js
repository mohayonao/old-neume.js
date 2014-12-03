"use strict";

var neume = require("../../src");

neume.use(require("../../src/ugen/line"));

describe("ugen/line", function() {
  var Neume = null;

  before(function() {
    Neume = neume(new global.AudioContext());
  });

  describe("$(line)", function() {
    it("returns a GainNode that is connected with DC(1)", function() {
      var synth = new Neume.Synth(function($) {
        return $("line");
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
            inputs: [ DC(1) ]
          }
        ]
      });
    });
    it("works", function() {
      var synth = new Neume.Synth(function($) {
        return $("line", { start: 880, end: 440, dur: 0.200 });
      });

      var audioContext = Neume.audioContext;
      var outlet = synth.toAudioNode().$inputs[0];
      var ended = 0;

      audioContext.$reset();
      synth.$context.reset();

      synth.start(0.100).on("end", function(e) {
        ended = e.playbackTime;
      });

      audioContext.$processTo("00:00.500");

      assert(closeTo(outlet.gain.$valueAtTime(0.000), 880, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.050), 880, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.100), 880, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.150), 770, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.200), 660, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.250), 550, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.300), 440, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.350), 440, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.400), 440, 1e-2));

      assert(closeTo(ended, 0.300, 1e-2));
    });
    it("works with stop", function() {
      var synth = new Neume.Synth(function($) {
        return $("line", { start: 880, end: 440, dur: 0.200 });
      });

      var audioContext = Neume.audioContext;
      var outlet = synth.toAudioNode().$inputs[0];
      var ended = 0;

      audioContext.$reset();
      synth.$context.reset();

      synth.start(0.100).on("end", function(e) {
        ended = e.playbackTime;
      });
      synth.stop(0.200);

      audioContext.$processTo("00:00.500");

      assert(closeTo(outlet.gain.$valueAtTime(0.000), 880, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.050), 880, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.100), 880, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.150), 770, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.200), 660, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.250), 550, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.300), 440, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.350), 440, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.400), 440, 1e-2));

      assert(ended === 0);
    });
    it("works with _ style", function() {
      var synth = new Neume.Synth(function($) {
        return $("line", { _: [ 0, 0.5, 0.100, 0.2, 0.100, 0.4, 0.100 ] });
      });

      var audioContext = Neume.audioContext;
      var outlet = synth.toAudioNode().$inputs[0];
      var ended = 0;

      audioContext.$reset();
      synth.$context.reset();

      synth.start(0.100).on("end", function(e) {
        ended = e.playbackTime;
      });

      audioContext.$processTo("00:00.500");

      assert(closeTo(outlet.gain.$valueAtTime(0.000), 0.000, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.050), 0.000, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.100), 0.000, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.150), 0.250, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.200), 0.500, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.250), 0.350, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.300), 0.200, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.350), 0.300, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.400), 0.400, 1e-2));

      assert(closeTo(ended, 0.400, 1e-2));
    });
  });

  describe("$(xline)", function() {
    it("returns a GainNode that is connected with DC(1)", function() {
      var synth = new Neume.Synth(function($) {
        return $("xline");
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
            inputs: [ DC(1) ]
          }
        ]
      });
    });
    it("works", function() {
      var synth = new Neume.Synth(function($) {
        return $("xline", { start: 880, end: 440, dur: 0.200 });
      });

      var audioContext = Neume.audioContext;
      var outlet = synth.toAudioNode().$inputs[0];
      var ended = 0;

      audioContext.$reset();
      synth.$context.reset();

      synth.start(0.100).on("end", function(e) {
        ended = e.playbackTime;
      });

      audioContext.$processTo("00:00.350");

      assert(closeTo(outlet.gain.$valueAtTime(0.000), 880.000, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.050), 880.000, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.100), 880.000, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.125), 806.963, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.150), 739.988, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.175), 678.572, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.200), 622.253, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.225), 570.609, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.250), 523.251, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.275), 479.823, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.300), 440.000, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.325), 440.000, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.350), 440.000, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.375), 440.000, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.400), 440.000, 1e-2));

      assert(closeTo(ended, 0.300, 1e-2));
    });

    it("works with _ style", function() {
      var synth = new Neume.Synth(function($) {
        return $("xline", { _: [ 0, 0.5, 0.100, 0.2, 0.100, 0.4, 0.100 ] });
      });

      var audioContext = Neume.audioContext;
      var outlet = synth.toAudioNode().$inputs[0];
      var ended = 0;

      audioContext.$reset();
      synth.$context.reset();

      synth.start(0.100).on("end", function(e) {
        ended = e.playbackTime;
      });

      audioContext.$processTo("00:00.450");

      assert(closeTo(outlet.gain.$valueAtTime(0.000), 0.000, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.050), 0.000, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.100), 0.000, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.125), 0.000, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.150), 0.000, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.175), 0.018, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.200), 0.500, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.225), 0.397, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.250), 0.316, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.275), 0.251, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.300), 0.200, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.325), 0.237, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.350), 0.282, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.375), 0.336, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.400), 0.400, 1e-2));

      assert(closeTo(ended, 0.400, 1e-2));
    });
  });

  describe("$(line $(line) $(line))", function() {
    it("returns a GainNode that is connected inputs", function() {
      var synth = new Neume.Synth(function($) {
        return $("line", $("line"), $("line"));
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
            inputs: [
              {
                name: "GainNode",
                gain: {
                  value: 1,
                  inputs: []
                },
                inputs: [ DC(1) ]
              },
              {
                name: "GainNode",
                gain: {
                  value: 1,
                  inputs: []
                },
                inputs: [ DC(1) ]
              }
            ]
          }
        ]
      });
    });
  });

});
