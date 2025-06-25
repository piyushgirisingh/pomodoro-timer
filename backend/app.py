from flask import Flask, jsonify
from flask_cors import CORS
from datetime import datetime

sessions = []

app = Flask(__name__)
CORS(app)


@app.route('/api/session/start', methods=['GET'])
def start_session():
    return jsonify({"message": "Pomodoro session started!"})


@app.route('/api/session/complete', methods=['POST'])
def complete_session():
    global sessions
    timestamp = datetime.now().isoformat()
    sessions.append(timestamp)
    print(f"✅ Session completed at {timestamp}")
    return jsonify({"message": "Session completed and saved.", "sessions_today": get_today_count()})


@app.route('/api/session/today', methods=['GET'])
def get_today_sessions():
    return jsonify({"sessions_today": get_today_count()})


def get_today_count():
    today = datetime.now().date()
    return sum(1 for ts in sessions if datetime.fromisoformat(ts).date() == today)


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)
