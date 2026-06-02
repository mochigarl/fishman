import { useState } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"

function Login() {
  const navigate = useNavigate()

  const [form, setForm] = useState({
    username: "",
    password: ""
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleLogin = async (e) => {
    e.preventDefault()
    setError("")

    if (!form.username || !form.password) {
      setError("Please enter username and password.")
      return
    }

    try {
      setLoading(true)

      const res = await axios.post("http://localhost:5000/api/auth/login", {
        username: form.username,
        password: form.password
      })

      localStorage.setItem("fishman_token", res.data.token)
      localStorage.setItem("fishman_admin", JSON.stringify(res.data.admin))

      navigate("/dashboard")
    } catch (err) {
      console.log(err)
      setError(err.response?.data?.error || "Login failed.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-brand">
          <h1>FishMan</h1>
          <p>Administrator Login</p>
        </div>

        <form onSubmit={handleLogin} className="login-form">
          <div className="login-form-group">
            <label>Username</label>
            <input
              type="text"
              value={form.username}
              onChange={(e) =>
                setForm({ ...form, username: e.target.value })
              }
              placeholder="Enter username"
            />
          </div>

          <div className="login-form-group">
            <label>Password</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) =>
                setForm({ ...form, password: e.target.value })
              }
              placeholder="Enter password"
            />
          </div>

          {error && <p className="login-error">{error}</p>}

          <button type="submit" className="login-submit-btn" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  )
}

export default Login