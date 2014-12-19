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

    Object.keys(spec).forEach(function(name) {
      if (typeof outlet[name] !== "undefined") {
        if (outlet[name] instanceof global.AudioParam) {
          context.connect(spec[name], outlet[name]);
        } else {
          outlet[name] = spec[name];
        }
      }
    });

    if (outlet.numberOfInputs) {
      context.connect(inputs, outlet);
    }

    return new neume.Unit({
      outlet: outlet
    });
  }

};
