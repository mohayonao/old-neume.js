"use strict";

function neume() {
  return neume.impl.apply(null, arguments);
}

neume.version = "0.8.1";

module.exports = neume;
