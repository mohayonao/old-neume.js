module.exports = function(neume, _) {
  "use strict";

  var WEB_AUDIO_MAX_DELAY_TIME = 180;

  /**
   * $("delay", {
   *   delayTime   : [number|UGen] = 0
   *   maxDelayTime: [number]      = delayTime
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

    var delayTime = _.defaults(spec.delayTime, 0);
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
    _.connect({ from: delayTime, to: delay.delayTime });

    inputs.forEach(function(node) {
      _.connect({ from: node, to: delay });
    });

    return new neume.Unit({
      outlet: delay
    });
  });

};
