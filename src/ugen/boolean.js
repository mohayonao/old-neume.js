module.exports = function(neume, _) {
  "use strict";

  /**
   * $(boolean, {
   *   true : [number] = 1
   *   false: [number] = 0
   *   lag  : [number] = 0
   *   curve: [number] = 0
   * } ... inputs)
   *
   * methods:
   *   setValue(t, value)
   *   toggle(t)
   *
   * +--------+      +-------+
   * | inputs |  or  | DC(1) |
   * +--------+      +-------+
   *   ||||||
   * +------------------------------------+
   * | GainNode                           |
   * | - gain: value ? trueVal : falseVal |
   * +------------------------------------+
   *   |
   */
  neume.register("boolean", function(ugen, spec, inputs) {
    var context = ugen.$context;
    var outlet  = null;

    var data = !!spec.value;
    var trueVal  = _.finite(_.defaults(spec.true , 1));
    var falseVal = _.finite(_.defaults(spec.false, 0));
    var param = context.createParam(data ? trueVal : falseVal, spec);

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
          if (typeof value === "boolean") {
            t = _.finite(_.defaults(t, context.currentTime));
            context.sched(t, function() {
              var v0 = data  ? trueVal : falseVal;
              var v1 = value ? trueVal : falseVal;
              update(t, v0, v1, value);
            });
          }
        },
        toggle: function(t) {
          t = _.finite(_.defaults(t, context.currentTime));
          context.sched(t, function() {
            var v0 = data ? trueVal : falseVal;
            var v1 = data ? falseVal : trueVal;
            update(t, v0, v1, !data);
          });
        }
      }
    });
  });

};
