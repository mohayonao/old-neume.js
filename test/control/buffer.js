"use strict";

var neume = require("../../src");

describe("neume.Buffer", function() {
  var context = null;
  var audioBuffer = null;
  var bufferData = [ [ 0, 1, 2, 3, 4, 5, 6, 7 ], [ 7, 6, 5, 4, 3, 2, 1, 0 ] ];

  beforeEach(function() {
    context = new neume.Context(new global.AudioContext().destination);
    audioBuffer = context.audioContext.createBuffer(2, 8, 44100);
    audioBuffer.getChannelData(0).set(new Float32Array(bufferData[0]));
    audioBuffer.getChannelData(1).set(new Float32Array(bufferData[1]));
  });

  describe("constructor", function() {
    it("(context: neume.Context, audioBuffer: AudioBuffer)", function() {
      var buffer = new neume.Buffer(context, audioBuffer);

      assert(buffer instanceof neume.Buffer);
    });
  });

  describe(".create", function() {
    it("(context: neume.Context, channels: number, length: number, sampleRate: number): neume.Buffer", function() {
      var buffer = neume.Buffer.create(context, 4, 16, 44100);

      assert(buffer instanceof neume.Buffer);
      assert(buffer.sampleRate === 44100);
      assert(buffer.length === 16);
      assert(buffer.duration === 16 / 44100);
      assert(buffer.numberOfChannels === 4);
    });
  });

  describe(".from", function() {
    it("(context: neume.Context, from: Array<number>|Float32Array): neume.Buffer", function() {
      var buffer = neume.Buffer.from(context, [ 1, 2, 3, 4, 5, 6, 7, 8 ]);

      assert(buffer instanceof neume.Buffer);
      assert(buffer.sampleRate === context.sampleRate);
      assert(buffer.length === 8);
      assert(buffer.duration === 8 / context.sampleRate);
      assert(buffer.numberOfChannels === 1);
      assert.deepEqual(buffer[0], new Float32Array([ 1, 2, 3, 4, 5, 6, 7, 8 ]));
    });
  });

  describe(".load", function() {
    it("(context: neume.Context, url: string): Promise", function() {
      assert(neume.Buffer.load(context, "/fail") instanceof Promise);
    });
    it("(context: neume.Context, url: string): Promise(resolve)", function(done) {
      context.audioContext.DECODE_AUDIO_DATA_RESULT = audioBuffer;

      neume.Buffer.load(context, "/success").then(function(buffer) {
        assert(buffer instanceof neume.Buffer);
        assert(buffer.sampleRate === audioBuffer.sampleRate);
        assert(buffer.length === audioBuffer.length);
        assert(buffer.duration === audioBuffer.duration);
        assert(buffer.numberOfChannels === audioBuffer.numberOfChannels);
        done();
      }).catch(function() {
        done("SHOULD NOT REACHED");
      });
    });
    it("(context: neume.Context, url: string): Promise(relect)", function(done) {
      neume.Buffer.load(context, "/fail").then(function() {
        done("SHOULD NOT REACHED");
      }).catch(function() {
        done();
      });
    });
    it("(context: neume.Context, url: string): Promise(reject)", function(done) {
      context.audioContext.DECODE_AUDIO_DATA_FAILED = true;

      neume.Buffer.load(context, "/success").then(function() {
        done("SHOULD NOT REACHED");
      }).catch(function() {
        done();
      });
    });
  });

  describe("#sampleRate", function() {
    it("\\getter: number", function() {
      var buffer = new neume.Buffer(context, audioBuffer);

      assert(buffer.sampleRate === audioBuffer.sampleRate);
    });
  });

  describe("#length", function() {
    it("\\getter: number", function() {
      var buffer = new neume.Buffer(context, audioBuffer);

      assert(buffer.length === audioBuffer.length);
    });
  });

  describe("#duration", function() {
    it("\\getter: number", function() {
      var buffer = new neume.Buffer(context, audioBuffer);

      assert(buffer.duration === audioBuffer.duration);
    });
  });

  describe("#numberOfChannels", function() {
    it("\\getter: number", function() {
      var buffer = new neume.Buffer(context, audioBuffer);

      assert(buffer.numberOfChannels === audioBuffer.numberOfChannels);
    });
  });

  describe("#[index: number]", function() {
    it("\\getter: Float32Array", function() {
      var buffer = new neume.Buffer(context, audioBuffer);

      assert(buffer[0] === audioBuffer.getChannelData(0));
      assert(buffer[1] === audioBuffer.getChannelData(1));
    });
  });

  describe("#getChannelData", function() {
    it("(ch: number): Float32Array", function() {
      var buffer = new neume.Buffer(context, audioBuffer);

      assert(buffer.getChannelData(0) === audioBuffer.getChannelData(0));
      assert(buffer.getChannelData(1) === audioBuffer.getChannelData(1));
    });
  });

  describe("#concat", function() {
    it("(...buffers: neume.Buffer|AudioBuffer): neume.Buffer", function() {
      var a = neume.Buffer.from(context, [ 1, 2, 3 ]);
      var b = neume.Buffer.from(context, [ 4, 5, 6 ]);
      var c = neume.Buffer.from(context, [ 7, 8, 9 ]);
      var concatenated = a.concat(b, c, c, b, a);

      assert(concatenated instanceof neume.Buffer);

      assert.deepEqual(concatenated[0], new Float32Array([
        1, 2, 3,  4, 5, 6,  7, 8, 9,
        7, 8, 9,  4, 5, 6,  1, 2, 3
      ]));
    });
  });

  describe("#reverse", function() {
    it("(): neume.Buffer", function() {
      var buffer = new neume.Buffer(context, audioBuffer);
      var reversed = buffer.reverse();

      assert(reversed instanceof neume.Buffer);
      assert.deepEqual(reversed[0], new Float32Array(bufferData[0].slice().reverse()));
      assert.deepEqual(reversed[1], new Float32Array(bufferData[1].slice().reverse()));
    });
  });

  describe("#slice", function() {
    it("(): neume.Buffer", function() {
      var buffer = new neume.Buffer(context, audioBuffer);
      var sliced = buffer.slice();

      assert.deepEqual(sliced[0], new Float32Array(bufferData[0].slice()));
      assert.deepEqual(sliced[1], new Float32Array(bufferData[1].slice()));
    });
    it("(start: number, end: number): neume.Buffer // when (2, 5)", function() {
      var buffer = new neume.Buffer(context, audioBuffer);
      var sliced = buffer.slice(2, 5);

      assert(sliced instanceof neume.Buffer);
      assert(sliced !== buffer);
      assert(sliced.sampleRate === buffer.sampleRate);
      assert(sliced.length === 3);
      assert(sliced.duration === 3 / buffer.sampleRate);
      assert(sliced.numberOfChannels === buffer.numberOfChannels);
      assert.deepEqual(sliced[0], new Float32Array(bufferData[0].slice(2, 5)));
      assert.deepEqual(sliced[1], new Float32Array(bufferData[1].slice(2, 5)));
    });
    it("(start: number, end: number): neume.Buffer: // when (1, -3)", function() {
      var buffer = new neume.Buffer(context, audioBuffer);
      var sliced = buffer.slice(1, -3);

      assert.deepEqual(sliced[0], new Float32Array(bufferData[0].slice(1, -3)));
      assert.deepEqual(sliced[1], new Float32Array(bufferData[1].slice(1, -3)));
    });
    it("(start: number, end: number): neume.Buffer // when (-4, -1)", function() {
      var buffer = new neume.Buffer(context, audioBuffer);
      var sliced = buffer.slice(-4, -1);

      assert.deepEqual(sliced[0], new Float32Array(bufferData[0].slice(-4, -1)));
      assert.deepEqual(sliced[1], new Float32Array(bufferData[1].slice(-4, -1)));
    });
    it("(start: number, end: number): neume.Buffer // when (2, 2)", function() {
      var buffer = new neume.Buffer(context, audioBuffer);
      var sliced = buffer.slice(2, 0);

      assert.deepEqual(sliced[0], new Float32Array(1));
      assert.deepEqual(sliced[1], new Float32Array(1));
    });
  });

  describe("#split", function() {
    it("(n: number): neume.Buffer", function() {
      var buffer = new neume.Buffer(context, audioBuffer);
      var splitted = buffer.split(3);

      assert(splitted instanceof Array);
      assert(splitted.length === 3);
      assert(splitted[0] instanceof neume.Buffer);
      assert.deepEqual(splitted[0][0], new Float32Array([ 0, 1, 2 ]));
      assert.deepEqual(splitted[1][0], new Float32Array([ 3, 4, 5 ]));
      assert.deepEqual(splitted[2][0], new Float32Array([ 6, 7 ]));
    });
    it("(n: number): neume.Buffer // when 0", function() {
      var buffer = new neume.Buffer(context, audioBuffer);

      assert.deepEqual(buffer.split(0), []);
    });
  });

  describe("#normalize", function() {
    it("(): neume.Buffer", function() {
      var buffer = new neume.Buffer(context, audioBuffer);
      var normalized = buffer.normalize();

      var div7 = function(x) {
        return x / 7;
      };

      assert(normalized instanceof neume.Buffer);
      assert.deepEqual(normalized[0], new Float32Array(bufferData[0].map(div7)));
      assert.deepEqual(normalized[1], new Float32Array(bufferData[1].map(div7)));
    });
  });

  describe("#resample", function() {
    it("(size: number, interpolation: boolean): neume.Buffer // when (newSize, false)", function() {
      var buffer = new neume.Buffer(context, audioBuffer);
      var resampled = buffer.resample(12, false);

      assert(resampled instanceof neume.Buffer);
      assert.deepEqual(resampled[0], new Float32Array([ 0, 1, 1, 2, 3, 3, 4, 4, 5, 6, 6, 7 ]));
      assert.deepEqual(resampled[1], new Float32Array([ 7, 6, 6, 5, 4, 4, 3, 3, 2, 1, 1, 0 ]));
    });
    it("(size: number, interpolation: boolean): neume.Buffer // when (sameSize, false)", function() {
      var buffer = new neume.Buffer(context, audioBuffer);
      var resampled = buffer.resample(8, false);

      assert(resampled instanceof neume.Buffer);
      assert(resampled !== buffer);
      assert(resampled[0] !== bufferData[0]);
      assert(resampled[1] !== bufferData[1]);
      assert.deepEqual(resampled[0], new Float32Array(bufferData[0]));
      assert.deepEqual(resampled[1], new Float32Array(bufferData[1]));
    });
    it("(size: number, interpolation: boolean): neume.Buffer // when (newSize, true)", function() {
      var buffer = new neume.Buffer(context, audioBuffer);
      var resampled = buffer.resample(12, true);

      assert(resampled instanceof neume.Buffer);
      assert.deepEqual(resampled[0], new Float32Array([
        0,
        0.6363636255264282,
        1.2727272510528564,
        1.9090908765792847,
        2.545454502105713,
        3.1818182468414307,
        3.8181817531585693,
        4.454545497894287,
        5.090909004211426,
        5.7272725105285645,
        6.363636493682861,
        7,
      ]));
      assert.deepEqual(resampled[1], new Float32Array([
        7,
        6.363636493682861,
        5.7272725105285645,
        5.090909004211426,
        4.454545497894287,
        3.8181817531585693,
        3.1818182468414307,
        2.545454502105713,
        1.9090908765792847,
        1.2727272510528564,
        0.6363636255264282,
        0,
      ]));
    });
    it("(size: number, interpolation: boolean=true): neume.Buffer // when (newSize)", function() {
      var buffer = new neume.Buffer(context, audioBuffer);
      var resampled = buffer.resample(12);

      assert(resampled instanceof neume.Buffer);
      assert.deepEqual(resampled[0], new Float32Array([
        0,
        0.6363636255264282,
        1.2727272510528564,
        1.9090908765792847,
        2.545454502105713,
        3.1818182468414307,
        3.8181817531585693,
        4.454545497894287,
        5.090909004211426,
        5.7272725105285645,
        6.363636493682861,
        7,
      ]));
      assert.deepEqual(resampled[1], new Float32Array([
        7,
        6.363636493682861,
        5.7272725105285645,
        5.090909004211426,
        4.454545497894287,
        3.8181817531585693,
        3.1818182468414307,
        2.545454502105713,
        1.9090908765792847,
        1.2727272510528564,
        0.6363636255264282,
        0,
      ]));
    });
  });

  describe("#toPeriodicWave", function() {
    it("(): PeriodicWave", sinon.test(function() {
      var spy = this.spy(neume.FFT, "forward");
      var buffer = neume.Buffer.from(context, new Float32Array(8192));
      var wave = buffer.toPeriodicWave();

      assert(wave instanceof global.PeriodicWave);
      assert(spy.firstCall.args[0].length === 4096);
    }));
  });

});
