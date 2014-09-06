module.exports = function(neuma) {
  "use strict";

  /**
   * +------------------+
   * | BufferSourceNode |
   * | - loop: true     |
   * +------------------+
   *   |
   */
  neuma.register("white", function(ugen) {
    whiteNoise = whiteNoise || generateWhiteNoise(ugen.$context.sampleRate);

    var buf = ugen.$context.createBuffer(1, whiteNoise.length, ugen.$context.sampleRate);
    var bufSrc = ugen.$context.createBufferSource();

    buf.getChannelData(0).set(whiteNoise);

    bufSrc.buffer = buf;
    bufSrc.loop   = true;

    return new neuma.Unit({
      outlet: bufSrc,
      start: function(t) {
        bufSrc.start(t);
      },
      stop: function(t) {
        bufSrc.stop(t);
      }
    });
  });

  var whiteNoise = null;

  function generateWhiteNoise(sampleRate) {
    var noise = new Float32Array(sampleRate);

    for (var i = 0, imax = noise.length; i < imax; i++) {
      noise[i] = Math.random() * 2.0 - 1.0;
    }

    return noise;
  }

};
