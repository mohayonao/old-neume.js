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

})(function(neume, util) {
  "use strict";

  neume.register("debug~", function(ugen, spec, inputs) {
    var context = ugen.context;
    var outlet = context.createScriptProcessor(2048, 1, 1);

    var interval = util.finite(util.defaults(spec.interval, 1)) * context.sampleRate;
    var label = String(spec.label || "");
    var samples = 0;

    if (label) {
      label = label + ": ";
    }

    interval = Math.max(1, interval|0);

    outlet.onaudioprocess = function(e) {
      var input = e.inputBuffer.getChannelData(0);
      var length = input.length;

      for (var i = 0; i < length; i++) {
        samples += 1;
        if (samples === interval) {
          console.log(label + input[i]);
          samples = 0;
        }
      }

      e.outputBuffer.getChannelData(0).set(input);
    };

    new neume.Sum(context, inputs).connect(outlet);

    return new neume.Unit({
      outlet: outlet
    });
  });

});
