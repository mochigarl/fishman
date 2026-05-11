import { useEffect, useState } from "react"
import axios from "axios"
import { useLocation, useNavigate } from "react-router-dom"

function TrackOrder() {
  const location = useLocation()
  const navigate = useNavigate()

  const query = new URLSearchParams(location.search)
  const phone = query.get("phone") || ""

  const [latestOrder, setLatestOrder] = useState(null)
  const [loading, setLoading] = useState(false)

  const fetchLatestOrder = async () => {
    if (!phone) return

    try {
      setLoading(true)
      const res = await axios.get(
        `http://localhost:5000/api/orders/customer/${encodeURIComponent(phone)}`
      )

      if (res.data.length > 0) {
        setLatestOrder(res.data[0])
      } else {
        setLatestOrder(null)
      }
    } catch (error) {
      console.log(error)
      setLatestOrder(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLatestOrder()
  }, [phone])

  const formatDateTime = (value) => {
    if (!value) return "-"
    return new Date(value).toLocaleString()
  }

  const getStepClass = (status, step) => {
    const orderFlow = ["Pending", "Confirmed", "Completed"]
    return orderFlow.indexOf(status) >= orderFlow.indexOf(step)
      ? "track-step active"
      : "track-step"
  }

  return (
    <div className="customer-home">
      <div className="customer-header">
        <div className="customer-header-top">
          <div>
            <h1>Track Order</h1>
            <p className="customer-mode-text">Phone: {phone}</p>
          </div>

          <button
            className="customer-top-btn"
            onClick={() => navigate(`/order?mode=phone&phone=${encodeURIComponent(phone)}`)}
          >
            ← Back to Order
          </button>
        </div>
      </div>

      <div className="cart-section">
        <h2>Latest Order Status</h2>

        {loading ? (
          <p>Loading order...</p>
        ) : !latestOrder ? (
          <p>No order found for this phone number.</p>
        ) : (
          <>
            <div className="history-order-card">
              <div className="history-order-top">
                <div>
                  <h3>Order #{latestOrder.id}</h3>
                  <p>Status: {latestOrder.status}</p>
                </div>
                <div>
                  <strong>RM {Number(latestOrder.total_price).toFixed(2)}</strong>
                </div>
              </div>

              <div className="track-progress">
                <div className={getStepClass(latestOrder.status, "Pending")}>
                  <span>1</span>
                  <p>Order Received</p>
                </div>

                <div className={getStepClass(latestOrder.status, "Confirmed")}>
                  <span>2</span>
                  <p>Confirmed</p>
                </div>

                <div className={getStepClass(latestOrder.status, "Completed")}>
                  <span>3</span>
                  <p>Completed</p>
                </div>
              </div>

              <p><strong>Order Time:</strong> {formatDateTime(latestOrder.created_at)}</p>
              <p><strong>Confirmed Time:</strong> {formatDateTime(latestOrder.confirmed_at)}</p>
              <p><strong>Completed Time:</strong> {formatDateTime(latestOrder.completed_at)}</p>

              <div className="receipt-items">
                {latestOrder.items.map((item, index) => (
                  <div key={index} className="receipt-item-row">
                    <span>{item.name} x {item.quantity}</span>
                    <span>RM {(Number(item.price) * item.quantity).toFixed(2)}</span>
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

export default TrackOrder