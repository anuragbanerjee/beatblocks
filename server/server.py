from flask import Flask, render_template, request, copy_current_request_context
from flask_socketio import SocketIO, send, emit

import sys
import os 
camera = os.path.join(os.path.dirname(os.path.realpath(__file__)), "../camera")
sys.path.append(camera)
import block_recognizer

app = Flask(__name__)
socketio = SocketIO(app)

import random
def genBlocks():
    blocks = [{
        "shape": random.choice(["triangle", "square", "pentagon", "circle"]),
        "color": random.choice(["blue", "orange", "purple", "pink"])
    } for i in range(random.randint(1, 16))]
    return blocks

import time
def sendBlocks():
    try:
        while True:
            start = time.time()
            blocks = block_recognizer.getBlocks(debug=False)
            # blocks = genBlocks() # for testing purposes only
            end = time.time()
            print("TOOK: " + str(end - start))
            # socketio.sleep(1)
            socketio.emit("blocks", data=blocks, broadcast=True)
    except:
        socketio.sleep(1)
        sendBlocks()


@app.route("/")
def index():
    return render_template("index.html")

socketio.start_background_task(target=sendBlocks)

if __name__ == "__main__":
    print("RUNNING ON localhost:5000")
    socketio.run(app)