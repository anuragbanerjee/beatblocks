function BufferLoader(context, urlMap, callback) {
  this.context = context;
  this.urlMap = urlMap;
  this.onload = callback;
  this.bufferMap = {};
  this.loadCount = 0;
}

BufferLoader.prototype.loadBuffer = function(url, key) {
  // Load buffer asynchronously
  var request = new XMLHttpRequest();
  request.open("GET", url, true);
  request.responseType = "arraybuffer";

  var loader = this;

  request.onload = function() {
    // Asynchronously decode the audio file data in request.response
    loader.context.decodeAudioData(
      request.response,
      function(buffer) {
        if (!buffer) {
          alert('error decoding file data: ' + url);
          return;
        }

        loader.bufferMap[key] = buffer;
        if (++loader.loadCount == Object.keys(loader.urlMap).length)
          loader.onload(loader.bufferMap);
      },
      function(error) {
        console.error('decodeAudioData error', error);
      }
    );
  }

  request.onerror = function() {
    alert('BufferLoader: XHR error');
  }

  request.send();
}

BufferLoader.prototype.load = function() {
  Object.keys(this.urlMap).forEach(url => {
    this.loadBuffer(this.urlMap[url], url);
  });
}
