module.exports = function(neume, util) {
  "use strict";

  var ITERATE = 0;
  var FINISHED = 1;

  /**
   * $("iter", {
   *   iter: iterator = null,
   *   curve: string|number = "step",
   *   lag: timevalue = 0,
   *   mul: signal = 1,
   *   add: signal = 0,
   * }, ...inputs: signal)
   *
   * methods:
   *   next(startTime: timevalue)
   *
   * +-----------+     +-----------+
   * | inputs[0] | ... | inputs[N] |
   * +-----------+     +-----------+
   *   |                 |
   *   +-----------------+
   *   |
   * +----------+
   * | GainNode |
   * | - gain: <--- iterator value
   * +----------+
   *   |
   */
  neume.register("iter", function(ugen, spec, inputs) {
    return make(ugen, spec, inputs);
  });

  function make(ugen, spec, inputs) {
    var context = ugen.context;

    var iter = util.defaults(spec.iter, null);
    var state = ITERATE;
    var param = new neume.Param(context, 0, spec);
    var outlet = inputs.length ? param.toAudioNode(inputs) : param;

    function start(t) {
      var items = iterNext();
      if (items.done) {
        state = FINISHED;
        ugen.emit("end", {
          type: "end",
          synth: ugen.synth,
          playbackTime: t
        });
      } else {
        param.setValueAtTime(util.finite(items.value), t);
      }
    }

    function next(t) {
      if (state !== ITERATE) {
        return;
      }

      t = util.finite(context.toSeconds(t));

      var items = iterNext();

      if (items.done) {
        state = FINISHED;
        ugen.emit("end", {
          type: "end",
          synth: ugen.synth,
          playbackTime: t
        });
      } else {
        param.update(util.finite(items.value), t);
      }
    }

    function iterNext() {
      return util.isIterator(iter) ? iter.next() : { done: true };
    }

    return new neume.Unit({
      outlet: outlet,
      start: start,
      methods: {
        next: next
      }
    });
  }

};
