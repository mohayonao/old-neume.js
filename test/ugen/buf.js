"use strict";

var neume = require("../../src");

neume.use(require("../../src/ugen/buf"));

describe("ugen/buf", function() {
  var neu = null;

  beforeEach(function() {
    neu = neume(new global.AudioContext());
  });

  describe("graph", function() {
    it("$('buf', { buffer: buffer })", function() {
      var synth = neu.Synth(function($) {
        var buffer = neu.context.createBuffer(2, 16, 44100);
        return $("buf", { buffer: buffer });
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
              sampleRate: 44100,
              length: 16,
              duration: 16 / 44100,
              numberOfChannels: 2
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
    it("$(AudioBuffer)", function() {
      var synth = neu.Synth(function($) {
        return $(neu.context.createBuffer(2, 16, 44100));
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
              sampleRate: 44100,
              length: 16,
              duration: 16 / 44100,
              numberOfChannels: 2
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
    it("$(NeuBuffer)", function() {
      var synth = neu.Synth(function($) {
        return $(neu.Buffer(2, 16, 44100));
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
              sampleRate: 44100,
              length: 16,
              duration: 16 / 44100,
              numberOfChannels: 2
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

  describe("works", function() {
    it("start", function() {
      var spy1 = sinon.spy(function(e) {
        assert(this instanceof neume.UGen);
        assert(e.type === "end");
        assert(e.synth instanceof neume.Synth);
        assert(closeTo(e.playbackTime, 0.350, 1e-2));
      });
      var synth = neu.Synth(function($) {
        var buffer = neu.Buffer(1, 11025, 44100);
        return $(buffer).on("end", spy1);
      });

      synth.start(0.100);

      var outlet = synth.toAudioNode().$inputs[0];

      neu.audioContext.$processTo("00:00.500");
      assert(outlet.$stateAtTime(0.000) === "SCHEDULED");
      assert(outlet.$stateAtTime(0.050) === "SCHEDULED");
      assert(outlet.$stateAtTime(0.100) === "PLAYING");
      assert(outlet.$stateAtTime(0.150) === "PLAYING");
      assert(outlet.$stateAtTime(0.200) === "PLAYING");
      assert(outlet.$stateAtTime(0.250) === "PLAYING");
      assert(outlet.$stateAtTime(0.300) === "PLAYING");
      assert(outlet.$stateAtTime(0.350) === "FINISHED");
      assert(outlet.$stateAtTime(0.400) === "FINISHED");
      assert(outlet.$stateAtTime(0.450) === "FINISHED");
      assert(outlet.$stateAtTime(0.500) === "FINISHED");
      assert(spy1.calledOnce);
    });
    it("start/stop", function() {
      var synth = neu.Synth(function($) {
        var buffer = neu.Buffer(1, 11025, 44100);
        return $(buffer).on("end", function() {
          throw new Error("NOT REACHED");
        });
      });

      synth.start(0.100);
      synth.stop(0.200);

      var outlet = synth.toAudioNode().$inputs[0];

      neu.audioContext.$processTo("00:00.300");
      assert(outlet.$stateAtTime(0.000) === "SCHEDULED");
      assert(outlet.$stateAtTime(0.050) === "SCHEDULED");
      assert(outlet.$stateAtTime(0.100) === "PLAYING");
      assert(outlet.$stateAtTime(0.150) === "PLAYING");
      assert(outlet.$stateAtTime(0.200) === "FINISHED");
      assert(outlet.$stateAtTime(0.250) === "FINISHED");
      assert(outlet.$stateAtTime(0.300) === "FINISHED");
      assert(outlet.$stateAtTime(0.350) === "FINISHED");
      assert(outlet.$stateAtTime(0.400) === "FINISHED");
      assert(outlet.$stateAtTime(0.450) === "FINISHED");
      assert(outlet.$stateAtTime(0.500) === "FINISHED");
    });
  });

  describe("parameters", function() {
    it("full name", function() {
      var buffer = neu.context.createBuffer(1, 16, 44100);
      var json = neu.Synth(function($) {
        return $("buf", { buffer: buffer, loop: true, loopStart: 1, loopEnd: 2 });
      }).toAudioNode().toJSON().inputs[0];

      assert.deepEqual(json.buffer, buffer.toJSON());
      assert(json.loop === true);
      assert(json.loopStart === 1);
      assert(json.loopEnd === 2);
    });
    it("short name", function() {
      var buffer = neu.context.createBuffer(1, 16, 44100);
      var json = neu.Synth(function($) {
        return $("buf", { buf: buffer, loop: true, start: 1, end: 2 });
      }).toAudioNode().toJSON().inputs[0];

      assert.deepEqual(json.buffer, buffer.toJSON());
      assert(json.loop === true);
      assert(json.loopStart === 1);
      assert(json.loopEnd === 2);
    });
  });

});
