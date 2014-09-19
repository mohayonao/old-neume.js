"use strict";

var neume = require("../../src/neume");

neume.use(require("../../src/ugen/script"));

describe("ugen/script", function() {
  describe("$(script $(script))", function() {
    /*
     * +-----------+
     * | $(script) |
     * +-----------+
     *   |
     * +---------------------+
     * | ScriptProcessorNode |
     * +---------------------+
     *   |
     */
    it("return a ScriptProcessorNode that is connected with $(script)", function() {
      var context = new neume.Context(new window.AudioContext());
      var NOP = function() {};

      var synth = neume.Neume(function($) {
        return $("script", { audioprocess: NOP }, $("script"));
      })();

      assert.deepEqual(synth.outlet.toJSON(), {
        name: "ScriptProcessorNode",
        inputs: [
          {
            name: "ScriptProcessorNode",
            inputs: []
          }
        ]
      });
    });
  });

});
