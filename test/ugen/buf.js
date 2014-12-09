"use strict";

var neume = require("../../src");

neume.use(require("../../src/ugen/buf"));

describe("ugen/buf", function() {
  var Neume = null;

  beforeEach(function() {
    Neume = neume(new global.AudioContext());
  });

  describe("graph", function() {
    it("$('buf', { buffer: buffer })", function() {
      var synth = Neume.Synth(function($) {
        var buffer = Neume.context.createBuffer(2, 16, 44100);
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
      var synth = Neume.Synth(function($) {
        return $(Neume.context.createBuffer(2, 16, 44100));
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
      var synth = Neume.Synth(function($) {
        return $(Neume.Buffer(2, 16, 44100));
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
    it("start", function(done) {
      var synth = Neume.Synth(function($) {
        var buffer = Neume.Buffer(1, 11025, 44100);
        return $(buffer).on("end", function() {
          done();
        });
      });

      synth.start(0.100);

      Neume.audioContext.$processTo("00:00.500");

      var outlet = synth.toAudioNode().$inputs[0];
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
    });
    it("start/stop", function(done) {
      var synth = Neume.Synth(function($) {
        var buffer = Neume.Buffer(1, 11025, 44100);
        return $(buffer).on("end", function() {
          done();
        });
      });

      synth.start(0.100);
      synth.stop(0.200);

      Neume.audioContext.$processTo("00:00.300");

      var outlet = synth.toAudioNode().$inputs[0];
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
    it("with duration", function() {
      var synth = Neume.Synth(function($) {
        var buffer = Neume.Buffer(1, 11025, 44100);
        return $(buffer, { offset: 5, dur: 10 });
      });

      var outlet = synth.toAudioNode().$inputs[0];
      var spy = sinon.spy(outlet, "start");

      synth.start(0.100);

      Neume.audioContext.$processTo("00:00.100");

      assert(spy.calledOnce === true);
      assert.deepEqual(spy.firstCall.args, [ 0.100, 5, 10 ]);
    });
  });

  describe("parameters", function() {
    it("full name", function() {
      var buffer = Neume.context.createBuffer(1, 16, 44100);
      var json = Neume.Synth(function($) {
        return $("buf", { buffer: buffer, loop: true, loopStart: 1, loopEnd: 2 });
      }).toAudioNode().toJSON().inputs[0];

      assert.deepEqual(json.buffer, buffer.toJSON());
      assert(json.loop === true);
      assert(json.loopStart === 1);
      assert(json.loopEnd === 2);
    });
    it("short name", function() {
      var buffer = Neume.context.createBuffer(1, 16, 44100);
      var json = Neume.Synth(function($) {
        return $("buf", { buf: buffer, loop: true, start: 1, end: 2 });
      }).toAudioNode().toJSON().inputs[0];

      assert.deepEqual(json.buffer, buffer.toJSON());
      assert(json.loop === true);
      assert(json.loopStart === 1);
      assert(json.loopEnd === 2);
    });
  });

});
