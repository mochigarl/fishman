import { useNavigate } from "react-router-dom"
import fishmanLogo from "../assets/logo-fishman.jpeg"

function CustomerTopbar({
  mode = "guest",
  phone = "",
  search = "",
  onSearchChange,
  cartCount = 0
}) {
  const navigate = useNavigate()

  return (
    <header className="cust-topbar">
      <div
        className="cust-brand"
        onClick={() =>
          navigate(`/order?mode=${mode}${phone ? `&phone=${encodeURIComponent(phone)}` : ""}`)
        }
      >
        <div className="cust-brand-logo real-logo">
          <img src={fishmanLogo} alt="FishMan Logo" />
        </div>

        <div>
          <h1>FishMan</h1>
          <p>{mode === "phone" ? `Phone Mode: ${phone}` : "Guest Mode"}</p>
        </div>
      </div>

      <div className="cust-top-search">
        <span className="cust-search-icon">🔎</span>
        <input
          type="text"
          placeholder="Search fish or seafood..."
          value={search}
          onChange={(e) => onSearchChange?.(e.target.value)}
        />
      </div>

      <div className="cust-top-actions">
        {mode === "phone" && (
          <>
            <button
              className="cust-top-link-btn"
              onClick={() => navigate(`/track-order?phone=${encodeURIComponent(phone)}`)}
            >
              Track Order
            </button>

            <button
              className="cust-top-link-btn"
              onClick={() => navigate(`/my-orders?phone=${encodeURIComponent(phone)}`)}
            >
              History
            </button>
          </>
        )}

        <button
          className="cust-cart-icon-btn"
          onClick={() =>
            navigate(`/cart?mode=${mode}${phone ? `&phone=${encodeURIComponent(phone)}` : ""}`)
          }
          aria-label="Open cart"
          title="Open cart"
        >
          <span className="cust-cart-emoji">🧺</span>
          {cartCount > 0 && <span className="cust-cart-badge">{cartCount}</span>}
        </button>
      </div>
    </header>
  )
}

export default CustomerTopbar