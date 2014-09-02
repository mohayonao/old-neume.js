module.exports = function(neuma, _) {
  "use strict";

  _.each({
    sin   : "sine",
    square: "square",
    saw   : "sawtooth",
    tri   : "triangle"
  }, function(type, name) {
    /**
     * no inputs
     * +------------------------+
     * | OscillatorNode         |
     * | - type: type           |
     * | - frequency: freq(440) |
     * | - detune: detune(0)    |
     * +------------------------+
     *   |
     *
     * has inputs
     * +--------+
     * | inputs |
     * +--------+     +----------------------+
     *   |            | OscillatorNode       |
     * +-----------+  | - type: type         |
     * | GainNode  |  | - frequency: freq(2) |
     * | - gain: 0 |--| - detune: detune(0)  |
     * +-----------+  +----------------------+
     *   |
     */
    neuma.register(name, function(ugen, spec, inputs) {
      var out = inputs.length ?
        hasInputs(type, ugen, spec, inputs) : noInputs(type, ugen, spec);
      var osc = out.osc;

      return new neuma.Unit({
        outlet: out.outlet,
        start: function(t) {
          osc.start(t);
        },
        stop: function(t) {
          osc.stop(t);
        }
      });
    });
  });

  function noInputs(type, ugen, spec) {
    var osc = ugen.$context.createOscillator();

    osc.type = type;
    osc.frequency.value = 0;
    osc.detune.value    = 0;
    _.connect({ from: _.defaults(spec.freq, 440), to: osc.frequency });
    _.connect({ from: _.defaults(spec.detune, 0), to: osc.detune });

    return { outlet: osc, osc: osc };
  }

  function hasInputs(type, ugen, spec, inputs) {
    var osc  = ugen.$context.createOscillator();
    var gain = ugen.$context.createGain();

    osc.type = type;
    osc.frequency.value = 0;
    osc.detune.value    = 0;
    _.connect({ from: _.defaults(spec.freq, 2), to: osc.frequency });
    _.connect({ from: _.defaults(spec.detune, 0), to: osc.detune });

    gain.gain.value = 0;
    _.connect({ from: osc, to: gain.gain });

    _.each(inputs, function(node) {
      _.connect({ from: node, to: gain });
    });

    return { outlet: gain, osc: osc };
  }

};
