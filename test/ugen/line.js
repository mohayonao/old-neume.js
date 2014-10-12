"use strict";

var neume = require("../../src");

neume.use(require("../../src/ugen/line"));

describe("ugen/line", function() {
  var Neume = null;

  before(function() {
    Neume = neume.exports(new window.AudioContext());
  });

  describe("$(line)", function() {
    it("returns a GainNode that is connected with DC(1)", function() {
      var synth = new Neume(function($) {
        return $("line");
      })();
      assert.deepEqual(synth.toAudioNode().toJSON(), {
        name: "GainNode",
        gain: {
          value: 1,
          inputs: []
        },
        inputs: [ DC(1) ]
      });
    });
    it("works", function() {
      var synth = new Neume(function($) {
        return $("line", { start: 880, end: 440, dur: 0.200 });
      })();

      var audioContext = Neume.audioContext;
      var outlet = synth.toAudioNode();
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
      var synth = new Neume(function($) {
        return $("line", { start: 880, end: 440, dur: 0.200 });
      })();

      var audioContext = Neume.audioContext;
      var outlet = synth.toAudioNode();
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
  });

  describe("$(xline)", function() {
    it("returns a GainNode that is connected with DC(1)", function() {
      var synth = new Neume(function($) {
        return $("xline");
      })();
      assert.deepEqual(synth.toAudioNode().toJSON(), {
        name: "GainNode",
        gain: {
          value: 1,
          inputs: []
        },
        inputs: [ DC(1) ]
      });
    });
    it("works", function() {
      var synth = new Neume(function($) {
        return $("xline", { start: 880, end: 440, dur: 0.200 });
      })();

      var audioContext = Neume.audioContext;
      var outlet = synth.toAudioNode();
      var ended = 0;

      audioContext.$reset();
      synth.$context.reset();

      synth.start(0.100).on("end", function(e) {
        ended = e.playbackTime;
      });

      audioContext.$processTo("00:00.500");

      assert(closeTo(outlet.gain.$valueAtTime(0.000), 880.000, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.050), 880.000, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.100), 880.000, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.150), 739.988, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.200), 622.253, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.250), 523.251, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.300), 440.000, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.350), 440.000, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.400), 440.000, 1e-2));

      assert(closeTo(ended, 0.300, 12-2));
    });
  });

  describe("$(line $(line) $(line))", function() {
    it("returns a GainNode that is connected inputs", function() {
      var synth = new Neume(function($) {
        return $("line", $("line"), $("line"));
      })();
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
      });
    });
  });
});
