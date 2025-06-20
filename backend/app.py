from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)


@app.route('/api/session/start', methods=['GET'])
def start_session():
    return jsonify({"message": "Pomodoro session started!"})


@app.route('/api/session/complete', methods=['POST'])
def complete_session():
    print("✅ Received session completion from frontend")
    return jsonify({"message": "Session completed and saved."})


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)
