import { useEffect, useMemo, useState } from "react"
import axios from "axios"
import AdminLayout from "../components/AdminLayout"

function Weather() {
  const [search, setSearch] = useState("")
  const [searchResults, setSearchResults] = useState([])
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [weatherData, setWeatherData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [searching, setSearching] = useState(false)
  const [error, setError] = useState("")
  const [liveTime, setLiveTime] = useState(new Date())

  const API_BASE = `${import.meta.env.VITE_API_BASE_URL}/api`

  const getWeatherInfoFromCode = (code, isDay = 1) => {
    const map = {
      0: { text: "Clear", icon: isDay ? "☀️" : "🌙" },
      1: { text: "Mainly Clear", icon: isDay ? "🌤️" : "🌙" },
      2: { text: "Partly Cloudy", icon: "⛅" },
      3: { text: "Cloudy", icon: "☁️" },
      45: { text: "Fog", icon: "🌫️" },
      48: { text: "Fog", icon: "🌫️" },
      51: { text: "Light Drizzle", icon: "🌦️" },
      53: { text: "Drizzle", icon: "🌦️" },
      55: { text: "Heavy Drizzle", icon: "🌧️" },
      56: { text: "Freezing Drizzle", icon: "🌧️" },
      57: { text: "Heavy Freezing Drizzle", icon: "🌧️" },
      61: { text: "Light Rain", icon: "🌦️" },
      63: { text: "Rain", icon: "🌧️" },
      65: { text: "Heavy Rain", icon: "⛈️" },
      66: { text: "Freezing Rain", icon: "🌧️" },
      67: { text: "Heavy Freezing Rain", icon: "⛈️" },
      71: { text: "Light Snow", icon: "❄️" },
      73: { text: "Snow", icon: "❄️" },
      75: { text: "Heavy Snow", icon: "❄️" },
      77: { text: "Snow Grains", icon: "❄️" },
      80: { text: "Rain Showers", icon: "🌦️" },
      81: { text: "Heavy Showers", icon: "🌧️" },
      82: { text: "Violent Showers", icon: "⛈️" },
      85: { text: "Snow Showers", icon: "❄️" },
      86: { text: "Heavy Snow Showers", icon: "❄️" },
      95: { text: "Thunderstorm", icon: "⛈️" },
      96: { text: "Thunderstorm with Hail", icon: "⛈️" },
      99: { text: "Severe Thunderstorm", icon: "⛈️" }
    }

    return map[code] || { text: "Weather", icon: "🌤️" }
  }

  const getWeatherBackgroundClass = (code, isDay = 1) => {
    const rainyCodes = [51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82]
    const stormCodes = [95, 96, 99]
    const cloudyCodes = [2, 3, 45, 48]
    const snowyCodes = [71, 73, 75, 77, 85, 86]

    if (stormCodes.includes(code)) {
      return isDay ? "weather-bg-storm" : "weather-bg-night-rain"
    }

    if (rainyCodes.includes(code)) {
      return isDay ? "weather-bg-rain" : "weather-bg-night-rain"
    }

    if (snowyCodes.includes(code)) {
      return isDay ? "weather-bg-cloudy" : "weather-bg-night"
    }

    if (cloudyCodes.includes(code)) {
      return isDay ? "weather-bg-cloudy" : "weather-bg-night"
    }

    return isDay ? "weather-bg-sunny" : "weather-bg-night"
  }

  const formatLiveTime = (date, timeZone) => {
    try {
      return date.toLocaleString("en-MY", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit",
        timeZone: timeZone || "Asia/Kuching"
      })
    } catch {
      return date.toLocaleString("en-MY", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit"
      })
    }
  }

  const formatDay = (value) => {
    if (!value) return "-"
    return new Date(value).toLocaleDateString("en-MY", {
      weekday: "short"
    })
  }

  const formatHour = (value, timeZone) => {
    if (!value) return "-"
    try {
      return new Date(value).toLocaleTimeString("en-MY", {
        hour: "numeric",
        minute: "2-digit",
        timeZone: timeZone || "Asia/Kuching"
      })
    } catch {
      return new Date(value).toLocaleTimeString("en-MY", {
        hour: "numeric",
        minute: "2-digit"
      })
    }
  }

  const degreeToDirectionLabel = (deg) => {
    if (deg == null) return "-"
    const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"]
    const index = Math.round(deg / 45) % 8
    return directions[index]
  }

  const searchLocation = async () => {
    if (!search.trim()) {
      setSearchResults([])
      return
    }

    try {
      setSearching(true)
      setError("")
      const res = await axios.get(
        `${API_BASE}/location/search?q=${encodeURIComponent(search)}`
      )
      setSearchResults(res.data || [])
    } catch (err) {
      console.error("Location search error:", err)
      setError("Failed to search location.")
      setSearchResults([])
    } finally {
      setSearching(false)
    }
  }

  const fetchWeatherTide = async (lat, lon, manualLocation = null) => {
    try {
      setLoading(true)
      setError("")

      const res = await axios.get(`${API_BASE}/weather-tide?lat=${lat}&lon=${lon}`)

      setWeatherData(res.data)

      if (manualLocation) {
        setSelectedLocation(manualLocation)
      } else if (res.data?.location) {
        setSelectedLocation(res.data.location)
      }
    } catch (err) {
      console.error("Weather/tide fetch error:", err)
      setError(err.response?.data?.error || "Failed to fetch weather and tide data.")
      setWeatherData(null)
    } finally {
      setLoading(false)
    }
  }

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.")
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude
        const lon = position.coords.longitude
        fetchWeatherTide(lat, lon)
      },
      () => {
        setError("Unable to retrieve your location.")
      }
    )
  }

  const handleSelectLocation = (location) => {
    setSelectedLocation(location)
    setSearch(`${location.name}, ${location.region || ""}, ${location.country || ""}`)
    setSearchResults([])
    fetchWeatherTide(location.lat, location.lon, location)
  }

  useEffect(() => {
    handleUseMyLocation()
  }, [])

  useEffect(() => {
    const timer = setInterval(() => {
      setLiveTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const currentWeatherInfo = useMemo(() => {
    return getWeatherInfoFromCode(
      weatherData?.weather?.weatherCode,
      weatherData?.weather?.isDay
    )
  }, [weatherData])

  const weatherBgClass = useMemo(() => {
    return getWeatherBackgroundClass(
      weatherData?.weather?.weatherCode,
      weatherData?.weather?.isDay
    )
  }, [weatherData])

  const getSafetyStatus = () => {
    const windSpeed = Number(weatherData?.weather?.windSpeed || 0)
    const weatherCode = Number(weatherData?.weather?.weatherCode || 0)
    const precipitation = Number(weatherData?.weather?.precipitation || 0)

    const stormCodes = [95, 96, 99]
    const heavyRainCodes = [63, 65, 66, 67, 81, 82]

    if (windSpeed > 60 || stormCodes.includes(weatherCode)) {
      return {
        label: "Dangerous",
        className: "danger",
        message:
          "Sea conditions are considered dangerous. Fishermen are strongly advised not to go out to sea."
      }
    }

    if (
      windSpeed >= 40 ||
      heavyRainCodes.includes(weatherCode) ||
      precipitation >= 7
    ) {
      return {
        label: "Caution",
        className: "caution",
        message:
          "Sea conditions require caution. Fishermen should monitor weather changes carefully before going out."
      }
    }

    return {
      label: "Safe",
      className: "safe",
      message:
        "Sea conditions are currently considered safe for small-scale coastal fishing activities."
    }
  }

  const safetyStatus = useMemo(() => getSafetyStatus(), [weatherData])

  const hourlyData = weatherData?.forecast?.hourly || []
  const dailyData = weatherData?.forecast?.daily || []
  const timezone = weatherData?.location?.timezone

  return (
    <AdminLayout>
      <div className={`weather-dynamic-page ${weatherBgClass}`}>
        <div className="weather-board no-sidebar">
          <div className="weather-center full-width">
            <div className="weather-searchbar">
              <div className="weather-search-box">
                <input
                  type="text"
                  placeholder="Search for a location"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") searchLocation()
                  }}
                />
                <button onClick={searchLocation} disabled={searching}>
                  {searching ? "Searching..." : "Search"}
                </button>
              </div>

              <button className="weather-location-btn" onClick={handleUseMyLocation}>
                Use My Location
              </button>
            </div>

            {searchResults.length > 0 && (
              <div className="weather-search-results">
                {searchResults.map((item) => (
                  <button
                    key={item.id}
                    className="weather-search-result-item"
                    onClick={() => handleSelectLocation(item)}
                  >
                    {item.name}, {item.region}, {item.country}
                  </button>
                ))}
              </div>
            )}

            {error && <div className="weather-error-box">{error}</div>}

            {loading ? (
              <div className="weather-card weather-loading-card">
                <p>Loading weather and tide data...</p>
              </div>
            ) : weatherData ? (
              <>
                <div className="weather-hero-card">
                  <div className="weather-hero-left">
                    <div className="weather-hero-city">
                      {selectedLocation?.name || weatherData.location?.name || "Selected Location"}
                    </div>
                    <div className="weather-hero-sub">{currentWeatherInfo.text}</div>
                    <div className="weather-hero-time">
                      {formatLiveTime(liveTime, timezone)}
                    </div>
                    <div className="weather-hero-temp">
                      {weatherData.weather?.airTemperature ?? "-"}°
                    </div>
                  </div>

                  <div className="weather-hero-right">
                    <div className="weather-hero-icon">{currentWeatherInfo.icon}</div>
                  </div>
                </div>

                <div className={`weather-safety-card ${safetyStatus.className}`}>
                  <div className="weather-card-title">Fishing Safety Status</div>
                  <div className="weather-safety-status">{safetyStatus.label}</div>
                  <p>{safetyStatus.message}</p>

                  <div className="weather-safety-meta">
                    <span>Wind Speed: {weatherData?.weather?.windSpeed ?? "-"} km/h</span>
                    <span>Precipitation: {weatherData?.weather?.precipitation ?? "-"} mm</span>
                    <span>Condition: {currentWeatherInfo.text}</span>
                  </div>
                </div>

                <div className="weather-hourly-card">
                  <div className="weather-card-title">Today's Forecast</div>
                  <div className="weather-hourly-row">
                    {hourlyData.length > 0 ? (
                      hourlyData.slice(0, 6).map((hour, index) => {
                        const info = getWeatherInfoFromCode(hour.weatherCode, 1)
                        return (
                          <div className="weather-hourly-item" key={`${hour.time}-${index}`}>
                            <span>{formatHour(hour.time, timezone)}</span>
                            <div className="weather-hourly-icon">{info.icon}</div>
                            <strong>{hour.temp ?? "-"}°</strong>
                          </div>
                        )
                      })
                    ) : (
                      <div className="weather-empty-box">No hourly forecast available.</div>
                    )}
                  </div>
                </div>

                <div className="weather-bottom-grid">
                  <div className="weather-conditions-card">
                    <div className="weather-card-title">Air & Marine Conditions</div>

                    <div className="weather-conditions-grid">
                      <div className="weather-condition-box">
                        <span>Humidity</span>
                        <strong>{weatherData.weather?.humidity ?? "-"}%</strong>
                      </div>

                      <div className="weather-condition-box">
                        <span>Wind</span>
                        <strong>{weatherData.weather?.windSpeed ?? "-"} km/h</strong>
                      </div>

                      <div className="weather-condition-box">
                        <span>Wind Dir</span>
                        <strong>{degreeToDirectionLabel(weatherData.weather?.windDirection)}</strong>
                      </div>

                      <div className="weather-condition-box">
                        <span>Precipitation</span>
                        <strong>{weatherData.weather?.precipitation ?? "-"} mm</strong>
                      </div>

                      <div className="weather-condition-box">
                        <span>Cloud Cover</span>
                        <strong>{weatherData.weather?.cloudCover ?? "-"}%</strong>
                      </div>

                      <div className="weather-condition-box">
                        <span>Timezone</span>
                        <strong>{weatherData.location?.timezone || "-"}</strong>
                      </div>

                      <div className="weather-condition-box">
                        <span>Current Tide</span>
                        <strong>{weatherData.tide?.current_level_m ?? "-"} m</strong>
                      </div>

                      <div className="weather-condition-box">
                        <span>Next High Tide</span>
                        <strong>{weatherData.tide?.next_high?.height_m ?? "-"} m</strong>
                      </div>

                      <div className="weather-condition-box">
                        <span>Next Low Tide</span>
                        <strong>{weatherData.tide?.next_low?.height_m ?? "-"} m</strong>
                      </div>

                      <div className="weather-condition-box">
                        <span>Tide Trend</span>
                        <strong>{weatherData.tide?.trend || "-"}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="weather-week-card">
                    <div className="weather-card-title">7-Day Forecast</div>

                    <div className="weather-week-list">
                      {dailyData.length > 0 ? (
                        dailyData.map((day, index) => {
                          const info = getWeatherInfoFromCode(day.weatherCode, 1)
                          return (
                            <div className="weather-week-item" key={`${day.date}-${index}`}>
                              <span className="weather-week-day">{formatDay(day.date)}</span>
                              <span className="weather-week-icon">{info.icon}</span>
                              <span className="weather-week-text">{info.text}</span>
                              <span className="weather-week-temp">
                                {day.maxTemp ?? "-"}° / {day.minTemp ?? "-"}°
                              </span>
                            </div>
                          )
                        })
                      ) : (
                        <div className="weather-empty-box">No 7-day forecast available.</div>
                      )}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="weather-card weather-loading-card">
                <p>No weather data yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

export default Weather
