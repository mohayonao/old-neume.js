module.exports = function(neuma, _) {
  "use strict";

  /**
   * +--------+      +-------+
   * | inputs |  or  | DC(1) |
   * +--------+      +-------+
   *   |
   * +----------------------+
   * | GainNode             |
   * | - gain: array[index] |
   * +----------------------+
   *   |
   */
  neuma.register("array", function(ugen, spec, inputs) {
    var context = ugen.$context;

    var gain = ugen.$context.createGain();

    var index = 0;
    var data = spec.value.map(_.finite);

    if (data.length === 0)  {
      data = [ 0 ];
    }

    var mode = {
      wrap: _.wrapAt,
      fold: _.foldAt,
    }[spec.mode] || /* istanbul ignore next*/ _.clipAt;

    var curve = {
      lin: "linearRampToValueAtTime",
      exp: "exponentialRampToValueAtTime"
    }[spec.curve] || /* istanbul ignore next*/ "setValueAtTime";

    var lag = _.finite(spec.lag);

    if (_.isEmpty(inputs)) {
      inputs = [ new neuma.DC(context, 1) ];
    }

    inputs.forEach(function(node) {
      _.connect({ from: node, to: gain });
    });

    gain.gain.setValueAtTime(data[0], 0);

    function setValueAtTime(t, index) {
      var t0 = ugen.$context.currentTime;
      var t1 = _.finite(_.defaults(t, t0));
      var t2 = t1 + lag;
      var value = mode(data, index);
      ugen.$context.sched(t1, function() {
        gain.gain.cancelScheduledValues(0);
        gain.gain.setValueAtTime(gain.gain.value, t1);
        gain.gain[curve](value, t2);
      });
    }

    return new neuma.Unit({
      outlet: gain,
      methods: {
        at: function(t, index) {
          index = _.int(index);
          setValueAtTime(t, index);
        },
        next: function(t) {
          index += 1;
          setValueAtTime(t, index);
        },
        prev: function(t) {
          index -= 1;
          setValueAtTime(t, index);
        }
      }
    });
  });
};
