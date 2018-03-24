from flask import Flask, render_template, request, copy_current_request_context
from flask_socketio import SocketIO, send, emit

import sys
import os 
camera = os.path.join(os.path.dirname(os.path.realpath(__file__)), "../camera")
sys.path.append(camera)
import block_recognizer

app = Flask(__name__)
socketio = SocketIO(app)

def sendBlocks():
    while True:
        blocks = block_recognizer.getBlocks(debug=False)
        socketio.emit("blocks", data=blocks, broadcast=True)
        socketio.sleep(1)

socketio.start_background_task(target=sendBlocks)

@app.route("/")
def index():
    return render_template("index.html")

if __name__ == "__main__":
    print("RUNNING ON localhost:5000")
    socketio.run(app)