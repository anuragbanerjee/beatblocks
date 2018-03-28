let all_blocks = [];
function shouldBlockPlay(color, shape){
  const matches = all_blocks.filter(b => b.color === color && b.shape == shape);
  return matches.length > 0;
}

$(document).ready(function() {
  var socket = io.connect('http://localhost:5000');

  socket.on('blocks', (blocks) => {
    let b = blocks.map(b => `<li>${b["color"]} ${b["shape"]}</li>`).join("")
    $("#messages").append(`
    <ol>
      ${b}
    </ol><br>`);

    all_blocks = blocks;
  });
});

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

const melodies = [
  {
    el: melody1,
    shape: "triangle"
  },{
    el: melody2,
    shape: "square"
  },{
    el: melody3,
    shape: "pentagon"
  },{
    el: melody4,
    shape: "circle"
  },
].map(m => {
  m.color = "blue";
  return m;
});

const pads = [
  {
    el: pads1,
    shape: "triangle"
  },{
    el: pads2,
    shape: "square"
  },{
    el: pads3,
    shape: "pentagon"
  },{
    el: pads4,
    shape: "circle"
  },
].map(m => {
  m.color = "purple";
  return m;
});

const arps = [
  {
    el: arps1,
    shape: "triangle"
  },{
    el: arps2,
    shape: "square"
  },{
    el: arps3,
    shape: "pentagon"
  },{
    el: arps4,
    shape: "circle"
  },
].map(m => {
  m.color = "pink";
  return m;
});

const percs = [
  {
    el: perc1,
    shape: "triangle"
  },{
    el: perc2,
    shape: "square"
  },{
    el: perc3,
    shape: "pentagon"
  },{
    el: perc4,
    shape: "circle"
  },
].map(m => {
  m.color = "orange";
  return m;
});

const sounds = Array.prototype.concat(melodies, pads, arps, percs);

console.log(`starting sounds`);
sounds.forEach(s => {
  s.el.muted = !shouldBlockPlay(s.color, s.shape);
  s.el.loop = true;
  s.el.play();
});

setInterval(() => {
  console.log("blocks", JSON.stringify(all_blocks))
  sounds.forEach(s => {
    s.el.muted = !shouldBlockPlay(s.color, s.shape);
  });
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