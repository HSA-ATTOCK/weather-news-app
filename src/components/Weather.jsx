import React, { useState } from "react";
import "../styles/weather.css";

const Weather = () => {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const apiKey = process.env.REACT_APP_WEATHER_KEY;

  const fetchWeather = async () => {
    if (!city.trim()) return;

    try {
      setLoading(true);
      setError(null);
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city.trim()}&units=metric&appid=${apiKey}`
      );

      if (!res.ok) {
        throw new Error(
          res.status === 404 ? "City not found" : "Weather data unavailable"
        );
      }

      const data = await res.json();
      setWeather(data);
    } catch (err) {
      setError(err.message);
      setWeather(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="weather-card">
      <div className="weather-header">
        <h2 className="weather-title">
          <span className="weather-icon">🌦</span> Weather
        </h2>
      </div>

      <div className="weather-search">
        <input
          type="text"
          className="weather-input"
          placeholder="Enter city"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && fetchWeather()}
        />
        <button
          className="weather-button"
          onClick={fetchWeather}
          disabled={loading}
        >
          {loading ? "Loading..." : "Get Weather"}
        </button>
      </div>

      {error && <div className="weather-error">⚠️ {error}</div>}

      {weather && weather.main && (
        <div className="weather-content">
          <h3 className="weather-city">
            <span className="weather-location-icon">📍</span> {weather.name}
          </h3>
          <p className="weather-description">
            {weather.weather[0].description}
          </p>
          <div className="weather-main">
            <p className="weather-temp">
              <span className="weather-temp-icon">🌡</span>{" "}
              {Math.round(weather.main.temp)}°C
            </p>
            <div className="weather-details">
              <div className="weather-detail">
                <span className="weather-detail-icon">💧</span>
                <div className="weather-detail-text">
                  Humidity:{" "}
                  <span className="weather-detail-value">
                    {weather.main.humidity}%
                  </span>
                </div>
              </div>
              <div className="weather-detail">
                <span className="weather-detail-icon">💨</span>
                <div className="weather-detail-text">
                  Wind:{" "}
                  <span className="weather-detail-value">
                    {weather.wind.speed} m/s
                  </span>
                  {/* for wind in km/h, you can uncomment the span below */}
                  {/* and comment the above span */}
                  {/* <span className="weather-detail-value">
                    {(weather.wind.speed * 3.6).toFixed(1)} km/h
                  </span> */}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Weather;
