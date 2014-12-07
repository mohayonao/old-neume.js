module.exports = function(neume, util) {
  "use strict";

  var WEB_AUDIO_MAX_DELAY_TIME = neume.MAX_DELAY_SEC;

  /**
   * $("delay", {
   *   delayTime: [number|UGen] = 0
   *   feedback: [number|UGen] = 0
   *   maxDelay: [number] = delay
   * } ... inputs)
   *
   * +--------+
   * | inputs |
   * +--------+             +-----+
   *   ||||||               |     |
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
    var context = ugen.$context;

    var delayTime = context.toSeconds(util.defaults(spec.delay, spec.delayTime, 0));
    var feedback = util.defaults(spec.fb, spec.feedback, 0);
    var maxDelayTime;

    if (typeof delayTime === "number") {
      delayTime = util.clip(util.finite(context.toSeconds(delayTime)), 0, WEB_AUDIO_MAX_DELAY_TIME);
      maxDelayTime = delayTime;
    } else {
      maxDelayTime = util.finite(context.toSeconds(util.defaults(spec.maxDelay, spec.maxDelayTime, 1)));
    }
    maxDelayTime = util.clip(maxDelayTime, 1 / context.sampleRate, WEB_AUDIO_MAX_DELAY_TIME);

    var delayNode = context.createDelay(maxDelayTime);

    delayNode.delayTime.value = 0;
    context.connect(delayTime, delayNode.delayTime);

    if (feedback !== 0) {
      var feedbackNode = context.createGain();

      feedbackNode.gain.value = 0;

      context.connect(delayNode, feedbackNode);
      context.connect(feedback, feedbackNode.gain);

      inputs = inputs.concat(feedbackNode);
    }

    new neume.Sum(context, inputs).connect(delayNode);

    return new neume.Unit({
      outlet: delayNode
    });
  });

};
