import React, { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import "../styles/weather.css";

const Weather = () => {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const apiKey = process.env.REACT_APP_WEATHER_KEY;

  const fetchWeather = async () => {
    if (!city.trim()) return;

    try {
      setLoading(true);
      setError(null);

      // Current weather
      const currentRes = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`
      );
      if (!currentRes.ok) throw new Error("City not found");

      const currentData = await currentRes.json();
      setWeather(currentData);

      // Forecast data
      const forecastRes = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${apiKey}`
      );
      if (!forecastRes.ok) throw new Error("Forecast data not available");

      const forecastData = await forecastRes.json();

      // Group forecast by day and calculate average temp
      const dailyMap = {};
      forecastData.list.forEach((item) => {
        const date = item.dt_txt.split(" ")[0];
        if (!dailyMap[date]) dailyMap[date] = [];
        dailyMap[date].push(item.main.temp);
      });

      const summarized = Object.entries(dailyMap).map(([date, temps]) => {
        const avg = temps.reduce((a, b) => a + b, 0) / temps.length;

        const dayEntries = forecastData.list.filter((item) =>
          item.dt_txt.startsWith(date)
        );
        const condition = dayEntries[0]?.weather[0]?.main || "Clear";

        const conditionEmoji = {
          Clear: "☀️",
          Rain: "🌧️",
          Clouds: "☁️",
          Snow: "❄️",
          Thunderstorm: "🌩️",
          Drizzle: "🌦️",
          Mist: "🌫️",
        };

        return {
          date: new Date(date).toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
          }),
          temperature: parseFloat(avg.toFixed(1)),
          condition,
          emoji: conditionEmoji[condition] || "🌈",
        };
      });

      // Take next 4-5 days (excluding today if needed)
      setForecast(summarized.slice(0, 5));
    } catch (err) {
      setError(err.message);
      setWeather(null);
      setForecast([]);
    } finally {
      setLoading(false);
    }
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="weather-tooltip">
          <strong>{label}</strong>
          <p>
            {data.emoji} {data.condition}
          </p>
          <p>🌡 {data.temperature}°C</p>
        </div>
      );
    }
    return null;
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
                </div>
              </div>
            </div>
          </div>

          {forecast.length > 0 && (
            <div className="weather-forecast">
              <h4>📊 5-Day Forecast</h4>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={forecast}>
                  <CartesianGrid stroke="#ccc" />
                  <XAxis dataKey="date" />
                  <YAxis unit="°C" />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="temperature"
                    stroke="#007BFF"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Weather;
