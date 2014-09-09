module.exports = function(neuma, _) {
  "use strict";

  var WEB_AUDIO_MAX_DELAY_TIME = 180;

  /**
   * +------------+
   * | ...inputs  |
   * +------------+
   *   |
   * +------------------------+
   * | DelayNode              |
   * | - delayTime: delayTime |
   * +------------------------+
   *   |
   */
  neuma.register("delay", function(ugen, spec, inputs) {
    var delayTime = _.defaults(spec.delayTime, 0);
    var maxDelayTime;

    if (_.isNumber(delayTime)) {
      delayTime    = Math.max(0, Math.min(delayTime, WEB_AUDIO_MAX_DELAY_TIME));
      maxDelayTime = delayTime;
    } else {
      maxDelayTime = _.finite(_.defaults(spec.maxDelayTime, 1));
    }
    maxDelayTime = Math.max(1 / ugen.$context.sampleRate, Math.min(maxDelayTime, WEB_AUDIO_MAX_DELAY_TIME));

    var delay = ugen.$context.createDelay(maxDelayTime);

    delay.delayTime.value = 0;
    _.connect({ from: _.defaults(spec.delayTime, 0), to: delay.delayTime });

    inputs.forEach(function(node) {
      _.connect({ from: node, to: delay });
    });

    return new neuma.Unit({
      outlet: delay
    });
  });

};
