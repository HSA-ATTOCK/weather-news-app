// App.js
import { useState, useEffect } from "react";
import "./App.css";
import Weather from "./components/Weather.jsx";
import News from "./components/News.jsx";
import Quote from "./components/Quote.jsx";
import { FiSun, FiMoon } from "react-icons/fi";

function App() {
  const [darkMode, setDarkMode] = useState(() => {
    // Check for saved preference or use system preference
    const savedMode = localStorage.getItem("darkMode");
    if (savedMode !== null) return JSON.parse(savedMode);
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  // Apply dark mode class to body on mount and when darkMode changes
  useEffect(() => {
    document.body.classList.toggle("dark-mode", darkMode);
    localStorage.setItem("darkMode", JSON.stringify(darkMode));
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <div className={`App ${darkMode ? "dark" : ""}`}>
      <div className="header-container">
        <h1 className="dashboard-title">🌤 Dashboard</h1>
        <button
          onClick={toggleDarkMode}
          className="dark-mode-toggle"
          aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
        >
          {darkMode ? <FiSun size={24} /> : <FiMoon size={24} />}
        </button>
      </div>
      <div className="dashboard-grid">
        <Quote darkMode={darkMode} />
        <div className="horizontal-cards">
          <Weather darkMode={darkMode} />
          <News /> {/* Remove darkMode prop here */}
        </div>
      </div>
    </div>
  );
}

export default App;
