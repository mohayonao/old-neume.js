module.exports = function(neuma) {
  "use strict";

  neuma.use(require("./add"));
  neuma.use(require("./array"));
  neuma.use(require("./biquad"));
  neuma.use(require("./boolean"));
  neuma.use(require("./buf"));
  neuma.use(require("./comp"));
  neuma.use(require("./conv"));
  neuma.use(require("./delay"));
  neuma.use(require("./env"));
  neuma.use(require("./function"));
  neuma.use(require("./line"));
  neuma.use(require("./media-stream"));
  neuma.use(require("./media"));
  neuma.use(require("./mul"));
  neuma.use(require("./noise"));
  neuma.use(require("./number"));
  neuma.use(require("./osc"));
  neuma.use(require("./shaper"));

};
