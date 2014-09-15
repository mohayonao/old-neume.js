"use strict";

var neume = require("../src/neume");

neume.use(require("../src/ugen/noise"));

describe("ugen/noise", function() {
  var synth = null;

  describe("$(white)", function() {
    /*
     * +------------------+
     * | BufferSourceNode |
     * +------------------+
     *   |
     */
    beforeEach(function() {
      synth = neume.Neume(function($) {
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
      var audioContext = neume._.findAudioContext(synth);
      var outlet = synth.outlet;

      audioContext.$reset();
      synth.$context.reset();

      synth.start(0.100);
      synth.stop(0.200);

      audioContext.$process(0.300);
      assert(outlet.$stateAtTime(0.000) === "SCHEDULED");
      assert(outlet.$stateAtTime(0.050) === "SCHEDULED");
      assert(outlet.$stateAtTime(0.100) === "PLAYING");
      assert(outlet.$stateAtTime(0.150) === "PLAYING");
      assert(outlet.$stateAtTime(0.200) === "FINISHED");
      assert(outlet.$stateAtTime(0.250) === "FINISHED");
    });
  });

});
