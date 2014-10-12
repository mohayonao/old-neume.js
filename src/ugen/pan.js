module.exports = function(neume, _) {
  "use strict";

  /**
   * $("pan", {
   * } ... inputs)
   *
   * +--------+
   * | inputs |
   * +--------+
   *   ||||||
   * +------------+
   * | PannerNode |
   * +------------+
   *   |
   */
  var PannerNodeParams = {
    refDistance   : true,
    maxDistance   : true,
    rolloffFactor : true,
    coneInnerAngle: true,
    coneOuterAngle: true,
    coneOuterGain : true
  };

  neume.register("pan", function(ugen, spec, inputs) {
    var context = ugen.$context;

    var pan = context.createPanner();

    pan.panningModel = {
      equalpower: "equalpower",
      eq        : "equalpower"
    }[spec.panningModel] || "HRTF";

    pan.distanceModel = {
      linear     : "linear",
      exponential: "exponential",
      lin: "linear",
      exp: "exponential",
    }[spec.distanceModel] || "inverse";

    pan.refDistance    = _.finite(_.defaults(spec.refDistance   , 1));
    pan.maxDistance    = _.finite(_.defaults(spec.maxDistance   , 10000));
    pan.rolloffFactor  = _.finite(_.defaults(spec.rolloffFactor , 1));
    pan.coneInnerAngle = _.finite(_.defaults(spec.coneInnerAngle, 360));
    pan.coneOuterAngle = _.finite(_.defaults(spec.coneOuterAngle, 360));
    pan.coneOuterGain  = _.finite(_.defaults(spec.coneOuterGain , 0));

    new neume.Sum(context, inputs).connect(pan);

    function update(value) {
      Object.keys(value).forEach(function(key) {
        if (PannerNodeParams.hasOwnProperty(key)) {
          pan[key] = _.finite(value[key]);
        }
      });
    }

    return new neume.Unit({
      outlet: pan,
      methods: {
        setValue: function(t, value) {
          if (_.isDictionary(value)) {
            context.sched(context.toSeconds(t), function() {
              update(value);
            });
          }
        },
        setPosition: function(t, x, y, z) {
          context.sched(context.toSeconds(t), function() {
            pan.setPosition(x, y, z);
          });
        },
        setOrientation: function(t, x, y, z) {
          context.sched(context.toSeconds(t), function() {
            pan.setOrientation(x, y, z);
          });
        },
        setVelocity: function(t, x, y, z) {
          context.sched(context.toSeconds(t), function() {
            pan.setVelocity(x, y, z);
          });
        },
      }
    });
  });

};
