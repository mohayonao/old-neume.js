module.exports = function(neuma) {
  "use strict";

  neuma.use(require("./add"));
  neuma.use(require("./biquad"));
  neuma.use(require("./buf"));
  neuma.use(require("./clip"));
  neuma.use(require("./comp"));
  neuma.use(require("./conv"));
  neuma.use(require("./delay"));
  neuma.use(require("./line"));
  neuma.use(require("./mul"));
  neuma.use(require("./number"));
  neuma.use(require("./osc"));
  neuma.use(require("./white"));
  neuma.use(require("./xline"));

};
