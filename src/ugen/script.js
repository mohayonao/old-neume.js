module.exports = function(neume, _) {
  "use strict";

  /**
   * $("script", {
   *   audioprocess: [function] = null
   * } ... inputs)
   *
   * +--------+
   * | inputs |
   * +--------+
   *   ||||||
   * +---------------------+
   * | ScriptProcessorNode |
   * +---------------------+
   *   |
   */
  neume.register("script", function(ugen, spec, inputs) {
    var context = ugen.$context;

    var outlet = context.createScriptProcessor(512, 1, 1);

    if (typeof spec.audioprocess === "function")  {
      outlet.onaudioprocess = spec.audioprocess;
    }

    inputs.forEach(function(node) {
      _.connect({ from: node, to: outlet });
    });

    return new neume.Unit({
      outlet: outlet
    });
  });

};
