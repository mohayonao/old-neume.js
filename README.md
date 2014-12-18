# neume.js
[![Bower](https://img.shields.io/bower/v/neume.js.svg?style=flat)](https://github.com/mohayonao/neume.js)
[![Build Status](http://img.shields.io/travis/mohayonao/neume.js.svg?style=flat)](https://travis-ci.org/mohayonao/neume.js)
[![Coverage Status](http://img.shields.io/coveralls/mohayonao/neume.js.svg?style=flat)](https://coveralls.io/r/mohayonao/neume.js?branch=master)

![](http://upload.wikimedia.org/wikipedia/commons/a/ab/Gregorian_chant.gif)

## What is?
**Neume** (/ˈnjuːm/; ja: ニューム) is a Web Audio API library for developing browser music. The architecture of neume.js provides very simple operation for creating web-based audio application and generates optimized audio-graph for Web Audio API.

## Examples

  - [mml-piano](http://mohayonao.github.io/neume.js/examples/mml-piano.html)
    - toy piano with Music Macro Language
  - [sine-storm](http://mohayonao.github.io/neume.js/examples/sine-storm.html)
    - sine wave drone
  - [8bit-sequencer](http://mohayonao.github.io/neume.js/examples/8bit-sequencer.html)
    - simple rhythm machine
  - [rendering-reich](http://mohayonao.github.io/neume.js/examples/rendering-reich.html)
    - render sound and play it with phase-shift
  - [buffer-work](http://mohayonao.github.io/neume.js/examples/buffer-work.html)
    - buffer edit like tape (cut, paste, reverse...)
  - weird demonstrations
    - [6chars drum](http://the.mohayonao.com/6chars/)
    - [scalable mario](http://the.mohayonao.com/scalable-mario/)
    - [formant khoomii](http://the.mohayonao.com/khoomii/)

## Installation

#### Bower

```sh
$ bower install neume.js
```

#### Downloads

  - [neume.js](https://raw.githubusercontent.com/mohayonao/neume.js/master/build/neume.js)
  - [neume.min.js](https://raw.githubusercontent.com/mohayonao/neume.js/master/build/neume.min.js)
  - [neume.min.js.map](https://raw.githubusercontent.com/mohayonao/neume.js/master/build/neume.min.js.map)

Neume.js is dependent on `Web Audio API` and `Promise`.

  - [es6-promise](https://github.com/jakearchibald/es6-promise)

In a browser, include it in your html.

```html
<script src="/path/to/es6-promise.js"></script>
<script src="/path/to/neume.min.js"></script>
```

Here is boilerplate html in order to play a sine wave metronome in neume.js. ->  [sample](http://mohayonao.github.io/neume.js/examples/metronome.html)

```html
<!DOCTYPE html>
<html>
<head>
  <script src="/path/to/es6-promise.js"></script>
  <script src="/path/to/neume.min.js"></script>
</head>
<body>
  <button id="start">start</button>
  <script>
    var neu = neume(new AudioContext());

    function Sine($, freq, dur) {
      return $("sin", { freq: freq })
      .$("xline", { start: 0.2, dur: dur }).on("end", $.stop);
    }

    var timer = null;

    function start() {
      if (timer) {
        timer.stop();
        timer = null;
      } else {
        timer = neu.Interval("4n", function(e) {
          var freq = [ 880, 440, 440, 440 ][e.count % 4];
          var dur = [ 0.5, 0.125, 0.125, 0.125 ][e.count % 4];

          neu.Synth(Sine, freq, dur).start(e.playbackTime);
        }).start();
      }
    }

    document.getElementById("start").onclick = start;
  </script>
</body>
</html>
```

## How do work?

This example makes a modulated sine wave with a decay of about 1 second.

```javascript
// initialize Neume interface with AudioContext
var neu = neume(new AudioContext());

// define synth and play it
neu.Synth(function($) {
  return $("sin", {
    freq: $("sin", { freq: 8 }).mul(20).add(880)
  })
  .$("xline", {
    start: 0.25, end: 0.001, dur: 1
  }).on("end", $.stop);
}).start();
```

Above code generates an audio graph like a below. Graphs are optimized flexibly by neume.js.

```
                        +-------------------+
                        | OscillatorNode    |
                        | - type     : sine |
                        | - frequency: 8    |
                        | - detune   : 0    |
                        +-------------------+
+-------------------+     |
| OscillatorNode    |   +------------+
| - type     : sine |   | GainNode   |
| - frequency: 880  <---| - gain: 20 |
| - detune   : 0    |   +------------+
+-------------------+
  |
+-----------------------+
| GainNode              |
| - gain: 0.25 -> 0.001 |
+-----------------------+
  |
+-----------+
| GainNode  | * This node is used to
| - gain: 1 |     fade volume for a synth instance.
+-----------+
  |
```

In SuperCollider

```ruby
{
  SinOsc.ar(SinOsc.kr(8) * 20 + 880) *
    XLine.kr(0.25, 0.001, 1, doneAction:2)
}.play;
```

In MAX patch

![max-capture](http://otononaru.appspot.com/cdn/neume/capture-max.png)

## Tools

  - [neume.js editor](http://mohayonao.github.io/neume.js/examples/editor/)
  - [audio-graph-viewer](http://mohayonao.github.io/neume.js/examples/audio-graph-viewer/)

## Documents

  - [Reference](https://github.com/mohayonao/neume.js/wiki) ( :construction_worker: work in progress )

## License

Neume.js is available under the The MIT License.
