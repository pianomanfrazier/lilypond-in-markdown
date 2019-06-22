var audioEls = document.getElementsByClassName('lilypond-audio');

function updateStatusBar(statusBar, percent) {
  statusBar.childNodes[0].style.width = String(percent * 100) + '%';
}

var animationLoop = function(howl, el) {
  return {
    raf: '',
    running: false,
    start: (function() {
      this.running = true;
      function step(timestamp) {
        if (this.running) {
          window.requestAnimationFrame(step);
        }
        updateStatusBar(el.childNodes[0], howl.seek() / howl.duration());
      }
      step.bind(this);
      window.requestAnimationFrame(step);
    }).bind(this),
    cancel: (function() {
      this.running = false;
    }).bind(this)
  }
}

var extensions = ['.ogg', '.mp3'];
var howls = {};
var els   = {};
for (i in audioEls) {
  if (audioEls[i] && audioEls[i].dataset) {
    var hash = audioEls[i].dataset.audio;
    var audioSrc = [];
    for (j in extensions) {
      audioSrc.push('/audio/' + hash + extensions[j])
    }
    els[hash] = audioEls[i];
    howls[hash] = new Howl({
      src: audioSrc,
      onplay: function (id) {
        els[this.hash].classList.add('playing');
        els[this.hash].classList.remove('paused');
        this.animation.start();
      },
      onpause: function (id) {
        els[this.hash].classList.add('paused');
        els[this.hash].classList.remove('playing');
        this.animation.cancel();
      },
      onseek: function (id) {
        updateStatusBar(els[this.hash].children[0], this.seek() / this.duration());
      },
      onend: function (id) {
        els[this.hash].classList.add('paused');
        els[this.hash].classList.remove('playing');
        this.seek(0);
        this.animation.cancel();
      },
      onloaderror: function (id, err) {
        els[this.hash].classList.add('error');
        els[this.hash].innerHTML = '<p>' + err + '</p>';
      },
      onplayerror: function (id, err) {
        els[this.hash].classList.add('error');
        els[this.hash].innerHTML = '<p>' + err + '</p>';
      }
    });
    howls[hash].hash = hash;
    howls[hash].animation = animationLoop(howls[hash], els[hash]);
  }
}

var seekIncrement = 1;

function playAudio(hash) {
  var howl = howls[hash]
  if (!howl.playing()) {
    howl.play();
  }
}

function togglePlayAudio(hash) {
  var howl = howls[hash]
  if (!howl.playing()) {
    howl.play();
  } else {
    howl.pause();
  }
}

function pauseAudio(hash) {
  howls[hash].pause();
}

function ffAudio(hash) {
  var howl = howls[hash];
  var pos = howl.seek();
  var seekPos = pos + seekIncrement < howl.duration() ? pos + seekIncrement : howl.duration();
  howl.seek(seekPos)
}

function rewindAudio(hash) {
  var howl = howls[hash];
  var pos = howl.seek();
  var seekPos = pos - seekIncrement > 0 ? pos - seekIncrement : 0;
  howl.seek(seekPos)
}

