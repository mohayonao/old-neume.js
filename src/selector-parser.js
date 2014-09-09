"use strict";

var reUGenName = /^([a-zA-Z](-?[a-zA-Z0-9]+)*!?\??|[-+*\/%<=>!?&|@]+)/;

function isValidUGenName(name) {
  var exec = reUGenName.exec(name);
  return !!exec && exec[0] === name;
}

function parse(selector) {
  selector = String(selector);

  var parsed = { key: "", id: null, class: [] };

  var keyMatched = selector.match(reUGenName);
  if (keyMatched) {
    parsed.key = keyMatched[0];
    selector = selector.substr(parsed.key.length);
  }

  var matched = selector.match(/[.#][a-zA-Z](-?[a-zA-Z0-9]+)*/g);
  if (matched) {
    matched.forEach(function(match) {
      var ch0 = match.charAt(0);
      if (ch0 === "#") {
        if (!parsed.id) {
          parsed.id = match.substr(1);
        }
      } else {
        parsed.class.push(match.substr(1));
      }
    });
  }

  return parsed;
}

module.exports = {
  isValidUGenName: isValidUGenName,
  parse: parse
};
