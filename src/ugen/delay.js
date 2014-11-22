module.exports = function(neume, util) {
  "use strict";

  var WEB_AUDIO_MAX_DELAY_TIME = neume.MAX_DELAY_SEC;

  /**
   * $("delay", {
   *   delay: [number|UGen] = 0
   *   maxDelayTime: [number] = delay
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

    var delayTime = util.defaults(context.toSeconds(spec.delay), 0);
    var maxDelayTime;

    if (typeof delayTime === "number") {
      delayTime = util.clip(util.finite(context.toSeconds(delayTime)), 0, WEB_AUDIO_MAX_DELAY_TIME);
      maxDelayTime = delayTime;
    } else {
      maxDelayTime = util.finite(util.defaults(context.toSeconds(spec.maxDelayTime), 1));
    }
    maxDelayTime = util.clip(maxDelayTime, 1 / context.sampleRate, WEB_AUDIO_MAX_DELAY_TIME);

    var delay = context.createDelay(maxDelayTime);

    delay.delayTime.value = 0;
    context.connect(delayTime, delay.delayTime);

    context.createSum(inputs).connect(delay);

    return new neume.Unit({
      outlet: delay
    });
  });

};
