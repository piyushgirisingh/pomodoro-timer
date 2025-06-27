import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import './Timer.css';

const ding = new Audio('/sounds/ding.mp3');

function App() {
  const [timeLeft, setTimeLeft] = useState(10); // Change to 1500 for 25 mins
  const [isRunning, setIsRunning] = useState(false);
  const [message, setMessage] = useState('');
  const [sessionCount, setSessionCount] = useState(0);
  const timerRef = useRef(null);
  const sessionCompletedRef = useRef(false);
  const [darkMode, setDarkMode] = useState(false);

  const DAILY_GOAL = 4;
  const WORK_DURATION = 10; // Change to 1500 for 25 mins

  const getTreeStage = () => {
    const stages = ["🌱", "🌿", "🌳", "🌴", "🎄"];
    return stages[Math.min(sessionCount, stages.length - 1)];
  };

  const getProgressPercentage = () => {
    return Math.min((sessionCount / DAILY_GOAL) * 100, 100);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const startTimer = () => {
    if (!isRunning) {
      setIsRunning(true);
    }
  };

  const pauseTimer = () => {
    clearInterval(timerRef.current);
    setIsRunning(false);
  };

  const resetTimer = () => {
    clearInterval(timerRef.current);
    setIsRunning(false);
    setTimeLeft(WORK_DURATION);
    setSessionCount(0);
    setMessage("");
  };

  const notifyBackend = async () => {
    try {
      const res = await axios.post('http://127.0.0.1:5001/api/session/complete');
      console.log('✅ Backend responded:', res.data);
      setMessage(res.data.message || 'Session completed and saved!');
    } catch (err) {
      console.error('❌ Error:', err.message);
      setMessage('Error sending completion to backend');
    }
  };

  useEffect(() => {
    ding.load();
  }, []);

  useEffect(() => {
    if (!isRunning || sessionCount >= DAILY_GOAL) return;

    sessionCompletedRef.current = false;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setIsRunning(false);
          setTimeLeft(WORK_DURATION);

          if (!sessionCompletedRef.current) {
            sessionCompletedRef.current = true;
            setSessionCount((prev) => prev + 1);
            ding.play().catch((err) => {
              console.error("🔇 Sound failed to play:", err);
            });
            notifyBackend();
          }

          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [isRunning, sessionCount]);

  const themeStyles = {
    backgroundColor: darkMode ? "#1e1e1e" : "#f5f5f5",
    color: darkMode ? "#ffffff" : "#000000",
    transition: "all 0.3s ease",
    fontFamily: 'Arial, sans-serif',
    padding: '2rem',
    textAlign: 'center',
    maxWidth: '600px',
    margin: 'auto',
    minHeight: '100vh'
  };

  return (
    <div style={themeStyles}>
      <button
        onClick={() => setDarkMode(!darkMode)}
        style={{
          position: "absolute",
          top: "1rem",
          right: "1rem",
          padding: "0.5rem 1rem",
          fontSize: "1rem",
          borderRadius: "5px",
          border: "none",
          backgroundColor: darkMode ? "#ffc107" : "#333",
          color: darkMode ? "#000" : "#fff",
          cursor: "pointer"
        }}
      >
        {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
      </button>

      <h1> Pomodoro Timer 🍅</h1>

      <h2 style={{ fontSize: "5rem", margin: "1rem 0", fontWeight: "bold" }}>
        {formatTime(timeLeft)}
      </h2>

      <h3 style={{ fontSize: "3rem" }}>Focus Tree: {getTreeStage()}</h3>

      {/* 📊 Progress Bar Section */}
      <div style={{ marginTop: "1rem", width: "80%", marginLeft: "auto", marginRight: "auto" }}>
        <div style={{
          height: "20px",
          backgroundColor: darkMode ? "#444" : "#e0e0e0",
          borderRadius: "10px",
          overflow: "hidden"
        }}>
          <div style={{
            width: `${getProgressPercentage()}%`,
            height: "100%",
            backgroundColor: getProgressPercentage() === 100 ? "#28a745" : (darkMode ? "#90caf9" : "#007bff"),
            transition: "width 0.4s ease"
          }} />
        </div>
        <p style={{ marginTop: "0.5rem", fontWeight: "bold" }}>
          {`Pomodoros completed: ${sessionCount} / ${DAILY_GOAL}`}
        </p>
      </div>

      {/* Buttons */}
      <div style={{ marginBottom: "1rem", marginTop: "2rem" }}>
        {sessionCount >= DAILY_GOAL ? (
          <button className="timer-button" disabled>🎉 Goal Completed!</button>
        ) : !isRunning ? (
          <button className="timer-button" onClick={startTimer}>Start</button>
        ) : (
          <button className="timer-button" onClick={pauseTimer}>Pause</button>
        )}
        <button className="timer-button" style={{ marginLeft: "1rem" }} onClick={resetTimer}>Reset</button>
      </div>

      <p>{message}</p>
    </div>
  );
}

export default App;