"use strict";

var neuma = require("../src/neuma");

neuma.use(require("../src/ugen/buf"));

describe("ugen/buf", function() {
  var buffer = null;

  describe("$(buf buffer:buffer)", function() {
    /*
     * +------------------+
     * | BufferSourceNode |
     * +------------------+
     *   |
     */
    beforeEach(function() {
      var context = new neuma.Context(new window.AudioContext());
      buffer = neuma.Buffer.from(context, [ 1, 2, 3, 4 ]);
    });

    it("returns a BufferSourceNode", function() {
      var synth = neuma.Neuma(function($) {
        return $("buf", { buffer: buffer });
      })();

      assert.deepEqual(synth.outlet.toJSON(), {
        name: "AudioBufferSourceNode",
        buffer: {
          name: "AudioBuffer",
          length: 4,
          duration: 4 / 44100,
          sampleRate: 44100,
          numberOfChannels: 1
        },
        playbackRate: {
          value: 1,
          inputs: []
        },
        loop: false,
        loopStart: 0,
        loopEnd: 0,
        inputs: []
      });
    });

    it("works", function() {
      var synth = neuma.Neuma(function($) {
        return $("buf", { buffer: buffer });
      })();

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

    it("works without duration", function() {
      var synth = neuma.Neuma(function($) {
        return $("buf", { buffer: buffer, offset: 5 });
      })();

      var audioContext = neuma._.findAudioContext(synth);
      var outlet = synth.outlet;
      var spy = sinon.spy(outlet, "start");

      audioContext.$reset();
      synth.$context.reset();

      synth.start(0.100);

      audioContext.$process(0.100);

      assert(spy.calledOnce === true);
      assert.deepEqual(spy.firstCall.args, [ 0.100, 5 ]);
    });

    it("works duration", function() {
      var synth = neuma.Neuma(function($) {
        return $("buf", { buffer: buffer, offset: 5, duration: 10 });
      })();

      var audioContext = neuma._.findAudioContext(synth);
      var outlet = synth.outlet;
      var spy = sinon.spy(outlet, "start");

      audioContext.$reset();
      synth.$context.reset();

      synth.start(0.100);

      audioContext.$process(0.100);

      assert(spy.calledOnce === true);
      assert.deepEqual(spy.firstCall.args, [ 0.100, 5, 10 ]);
    });

  });

});
