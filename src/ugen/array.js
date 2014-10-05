module.exports = function(neume, _) {
  "use strict";

  /**
   * $([], {
   *   mode : enum[ clip, wrap, fold ] = clip
   *   lag  : [number] = 0
   *   curve: [number] = 0
   * } ... inputs)
   *
   * methods:
   *   setValue(t, value)
   *   at(t, index)
   *   next(t)
   *   prev(t)
   *
   * +--------+      +-------+
   * | inputs |  or  | DC(1) |
   * +--------+      +-------+
   *   ||||||
   * +----------------------+
   * | GainNode             |
   * | - gain: array[index] |
   * +----------------------+
   *   |
   */
  neume.register("array", function(ugen, spec, inputs) {
    var context = ugen.$context;
    var outlet  = null;

    var index = 0;
    var data  = spec.value;
    var mode  = {
      clip: _.clipAt,
      wrap: _.wrapAt,
      fold: _.foldAt,
    }[spec.mode] || /* istanbul ignore next*/ _.clipAt;

    if (!Array.isArray(data) || data.length === 0)  {
      data = [ 0 ];
    }

    var prevValue = _.finite(data[0]);
    var param = context.createParam(prevValue, spec);

    if (inputs.length) {
      outlet = context.createGain();
      context.createSum(inputs).connect(outlet);
      context.connect(param, outlet.gain);
    } else {
      outlet = param;
    }

    function update(t0, nextIndex) {
      var v0 = prevValue;
      var v1 = mode(data, nextIndex);

      param.update(t0, v1, v0);

      prevValue = v1;
      index = nextIndex;
    }

    return new neume.Unit({
      outlet: outlet,
      methods: {
        setValue: function(t, value) {
          if (Array.isArray(value)) {
            t = _.finite(_.defaults(t, context.currentTime));
            context.sched(t, function() {
              data = value;
            });
          }
        },
        at: function(t, index) {
          t = _.finite(_.defaults(t, context.currentTime));
          context.sched(t, function() {
            update(t, _.int(index));
          });
        },
        next: function(t) {
          t = _.finite(_.defaults(t, context.currentTime));
          context.sched(t, function() {
            update(t, index + 1);
          });
        },
        prev: function(t) {
          t = _.finite(_.defaults(t, context.currentTime));
          context.sched(t, function() {
            update(t, index - 1);
          });
        }
      }
    });
  });

};
