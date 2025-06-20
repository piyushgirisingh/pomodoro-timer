import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [timeLeft, setTimeLeft] = useState(1 * 60); // 25 mins in seconds
  const [isRunning, setIsRunning] = useState(false);
  const [message, setMessage] = useState('');
  const timerRef = useRef(null);

  // Converts seconds to MM:SS format
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const startTimer = () => {
    if (!isRunning) {
      setIsRunning(true);
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev === 1) {
            clearInterval(timerRef.current);
            setIsRunning(false);
            notifyBackend();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  };

  const pauseTimer = () => {
    clearInterval(timerRef.current);
    setIsRunning(false);
  };

  const resetTimer = () => {
    clearInterval(timerRef.current);
    setIsRunning(false);
    setTimeLeft(1 * 60);
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



  // Cleanup timer if component unmounts
  useEffect(() => {
    return () => clearInterval(timerRef.current);
  }, []);

  return (
    <div style={{ fontFamily: 'Arial', padding: '2rem', textAlign: 'center' }}>
      <h1>Pomodoro Timer 🍅</h1>
      <h2>{formatTime(timeLeft)}</h2>

      <div>
        {!isRunning ? (
          <button onClick={startTimer}>Start</button>
        ) : (
          <button onClick={pauseTimer}>Pause</button>
        )}
        <button onClick={resetTimer} style={{ marginLeft: '10px' }}>Reset</button>
      </div>

      <p>{message}</p>
    </div>
  );
}

export default App;


