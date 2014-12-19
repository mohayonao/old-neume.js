module.exports = function(neume) {
  "use strict";

  var NOISE_DURATION = 4;
  var KVSKEY = "@neume:noise:";

  /**
   * $("noise", {
   *   type: string = "white",
   *   mul: signal = 1,
   *   add: signal = 0,
   * })
   *
   * aliases:
   * $("white"), $("pink"), $("brown")
   *
   * +------------------+
   * | BufferSourceNode |
   * | - loop: true     |
   * +------------------+
   *   |
   */
  neume.register("noise", function(ugen, spec) {
    var type = {
      pink: "pink",
      brown: "brown"
    }[spec.type] || "white";
    return make(type, ugen);
  });

  [
    "white", "pink", "brown"
  ].forEach(function(type) {
    neume.register(type, function(ugen) {
      return make(type, ugen);
    });
  });

  function make(type, ugen) {
    var context = ugen.context;
    var bufSrc = context.createBufferSource();

    bufSrc.buffer = neume.KVS.get(KVSKEY + type, context, NOISE_DURATION);
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

  // http://noisehack.com/generate-noise-web-audio-api/

  neume.KVS.set(KVSKEY + "white", function(context, duration) {
    var length = context.sampleRate * duration;
    var data = new Float32Array(length);

    for (var i = 0, imax = data.length; i < imax; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    var buf = context.createBuffer(1, length, context.sampleRate);
    buf.getChannelData(0).set(data);
    return buf;
  });

  neume.KVS.set(KVSKEY + "pink", function(context, duration) {
    var length = context.sampleRate * duration;
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
      data[i] *= 0.11; // (roughly) compensate for gain
      b6 = white * 0.115926;
    }

    var buf = context.createBuffer(1, length, context.sampleRate);
    buf.getChannelData(0).set(data);
    return buf;
  });

  neume.KVS.set(KVSKEY + "brown", function(context, duration) {
    var length = context.sampleRate * duration;
    var data = new Float32Array(length);

    var white;
    var lastOut = 0;

    for (var i = 0, imax = data.length; i < imax; i++) {
      white = Math.random() * 2 - 1;
      data[i] = (lastOut + (0.02 * white)) / 1.02;
      lastOut = data[i];
      data[i] *= 3.5; // (roughly) compensate for gain
    }

    var buf = context.createBuffer(1, length, context.sampleRate);
    buf.getChannelData(0).set(data);
    return buf;
  });

};
