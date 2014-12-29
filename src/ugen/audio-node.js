module.exports = function(neume) {
  "use strict";

  /**
   * $(AudioNode, {
   *   [attributes],
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
   *  +-----------+
   *  | AudioNode |
   *  +-----------+
   *    |
   */

  [
    "AudioBufferSourceNode",
    "MediaElementAudioSourceNode",
    "MediaStreamAudioSourceNode",
    "ScriptProcessorNode",
    "GainNode",
    "BiquadFilterNode",
    "DelayNode",
    "PannerNode",
    "ConvolverNode",
    "AnalyserNode",
    "DynamicsCompressorNode",
    "WaveShaperNode",
    "OscillatorNode",
  ].forEach(function(name) {
    neume.register(name, function(ugen, spec, inputs) {
      return make(ugen, spec, inputs);
    });
  });

  function make(ugen, spec, inputs) {
    var context = ugen.context;
    var outlet = spec.value;

    var gain = null;

    Object.keys(spec).forEach(function(name) {
      if (typeof outlet[name] !== "undefined") {
        if (outlet[name] instanceof neume.webaudio.AudioParam) {
          context.connect(spec[name], outlet[name]);
        } else {
          outlet[name] = spec[name];
        }
      }
    });
    if (inputs.length) {
      if (outlet.numberOfInputs) {
        context.connect(inputs, outlet);
      } else {
        gain = context.createGain();

        gain.gain.value = 0;

        context.connect(inputs, gain);
        context.connect(outlet, gain.gain);

        outlet = gain;
      }
    }

    return new neume.Unit({
      outlet: outlet
    });
  }

};
