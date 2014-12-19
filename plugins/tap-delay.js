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
   * $("tap-delay", {
   *   delays: [], feedback: 0, mul: 1, add: 0
   * })
   *
   * +--------+
   * | inputs |
   * +--------+
   *   |
   *   +-------------------------------------------------------------------------+
   *   |                                                                         |
   * +-----------+                                                               |
   * | GainNode  |                                                               |
   * | - gain: 1 |                                                               |
   * +-----------+                                                               |
   *   |                                                                         |
   *   +------------------+                                                      |
   *   |                  |                                                      |
   *   |                +------------------------+                               |
   *   |                | DelayNode              |                               |
   *   |                | - delayTime: delays[0] |                               |
   *   |                +------------------------+                               |
   *   |                  |                                                      |
   *   |                  +--------------------------+                           |
   *   |                  |                          |                           |
   *   |                  |                          |                           |
   *   |                  |                         +-------------------------+  |
   *   |                  |                         | DelayNode               |  |
   *   |                  |                         | - delayTime: delays[2N] |  |
   *   |                  |                         +-------------------------+  |
   *   |                  |                           |                          |
   *  +--------------+  +-------------------+       +----------------------+     |
   *  | GainNode     |  | GainNode          |       | GainNode             |     |
   *  | - gain: gain |  | - gain: delays[1] |       | - gain: delays[2N+1] |     |
   *  +--------------+  +-------------------+       +----------------------+     |
   *    |                 |                           |                          |
   *  +-------------------------------------------------+                        |
   *  | GainNode                                        |                        |
   *  | - gain: 1                                       |                        |
   *  +-------------------------------------------------+                        |
   *    |                                                                        |
   *    +----+                                                                   |
   *    |    |                                                                   |
   *    |  +------------------+                                                  |
   *    |  | GainNode         |                                                  |
   *    |  | - gain: feedback |                                                  |
   *    |  +------------------+                                                  |
   *    |    |                                                                   |
   *    |    +-------------------------------------------------------------------+
   *    |
   *    |
   */
  neume.register("tap-delay", function(ugen, spec, inputs) {
    var context = ugen.context;
    var inlet = context.createGain();
    var outlet = context.createGain();

    var delays = spec.delays;
    var gain = util.defaults(spec.gain, 0.5);
    var feedback = util.defaults(spec.feedback, 0);
    var maxDelayTime = util.defaults(context.toSeconds(spec.maxDelayTime), 1);

    if (Array.isArray(delays)) {
      delays = delays.reduce(function(a, b) {
        if (Array.isArray(b) && b.length % 2 === 1) {
          b = b.concat(0);
        }
        return a.concat(b);
      }, []);
    } else {
      delays = [];
    }

    new neume.Sum(context, inputs).connect(inlet);

    var gainNode = context.createGain();

    gainNode.gain.value = 0;
    context.connect(gain, gainNode.gain);
    context.connect(gainNode, outlet);

    var tap = inlet;

    for (var i = 0, imax = delays.length; i < imax; i += 2) {
      var node = createDelayGain(context, context.toSeconds(delays[i]), maxDelayTime, delays[i + 1]);
      context.connect(tap, node.inlet);
      context.connect(node.outlet, outlet);
      tap = node.inlet;
    }

    if (feedback !== 0) {
      var fbNode = context.createGain();

      fbNode.gain.value = 0;
      context.connect(feedback, fbNode.gain);

      context.connect(outlet, fbNode);
      context.connect(fbNode, inlet);
    }

    return new neume.Unit({
      outlet: outlet
    });
  });

  function createDelayGain(context, delayTime, maxDelayTime, gain) {
    var delayNode = createDelay(context, delayTime, maxDelayTime);
    var gainNode = context.createGain();

    gainNode.gain.value = 0;
    context.connect(gain, gainNode.gain);

    context.connect(delayNode, gainNode);

    return { inlet: delayNode, outlet: gainNode };
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
