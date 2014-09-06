module.exports = function(neuma) {
  "use strict";

  neuma.use(require("./add"));
  neuma.use(require("./biquad"));
  neuma.use(require("./line"));
  neuma.use(require("./mul"));
  neuma.use(require("./number"));
  neuma.use(require("./osc"));
  neuma.use(require("./white"));
  neuma.use(require("./xline"));

};
