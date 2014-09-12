"use strict";

var NeuContext = require("../src/context");
var NeuBuffer = require("../src/buffer");
var FFT = require("../src/fft");

describe("NeuBuffer", function() {
  var audioContext = null;
  var context = null;
  var audioBuffer = null;
  var buffer = null;
  var bufferData = [ [ 0, 1, 2, 3, 4, 5, 6, 7 ], [ 7, 6, 5, 4, 3, 2, 1, 0 ] ];

  beforeEach(function() {
    audioContext = new window.AudioContext();
    context = new NeuContext(audioContext);
    audioBuffer = audioContext.createBuffer(2, 8, 44100);
    audioBuffer.getChannelData(0).set(new Float32Array(bufferData[0]));
    audioBuffer.getChannelData(1).set(new Float32Array(bufferData[1]));
    buffer = new NeuBuffer(context, audioBuffer);
  });

  describe("(context, audioBuffer)", function() {
    it("returns an instance of NeuBuffer with the given buffer", function() {
      assert(buffer instanceof NeuBuffer);
    });
  });

  describe(".create(context, channels, length, sampleRate)", function() {
    it("returns an instance of NeuBuffer", function() {
      var buffer = NeuBuffer.create(context, 4, 16, 44100);

      assert(buffer instanceof NeuBuffer);
      assert(buffer.sampleRate === 44100);
      assert(buffer.length === 16);
      assert(buffer.duration === 16 / 44100);
      assert(buffer.numberOfChannels === 4);
    });
  });

  describe(".fill(context, length, func)", function() {
    it("returns an instance of NeuBuffer", function() {
      var buffer = NeuBuffer.fill(context, 4, [ 1 ]);

      assert(buffer instanceof NeuBuffer);
      assert(buffer.sampleRate === audioContext.sampleRate);
      assert(buffer.length === 4);
      assert(buffer.duration === 4 / audioContext.sampleRate);
      assert(buffer.numberOfChannels === 1);
      assert.deepEqual(buffer[0], new Float32Array([ 1, 1, 1, 1 ]));
    });
    it("returns an instance of NeuBuffer", function() {
      var buffer = NeuBuffer.fill(context, 4, function(i) {
        return i;
      });

      assert(buffer instanceof NeuBuffer);
      assert(buffer.sampleRate === audioContext.sampleRate);
      assert(buffer.length === 4);
      assert(buffer.duration === 4 / audioContext.sampleRate);
      assert(buffer.numberOfChannels === 1);
      assert.deepEqual(buffer[0], new Float32Array([ 0, 1, 2, 3 ]));
    });
  });

  describe(".from(context, from)", function() {
    it("returns an instance of NeuBuffer", function() {
      var buffer = NeuBuffer.from(context, [ 1, 2, 3, 4, 5, 6, 7, 8 ]);

      assert(buffer instanceof NeuBuffer);
      assert(buffer.sampleRate === audioContext.sampleRate);
      assert(buffer.length === 8);
      assert(buffer.duration === 8 / audioContext.sampleRate);
      assert(buffer.numberOfChannels === 1);
      assert.deepEqual(buffer[0], new Float32Array([ 1, 2, 3, 4, 5, 6, 7, 8 ]));
    });
  });

  describe(".load(context, url)", function() {
    it("returns an instance of Promise", function() {
      assert(NeuBuffer.load(context, "/fail") instanceof window.Promise);
    });
    it("resolves the promise with an instance of NeuBuffer when success", function() {
      audioContext.DECODE_AUDIO_DATA_RESULT = audioBuffer;
      return NeuBuffer.load(context, "/success").then(function(result) {
        assert(buffer instanceof NeuBuffer);
        assert(buffer.sampleRate === audioBuffer.sampleRate);
        assert(buffer.length === audioBuffer.length);
        assert(buffer.duration === audioBuffer.duration);
        assert(buffer.numberOfChannels === audioBuffer.numberOfChannels);
      });
    });
    it("rejects the promise when failed in XMLHttpRequest", function() {
      var passed = null;
      return NeuBuffer.load(context, "/fail").then(function() {
        passed = new Error("NOT REACHED");
        throw passed;
      }).catch(function() {
        assert(passed === null);
      });
    });
    it("rejects the promise when failed in decodeAudioData", function() {
      var passed = null;
      audioContext.DECODE_AUDIO_DATA_FAILED = true;
      return NeuBuffer.load(context, "/success").then(function() {
        passed = new Error("NOT REACHED");
        throw passed;
      }).catch(function() {
        assert(passed === null);
      });
    });
  });

  describe("#sampleRate", function() {
    it("points to AudioBuffer#sampleRate", function() {
      assert(buffer.sampleRate === 44100);
    });
  });

  describe("#length", function() {
    it("points to AudioBuffer#length", function() {
      assert(buffer.length === 8);
    });
  });

  describe("#duration", function() {
    it("points to AudioBuffer#duration", function() {
      assert(buffer.duration === 8 / 44100);
    });
  });

  describe("#numberOfChannels", function() {
    it("points to AudioBuffer#numberOfChannels", function() {
      assert(buffer.numberOfChannels === 2);
    });
  });

  describe("#[index]", function() {
    it("points to AudioBuffer#getChannelData(index)", function() {
      assert(buffer[0] === audioBuffer.getChannelData(0));
      assert(buffer[1] === audioBuffer.getChannelData(1));
    });
  });

  describe("#getChannelData(ch)", function() {
    it("points to AudioBuffer#getChannelData(ch)", function() {
      assert(buffer.getChannelData(0) === audioBuffer.getChannelData(0));
      assert(buffer.getChannelData(1) === audioBuffer.getChannelData(1));
    });
  });

  describe("#concat(...buffer)", function() {
    it("return new NeuBuffer instance that concatenates this + ...buffer", function() {
      var a = NeuBuffer.from(context, [ 1, 2, 3 ]);
      var b = NeuBuffer.from(context, [ 4, 5, 6 ]);
      var c = NeuBuffer.from(context, [ 7, 8, 9 ]);
      var concatenated = a.concat(b, c, c, b, a);

      assert(concatenated instanceof NeuBuffer);

      assert.deepEqual(concatenated[0], new Float32Array([
        1, 2, 3,  4, 5, 6,  7, 8, 9,
        7, 8, 9,  4, 5, 6,  1, 2, 3
      ]));
    });
  });

  describe("#reverse()", function() {
    it("returns new NeuBuffer instance that reversed", function() {
      var reversed = buffer.reverse();

      assert(reversed instanceof NeuBuffer);
      assert.deepEqual(reversed[0], new Float32Array(bufferData[0].slice().reverse()));
      assert.deepEqual(reversed[1], new Float32Array(bufferData[1].slice().reverse()));
    });
  });

  describe("#slice(start, end)", function() {
    it("returns new NeuBuffer instance that has sliced buffers", function() {
      var sliced = buffer.slice(2, 5);

      assert(sliced instanceof NeuBuffer);
      assert(sliced !== buffer);
      assert(sliced.sampleRate === buffer.sampleRate);
      assert(sliced.length === 3);
      assert(sliced.duration === 3 / buffer.sampleRate);
      assert(sliced.numberOfChannels === buffer.numberOfChannels);
      assert.deepEqual(sliced[0], new Float32Array(bufferData[0].slice(2, 5)));
      assert.deepEqual(sliced[1], new Float32Array(bufferData[1].slice(2, 5)));
    });
    it("()", function() {
      var sliced = buffer.slice();

      assert.deepEqual(sliced[0], new Float32Array(bufferData[0].slice()));
      assert.deepEqual(sliced[1], new Float32Array(bufferData[1].slice()));
    });
    it("(1, -3)", function() {
      var sliced = buffer.slice(1, -3);

      assert.deepEqual(sliced[0], new Float32Array(bufferData[0].slice(1, -3)));
      assert.deepEqual(sliced[1], new Float32Array(bufferData[1].slice(1, -3)));
    });
    it("(-4, -1)", function() {
      var sliced = buffer.slice(-4, -1);

      assert.deepEqual(sliced[0], new Float32Array(bufferData[0].slice(-4, -1)));
      assert.deepEqual(sliced[1], new Float32Array(bufferData[1].slice(-4, -1)));
    });
    it("(2, 2)", function() {
      var sliced = buffer.slice(2, 0);

      assert.deepEqual(sliced[0], new Float32Array(1));
      assert.deepEqual(sliced[1], new Float32Array(1));
    });
  });

  describe("#split(n)", function() {
    it("returns an array that contains splitted buffer", function() {
      var splitted = buffer.split(3);

      assert(splitted instanceof Array);
      assert(splitted.length === 3);
      assert(splitted[0] instanceof NeuBuffer);
      assert.deepEqual(splitted[0][0], new Float32Array([ 0, 1, 2 ]));
      assert.deepEqual(splitted[1][0], new Float32Array([ 3, 4, 5 ]));
      assert.deepEqual(splitted[2][0], new Float32Array([ 6, 7 ]));
    });
    it("returns an empty array if given invalid number", function() {
      assert.deepEqual(buffer.split(0), []);
    });
  });

  describe("#normalize()", function() {
    it("returns new NeuBuffer instance that normalized", function() {
      var normalized = buffer.normalize();

      var div7 = function(x) { return x / 7; };

      assert(normalized instanceof NeuBuffer);
      assert.deepEqual(normalized[0], new Float32Array(bufferData[0].map(div7)));
      assert.deepEqual(normalized[1], new Float32Array(bufferData[1].map(div7)));
    });
  });

  describe("#resample(size, interpolation)", function() {
    it("returns new NeuBuffer instance that resampled", function() {
      var resampled = buffer.resample(12, false);

      assert(resampled instanceof NeuBuffer);
      assert.deepEqual(resampled[0], new Float32Array([ 0, 1, 1, 2, 3, 3, 4, 4, 5, 6, 6, 7 ]));
      assert.deepEqual(resampled[1], new Float32Array([ 7, 6, 6, 5, 4, 4, 3, 3, 2, 1, 1, 0 ]));
    });
    it("returns new NeuBuffer instance that non-resampled (same size)", function() {
      var resampled = buffer.resample(8, false);

      assert(resampled instanceof NeuBuffer);
      assert(resampled !== buffer);
      assert(resampled[0] !== bufferData[0]);
      assert(resampled[1] !== bufferData[1]);
      assert.deepEqual(resampled[0], new Float32Array(bufferData[0]));
      assert.deepEqual(resampled[1], new Float32Array(bufferData[1]));
    });
    it("returns new NeuBuffer instance that resampled with interpolation", function() {
      var resampled = buffer.resample(12, true);

      assert(resampled instanceof NeuBuffer);
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

  describe("#toPeriodicWave()", function() {
    it("returns an instance of PeriodicWave", function() {
      var wave = buffer.toPeriodicWave();

      assert(wave instanceof window.PeriodicWave);
    });
    it("clip a buffer if over 4096", sinon.test(function() {
      var spy = this.spy(FFT, "forward");
      var buffer = NeuBuffer.from(context, new Float32Array(8192));
      var wave = buffer.toPeriodicWave();

      assert(wave instanceof window.PeriodicWave);
      assert(spy.firstCall.args[0].length === 4096);
    }));
  });

});
