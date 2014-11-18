module.exports = function(neume, _) {
  "use strict";

  /**
   * $("script", {
   *   process: [function] = null,
   *   bufSize: [number] = 1024,
   *   numOfInputs : [number] = 1,
   *   numOfOutputs: [number] = 1,
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

    var bufSize = _.int(_.defaults(spec.bufSize, 1024));
    var numOfInputs = _.int(_.defaults(spec.numOfInputs, 1));
    var numOfOutputs = _.int(_.defaults(spec.numOfOutputs, 1));

    var outlet = context.createScriptProcessor(bufSize, numOfInputs, numOfOutputs);

    if (typeof spec.process === "function")  {
      outlet.onaudioprocess = spec.process;
    }

    context.createSum(inputs).connect(outlet);

    return new neume.Unit({
      outlet: outlet
    });
  });

};
