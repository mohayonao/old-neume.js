module.exports = function(neuma) {
  "use strict";

  neuma.register("media", function(ugen, spec) {
    return make(setup(ugen, spec.media));
  });

  neuma.register("htmlaudioelement", function(ugen, spec) {
    return make(setup(ugen, spec.value));
  });

  neuma.register("htmlvideoelement", function(ugen, spec) {
    return make(setup(ugen, spec.value));
  });

  function setup(ugen, media) {
    if (window.HTMLMediaElement && media instanceof window.HTMLMediaElement) {
      return ugen.$context.createMediaElementSource(media);
    }
    return null;
  }

  function make(outlet) {
    return new neuma.Unit({
      outlet: outlet
    });
  }
};
