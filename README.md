# neume.js
[![Bower](https://img.shields.io/bower/v/neume.js.svg?style=flat)](https://github.com/mohayonao/neume.js)
[![Build Status](http://img.shields.io/travis/mohayonao/neume.js.svg?style=flat)](https://travis-ci.org/mohayonao/neume.js)
[![Coverage Status](http://img.shields.io/coveralls/mohayonao/neume.js.svg?style=flat)](https://coveralls.io/r/mohayonao/neume.js?branch=master)
[![Dependency Status](http://img.shields.io/david/mohayonao/neume.js.svg?style=flat)](https://david-dm.org/mohayonao/neume.js)
[![devDependency Status](http://img.shields.io/david/dev/mohayonao/neume.js.svg?style=flat)](https://david-dm.org/mohayonao/neume.js)

![](http://upload.wikimedia.org/wikipedia/commons/a/ab/Gregorian_chant.gif)

## What is?
**Neume.js** is a Web Audio API library for developing interactive music.

## Examples

  - [8bit-sequencer](http://mohayonao.github.io/neume.js/examples/8bit-sequencer.html)
    - real time audio processing rhythm machine
  - [buffer-work](http://mohayonao.github.io/neume.js/examples/buffer-work.html)
    - load an audio file and edit it like tape music
  - [mml-piano](http://mohayonao.github.io/neume.js/examples/mml-piano.html)
    - toy piano with Music Macro Language
  - [rendering-reich](http://mohayonao.github.io/neume.js/examples/rendering-reich.html)
    - rendering audio and play it
  - weird demo
    - [6chars drums](http://the.mohayonao.com/6chars/)
    - [formant khoomii](http://the.mohayonao.com/khoomii/)
    - [scalable mario](http://the.mohayonao.com/scalable-mario/)

## Installation

##### Bower

```sh
$ bower install neume.js
```

##### Downloads

  - [neume.js](http://mohayonao.github.io/neume.js/build/neume.js)
  - [neume.min.js](http://mohayonao.github.io/neume.js/build/neume.min.js)

```html
<script src="neume.js"></script>
```

Neume.js is dependent on `Web Audio API` and `Promise`.

  - [es6-promise](https://github.com/jakearchibald/es6-promise)

## How do work?

This code generates an audio graph like below.

```javascript
var synth = Neume.Synth(function($) {
  var out;

  out = $("sin", { freq: $("sin", { freq: 2, mul: 20, add: 880 } )});
  out = $("xline", { start: 0.25, end: 0.001, dur: 1 }, out).on("end", function(e) {
    this.stop(e.playbackTime);
  });

  return out;
});
```
```
                           +-------------------+
                           | OscillatorNode    |
                           | - type     : sine |
                           | - frequency: 2    |
                           | - detune   : 0    |
                           +-------------------+
+-----------------------+    |
| OscillatorNode        |  +------------+
| - type     : sine     |  | GainNode   |
| - frequency: 880      |--| - gain: 20 |
| - detune   : 0        |  +------------+
+-----------------------+
  |
+-----------------------+
| GainNode              |
| - gain: 0.25 -> 0.001 |
+-----------------------+
  |
```

## Documents

  - [Getting Started](https://github.com/mohayonao/neume.js/wiki/tutorial-Getting-Started) (:construction_worker: partially Japanese)

## License

Neume.js is available under the The MIT License.
