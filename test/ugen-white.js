"use strict";

var neuma = require("../src/neuma");

neuma.use(require("../src/ugen/white"));

describe("ugen/white", function() {
  var synth = null;

  describe("$(white)", function() {
    /*
     * +------------------+
     * | BufferSourceNode |
     * +------------------+
     *   |
     */
    beforeEach(function() {
      synth = neuma.Neuma(function($) {
        return $("white");
      })();
    });
    it("returns a OscillatorNode", function() {
      assert.deepEqual(synth.outlet.toJSON(), {
        name: "AudioBufferSourceNode",
        buffer: {
          name: "AudioBuffer",
          length: 44100,
          duration: 1,
          sampleRate: 44100,
          numberOfChannels: 1
        },
        playbackRate: {
          value: 1,
          inputs: []
        },
        loop: true,
        loopStart: 0,
        loopEnd: 0,
        inputs: []
      });
    });
    it("works", function() {
      var audioContext = neuma._.findAudioContext(synth);
      var outlet = synth.outlet;

      audioContext.$reset();
      synth.$context.reset();

      synth.start(0.100);
      synth.stop(0.200);

      assert(outlet.$state === "init", "00:00.000");

      audioContext.$process(0.050);
      assert(outlet.$state === "init", "00:00.050");

      audioContext.$process(0.050);
      assert(outlet.$state === "start", "00:00.100");

      audioContext.$process(0.050);
      assert(outlet.$state === "start", "00:00.150");

      audioContext.$process(0.050);
      assert(outlet.$state === "stop", "00:00.200");

      audioContext.$process(0.050);
      assert(outlet.$state === "stop", "00:00.250");
    });
  });

});
