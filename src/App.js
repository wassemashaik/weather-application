// import WeatherCard from "./components/WeatherCard";
import "./App.css";
import { useState } from "react";
import axios from "axios";

function App() {
  const [city, setCity] = useState("");
  const [weatherData, setWeatherData] = useState(null);
  const [forecastData, setForecastData] = useState([]);
  const [darkMode, setDarkMode] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const apiKey = process.env.REACT_APP_WEATHER_API_KEY;

  const fetchWeather = async () => {
    if (!city) {
      setError("Please enter a city name");
      return;
    };
    try {
      setLoading(true)
      setError("");
      setWeatherData(null);
      setForecastData([]);

      const current = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`
      );

      const { lat, lon } = current.data.coord;
      setWeatherData(current.data)

      const forecast = await axios.get(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
      );

      const filteredForecast = forecast.data.list.filter((_,index) => index % 8 === 0)
      setForecastData(filteredForecast)

    } catch (err) {
      console.error(err);
      setError("Could not fetch weather data. Please check the city name or try again later.");
    }finally {
      setLoading(false)
    }
  };

  const getWeatherClass = () => {
    if (!weatherData) return "";
    const main = weatherData.weather[0].main.toLowerCase();
    if (main.includes("cloud")) return "cloudy";
    if (main.includes("rain")) return "rainy";
    if (main.includes("clear")) return "sunny";
    return "default-weather";
  };

  const toggleTheme = () => {
    setDarkMode((prev) => (prev === "light" ? "dark" : "light"))
  };

  return (
    <div className={`app ${darkMode} ${getWeatherClass()}`}>
      <div className="header">
      <h1>🌤️ Weather App</h1>
      <button onClick={toggleTheme} className="toggle-btn">
          {darkMode === "light" ?  "🌙 Dark Mode" : "☀️ Light Mode"}
        </button>
        </div>
      <div className="search-box">
        <input
          type="text"
          placeholder="Enter city name"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && fetchWeather()}
        />
        <button className="get-btn" onClick={fetchWeather}>Get Weather</button>
      </div>

      {error && <div className="error">{error}</div>}
      {loading && <div className="loading">Loading...</div> }

      {weatherData && (
        <div className="weather-info">
          <h2>
            {weatherData.name}, {weatherData.sys.country}
          </h2>
          <img
            src={`https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png`}
            alt="weather icon"
          />
          <p>🌡️ Temperature: {weatherData.main.temp}°C</p>
          <p>🌥️ Weather: {weatherData.weather[0].description}</p>
          <p>💧 Humidity: {weatherData.main.humidity}%</p>
          <p>🌬️ Wind: {weatherData.wind.speed} m/s</p>
        </div>
      )}

      {forecastData.length > 0 && (
        <div className="forecast">
          <h3>5-Day Forecast</h3>
          <div className="forecast-grid">
            {forecastData.map((day, index) => (
              <div key={index} className="forecast-card">
                <p>{new Date(day.dt * 1000).toLocaleDateString()}</p>
                <img
                  src={`https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png`}
                  alt={day.weather[0].description}
                />
                <p>{day.weather[0].description}</p>
                <p>{day.main.temp}°C</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
