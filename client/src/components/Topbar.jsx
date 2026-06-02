import { NavLink, useNavigate } from "react-router-dom"
import logo from "../assets/logo-fishman.jpeg"

function Topbar() {
  const navigate = useNavigate()

  return (
    <header className="fm-topbar-only">
      <div className="fm-topbar-left">
        <div className="fm-topbar-brand" onClick={() => navigate("/dashboard")}>
          <img src={logo} alt="FishMan Logo" className="fm-topbar-logo" />
          <div>
            <h2>FishMan</h2>
            <p>Pulau Kerbau Enterprise</p>
          </div>
        </div>

        <nav className="fm-topbar-nav">
          <NavLink to="/dashboard">Dashboard</NavLink>
          <NavLink to="/orders">Order Centre</NavLink>
          <NavLink to="/products">Product Centre</NavLink>
          <NavLink to="/weather">Weather & Tide</NavLink>
          <NavLink to="/sales-report">Sales Report</NavLink>
          <NavLink to="/notifications">Notifications</NavLink>
        </nav>
      </div>

      <div className="fm-topbar-right">
        <button
          className="fm-topbar-icon-btn fm-bell-btn"
          onClick={() => navigate("/notifications")}
          title="Notifications"
        >
          🔔
          <span className="fm-bell-dot"></span>
        </button>

        <button
          className="fm-topbar-admin-btn"
          onClick={() => {
            localStorage.removeItem("fishman_token")
            localStorage.removeItem("fishman_admin")
            navigate("/")
          }}
          title="Logout"
        >
          Logout
        </button>
      </div>
    </header>
  )
}

export default Topbar