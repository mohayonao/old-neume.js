module.exports = function(neume, util) {
  "use strict";

  var WEB_AUDIO_MAX_DELAY_TIME = neume.MAX_DELAY_SEC;

  /**
   * $("delay", {
   *   delayTime: signal = 0,
   *   feedback: signal = 0,
   *   maxDelayTime: number = 0,
   *   mul: signal = 1,
   *   add: signal = 0,
   * }, ...inputs: signal)
   *
   * +-----------+     +-----------+
   * | inputs[0] | ... | inputs[N] |
   * +-----------+     +-----------+
   *   |                 |
   *   +-----------------+
   *   |
   *   |                    +-----+
   *   |                    |     |
   * +------------------------+   |
   * | DelayNode              |   |
   * | - delayTime: delayTime |   |
   * +------------------------+   |
   *   |      |                   |
   *   |    +------------------+  |
   *   |    | GainNode         |  |
   *   |    | - gain: feedback |  |
   *   |    +------------------+  |
   *   |      |                   |
   *   |      +-------------------+
   *   |
   */
  neume.register("delay", function(ugen, spec, inputs) {
    return make(ugen, spec, inputs);
  });

  function make(ugen, spec, inputs) {
    var context = ugen.context;

    var delayTime = context.toSeconds(util.defaults(spec.delay, spec.delayTime, 0));
    var feedback = util.defaults(spec.fb, spec.feedback, 0);
    var maxDelayTime;

    if (typeof delayTime === "number") {
      delayTime = util.clip(util.finite(delayTime), 0, WEB_AUDIO_MAX_DELAY_TIME);
      maxDelayTime = delayTime;
    } else {
      maxDelayTime = util.finite(context.toSeconds(util.defaults(spec.maxDelay, spec.maxDelayTime, 1)));
    }
    maxDelayTime = util.clip(maxDelayTime, 1 / context.sampleRate, WEB_AUDIO_MAX_DELAY_TIME);

    var outlet = context.createDelay(maxDelayTime);

    outlet.delayTime.value = 0;
    context.connect(delayTime, outlet.delayTime);

    if (feedback !== 0) {
      var feedbackNode = context.createGain();

      feedbackNode.gain.value = 0;

      context.connect(outlet, feedbackNode);
      context.connect(feedback, feedbackNode.gain);

      inputs = inputs.concat(feedbackNode);
    }

    context.connect(inputs, outlet);

    return new neume.Unit({
      outlet: outlet
    });
  }

};
