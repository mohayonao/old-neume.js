(function(plugin) {
  "use strict";

  // Module systems magic dance.

  if (typeof require === "function" && typeof exports === "object" && typeof module === "object") {
    // NodeJS
    module.exports = plugin;
  } else if (typeof define === "function" && define.amd) {
    // AMD
    define(function () {
        return plugin;
    });
  } else {
    // Other environment (usually <script> tag): plug in to global chai instance directly.
    neume.use(plugin);
  }

})(function(neume, _) {
  "use strict";

  neume.register("impulse", function(ugen, spec) {
    var context = ugen.$context;
    var outlet  = context.createScriptProcessor(512, 0, 1);

    var level = _.finite(_.defaults(spec.level, 1));

    var startTime  = Infinity;
    var sampleRate = context.sampleRate;
    var processDur = 512 / sampleRate;
    var ended = false;

    outlet.onaudioprocess = function(e) {
      if (ended) {
        return;
      }

      var t0 = e.playbackTime || context.currentTime;
      var t1 = t0 + processDur;

      if (startTime < t0 || (t0 <= startTime && startTime <= t1)) {
        var index = (startTime - t0) / (1 / sampleRate);

        index = Math.max(0, Math.min(index|0, 511));
        e.outputBuffer.getChannelData(0)[index] = level;
        ended = true;

        ugen.emit("end", {
          playbackTime: startTime
        }, ugen.$synth);
      }
    };

    return new neume.Unit({
      outlet: outlet,
      start: function(t) {
        startTime = t;
      }
    });
  });

});
