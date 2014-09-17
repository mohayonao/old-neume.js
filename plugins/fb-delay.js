(function(feedbackDelay) {
  "use strict";

  // Module systems magic dance.

  if (typeof require === "function" && typeof exports === "object" && typeof module === "object") {
    // NodeJS
    module.exports = feedbackDelay;
  } else if (typeof define === "function" && define.amd) {
    // AMD
    define(function () {
        return feedbackDelay;
    });
  } else {
    // Other environment (usually <script> tag): plug in to global chai instance directly.
    Neume.use(feedbackDelay);
  }

})(function(neume, _) {
  "use strict";

  var WEB_AUDIO_MAX_DELAY_TIME = 180;

  neume.register("fb-delay", function(ugen, spec, inputs) {
    var context = ugen.$context;

    var delayTime = _.defaults(spec.delayTime, 0.2);
    var maxDelayTime;

    if (_.isNumber(delayTime)) {
      delayTime    = _.clip(delayTime, 0, WEB_AUDIO_MAX_DELAY_TIME);
      maxDelayTime = delayTime;
    } else {
      maxDelayTime = _.finite(_.defaults(spec.maxDelayTime, 1));
    }
    maxDelayTime = _.clip(maxDelayTime, 1 / context.sampleRate, WEB_AUDIO_MAX_DELAY_TIME);

    var delay = context.createDelay(maxDelayTime);
    delay.delayTime.value = 0;
    _.connect({ from: delayTime, to: delay.delayTime });

    var feedback = context.createGain();
    feedback.gain.value = 0;
    _.connect({ from: _.defaults(spec.fb, 0.33), to: feedback.gain });

    _.connect({ from: delay, to: feedback });
    _.connect({ from: feedback, to: delay });

    return new neume.Unit({
      outlet: new neume.DryWet(context, inputs, delay, _.defaults(spec.mix, 0.4))
    });
  });

});
