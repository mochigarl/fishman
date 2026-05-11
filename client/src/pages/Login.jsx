import { useNavigate } from "react-router-dom"
import { useState } from "react"

function Login() {
  const navigate = useNavigate()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")

  const handleLogin = (e) => {
    e.preventDefault()

    if (username && password) {
      navigate("/dashboard")
    } else {
      alert("Enter username and password")
    }
  }

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>FishMan</h1>
        <p>Fishing Sales & Stock System</p>

        <form onSubmit={handleLogin}>
          <input
            type="admin"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button type="submit">Login</button>
        </form>
      </div>
    </div>
  )
}

export default Login