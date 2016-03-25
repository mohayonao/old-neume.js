module.exports = function(neume, util) {
  "use strict";

  /**
  * $(object, {
  *   key: string|number = "",
  *   curve: string|number = "step",
  *   lag: timevalue = 0,
  *   mul: signal = 1,
  *   add: signal = 0,
  * }, ...inputs: signal)
  *
  * $(Float32Array, {
  *   key: number = 0,
  *   curve: string|number = "step",
  *   lag: timevalue = 0,
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
  * +----------+
  * | GainNode |
  * | - gain: <--- value
  * +----------+
  *   |
  */
  neume.register("object", make);
  neume.register("Float32Array", make);

  function make(ugen, spec, inputs) {
    var context = ugen.context;

    var data = util.defaults(spec.value, 0);
    var key = util.defaults(spec.i, spec.index, spec.key, "");
    var interval = util.defaults(spec.poll, spec.pollTime, spec.interval, 0.250);
    var schedId = 0;
    var valueOf = null;

    if ((typeof key === "string" || typeof key === "number") && data.hasOwnProperty(key)) {
      if (typeof data[key] === "function") {
        valueOf = function() {
          return data[key]();
        };
      } else {
        valueOf = function() {
          return data[key];
        };
      }
    } else {
      valueOf = function() {
        return data.valueOf();
      };
    }

    var minInterval = 1 / context.sampleRate;

    var prevVal = util.finite(valueOf());
    var param = new neume.Param(context, prevVal, spec);
    var outlet = inputs.length ? param.toAudioNode(inputs) : param;

    function update(e) {
      var t0 = e.playbackTime;
      var value = util.finite(valueOf());

      if (value !== prevVal) {
        param.update(value, t0);
        prevVal = value;
      }

      var nextInterval = Math.max(minInterval, util.finite(context.toSeconds(interval)));

      schedId = context.sched(t0 + nextInterval, update);
    }

    return new neume.Unit({
      outlet: outlet,
      start: function(t) {
        update(t);
      },
      stop: function() {
        context.unsched(schedId);
        schedId = 0;
      }
    });
  }
};
