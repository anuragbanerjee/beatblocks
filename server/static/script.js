// here, the client will establish a websocket connection
$(document).ready(function() {

  var socket = io.connect('http://localhost:5000');

  socket.on('blocks', function(blocks) {
    b = blocks.map(b => `${b["color"]} ${b["shape"]}<br>`).join("")
    $("#messages").append(`
    <li>
      ${b}
    </li>`);
  })
});

// Audio
var melody = document.getElementById("melody");
var pads = document.getElementById("pads");
var arps = document.getElementById("arps");
var drums = document.getElementById("drums");

melody.addEventListener('ended', function(){
  melody.play();
});
pads.addEventListener('ended', function() {
  pads.play();
})
arps.addEventListener('ended', function() {
  arps.play();
})
drums.addEventListener('ended', function() {
  drums.play();
})

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