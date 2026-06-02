import { useEffect, useState } from "react"
import axios from "axios"
import { useLocation } from "react-router-dom"
import CustomerLayout from "../components/CustomerLayout"

function MyOrders() {
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
              <h3>My Orders</h3>
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

                  <div className="cart-receipt-items">
                    {Array.isArray(order.items) &&
                      order.items.map((item, index) => (
                        <div className="cart-receipt-row" key={index}>
                          <span>
                            {item.name} x {item.quantity}
                          </span>
                          <span>
                            RM {(Number(item.price) * Number(item.quantity)).toFixed(2)}
                          </span>
                        </div>
                      ))}
                  </div>

                  {order.remark && (
                    <p style={{ marginTop: "12px" }}>
                      <strong>Remark:</strong> {order.remark}
                    </p>
                  )}

                  {order.status === "Rejected" && (
                    <p className="track-rejected-text">
                      This order was rejected by admin.
                    </p>
                  )}
                </div>
              ))
            ) : (
              <div className="cart-empty-box">
                <h4>No orders found</h4>
                <p>No order history found for this phone number.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </CustomerLayout>
  )
}

export default MyOrders