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

  var MAX_DELAY_SEC = neume.MAX_DELAY_SEC;

  /**
   * y[n] = gain * x[n] + ffGain * x[n-ffDaley] + fbGain * y[n-fbDelay]
   *
   * +--------+
   * | inputs |
   * +--------+
   *   |
   *   +-----------------+
   *   |                 |
   *   |               +----------------------+
   *   |               | DelayNode            |
   *   |               | - delayTime: ffDelay |
   *   |               +----------------------+
   *   |                 |
   * +--------------+  +----------------+
   * | GainNode     |  | GainNode       |
   * | - gain: gain |  | - gain: ffGain |
   * +--------------+  +----------------+
   *   |
   *   +-------------------------------+
   *   |                               |
   * +-----------+                     |
   * | GainNode  |                     |
   * | - gain: 1 |                     |
   * +-----------+                     |
   *   |       |                       |
   *   |     +----------------------+  |
   *   |     | DelayNode            |  |
   *   |     | - delayTime: fbDelay |  |
   *   |     +----------------------+  |
   *   |       |                       |
   *   |     +----------------+        |
   *   |     | GainNode       |        |
   *   |     | - gain: fbGain |        |
   *   |     +----------------+        |
   *   |       |                       |
   *   |       +-----------------------+
   *   |
   */
  neume.register("comb", function(ugen, spec, inputs) {
    return make(ugen, {
      gain: spec.gain,
      ffGain: spec.ffGain,
      fbGain: spec.fbGain,
      ffDelay: spec.delay,
      fbDelay: spec.delay,
      ffMaxDelayTime: spec.maxDelayTime,
      fbMaxDelayTime: spec.maxDelayTime,
    }, inputs);
  });

  neume.register("teeth", function(ugen, spec, inputs) {
    return make(ugen, {
      gain: spec.gain,
      ffGain: spec.ffGain,
      fbGain: spec.fbGain,
      ffDelay: spec.ffDelay,
      fbDelay: spec.fbDelay,
      ffMaxDelayTime: spec.ffMaxDelayTime,
      fbMaxDelayTime: spec.fbMaxDelayTime,
    }, inputs);
  });

  function make(ugen, spec, inputs) {
    var context = ugen.context;
    var outlet = null;
    var gainNode, ffNode, fbNode;

    var gain = util.defaults(spec.gain, 0);
    var ffGain = util.defaults(spec.ffGain, 0);
    var fbGain = util.defaults(spec.fbGain, 0);
    var ffDelay = util.defaults(context.toSeconds(spec.ffDelay), 0.001);
    var fbDelay = util.defaults(context.toSeconds(spec.fbDelay), 0.001);

    var sum = new neume.Sum(context, inputs);

    if (gain !== 0) {
      outlet = util.defaults(outlet, context.createGain());
      gainNode = createGain(context, gain);
      context.connect(sum, gainNode.inlet);
      context.connect(gainNode.outlet, outlet);
    }

    if (ffGain !== 0) {
      outlet = util.defaults(outlet, context.createGain());
      if (ffDelay !== 0) {
        ffNode = createDelayGain(context, ffDelay, spec.ffMaxDelayTime, ffGain);
      } else {
        ffNode = createGain(context, ffGain);
      }
      context.connect(sum, ffNode.inlet);
      context.connect(ffNode.outlet, outlet);
    }

    if (fbGain !== 0) {
      if (outlet === null) {
        outlet = context.createGain();
        context.connect(sum, outlet);
      }
      if (fbDelay !== 0) {
        fbNode = createDelayGain(context, fbDelay, spec.fbMaxDelayTime, fbGain);
      } else {
        fbNode = createGain(context, fbGain);
      }
      context.connect(outlet, fbNode.inlet);
      context.connect(fbNode.outlet, outlet);
    }

    if (outlet === null) {
      outlet = context.createDC(0);
    }

    return new neume.Unit({
      outlet: outlet
    });
  }

  function createDelayGain(context, delayTime, maxDelayTime, gain) {
    var delayNode = createDelay(context, delayTime, maxDelayTime);
    var gainNode = context.createGain();

    gainNode.gain.value = 0;
    context.connect(gain, gainNode.gain);

    context.connect(delayNode, gainNode);

    return { inlet: delayNode, outlet: gainNode };
  }

  function createGain(context, gain) {
    var gainNode = context.createGain();

    gainNode.gain.value = 0;
    context.connect(gain, gainNode.gain);

    return { inlet: gainNode, outlet: gainNode };
  }

  function createDelay(context, delayTime, maxDelayTime) {
    if (typeof delayTime === "number") {
      delayTime = util.clip(delayTime, 0, MAX_DELAY_SEC);
      maxDelayTime = delayTime;
    } else {
      maxDelayTime = util.finite(util.defaults(context.toSeconds(maxDelayTime), 1));
    }
    maxDelayTime = util.clip(maxDelayTime, 1 / context.sampleRate, MAX_DELAY_SEC);

    var delayNode = context.createDelay(maxDelayTime);

    delayNode.delayTime.value = 0;
    context.connect(delayTime, delayNode.delayTime);

    return delayNode;
  }

});
