module.exports = function(neume, _) {
  "use strict";

  /**
   * $(number, {
   *   lag  : number = 0
   *   curve: number = 0
   * } ... inputs)
   *
   * methods:
   *   setValue(t, value)
   *
   * +--------+      +-------+
   * | inputs |  or  | DC(1) |
   * +--------+      +-------+
   *   ||||||
   * +---------------+
   * | GainNode      |
   * | - gain: value |
   * +---------------+
   *   |
   */
  neume.register("number", function(ugen, spec, inputs) {
    var context = ugen.$context;
    var outlet  = null;

    var data  = _.finite(spec.value);
    var param = context.createParam(data, spec);

    if (inputs.length) {
      outlet = context.createGain();
      context.createSum(inputs).connect(outlet);
      context.connect(param, outlet.gain);
    } else {
      outlet = param;
    }

    function update(t0, v0, v1, nextData) {
      param.update(t0, v1, v0);
      data = nextData;
    }

    return new neume.Unit({
      outlet: outlet,
      methods: {
        setValue: function(t, value) {
          if (_.isFinite(value)) {
            context.sched(_.finite(context.toSeconds(t)), function() {
              update(t, data, value, value);
            });
          }
        }
      }
    });
  });

};
