module.exports = function(neume) {
  "use strict";

  var NOISE_DURATION = 4;

  /**
   * $("white")
   *
   * $("pink")
   *
   * +------------------+
   * | BufferSourceNode |
   * | - loop: true     |
   * +------------------+
   *   |
   */
  neume.register("white", function(ugen) {
    whiteNoise = whiteNoise || new WhiteNoise(ugen.$context.sampleRate * NOISE_DURATION);
    return make(whiteNoise, ugen);
  });

  neume.register("pink", function(ugen) {
    pinkNoise = pinkNoise || new PinkNoise(ugen.$context.sampleRate * NOISE_DURATION);
    return make(pinkNoise, ugen);
  });

  function make(data, ugen) {
    var buf = ugen.$context.createBuffer(1, data.length, ugen.$context.sampleRate);
    var bufSrc = ugen.$context.createBufferSource();

    buf.getChannelData(0).set(data);

    bufSrc.buffer = buf;
    bufSrc.loop = true;

    return new neume.Unit({
      outlet: bufSrc,
      start: function(t) {
        bufSrc.start(t);
      },
      stop: function(t) {
        bufSrc.stop(t);
      }
    });
  }

  var whiteNoise = null;
  var pinkNoise = null;

  function WhiteNoise(length) {
    var data = new Float32Array(length);

    for (var i = 0, imax = data.length; i < imax; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    return data;
  }

  function PinkNoise(length) {
    // DSP generation of Pink (1/f) Noise
    // http://www.firstpr.com.au/dsp/pink-noise/

    var data = new Float32Array(length);

    var white;
    var b0 = 0;
    var b1 = 0;
    var b2 = 0;
    var b3 = 0;
    var b4 = 0;
    var b5 = 0;
    var b6 = 0;

    for (var i = 0, imax = data.length; i < imax; i++) {
      white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      data[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
      data[i] *= 0.12; // adjust gain
      b6 = white * 0.115926;
    }

    return data;
  }
};
