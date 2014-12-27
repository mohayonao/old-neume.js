module.exports = function(neume) {
  "use strict";

  neume.use(require("./add"));
  neume.use(require("./audio-node"));
  neume.use(require("./biquad"));
  neume.use(require("./buf"));
  neume.use(require("./comp"));
  neume.use(require("./conv"));
  neume.use(require("./delay"));
  neume.use(require("./drywet"));
  neume.use(require("./env"));
  neume.use(require("./inout"));
  neume.use(require("./iter"));
  neume.use(require("./lfpulse"));
  neume.use(require("./line"));
  neume.use(require("./mono"));
  neume.use(require("./mul"));
  neume.use(require("./noise"));
  neume.use(require("./object"));
  neume.use(require("./osc"));
  neume.use(require("./pan2"));
  neume.use(require("./shaper"));

};
