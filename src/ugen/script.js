module.exports = function(neume) {
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

    context.createSum(inputs).connect(outlet);

    return new neume.Unit({
      outlet: outlet
    });
  });

};
