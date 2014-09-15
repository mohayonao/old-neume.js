"use strict";

var neume = require("../src/neume");

neume.use(require("../src/ugen/line"));

describe("ugen/line", function() {
  describe("$(line)", function() {
    it("returns a GainNode that is connected with DC(1)", function() {
      var synth = neume.Neume(function($) {
        return $("line");
      })();
      assert.deepEqual(synth.outlet.toJSON(), {
        name: "GainNode",
        gain: {
          value: 1,
          inputs: []
        },
        inputs: [ DC(1) ]
      });
    });
    it("works", function() {
      var synth = neume.Neume(function($) {
        return $("line", { start: 880, end: 440, dur: 0.200 });
      })();
      var audioContext = neume._.findAudioContext(synth);
      var outlet = synth.outlet;
      var ended = 0;

      audioContext.$reset();
      synth.$context.reset();

      synth.start(0.100).on("end", function(e) {
        ended = e.playbackTime;
      });

      audioContext.$process(0.500);

      assert(outlet.gain.$valueAtTime(0.000) === 880);
      assert(outlet.gain.$valueAtTime(0.050) === 880);
      assert(outlet.gain.$valueAtTime(0.100) === 880);
      assert(closeTo(outlet.gain.$valueAtTime(0.150), 770, 1e-6));
      assert(closeTo(outlet.gain.$valueAtTime(0.200), 660, 1e-6));
      assert(closeTo(outlet.gain.$valueAtTime(0.250), 550, 1e-6));
      assert(closeTo(outlet.gain.$valueAtTime(0.300), 440, 1e-6));
      assert(outlet.gain.$valueAtTime(0.350) === 440);
      assert(outlet.gain.$valueAtTime(0.400) === 440);

      assert(ended === 0.30000000000000004);
    });
    it("works with stop", function() {
      var synth = neume.Neume(function($) {
        return $("line", { start: 880, end: 440, dur: 0.200 });
      })();

      var audioContext = neume._.findAudioContext(synth);
      var outlet = synth.outlet;
      var ended = 0;

      audioContext.$reset();
      synth.$context.reset();

      synth.start(0.100).on("end", function(e) {
        ended = e.playbackTime;
      });
      synth.stop(0.200);

      audioContext.$process(0.500);

      assert(outlet.gain.$valueAtTime(0.000) === 880);
      assert(outlet.gain.$valueAtTime(0.050) === 880);
      assert(outlet.gain.$valueAtTime(0.100) === 880);
      assert(closeTo(outlet.gain.$valueAtTime(0.150), 770, 1e-6));
      assert(closeTo(outlet.gain.$valueAtTime(0.200), 660, 1e-6));
      assert(closeTo(outlet.gain.$valueAtTime(0.250), 550, 1e-6));
      assert(closeTo(outlet.gain.$valueAtTime(0.300), 440, 1e-6));
      assert(outlet.gain.$valueAtTime(0.350) === 440);
      assert(outlet.gain.$valueAtTime(0.400) === 440);

      assert(ended === 0);
    });
  });

  describe("$(xline)", function() {
    it("returns a GainNode that is connected with DC(1)", function() {
      var synth = neume.Neume(function($) {
        return $("xline");
      })();
      assert.deepEqual(synth.outlet.toJSON(), {
        name: "GainNode",
        gain: {
          value: 1,
          inputs: []
        },
        inputs: [ DC(1) ]
      });
    });
    it("works", function() {
      var synth = neume.Neume(function($) {
        return $("xline", { start: 880, end: 440, dur: 0.200 });
      })();
      var audioContext = neume._.findAudioContext(synth);
      var outlet = synth.outlet;
      var ended = 0;

      audioContext.$reset();
      synth.$context.reset();

      synth.start(0.100).on("end", function(e) {
        ended = e.playbackTime;
      });

      audioContext.$process(0.500);

      assert(outlet.gain.$valueAtTime(0.000) === 880);
      assert(outlet.gain.$valueAtTime(0.050) === 880);
      assert(outlet.gain.$valueAtTime(0.100) === 880);
      assert(closeTo(outlet.gain.$valueAtTime(0.150), 739.9888454232688, 1e-6));
      assert(closeTo(outlet.gain.$valueAtTime(0.200), 622.2539674441618, 1e-6));
      assert(closeTo(outlet.gain.$valueAtTime(0.250), 523.2511306011974, 1e-6));
      assert(closeTo(outlet.gain.$valueAtTime(0.300), 440              , 1e-6));
      assert(outlet.gain.$valueAtTime(0.350) === 440);
      assert(outlet.gain.$valueAtTime(0.400) === 440);

      assert(ended === 0.30000000000000004);
    });
  });

  describe("$(line $(line) $(line))", function() {
    it("returns a GainNode that is connected inputs", function() {
      var synth = neume.Neume(function($) {
        return $("line", $("line"), $("line"));
      })();
      assert.deepEqual(synth.outlet.toJSON(), {
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
