module.exports = function(neume, _) {
  "use strict";

  /*
   * $("line", {
   *   start: [number] = 1
   *   end  : [number] = 0
   *   dur  : [number] = 1
   * } ... inputs)
   *
   * $("xline", {
   *   start: [number] = 1
   *   end  : [number] = 0
   *   dur  : [number] = 1
   * } ... inputs)
   *
   * +--------+      +-------+
   * | inputs |  or  | DC(1) |
   * +--------+      +-------+
   *   ||||||
   * +---------------+
   * | GainNode      |
   * | - gain: value |
   * +---------------+
   *   |
   */
  neume.register("line", function(ugen, spec, inputs) {
    var list = spec.hasOwnProperty("_") ? makeListFromNumArray(ugen.$context, _.toArray(spec._)) : [
      _.finite(_.defaults(spec.start, 1)),
      [
        _.finite(_.defaults(spec.end, 0)),
        _.finite(_.defaults(ugen.$context.toSeconds(spec.dur), 1))
      ]
    ];
    return make("linTo", ugen, list, inputs);
  });

  neume.register("xline", function(ugen, spec, inputs) {
    var list = spec.hasOwnProperty("_") ? makeListFromNumArray(ugen.$context, _.toArray(spec._)) : [
      _.finite(_.defaults(spec.start, 1)),
      [
        _.finite(_.defaults(spec.end, 0)),
        _.finite(_.defaults(ugen.$context.toSeconds(spec.dur), 1))
      ]
    ];

    if (list[0] === 0) {
      list[0] = 1e-6;
    }

    for (var i = 1, imax = list.length; i < imax; i++) {
      if (list[i][0] === 0) {
        list[i][0] = 1e-6;
      }
    }

    return make("expTo", ugen, list, inputs);
  });


  function makeListFromNumArray(context, list) {
    var result = [
      _.finite(list[0])
    ];

    for (var i = 1, imax = list.length; i < imax; i += 2) {
      result.push([
        _.finite(list[i]),
        _.finite(context.toSeconds(list[i+1]))
      ]);
    }

    return result;
  }

  function make(curve, ugen, list, inputs) {
    var context = ugen.$context;
    var outlet  = null;

    var schedId = 0;
    var param = context.createParam(list[0]);

    if (inputs.length) {
      outlet = context.createGain();
      context.createSum(inputs).connect(outlet);
      context.connect(param, outlet.gain);
    } else {
      outlet = param;
    }

    function start(t) {
      var t0 = t;
      var t1 = t0;

      param.setAt(list[0], t0);

      for (var i = 1, imax = list.length; i < imax; i++) {
        t1 += list[i][1];
        param[curve](list[i][0], t1);
      }

      schedId = context.sched(t1, function(t) {
        schedId = 0;
        ugen.emit("end", { playbackTime: t }, ugen.$synth);
      });
    }

    function stop() {
      context.unsched(schedId);
    }

    return new neume.Unit({
      outlet: outlet,
      start : start,
      stop  : stop
    });
  }

};
