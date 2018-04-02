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
    console.log("from server: ", blocks);
    if (blocks == null) {
      blocks = []
    }
    
    let b = blocks.map(b => `<li>${b["color"]} ${b["shape"]}</li>`).join("")
    $("#messages").innerHTML = `
      ${b}`;

    all_blocks = blocks;

    if (started == false && all_blocks.length > 0) {
      sources.forEach(s => s.start(0))
      started = true;
    }
  });

  triggerAnimations();
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
        arps1: 'static/sounds/arp 1.ogg',
        arps2: 'static/sounds/arp 2.ogg',
        arps3: 'static/sounds/arp 3.ogg',
        arps4: 'static/sounds/arp 4.ogg',

        melody1: 'static/sounds/melody 1.ogg',
        melody2: 'static/sounds/melody 2.ogg',
        melody3: 'static/sounds/melody 3.ogg',
        melody4: 'static/sounds/melody 4.ogg',

        pads1: 'static/sounds/pads 1.ogg',
        pads2: 'static/sounds/pads 2.ogg',
        pads3: 'static/sounds/pads 3.ogg',
        pads4: 'static/sounds/pads 4.ogg',

        perc1: 'static/sounds/perc 1.ogg',
        perc2: 'static/sounds/perc 2.ogg',
        perc3: 'static/sounds/perc 3.ogg',
        perc4: 'static/sounds/perc 4.ogg'
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
}, 8000);


// Vue.js
new Vue({
  el: '#screen',
  data: {
    message: 'Hello Vue.js!',
    magHide: false,
    ojHide: false,
    purpHide: false,
    blueHide: false,
    greenHide: false,
    redHide: false,
  },
  methods: {
    updateMag:function(event){
      this.magHide = true;
    },
    updateOj:function(event){
      this.ojHide = true;
    },
    updatePurp:function(event){
      this.purpHide = true;
    },
    updateBlue:function(event){
      this.blueHide = true;
    }
    // updateGreen:function(event){
    //   this.greenHide = true;
    // }
    // updateRed:function(event){
    //   this.redHide = true;
    // }
  }
});

function triggerAnimations () {

  //json animations
  var magenta = lottie.loadAnimation({
    container: document.getElementById("magenta"),
    renderer: 'svg',
    loop: false,
    autoplay: true,
    path: 'static/mag.json' // the path to the animation json
  });

  var orange = lottie.loadAnimation({
    container: document.getElementById("orange"),
    renderer: 'svg',
    loop: false,
    autoplay: true,
    path: 'static/oj.json' // the path to the animation json
  });

  var purple = lottie.loadAnimation({
    container: document.getElementById("purple"),
    renderer: 'svg',
    loop: false,
    autoplay: true,
    path: 'static/purp.json' // the path to the animation json
  });

  var blue  = lottie.loadAnimation({
    container: document.getElementById("blue"),
    renderer: 'svg',
    loop: false,
    autoplay: true,
    path: 'static/blue.json' // the path to the animation json
  });

  var green  = lottie.loadAnimation({
    container: document.getElementById("green"),
    renderer: 'svg',
    loop: false,
    autoplay: true,
    path: 'static/grn.json' // the path to the animation json
  });

  var red  = lottie.loadAnimation({
    container: document.getElementById("red"),
    renderer: 'svg',
    loop: true,
    autoplay: true,
    path: 'static/red.json' // the path to the animation json
  });
}