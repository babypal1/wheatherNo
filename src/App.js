import React, { useState, useEffect } from 'react'
import './index.css' // 👈 make sure this line is there

const WEATHER_CODES = {
  0: 'Clear sky',
  1: 'Mainly clear',
  2: 'Partly cloudy',
  3: 'Overcast',
  45: 'Fog',
  48: 'Depositing rime fog',
  51: 'Light drizzle',
  53: 'Moderate drizzle',
  55: 'Dense drizzle',
  61: 'Slight rain',
  63: 'Moderate rain',
  65: 'Heavy rain',
  80: 'Rain showers slight',
  81: 'Rain showers moderate',
  82: 'Rain showers violent',
  95: 'Thunderstorm'
}

function App() {
  const [city, setCity] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [result, setResult] = useState(null)
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  async function fetchWeatherForCity(name) {
    setError(null)
    setResult(null)
    if (!name) return setError('Please enter a city name')
    try {
      setLoading(true)
      const geoRes = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(name)}&count=5`
      )
      const geoJson = await geoRes.json()
      if (!geoJson.results || geoJson.results.length === 0)
        return setError('City not found')

      const { latitude, longitude, name: placeName, country } = geoJson.results[0]
      const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&timezone=auto`
      const wRes = await fetch(weatherUrl)
      const wJson = await wRes.json()
      if (!wJson.current_weather) return setError('Weather data not available')

      setResult({
        placeName,
        country,
        current: wJson.current_weather
      })
    } catch (err) {
      setError('Network or API error')
    } finally {
      setLoading(false)
    }
  }

  function onSearch(e) {
    e.preventDefault()
    fetchWeatherForCity(city.trim())
  }

  const formattedTime = currentTime.toLocaleTimeString()
  const formattedDate = currentTime.toLocaleDateString()

  return (
    <div className="app">
      <div className="weather-card">
        <h1 className="title">🌦️ WeatherNow</h1>
        <p className="subtitle">Instant weather updates for any city</p>

        <div className="datetime">
          <strong>{formattedDate}</strong> | {formattedTime}
        </div>

        <form onSubmit={onSearch} className="search-row">
          <input
            type="text"
            placeholder="Enter city (e.g. Delhi, London)"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Searching...' : 'Search'}
          </button>
        </form>

        {error && <p className="error">{error}</p>}

        {result && (
          <div className="result">
            <h2>
              {result.placeName}, <span>{result.country}</span>
            </h2>
            <div className="temperature">
              {result.current.temperature}°C
            </div>
            <p>{WEATHER_CODES[result.current.weathercode] || 'Unknown'}</p>
            <div className="details">
              <div>💨 Wind: {result.current.windspeed} km/h</div>
              <div>🧭 Direction: {result.current.winddirection}°</div>
              <div>🕒 Time: {result.current.time}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
