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
    return make(whiteNoise, ugen);
  });

  neuma.register("pink", function(ugen) {
    pinkNoise = pinkNoise || generatePinkNoise(ugen.$context.sampleRate);
    return make(pinkNoise, ugen);
  });

  function make(data, ugen) {
    var buf = ugen.$context.createBuffer(1, data.length, ugen.$context.sampleRate);
    var bufSrc = ugen.$context.createBufferSource();

    buf.getChannelData(0).set(data);

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
    var noise = new Float32Array(sampleRate);

    var whites = new Uint8Array([
      (Math.random() * 1073741824) % 25,
      (Math.random() * 1073741824) % 25,
      (Math.random() * 1073741824) % 25,
      (Math.random() * 1073741824) % 25,
      (Math.random() * 1073741824) % 25,
    ]);

    var MAX_KEY = 31;
    var key = 0;
    var last_key, diff;

    for (var i = 0, imax = noise.length; i < imax; i++) {
      last_key = key++;
      key &= MAX_KEY;

      diff = last_key ^ key;

      var sum = 0;
      for (var j = 0; j < 5; ++j) {
        if (diff & (1 << j)) {
          whites[j] = (Math.random() * 1073741824) % 25;
        }
        sum += whites[j];
      }

      noise[i] = (sum * 0.01666666) - 1;
    }

    return noise;
  }

};
