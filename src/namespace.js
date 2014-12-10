"use strict";

function neume() {
  return neume.impl.apply(null, arguments);
}

neume.version = "0.3.1";

module.exports = neume;
