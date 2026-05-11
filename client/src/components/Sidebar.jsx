import { Link, useLocation } from "react-router-dom"
import logo from "../assets/logo-fishman.jpeg"

function Sidebar() {
  const location = useLocation()

  const isActive = (path) => location.pathname === path

  return (
    <div className="sidebar-modern">
      <div className="sidebar-brand">
        <img src={logo} alt="FishMan Logo" className="sidebar-logo-image" />
        <div>
          <h2 className="sidebar-brand-title">FishMan</h2>
          <p className="sidebar-brand-subtitle">Pulau Kerbau Enterprise</p>
        </div>
      </div>

      <nav className="sidebar-nav">
        <Link className={isActive("/dashboard") ? "active" : ""} to="/dashboard">
          Dashboard
        </Link>

        <Link className={isActive("/orders") ? "active" : ""} to="/orders">
          Order Centre
        </Link>

        <Link className={isActive("/products") ? "active" : ""} to="/products">
          Product Centre
        </Link>

        <Link className={isActive("/weather") ? "active" : ""} to="/weather">
          Weather & Tide
        </Link>

        <Link to="/">Logout</Link>
      </nav>
    </div>
  )
}

export default Sidebar