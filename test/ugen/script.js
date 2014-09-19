"use strict";

var neume = require("../../src/neume");

neume.use(require("../../src/ugen/script"));

describe("ugen/script", function() {
  var Neume = null;

  before(function() {
    Neume = neume.exports(new window.AudioContext());
  });

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
      var NOP = function() {};

      var synth = new Neume(function($) {
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
