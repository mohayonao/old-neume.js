module.exports = function(neume, _) {
  "use strict";

  var WEB_AUDIO_MAX_DELAY_TIME = neume.MAX_DELAY_SEC;

  /**
   * $("delay", {
   *   delay       : [number|UGen] = 0
   *   maxDelayTime: [number]      = delay
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

    var delayTime = _.defaults(spec.delay, 0);
    var maxDelayTime;

    if (typeof delayTime === "number") {
      delayTime    = _.clip(_.finite(delayTime), 0, WEB_AUDIO_MAX_DELAY_TIME);
      maxDelayTime = delayTime;
    } else {
      maxDelayTime = _.finite(_.defaults(spec.maxDelayTime, 1));
    }
    maxDelayTime = _.clip(maxDelayTime, 1 / context.sampleRate, WEB_AUDIO_MAX_DELAY_TIME);

    var delay = context.createDelay(maxDelayTime);

    delay.delayTime.value = 0;
    context.connect(delayTime, delay.delayTime);

    inputs.forEach(function(node) {
      context.connect(node, delay);
    });

    return new neume.Unit({
      outlet: delay
    });
  });

};
