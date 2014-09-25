module.exports = function(neume) {
  "use strict";

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
    whiteNoise = whiteNoise || generateWhiteNoise(ugen.$context.sampleRate);
    return make(whiteNoise, ugen);
  });

  neume.register("pink", function(ugen) {
    pinkNoise = pinkNoise || generatePinkNoise(ugen.$context.sampleRate);
    return make(pinkNoise, ugen);
  });

  function make(data, ugen) {
    var buf = ugen.$context.createBuffer(1, data.length, ugen.$context.sampleRate);
    var bufSrc = ugen.$context.createBufferSource();

    buf.getChannelData(0).set(data);

    bufSrc.buffer = buf;
    bufSrc.loop   = true;

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
  var pinkNoise  = null;

  function generateWhiteNoise(sampleRate) {
    var noise = new Float32Array(sampleRate);

    for (var i = 0, imax = noise.length; i < imax; i++) {
      noise[i] = Math.random() * 2.0 - 1.0;
    }

    return noise;
  }

  function generatePinkNoise(sampleRate) {
    // DSP generation of Pink (1/f) Noise
    // http://www.firstpr.com.au/dsp/pink-noise/

    var noise = new Float32Array(sampleRate);

    var white;
    var b0 = 0;
    var b1 = 0;
    var b2 = 0;
    var b3 = 0;
    var b4 = 0;
    var b5 = 0;
    var b6 = 0;

    for (var i = 0, imax = noise.length; i < imax; i++) {
      white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      noise[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
      noise[i] *= 0.12; // adjust gain
      b6 = white * 0.115926;
    }

    return noise;
  }
};
