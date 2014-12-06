module.exports = function(neume, util) {
  "use strict";

  var WEB_AUDIO_MAX_DELAY_TIME = neume.MAX_DELAY_SEC;

  /**
   * $("delay", {
   *   delay: [number|UGen] = 0
   *   maxDelay: [number] = delay
   * } ... inputs)
   *
   * +--------+
   * | inputs |
   * +--------+
   *   ||||||
   * +------------------------+
   * | DelayNode              |
   * | - delayTime: delayTime |
   * +------------------------+
   *   |
   */
  neume.register("delay", function(ugen, spec, inputs) {
    var context = ugen.$context;

    var delayTime = context.toSeconds(util.defaults(spec.delay, spec.delayTime, 0));
    var maxDelayTime;

    if (typeof delayTime === "number") {
      delayTime = util.clip(util.finite(context.toSeconds(delayTime)), 0, WEB_AUDIO_MAX_DELAY_TIME);
      maxDelayTime = delayTime;
    } else {
      maxDelayTime = util.finite(context.toSeconds(util.defaults(spec.maxDelay, spec.maxDelayTime, 1)));
    }
    maxDelayTime = util.clip(maxDelayTime, 1 / context.sampleRate, WEB_AUDIO_MAX_DELAY_TIME);

    var delay = context.createDelay(maxDelayTime);

    delay.delayTime.value = 0;
    context.connect(delayTime, delay.delayTime);

    context.createNeuSum(inputs).connect(delay);

    return new neume.Unit({
      outlet: delay
    });
  });

};
