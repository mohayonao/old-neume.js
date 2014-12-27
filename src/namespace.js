"use strict";

function neume() {
  return neume.impl.apply(null, arguments);
}

neume.version = "0.8.2";

module.exports = neume;
