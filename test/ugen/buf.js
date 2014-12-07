"use strict";

var neume = require("../../src");

neume.use(require("../../src/ugen/buf"));

describe("ugen/buf", function() {
  var Neume = null;
  var buffer = null;

  beforeEach(function() {
    Neume = neume(new global.AudioContext());
  });

  describe("$(buf buffer:buffer)", function() {
    /*
     * +------------------+
     * | BufferSourceNode |
     * +------------------+
     *   |
     */
    beforeEach(function() {
      buffer = Neume.Buffer.from([ 1, 2, 3, 4 ]);
    });

    it("returns a BufferSourceNode", function() {
      var synth = Neume.Synth(function($) {
        return $("buf", { buf: buffer });
      });

      assert.deepEqual(synth.toAudioNode().toJSON(), {
        name: "GainNode",
        gain: {
          value: 1,
          inputs: []
        },
        inputs: [
          {
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
          }
        ]
      });
    });

    it("works", function(done) {
      var synth = Neume.Synth(function($) {
        return $("buf", { buf: buffer }).on("end", function() {
          done();
        });
      });

      synth.start(0.100);
      synth.stop(0.200);

      Neume.audioContext.$processTo("00:00.250");

      var outlet = synth.toAudioNode().$inputs[0];
      assert(outlet.$stateAtTime(0.000) === "SCHEDULED");
      assert(outlet.$stateAtTime(0.050) === "SCHEDULED");
      assert(outlet.$stateAtTime(0.100) === "PLAYING");
      assert(outlet.$stateAtTime(0.150) === "PLAYING");
      assert(outlet.$stateAtTime(0.200) === "FINISHED");
      assert(outlet.$stateAtTime(0.250) === "FINISHED");
    });

    it("works without duration", function() {
      var synth = Neume.Synth(function($) {
        return $("buf", { buf: buffer, offset: 5 });
      });

      var outlet = synth.toAudioNode().$inputs[0];
      var spy = sinon.spy(outlet, "start");

      synth.start(0.100);

      Neume.audioContext.$processTo("00:00.100");

      assert(spy.calledOnce === true);
      assert.deepEqual(spy.firstCall.args, [ 0.100, 5 ]);
    });

    it("works duration", function() {
      var synth = Neume.Synth(function($) {
        return $("buf", { buf: buffer, offset: 5, dur: 10 });
      });

      var outlet = synth.toAudioNode().$inputs[0];
      var spy = sinon.spy(outlet, "start");

      synth.start(0.100);

      Neume.audioContext.$processTo("00:00.100");

      assert(spy.calledOnce === true);
      assert.deepEqual(spy.firstCall.args, [ 0.100, 5, 10 ]);
    });
  });

  describe("$(AudioBuffer)", function() {
    it("returns a BufferSourceNode", function() {
      var audioBuffer = Neume.context.createBuffer(1, 128, 44100);
      var synth = Neume.Synth(function($) {
        return $(audioBuffer);
      });

      assert.deepEqual(synth.toAudioNode().toJSON(), {
        name: "GainNode",
        gain: {
          value: 1,
          inputs: []
        },
        inputs: [
          {
            name: "AudioBufferSourceNode",
            buffer: {
              name: "AudioBuffer",
              length: 128,
              duration: 128 / 44100,
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
          }
        ]
      });
    });
  });

  describe("$(NeuBuffer)", function() {
    it("returns a BufferSourceNode", function() {
      var buffer = neume.Buffer.from(Neume.context, [ 1, 2, 3, 4 ]);
      var synth = Neume.Synth(function($) {
        return $(buffer);
      });

      assert.deepEqual(synth.toAudioNode().toJSON(), {
        name: "GainNode",
        gain: {
          value: 1,
          inputs: []
        },
        inputs: [
          {
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
          }
        ]
      });
    });
  });

  describe("parameter check", function() {
    var buffer;

    beforeEach(function() {
      buffer = Neume.Buffer.from([ 1, 2, 3, 4 ]);
    });

    it("full name", function() {
      var json = Neume.Synth(function($) {
        return $("buf", { buffer: buffer, loop: true, loopStart: 1, loopEnd: 2 });
      }).toAudioNode().toJSON().inputs[0];

      assert.deepEqual(json.buffer, buffer.toAudioBuffer().toJSON());
      assert(json.loop === true);
      assert(json.loopStart === 1);
      assert(json.loopEnd === 2);
    });
    it("alias", function() {
      var json = Neume.Synth(function($) {
        return $("buf", { buf: buffer, loop: true, start: 1, end: 2 });
      }).toAudioNode().toJSON().inputs[0];

      assert.deepEqual(json.buffer, buffer.toAudioBuffer().toJSON());
      assert(json.loop === true);
      assert(json.loopStart === 1);
      assert(json.loopEnd === 2);
    });
  });

});
