let all_blocks = [];
function shouldBlockPlay(color, shape){
  const matches = all_blocks.filter(b => b.color === color && b.shape == shape);
  return matches.length > 0;
}

const c = new AudioContext();
let sounds = [];
let volumes = {};
let sources = [];

$(document).ready(function() {
  var socket = io.connect('http://localhost:5000');

  let started = false;
  socket.on('blocks', (blocks) => {
    let b = blocks.map(b => `<li>${b["color"]} ${b["shape"]}</li>`).join("")
    $("#messages").append(`
    <ol>
      ${b}
    </ol><br>`);

    all_blocks = blocks;

    if (started == false) {
      sources.forEach(s => s.start())
      started = true;
    }
  });
});

playSounds()
function playSounds () {
  const finishedLoading = function (soundFiles) {
    volumes = {};
    Object.entries(soundFiles).forEach(([name, b]) => {
      const source = c.createBufferSource();
      source.buffer = b;
      source.loop = true;

      const gain = c.createGain();
      gain.gain.value = 0;

      source.connect(gain);
      gain.connect(c.destination);

      sources.push(source);
      volumes[name] = gain.gain;

      const melodies = [
        {
          el: volumes["melody1"],
          shape: "triangle"
        },{
          el: volumes["melody2"],
          shape: "square"
        },{
          el: volumes["melody3"],
          shape: "pentagon"
        },{
          el: volumes["melody4"],
          shape: "circle"
        },
      ].map(m => {
        m.color = "blue";
        return m;
      });

      const pads = [
        {
          el: volumes["pads1"],
          shape: "triangle"
        },{
          el: volumes["pads2"],
          shape: "square"
        },{
          el: volumes["pads3"],
          shape: "pentagon"
        },{
          el: volumes["pads4"],
          shape: "circle"
        },
      ].map(m => {
        m.color = "purple";
        return m;
      });

      const arps = [
        {
          el: volumes["arps1"],
          shape: "triangle"
        },{
          el: volumes["arps2"],
          shape: "square"
        },{
          el: volumes["arps3"],
          shape: "pentagon"
        },{
          el: volumes["arps4"],
          shape: "circle"
        },
      ].map(m => {
        m.color = "pink";
        return m;
      });

      const percs = [
        {
          el: volumes["perc1"],
          shape: "triangle"
        },{
          el: volumes["perc2"],
          shape: "square"
        },{
          el: volumes["perc3"],
          shape: "pentagon"
        },{
          el: volumes["perc4"],
          shape: "circle"
        },
      ].map(m => {
        m.color = "orange";
        return m;
      });

      sounds = Array.prototype.concat(melodies, pads, arps, percs);
    });
  }

  const bufferLoader = new BufferLoader(
      c,
      {
        arps1: 'static/sounds/arp 1.mp3',
        arps2: 'static/sounds/arp 2.mp3',
        arps3: 'static/sounds/arp 3.mp3',
        arps4: 'static/sounds/arp 4.mp3',

        melody1: 'static/sounds/melody 1.mp3',
        melody2: 'static/sounds/melody 2.mp3',
        melody3: 'static/sounds/melody 3.mp3',
        melody4: 'static/sounds/melody 4.mp3',

        pads1: 'static/sounds/pads 1.mp3',
        pads2: 'static/sounds/pads 2.mp3',
        pads3: 'static/sounds/pads 3.mp3',
        pads4: 'static/sounds/pads 4.mp3',

        perc1: 'static/sounds/perc 1.mp3',
        perc2: 'static/sounds/perc 2.mp3',
        perc3: 'static/sounds/perc 3.mp3',
        perc4: 'static/sounds/perc 4.mp3'
      },
      finishedLoading
  );

  bufferLoader.load();
}

// Audio
const melody1 = document.getElementById("melody1");
const pads1 = document.getElementById("pads1");
const arps1 = document.getElementById("arp1");
const perc1 = document.getElementById("perc1");

const melody2 = document.getElementById("melody2");
const pads2 = document.getElementById("pads2");
const arps2 = document.getElementById("arp2");
const perc2 = document.getElementById("perc2");

const melody3 = document.getElementById("melody3");
const pads3 = document.getElementById("pads3");
const arps3 = document.getElementById("arp3");
const perc3 = document.getElementById("perc3");

const melody4 = document.getElementById("melody4");
const pads4 = document.getElementById("pads4");
const arps4 = document.getElementById("arp4");
const perc4 = document.getElementById("perc4");

console.log(`starting sounds`);

const updateSounds = () => {
  sounds.forEach(s => {
    s.el.value = shouldBlockPlay(s.color, s.shape) ? 1 : 0;
  });
};

setInterval(() => {
  console.log("blocks", JSON.stringify(all_blocks))
  updateSounds();
}, 1000);


// Vue.js
new Vue({
  el: '#screen',
  data: {
    message: 'Hello Vue.js!',
    x: 0, y: 0,
    x2: 0, y2: 0,
    x3: 0, y3: 0,
    x4: 0, y4: 0,
    melHide: true,
    padHide: true,
    arpHide: true,
    drumHide: true,
  },
  methods: {
    updateMelody:function(event){
      this.x = event.pageX - 50;
      this.y = event.pageY - 50;
      this.melHide = false;
      
      if(pads.paused == false) {
        pads.addEventListener('play',function(){
          melody.play();
        })
      }
      else if(arps.paused == false) {
        arps.addEventListener('play',function(){
          melody.play();
        })
      }
      else if(drums.paused == false) {
        drums.addEventListener('play',function(){
          melody.play();
        })
      }
      else {
        melody.play();
      }
    },
    updatePads:function(event){
      this.x2 = event.pageX - 50;
      this.y2 = event.pageY - 50;
      this.padHide = false;
      
      if(melody.paused == false) {
        melody.addEventListener('play', function(){
          pads.play();
        });
      }
      else if(arps.paused == false) {
        arps.addEventListener('play',function(){
          pads.play();
        })
      }
      else if(drums.paused == false) {
        drums.addEventListener('play',function(){
          pads.play();
        })
      } 
      else {
        pads.play();
      } 
    },
    updateArps:function(event){
      this.x3 = event.pageX - 50;
      this.y3 = event.pageY - 50;
      this.arpHide = false;

      if(melody.paused == false) {
        melody.addEventListener('play', function(){
          arps.play();
        });
      }
      else if(pads.paused == false) {
        pads.addEventListener('play',function(){
          arps.play();
        })
      }
      else if(drums.paused == false) {
        drums.addEventListener('play',function(){
          arps.play();
        })
      } 
      else {
        arps.play();
      }
    },
    updateDrums:function(event){
      this.x4 = event.pageX - 50;
      this.y4 = event.pageY - 50;
      this.drumHide = false;

      if(melody.paused == false) {
        melody.addEventListener('play', function(){
          drums.play();
        });
      }
      else if(pads.paused == false) {
        pads.addEventListener('play',function(){
          drums.play();
        })
      }
      else if(arps.paused == false) {
        arps.addEventListener('play',function(){
          drums.play();
        })
      }
      else {
        drums.play();
      }
    }
  }
});

//json animations
var anim = lottie.loadAnimation({
  container: document.getElementById("animation"),
  renderer: 'svg',
  loop: true,
  autoplay: true,
  path: 'static/sonar.json' // the path to the animation json
});

var anim2 = lottie.loadAnimation({
  container: document.getElementById("animation2"),
  renderer: 'svg',
  loop: true,
  autoplay: true,
  path: 'static/play_button.json' // the path to the animation json
});

var anim3 = lottie.loadAnimation({
  container: document.getElementById("animation3"),
  renderer: 'svg',
  loop: true,
  autoplay: true,
  path: 'static/pulsing_beacon.json' // the path to the animation json
});

var anim4 = lottie.loadAnimation({
  container: document.getElementById("animation4"),
  renderer: 'svg',
  loop: true,
  autoplay: true,
  path: 'static/six_spoke_spinner.json' // the path to the animation json
});