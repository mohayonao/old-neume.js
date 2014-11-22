(function(plugin) {
  "use strict";

  // Module systems magic dance.

  if (typeof require === "function" && typeof exports === "object" && typeof module === "object") {
    // NodeJS
    module.exports = plugin;
  } else if (typeof define === "function" && define.amd) {
    // AMD
    define(function() {
      return plugin;
    });
  } else {
    // Other environment (usually <script> tag): plug in to global chai instance directly.
    neume.use(plugin);
  }

})(function(neume, _) {
  "use strict";

  neume.register("ring1", function(ugen, spec, inputs) {
    // (a * b) + a
    var context = ugen.$context;
    var outlet = null;

    var a = context.createSum(inputs);
    var b = _.defaults(spec.mod, 0);

    outlet = context.createMul(a, b).add(a);

    return new neume.Unit({
      outlet: outlet
    });
  });

  neume.register("ring2", function(ugen, spec, inputs) {
    // ((a * b) + a + b)
    var context = ugen.$context;
    var outlet = null;

    var a = context.createSum(inputs);
    var b = _.defaults(spec.mod, 0);

    outlet = context.createMul(a, b).add(a).add(b);

    return new neume.Unit({
      outlet: outlet
    });
  });

  neume.register("ring3", function(ugen, spec, inputs) {
    // (a * a * b)
    var context = ugen.$context;
    var outlet = null;

    var a = context.createSum(inputs);
    var b = _.defaults(spec.mod, 0);

    outlet = context.createMul(a, a).mul(b);

    return new neume.Unit({
      outlet: outlet
    });
  });

  neume.register("ring4", function(ugen, spec, inputs) {
    // ((a * a * b) - (a * b * b))
    var context = ugen.$context;
    var outlet = null;

    var a = context.createSum(inputs);
    var b = _.defaults(spec.mod, 0);

    outlet = context.createMul(a, a).mul(b).add(
      context.createMul(a, b).mul(b).mul(-1)
    );

    return new neume.Unit({
      outlet: outlet
    });
  });

  neume.register("difsqr", function(ugen, spec, inputs) {
    // (a * a) - (b * b)
    var context = ugen.$context;
    var outlet = null;

    var a = context.createSum(inputs);
    var b = _.defaults(spec.mod, 0);

    outlet = context.createMul(a, a).add(
      context.createMul(b, b).mul(-1)
    );

    return new neume.Unit({
      outlet: outlet
    });
  });

  neume.register("sumsqr", function(ugen, spec, inputs) {
    // (a * a) + (b * b)
    var context = ugen.$context;
    var outlet = null;

    var a = context.createSum(inputs);
    var b = _.defaults(spec.mod, 0);

    outlet = context.createMul(a, a).add(
      context.createMul(b, b)
    );

    return new neume.Unit({
      outlet: outlet
    });
  });

  neume.register("sqrdif", function(ugen, spec, inputs) {
    // (a - b) ** 2
    var context = ugen.$context;
    var outlet = null;

    var a = context.createSum(inputs);
    var b = _.defaults(spec.mod, 0);

    outlet = context.createMul(a, context.createMul(b, -1));
    outlet = context.createMul(outlet, outlet);

    return new neume.Unit({
      outlet: outlet
    });
  });

  neume.register("sqrsum", function(ugen, spec, inputs) {
    // (a + b) ** 2
    var context = ugen.$context;
    var outlet = null;

    var a = context.createSum(inputs);
    var b = _.defaults(spec.mod, 0);

    outlet = context.createMul(a, b);
    outlet = context.createMul(outlet, outlet);

    return new neume.Unit({
      outlet: outlet
    });
  });

});
