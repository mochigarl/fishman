import { useEffect, useMemo, useState } from "react"
import axios from "axios"
import AdminLayout from "../components/AdminLayout"

function Orders() {
  const [orders, setOrders] = useState([])
  const [statusFilter, setStatusFilter] = useState("All")
  const [loading, setLoading] = useState(false)

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const res = await axios.get("http://localhost:5000/api/orders")
      setOrders(res.data)
    } catch (error) {
      console.log("Failed to fetch orders:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  const updateStatus = async (id, status) => {
    try {
      await axios.put(`http://localhost:5000/api/orders/${id}`, { status })
      fetchOrders()
    } catch (error) {
      console.log("Failed to update order:", error)
      alert(error.response?.data?.error || "Failed to update order")
    }
  }

  const deleteOrder = async (id) => {
    const confirmDelete = window.confirm("Delete this order?")
    if (!confirmDelete) return

    try {
      await axios.delete(`http://localhost:5000/api/orders/${id}`)
      fetchOrders()
    } catch (error) {
      console.log("Failed to delete order:", error)
      alert(error.response?.data?.error || "Failed to delete order")
    }
  }

  const filteredOrders = useMemo(() => {
    if (statusFilter === "All") return orders
    return orders.filter(
      (order) => String(order.status).toLowerCase() === statusFilter.toLowerCase()
    )
  }, [orders, statusFilter])

  const formatDateTime = (value) => {
    if (!value) return "-"
    return new Date(value).toLocaleString("en-MY")
  }

  const getStatusClass = (status) => {
    const s = String(status || "").toLowerCase()
    if (s === "completed") return "fm-status completed"
    if (s === "confirmed") return "fm-status confirmed"
    if (s === "pending") return "fm-status pending"
    return "fm-status"
  }

  return (
    <AdminLayout>
      <div className="fm-page-header">
        <div>
          <h1>Order Centre</h1>
          <p>Manage customer orders and track order progress</p>
        </div>
      </div>

      <div className="fm-orders-toolbar">
        <div className="fm-orders-filter-group">
          <button
            className={statusFilter === "All" ? "fm-filter-btn active" : "fm-filter-btn"}
            onClick={() => setStatusFilter("All")}
          >
            All
          </button>
          <button
            className={statusFilter === "Pending" ? "fm-filter-btn active" : "fm-filter-btn"}
            onClick={() => setStatusFilter("Pending")}
          >
            Pending
          </button>
          <button
            className={statusFilter === "Confirmed" ? "fm-filter-btn active" : "fm-filter-btn"}
            onClick={() => setStatusFilter("Confirmed")}
          >
            Confirmed
          </button>
          <button
            className={statusFilter === "Completed" ? "fm-filter-btn active" : "fm-filter-btn"}
            onClick={() => setStatusFilter("Completed")}
          >
            Completed
          </button>
        </div>

        <button className="fm-refresh-btn" onClick={fetchOrders}>
          Refresh
        </button>
      </div>

      <div className="fm-card-topbar">
        <div className="fm-card-head-gradient green-grad">
          Orders List
        </div>

        <div className="fm-card-body">
          {loading ? (
            <p>Loading orders...</p>
          ) : filteredOrders.length === 0 ? (
            <p>No orders found.</p>
          ) : (
            <div className="fm-table-wrap">
              <table className="fm-table-clean fm-orders-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Phone</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Order Time</th>
                    <th>Confirmed Time</th>
                    <th>Completed Time</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredOrders.map((order) => (
                    <tr key={order.id}>
                      <td>#{order.id}</td>
                      <td>{order.customer_name}</td>
                      <td>{order.phone}</td>

                      <td>
                        <div className="fm-order-items-cell">
                          {Array.isArray(order.items)
                            ? order.items.map((item, index) => (
                                <div key={index}>
                                  {item.name} x {item.quantity}
                                </div>
                              ))
                            : typeof order.items === "string"
                            ? (() => {
                                try {
                                  const parsed = JSON.parse(order.items)
                                  return parsed.map((item, index) => (
                                    <div key={index}>
                                      {item.name} x {item.quantity}
                                    </div>
                                  ))
                                } catch {
                                  return <div>-</div>
                                }
                              })()
                            : "-"}
                        </div>
                      </td>

                      <td>RM {Number(order.total_price).toFixed(2)}</td>
                      <td>
                        <span className={getStatusClass(order.status)}>
                          {order.status}
                        </span>
                      </td>
                      <td>{formatDateTime(order.created_at)}</td>
                      <td>{formatDateTime(order.confirmed_at)}</td>
                      <td>{formatDateTime(order.completed_at)}</td>

                      <td>
                        <div className="fm-action-group">
                          {String(order.status).toLowerCase() === "pending" && (
                            <button
                              className="fm-action-btn confirm"
                              onClick={() => updateStatus(order.id, "Confirmed")}
                            >
                              Confirm
                            </button>
                          )}

                          {String(order.status).toLowerCase() === "confirmed" && (
                            <button
                              className="fm-action-btn complete"
                              onClick={() => updateStatus(order.id, "Completed")}
                            >
                              Complete
                            </button>
                          )}

                          <button
                            className="fm-action-btn delete"
                            onClick={() => deleteOrder(order.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}

export default Orders