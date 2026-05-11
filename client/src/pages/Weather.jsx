import { useEffect, useMemo, useState } from "react"
import axios from "axios"
import Sidebar from "../components/Sidebar"

function Weather() {
  const [city, setCity] = useState("Kuching")
  const [searchText, setSearchText] = useState("Kuching")
  const [data, setData] = useState(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const fetchWeather = async (targetCity = city) => {
    try {
      setLoading(true)
      setError("")

      const res = await axios.get(
        `http://localhost:5000/api/weather?district=${encodeURIComponent(targetCity)}`
      )

      setData(res.data)
      setCity(targetCity)
    } catch (err) {
      console.log(err)
      setError(err.response?.data?.error || "Failed to fetch weather")
      setData(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchWeather("Kuching")
  }, [])

  const backgroundClass = useMemo(() => {
    if (!data?.current) return "weather-bg-cloudy"

    const text = data.current.condition_text.toLowerCase()
    const isNight = Number(data.current.is_day) === 0

    if (isNight) {
      if (text.includes("rain") || text.includes("storm")) return "weather-bg-night-rain"
      return "weather-bg-night"
    }

    if (text.includes("sunny") || text.includes("clear")) return "weather-bg-sunny"
    if (text.includes("rain") || text.includes("drizzle")) return "weather-bg-rain"
    if (text.includes("storm") || text.includes("thunder")) return "weather-bg-storm"
    return "weather-bg-cloudy"
  }, [data])

  const handleSearch = () => {
    if (!searchText.trim()) return
    fetchWeather(searchText.trim())
  }

  const getSafetyBg = () => {
    if (!data) return "#95a5a6"
    if (data.color === "green") return "#2ecc71"
    if (data.color === "orange") return "#f39c12"
    return "#e74c3c"
  }

  return (
    <div className="fishman-admin-layout">
      <Sidebar />

      <div className={`fishman-admin-main weather-modern-page ${backgroundClass}`}>
        <div className="weather-modern-top">
          <div className="weather-modern-search">
            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Search district or city"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSearch()
              }}
            />
            <button onClick={handleSearch}>Search</button>
          </div>
        </div>

        {loading && <p className="weather-modern-status">Loading weather...</p>}
        {error && <p className="weather-modern-error">{error}</p>}

        {data && (
          <>
            <div className="weather-hero-web">
              <p className="weather-hero-label">Current Weather</p>
              <h1 className="weather-hero-location">{data.location}</h1>

              <div className="weather-hero-main">
                <div className="weather-hero-temp">
                  {Math.round(data.current.temp_c)}°
                </div>
                <div className="weather-hero-icon">
                  <img
                    src={`https:${data.current.condition_icon}`}
                    alt={data.current.condition_text}
                    style={{ width: "72px", height: "72px" }}
                  />
                </div>
              </div>

              <p className="weather-hero-summary">{data.current.condition_text}</p>
            </div>

            <div className="weather-highlight-grid">
              <div className="weather-highlight-card">
                <p>Wind Speed</p>
                <h3>{data.current.wind_kph} km/h</h3>
              </div>

              <div className="weather-highlight-card">
                <p>Humidity</p>
                <h3>{data.current.humidity}%</h3>
              </div>

              <div className="weather-highlight-card">
                <p>Fishing Safety</p>
                <h3>{data.safety}</h3>
              </div>
            </div>

            <div
              className="weather-section-card"
              style={{ border: `2px solid ${getSafetyBg()}` }}
            >
              <div className="weather-section-header">
                <h2>Safety Recommendation</h2>
              </div>

              <div
                style={{
                  background: getSafetyBg(),
                  color: "white",
                  borderRadius: "16px",
                  padding: "16px",
                  fontWeight: "bold",
                  textAlign: "center"
                }}
              >
                {data.safety === "SAFE" && "Safe to go out for fishing"}
                {data.safety === "CAUTION" && "Go out with caution"}
                {data.safety === "DANGEROUS" && "Not recommended to go out"}
              </div>
            </div>

            <div className="weather-section-card">
              <div className="weather-section-header">
                <h2>Hourly Forecast</h2>
              </div>

              <div className="weather-hourly-row">
                {data.hourly.map((hour, i) => (
                  <div className="weather-hourly-box" key={i}>
                    <p>
                      {new Date(hour.time).toLocaleTimeString("en-MY", {
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </p>
                    <span className="weather-hourly-icon">
                      <img
                        src={`https:${hour.condition_icon}`}
                        alt={hour.condition_text}
                        style={{ width: "38px", height: "38px" }}
                      />
                    </span>
                    <small>{hour.condition_text}</small>
                    <h4>{hour.temp_c}°</h4>
                  </div>
                ))}
              </div>
            </div>

            <div className="weather-section-card">
              <div className="weather-section-header">
                <h2>7-Day Forecast</h2>
              </div>

              <div className="weather-forecast-list-web">
                {data.daily.map((day, i) => (
                  <div className="weather-forecast-row-web" key={i}>
                    <div className="forecast-day-web">
                      {i === 0
                        ? "Today"
                        : new Date(day.date).toLocaleDateString("en-MY", {
                            weekday: "long"
                          })}
                    </div>

                    <div className="forecast-icon-web">
                      <img
                        src={`https:${day.condition_icon}`}
                        alt={day.condition_text}
                        style={{ width: "34px", height: "34px", verticalAlign: "middle" }}
                      />{" "}
                      <span style={{ fontSize: "14px" }}>{day.condition_text}</span>
                    </div>

                    <div className="forecast-range-web">
                      <span>{day.min_temp_c}°</span>
                      <div className="forecast-bar-web">
                        <div
                          className="forecast-bar-fill-web"
                          style={{
                            width: `${Math.max(
                              30,
                              ((Number(day.max_temp_c) - Number(day.min_temp_c)) / 15) * 100
                            )}%`
                          }}
                        ></div>
                      </div>
                      <span>{day.max_temp_c}°</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default Weather