import { useEffect, useState } from "react"
import axios from "axios"
import { useLocation } from "react-router-dom"
import CustomerLayout from "../components/CustomerLayout"

function TrackOrder() {
  const location = useLocation()
  const query = new URLSearchParams(location.search)
  const phone = query.get("phone") || ""

  const [orders, setOrders] = useState([])
  const [search, setSearch] = useState("")

  const fetchOrders = async () => {
    if (!phone) return

    try {
      const res = await axios.get(`http://localhost:5000/api/orders/phone/${phone}`)
      setOrders(res.data || [])
    } catch (error) {
      console.log("Failed to fetch orders:", error)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [phone])

  const getStepClass = (orderStatus, step) => {
    if (orderStatus === "Rejected") {
      return step === "Rejected" ? "track-step active rejected" : "track-step"
    }

    if (orderStatus === "Pending") {
      return step === "Pending" ? "track-step active" : "track-step"
    }

    if (orderStatus === "Confirmed") {
      return step === "Pending" || step === "Confirmed"
        ? "track-step active"
        : "track-step"
    }

    if (orderStatus === "Completed") {
      return step === "Pending" || step === "Confirmed" || step === "Completed"
        ? "track-step active"
        : "track-step"
    }

    return "track-step"
  }

  return (
    <CustomerLayout
      mode="phone"
      phone={phone}
      search={search}
      onSearchChange={setSearch}
      cartCount={0}
    >
      <div className="cart-page">
        <div className="cart-wrapper" style={{ gridTemplateColumns: "1fr" }}>
          <div className="cart-left">
            <div className="cart-section-head">
              <h3>Track Order</h3>
              <p>Phone Number: {phone || "-"}</p>
            </div>

            {orders.length > 0 ? (
              orders.map((order) => (
                <div className="history-order-card" key={order.id}>
                  <div className="history-order-top">
                    <div>
                      <h4>Order #{order.id}</h4>
                      <p>
                        Status: <strong>{order.status}</strong>
                      </p>
                    </div>
                    <div>
                      {order.created_at
                        ? new Date(order.created_at).toLocaleString("en-MY")
                        : "-"}
                    </div>
                  </div>

                  <div className="track-progress">
                    <div className={getStepClass(order.status, "Pending")}>
                      <span>1</span>
                      <p>Pending</p>
                    </div>

                    <div className={getStepClass(order.status, "Confirmed")}>
                      <span>2</span>
                      <p>Confirmed</p>
                    </div>

                    <div className={getStepClass(order.status, "Completed")}>
                      <span>3</span>
                      <p>Completed</p>
                    </div>

                    <div className={getStepClass(order.status, "Rejected")}>
                      <span>!</span>
                      <p>Rejected</p>
                    </div>
                  </div>

                  {order.remark && (
                    <p>
                      <strong>Remark:</strong> {order.remark}
                    </p>
                  )}

                  {order.status === "Rejected" && (
                    <p className="track-rejected-text">
                      This order was rejected by admin. Please contact seller for more details.
                    </p>
                  )}
                </div>
              ))
            ) : (
              <div className="cart-empty-box">
                <h4>No orders found</h4>
                <p>No order records found for this phone number.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </CustomerLayout>
  )
}

export default TrackOrder