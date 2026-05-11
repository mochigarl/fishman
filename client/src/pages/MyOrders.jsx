import { useEffect, useState } from "react"
import axios from "axios"
import { useLocation, useNavigate } from "react-router-dom"

function MyOrders() {
  const location = useLocation()
  const navigate = useNavigate()

  const query = new URLSearchParams(location.search)
  const phone = query.get("phone") || ""

  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)

  const fetchOrders = async () => {
    if (!phone) return

    try {
      setLoading(true)
      const res = await axios.get(
        `http://localhost:5000/api/orders/customer/${encodeURIComponent(phone)}`
      )
      setOrders(res.data)
    } catch (error) {
      console.log(error)
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [phone])

  const formatDateTime = (value) => {
    if (!value) return "-"
    return new Date(value).toLocaleString()
  }

  return (
    <div className="customer-home">
      <div className="customer-header">
        <div className="customer-header-top">
          <div>
            <h1>My Orders</h1>
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
        <h2>Order History</h2>

        {loading ? (
          <p>Loading orders...</p>
        ) : orders.length === 0 ? (
          <p>No orders found for this phone number.</p>
        ) : (
          orders.map((order) => (
            <div key={order.id} className="history-order-card">
              <div className="history-order-top">
                <div>
                  <h3>Order #{order.id}</h3>
                  <p>Status: {order.status}</p>
                </div>
                <div>
                  <strong>RM {Number(order.total_price).toFixed(2)}</strong>
                </div>
              </div>

              <p><strong>Order Time:</strong> {formatDateTime(order.created_at)}</p>
              <p><strong>Confirmed Time:</strong> {formatDateTime(order.confirmed_at)}</p>
              <p><strong>Completed Time:</strong> {formatDateTime(order.completed_at)}</p>

              <div className="receipt-items">
                {order.items.map((item, index) => (
                  <div key={index} className="receipt-item-row">
                    <span>{item.name} x {item.quantity}</span>
                    <span>RM {(Number(item.price) * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default MyOrders