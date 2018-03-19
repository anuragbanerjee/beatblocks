
from flask import Flask, render_template
from flask_socketio import SocketIO, send

app = Flask(__name__)
socketio = SocketIO(app)


@socketio.on('message')
def handle_message(msg):
    print('Message: ' + msg)
    send(msg, broadcast=True)


@app.route("/")
def hello():
    return render_template("index.html")


if __name__ == "__main__":
    socketio.run(app)