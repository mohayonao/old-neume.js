module.exports = function(neume, util) {
  "use strict";

  var WS_CURVE_SIZE = neume.WS_CURVE_SIZE;

  var curveL = new Float32Array(WS_CURVE_SIZE);
  var curveR = new Float32Array(WS_CURVE_SIZE);

  for (var i = 0; i < WS_CURVE_SIZE; i++) {
    curveL[i] = Math.cos((i / WS_CURVE_SIZE) * Math.PI * 0.5);
    curveR[i] = Math.sin((i / WS_CURVE_SIZE) * Math.PI * 0.5);
  }

  /**
   * $("pan2", {
   *   pos: [number|UGen] = 0
   * } ... inputs)
   *
   * +-----+              +--------+
   * | pos |              | inputs |
   * +-----+              +--------+
   *   |                    |
   *   +--------------------|-----------------------------+
   *   |                    +--------------+              |
   *   |                    |              |              |
   * +-----------------+  +-----------+  +-----------+  +-----------------+
   * | WaveShaperNode  |  | GainNode  |  | GainNode  |  | WaveShaperNode  |
   * | - curve: curveL |--| - gain: 0 |  | - gain: 0 |--| - curve: curveR |
   * +-----------------+  +-----------+  +-----------+  +-----------------+
   *   |                                                  |
   *   |               +----------------------------------+
   *   |               |
   * +-------------------+
   * | ChannelMergerNode |
   * +-------------------+
   *   |
   */
  neume.register("pan2", function(ugen, spec, inputs) {
    var context = ugen.$context;

    var gainL = context.createGain();
    var gainR = context.createGain();

    gainL.channelCount = 1;
    gainL.channelCountMode = "explicit";
    gainL.channelInterpretation = "speakers";

    gainR.channelCount = 1;
    gainR.channelCountMode = "explicit";
    gainR.channelInterpretation = "speakers";

    var pos = util.defaults(spec.pos, 0);

    if (typeof pos === "number") {
      pos = util.clip(pos, -1, +1) * 0.5 + 0.5;
      gainL.gain.value = Math.cos(pos * Math.PI * 0.5);
      gainR.gain.value = Math.sin(pos * Math.PI * 0.5);
    } else {
      var wsL = context.createWaveShaper();
      var wsR = context.createWaveShaper();

      wsL.curve = curveL;
      wsR.curve = curveR;

      context.connect(pos, wsL);
      context.connect(pos, wsR);

      gainL.gain.value = 0;
      gainR.gain.value = 0;

      wsL.connect(gainL.gain);
      wsR.connect(gainR.gain);
    }

    var merger = context.createChannelMerger(2);

    gainL.connect(merger, 0, 0);
    gainR.connect(merger, 0, 1);

    context.createSum(inputs).connect(gainL).connect(gainR);

    return new neume.Unit({
      outlet: merger
    });
  });
};
