(function(plugin) {
  "use strict";

  // Module systems magic dance.

  if (typeof require === "function" && typeof exports === "object" && typeof module === "object") {
    // NodeJS
    module.exports = plugin;
  } else if (typeof define === "function" && define.amd) {
    // AMD
    define(function() {
      return plugin;
    });
  } else {
    // Other environment (usually <script> tag): plug in to global chai instance directly.
    neume.use(plugin);
  }

})(function(neume, _) {
  "use strict";

  neume.register("pluck", function(ugen, spec) {
    var context = ugen.$context;
    var outlet  = null;

    var frequency = context.toFrequency(_.defaults(spec.freq, 440));

    var noise = createNoiseChunk(Math.round(context.sampleRate / frequency));
    var bufSrc = createNoiseChunkBufferSource(context, noise);

    var lpf = context.createBiquadFilter();
    lpf.type = "lowpass";
    lpf.Q.value = 1;
    lpf.frequency.value = 12000;

    context.connect(bufSrc, lpf);

    outlet = lpf;

    return new neume.Unit({
      outlet: outlet,
      start: function(t) {
        bufSrc.start(t);
        lpf.frequency.setTargetAtTime(0, t, 0.25);
      },
      stop: function(t) {
        bufSrc.stop(t);
      }
    });
  });

  function createNoiseChunk(size) {
    var data = new Float32Array(size);

    for (var i = 0; i < size; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    return data;
  }

  function createNoiseChunkBufferSource(context, data) {
    var bufSrc = context.createBufferSource();

    var buf = context.createBuffer(1, data.length, context.sampleRate);

    buf.getChannelData(0).set(data);

    bufSrc.buffer = buf;
    bufSrc.loop = true;

    return bufSrc;
  }

});
