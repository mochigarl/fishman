import { useEffect, useMemo, useState } from "react"
import axios from "axios"
import AdminLayout from "../components/AdminLayout"

function Orders() {
  const [orders, setOrders] = useState([])
  const [filter, setFilter] = useState("All")
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(false)

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const res = await axios.get("http://localhost:5000/api/orders")
      setOrders(res.data || [])
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
      console.log("Failed to update status:", error)
      alert("Failed to update order status.")
    }
  }

  const deleteOrder = async (id) => {
    const confirmed = window.confirm("Are you sure you want to delete this order?")
    if (!confirmed) return

    try {
      await axios.delete(`http://localhost:5000/api/orders/${id}`)
      fetchOrders()
    } catch (error) {
      console.log("Failed to delete order:", error)
      alert("Failed to delete order.")
    }
  }

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesFilter =
        filter === "All" ? true : order.status?.toLowerCase() === filter.toLowerCase()

      const keyword = search.toLowerCase()

      const matchesSearch =
        String(order.customer_name || "").toLowerCase().includes(keyword) ||
        String(order.phone || "").toLowerCase().includes(keyword) ||
        String(order.status || "").toLowerCase().includes(keyword) ||
        String(order.remark || "").toLowerCase().includes(keyword)

      return matchesFilter && matchesSearch
    })
  }, [orders, filter, search])

  const renderItems = (items) => {
    if (!items || !Array.isArray(items) || items.length === 0) return "-"

    return items.map((item, index) => (
      <div key={index}>
        {item.name} x {item.quantity}
      </div>
    ))
  }

  return (
    <AdminLayout>
      <div className="fm-page-header">
        <h1>Orders</h1>
        <p>Manage incoming customer orders and update their status.</p>
      </div>

      <div className="fishman-panel">
        <div className="panel-body">
          <div className="fm-orders-toolbar">
            <div className="fm-orders-left-tools">
              <input
                type="text"
                className="fm-orders-search"
                placeholder="Search by customer, phone, status, or remark..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              <div className="fm-orders-filter-group">
                <button
                  className={`fm-filter-btn ${filter === "All" ? "active" : ""}`}
                  onClick={() => setFilter("All")}
                >
                  All
                </button>
                <button
                  className={`fm-filter-btn ${filter === "Pending" ? "active" : ""}`}
                  onClick={() => setFilter("Pending")}
                >
                  Pending
                </button>
                <button
                  className={`fm-filter-btn ${filter === "Confirmed" ? "active" : ""}`}
                  onClick={() => setFilter("Confirmed")}
                >
                  Confirmed
                </button>
                <button
                  className={`fm-filter-btn ${filter === "Completed" ? "active" : ""}`}
                  onClick={() => setFilter("Completed")}
                >
                  Completed
                </button>
                <button
                  className={`fm-filter-btn ${filter === "Rejected" ? "active" : ""}`}
                  onClick={() => setFilter("Rejected")}
                >
                  Rejected
                </button>
              </div>
            </div>

            <button className="fm-refresh-btn" onClick={fetchOrders}>
              {loading ? "Refreshing..." : "Refresh"}
            </button>
          </div>

          <table className="fm-table-clean fm-orders-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Customer</th>
                <th>Phone</th>
                <th>Items</th>
                <th>Remark</th>
                <th>Total</th>
                <th>Status</th>
                <th>Created At</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <tr key={order.id}>
                    <td>#{order.id}</td>
                    <td>{order.customer_name}</td>
                    <td>{order.phone}</td>
                    <td className="fm-order-items-cell">{renderItems(order.items)}</td>
                    <td className="order-remark-cell">{order.remark || "-"}</td>
                    <td>RM {Number(order.total_price || 0).toFixed(2)}</td>
                    <td>{order.status}</td>
                    <td>
                      {order.created_at
                        ? new Date(order.created_at).toLocaleString("en-MY")
                        : "-"}
                    </td>
                    <td>
                      <div className="fm-action-group">
                        {order.status === "Pending" && (
                          <>
                            <button
                              className="fm-action-btn confirm"
                              onClick={() => updateStatus(order.id, "Confirmed")}
                            >
                              Confirm
                            </button>

                            <button
                              className="fm-action-btn reject"
                              onClick={() => updateStatus(order.id, "Rejected")}
                            >
                              Reject
                            </button>
                          </>
                        )}

                        {order.status === "Confirmed" && (
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
                ))
              ) : (
                <tr>
                  <td colSpan="9">No orders found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  )
}

export default Orders