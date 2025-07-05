import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  ComposedChart,
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import {
  WiDaySunny,
  WiRain,
  WiCloudy,
  WiSnow,
  WiThunderstorm,
  WiFog,
} from "react-icons/wi";
import "../styles/weather.css";

const Weather = () => {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [hourlyForecast, setHourlyForecast] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [recentSearches, setRecentSearches] = useState([]);
  const [showRecents, setShowRecents] = useState(false);
  const [activeTab, setActiveTab] = useState("daily");
  const [unit, setUnit] = useState("metric");
  const [theme, setTheme] = useState("light");

  const apiKey = process.env.REACT_APP_WEATHER_KEY;

  // Load recent searches from localStorage
  useEffect(() => {
    const savedSearches = localStorage.getItem("weatherRecentSearches");
    if (savedSearches) {
      setRecentSearches(JSON.parse(savedSearches));
    }

    // Check user's preferred color scheme
    if (
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    ) {
      setTheme("dark");
    }
  }, []);

  const fetchWeather = async () => {
    if (!city.trim()) return;

    try {
      setLoading(true);
      setError(null);

      // Current weather
      const currentRes = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=${unit}&appid=${apiKey}`
      );
      if (!currentRes.ok) throw new Error("City not found");

      const currentData = await currentRes.json();
      setWeather(currentData);

      // Forecast data
      const forecastRes = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=${unit}&appid=${apiKey}`
      );
      if (!forecastRes.ok) throw new Error("Forecast data not available");

      const forecastData = await forecastRes.json();

      // Process both daily and hourly forecast
      const processedDailyForecast = processDailyForecastData(forecastData);
      setForecast(processedDailyForecast);

      const processedHourlyForecast = processHourlyForecastData(forecastData);
      setHourlyForecast(processedHourlyForecast);

      // Add to recent searches
      addToRecentSearches(city);
    } catch (err) {
      setError(err.message);
      setWeather(null);
      setForecast([]);
      setHourlyForecast([]);
    } finally {
      setLoading(false);
      setShowRecents(false);
    }
  };

  const processDailyForecastData = (forecastData) => {
    const dailyMap = {};
    forecastData.list.forEach((item) => {
      const date = item.dt_txt.split(" ")[0];
      if (!dailyMap[date]) dailyMap[date] = [];
      dailyMap[date].push(item.main.temp);
    });

    return Object.entries(dailyMap)
      .map(([date, temps]) => {
        const avg = temps.reduce((a, b) => a + b, 0) / temps.length;
        const dayEntries = forecastData.list.filter((item) =>
          item.dt_txt.startsWith(date)
        );
        const condition = dayEntries[0]?.weather[0]?.main || "Clear";

        return {
          date: new Date(date).toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
          }),
          temperature: parseFloat(avg.toFixed(1)),
          condition,
          min: Math.min(...temps),
          max: Math.max(...temps),
          humidity: dayEntries[0]?.main?.humidity,
          wind: dayEntries[0]?.wind?.speed,
        };
      })
      .slice(0, 5);
  };

  const processHourlyForecastData = (forecastData) => {
    return forecastData.list.slice(0, 8).map((item) => ({
      time: new Date(item.dt * 1000).toLocaleTimeString([], {
        hour: "2-digit",
      }),
      temp: item.main.temp,
      condition: item.weather[0]?.main,
      humidity: item.main.humidity,
      wind: item.wind.speed,
    }));
  };

  const addToRecentSearches = (cityName) => {
    const updatedRecents = [
      cityName,
      ...recentSearches.filter(
        (city) => city.toLowerCase() !== cityName.toLowerCase()
      ),
    ].slice(0, 5);

    setRecentSearches(updatedRecents);
    localStorage.setItem(
      "weatherRecentSearches",
      JSON.stringify(updatedRecents)
    );
  };

  const handleRecentSearch = (recentCity) => {
    setCity(recentCity);
    setTimeout(() => fetchWeather(), 100);
  };

  const toggleUnit = () => {
    setUnit(unit === "metric" ? "imperial" : "metric");
  };

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  const getWeatherIcon = (condition, size = 24) => {
    const iconProps = { size };
    switch (condition) {
      case "Clear":
        return <WiDaySunny {...iconProps} />;
      case "Rain":
        return <WiRain {...iconProps} />;
      case "Clouds":
        return <WiCloudy {...iconProps} />;
      case "Snow":
        return <WiSnow {...iconProps} />;
      case "Thunderstorm":
        return <WiThunderstorm {...iconProps} />;
      case "Drizzle":
      case "Mist":
      case "Fog":
        return <WiFog {...iconProps} />;
      default:
        return <WiDaySunny {...iconProps} />;
    }
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <motion.div
          className={`weather-tooltip ${theme}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <strong>{label}</strong>
          <div className="tooltip-condition">
            {getWeatherIcon(data.condition, 30)}
            <span>{data.condition}</span>
          </div>
          <p>
            🌡 Temp: {data.temp || data.temperature}
            {unit === "metric" ? "°C" : "°F"}
          </p>
          {data.min && (
            <p>
              ⬇️ Low: {data.min}
              {unit === "metric" ? "°C" : "°F"}
            </p>
          )}
          {data.max && (
            <p>
              ⬆️ High: {data.max}
              {unit === "metric" ? "°C" : "°F"}
            </p>
          )}
          <p>💧 Humidity: {data.humidity}%</p>
          <p>
            💨 Wind: {data.wind} {unit === "metric" ? "m/s" : "mph"}
          </p>
        </motion.div>
      );
    }
    return null;
  };

  const getWeatherBackground = (condition) => {
    const lightBackgrounds = {
      Clear: "linear-gradient(135deg, #56CCF2 0%, #2F80ED 100%)",
      Rain: "linear-gradient(135deg, #4B79CF 0%, #283E51 100%)",
      Clouds: "linear-gradient(135deg, #BDC3C7 0%, #2C3E50 100%)",
      Snow: "linear-gradient(135deg, #E0EAFC 0%, #CFDEF3 100%)",
      Thunderstorm:
        "linear-gradient(135deg, #0F2027 0%, #203A43 50%, #2C5364 100%)",
      Drizzle: "linear-gradient(135deg, #74ebd5 0%, #ACB6E5 100%)",
      Mist: "linear-gradient(135deg, #606c88 0%, #3f4c6b 100%)",
    };

    const darkBackgrounds = {
      Clear: "linear-gradient(135deg, #0F2027 0%, #203A43 50%, #2C5364 100%)",
      Rain: "linear-gradient(135deg, #16222A 0%, #3A6073 100%)",
      Clouds: "linear-gradient(135deg, #1F1C2C 0%, #928DAB 100%)",
      Snow: "linear-gradient(135deg, #1D2B64 0%, #F8CDDA 100%)",
      Thunderstorm: "linear-gradient(135deg, #000000 0%, #434343 100%)",
      Drizzle: "linear-gradient(135deg, #1D4350 0%, #A43931 100%)",
      Mist: "linear-gradient(135deg, #29323C 0%, #485563 100%)",
    };

    const backgrounds = theme === "dark" ? darkBackgrounds : lightBackgrounds;
    return backgrounds[condition] || backgrounds["Clear"];
  };

  return (
    <motion.div
      className={`weather-card ${theme}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{
        background: weather?.weather
          ? getWeatherBackground(weather.weather[0].main)
          : theme === "dark"
          ? "linear-gradient(135deg, #0F2027 0%, #203A43 50%, #2C5364 100%)"
          : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      }}
    >
      <div className="weather-header">
        <h2 className="weather-title">
          <motion.span
            className="weather-icon"
            animate={{ y: [0, -5, 0] }}
            transition={{
              repeat: Infinity,
              duration: 3,
              ease: "easeInOut",
            }}
          >
            🌦
          </motion.span>
          Weather Forecast
        </h2>

        <div className="header-controls">
          {recentSearches.length > 0 && (
            <button
              className="recent-button"
              onClick={() => setShowRecents(!showRecents)}
            >
              {showRecents ? "Hide Recents" : "Recents"}
            </button>
          )}

          <button
            className="unit-toggle"
            onClick={toggleUnit}
            title={`Switch to ${unit === "metric" ? "Fahrenheit" : "Celsius"}`}
          >
            {unit === "metric" ? "°C" : "°F"}
          </button>

          <button
            className="theme-toggle"
            onClick={toggleTheme}
            title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          >
            {theme === "dark" ? "☀️" : "🌙"}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showRecents && (
          <motion.div
            className="recent-searches"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            {recentSearches.map((recentCity, index) => (
              <motion.div
                key={index}
                className="recent-item"
                onClick={() => handleRecentSearch(recentCity)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {recentCity}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="weather-search">
        <div className="search-container">
          <input
            type="text"
            className="weather-input"
            placeholder="Enter city name..."
            value={city}
            onChange={(e) => setCity(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && fetchWeather()}
          />
          {city && (
            <button className="clear-button" onClick={() => setCity("")}>
              ✕
            </button>
          )}
        </div>
        <motion.button
          className="weather-button"
          onClick={fetchWeather}
          disabled={loading || !city.trim()}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {loading ? (
            <span className="loading-spinner"></span>
          ) : (
            <>
              <span className="button-icon">🔍</span> Search
            </>
          )}
        </motion.button>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div
            className="weather-error"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            ⚠️ {error}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {weather && weather.main && (
          <motion.div
            className="weather-content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="current-weather">
              <h3 className="weather-city">
                <span className="weather-location-icon">📍</span>
                {weather.name}, {weather.sys?.country}
                <span className="current-date">
                  {new Date().toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </h3>

              <div className="weather-main">
                <div className="temperature-display">
                  <div className="current-temp">
                    {getWeatherIcon(weather.weather[0].main, 40)}
                    {Math.round(weather.main.temp)}
                    {unit === "metric" ? "°C" : "°F"}
                  </div>
                  <div className="temp-range">
                    <span className="high-temp">
                      ⬆️ {Math.round(weather.main.temp_max)}
                      {unit === "metric" ? "°C" : "°F"}
                    </span>
                    <span className="low-temp">
                      ⬇️ {Math.round(weather.main.temp_min)}
                      {unit === "metric" ? "°C" : "°F"}
                    </span>
                  </div>
                  <div className="weather-condition">
                    {weather.weather[0].description}
                  </div>
                </div>

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
                        {weather.wind.speed} {unit === "metric" ? "m/s" : "mph"}
                      </span>
                    </div>
                  </div>
                  <div className="weather-detail">
                    <span className="weather-detail-icon">🌫️</span>
                    <div className="weather-detail-text">
                      Pressure:{" "}
                      <span className="weather-detail-value">
                        {weather.main.pressure} hPa
                      </span>
                    </div>
                  </div>
                  <div className="weather-detail">
                    <span className="weather-detail-icon">👁️</span>
                    <div className="weather-detail-text">
                      Visibility:{" "}
                      <span className="weather-detail-value">
                        {(weather.visibility / 1000).toFixed(1)} km
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="forecast-tabs">
              <button
                className={`tab-button ${
                  activeTab === "hourly" ? "active" : ""
                }`}
                onClick={() => setActiveTab("hourly")}
              >
                Hourly Forecast
              </button>
              <button
                className={`tab-button ${
                  activeTab === "daily" ? "active" : ""
                }`}
                onClick={() => setActiveTab("daily")}
              >
                5-Day Forecast
              </button>
            </div>

            {activeTab === "hourly" && hourlyForecast.length > 0 && (
              <div className="weather-forecast">
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height={250}>
                    <ComposedChart data={hourlyForecast}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis
                        dataKey="time"
                        tick={{ fill: theme === "dark" ? "#fff" : "#333" }}
                      />
                      <YAxis
                        tick={{ fill: theme === "dark" ? "#fff" : "#333" }}
                        domain={["dataMin - 2", "dataMax + 2"]}
                      />
                      <Tooltip
                        content={<CustomTooltip />}
                        contentStyle={{
                          background:
                            theme === "dark"
                              ? "rgba(0, 0, 0, 0.9)"
                              : "rgba(255, 255, 255, 0.9)",
                          border: "none",
                          borderRadius: "10px",
                          color: theme === "dark" ? "#fff" : "#333",
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="temp"
                        fill={
                          theme === "dark"
                            ? "rgba(79, 195, 247, 0.2)"
                            : "rgba(79, 195, 247, 0.4)"
                        }
                        stroke={theme === "dark" ? "#4fc3f7" : "#2F80ED"}
                      />
                      <Line
                        type="monotone"
                        dataKey="temp"
                        stroke={theme === "dark" ? "#4fc3f7" : "#2F80ED"}
                        strokeWidth={3}
                        dot={{
                          fill: theme === "dark" ? "#4fc3f7" : "#2F80ED",
                          strokeWidth: 2,
                          r: 5,
                        }}
                        activeDot={{
                          fill: theme === "dark" ? "#ffeb3b" : "#FFA000",
                          strokeWidth: 0,
                          r: 7,
                        }}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>

                <div className="hourly-forecast-items">
                  {hourlyForecast.map((hour, index) => (
                    <motion.div
                      key={index}
                      className="hourly-item"
                      whileHover={{ scale: 1.05 }}
                    >
                      <div className="hour-time">{hour.time}</div>
                      <div className="hour-icon">
                        {getWeatherIcon(hour.condition, 24)}
                      </div>
                      <div className="hour-temp">
                        {Math.round(hour.temp)}
                        {unit === "metric" ? "°C" : "°F"}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "daily" && forecast.length > 0 && (
              <div className="weather-forecast">
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height={250}>
                    <ComposedChart data={forecast}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis
                        dataKey="date"
                        tick={{ fill: theme === "dark" ? "#fff" : "#333" }}
                      />
                      <YAxis
                        tick={{ fill: theme === "dark" ? "#fff" : "#333" }}
                        domain={["dataMin - 2", "dataMax + 2"]}
                      />
                      <Tooltip
                        content={<CustomTooltip />}
                        contentStyle={{
                          background:
                            theme === "dark"
                              ? "rgba(0, 0, 0, 0.9)"
                              : "rgba(255, 255, 255, 0.9)",
                          border: "none",
                          borderRadius: "10px",
                          color: theme === "dark" ? "#fff" : "#333",
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="temperature"
                        fill={
                          theme === "dark"
                            ? "rgba(79, 195, 247, 0.2)"
                            : "rgba(79, 195, 247, 0.4)"
                        }
                        stroke={theme === "dark" ? "#4fc3f7" : "#2F80ED"}
                      />
                      <Line
                        type="monotone"
                        dataKey="temperature"
                        stroke={theme === "dark" ? "#4fc3f7" : "#2F80ED"}
                        strokeWidth={3}
                        dot={{
                          fill: theme === "dark" ? "#4fc3f7" : "#2F80ED",
                          strokeWidth: 2,
                          r: 5,
                        }}
                        activeDot={{
                          fill: theme === "dark" ? "#ffeb3b" : "#FFA000",
                          strokeWidth: 0,
                          r: 7,
                        }}
                      />
                      <ReferenceLine
                        y={
                          forecast.reduce((a, b) => a + b.temperature, 0) /
                          forecast.length
                        }
                        stroke={theme === "dark" ? "#ffeb3b" : "#FFA000"}
                        strokeDasharray="5 5"
                        label={{
                          value: "Avg",
                          position: "right",
                          fill: theme === "dark" ? "#ffeb3b" : "#FFA000",
                        }}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>

                <div className="forecast-days">
                  {forecast.map((day, index) => (
                    <motion.div
                      key={index}
                      className="forecast-day"
                      whileHover={{ y: -5 }}
                    >
                      <div className="day-name">{day.date.split(",")[0]}</div>
                      <div className="day-icon">
                        {getWeatherIcon(day.condition, 30)}
                      </div>
                      <div className="day-temp">
                        {Math.round(day.temperature)}
                        {unit === "metric" ? "°C" : "°F"}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Weather;
