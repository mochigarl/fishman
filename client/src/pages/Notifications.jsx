import { useEffect, useMemo, useState } from "react"
import axios from "axios"
import AdminLayout from "../components/AdminLayout"

function Notifications() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState("")

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const res = await axios.get("http://localhost:5000/api/orders")
      setOrders(res.data || [])
      setLastUpdated(new Date().toLocaleTimeString("en-MY"))
    } catch (error) {
      console.log("Failed to fetch notifications:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotifications()

    const interval = setInterval(() => {
      fetchNotifications()
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const notifications = useMemo(() => {
    return orders.map((order) => {
      let icon = "🛒"
      let title = "New Order"
      let message = `${order.customer_name} placed an order.`
      if (order.status === "Confirmed") {
        icon = "✅"
        title = "Order Confirmed"
        message = `Order #${order.id} has been confirmed.`
      }

      if (order.status === "Completed") {
        icon = "📦"
        title = "Order Completed"
        message = `Order #${order.id} has been completed.`
      }

      return {
        id: order.id,
        icon,
        title,
        message,
        time: order.created_at
          ? new Date(order.created_at).toLocaleString("en-MY")
          : "-"
      }
    })
  }, [orders])

  return (
    <AdminLayout>

      <div className="fishman-panel">
        <div className="panel-body">
          <div className="fm-orders-toolbar">
            <div>
              <p style={{ margin: "6px 0 0", color: "#6b7280" }}>
              </p>
            </div>

            <button className="fm-refresh-btn" onClick={fetchNotifications}>
              {loading ? "Refreshing..." : "Refresh Now"}
            </button>
          </div>

          <p style={{ color: "#6b7280", marginBottom: "18px" }}>
            Last updated: {lastUpdated || "-"}
          </p>

          <div className="notification-list">
            {notifications.length > 0 ? (
              notifications.map((item) => (
                <div className="notification-card" key={item.id}>
                  <div className="notification-icon">{item.icon}</div>

                  <div className="notification-content">
                    <h3>{item.title}</h3>
                    <p>{item.message}</p>
                  </div>

                  <div className="notification-time">{item.time}</div>
                </div>
              ))
            ) : (
              <p>No notifications found.</p>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

export default Notifications