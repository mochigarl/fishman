import { useEffect, useMemo, useState } from "react"
import axios from "axios"
import { useLocation, useNavigate } from "react-router-dom"

function Cart() {
  const location = useLocation()
  const navigate = useNavigate()

  const query = new URLSearchParams(location.search)
  const mode = query.get("mode") || "guest"
  const phoneParam = query.get("phone") || ""

  const [cart, setCart] = useState([])
  const [customer, setCustomer] = useState({
    name: "",
    phone: phoneParam
  })

  const [receipt, setReceipt] = useState(null)

  const cartKey = useMemo(() => {
    return mode === "phone" && phoneParam
      ? `fishman_cart_${phoneParam}`
      : "fishman_cart_guest"
  }, [mode, phoneParam])

  const loadCart = () => {
    const saved = JSON.parse(localStorage.getItem(cartKey) || "[]")
    setCart(saved)
  }

  useEffect(() => {
    loadCart()
  }, [cartKey])

  const saveCart = (updatedCart) => {
    localStorage.setItem(cartKey, JSON.stringify(updatedCart))
    setCart(updatedCart)
  }

  const increaseQty = (id) => {
    const updated = cart.map((item) =>
      item.id === id
        ? {
            ...item,
            quantity:
              item.quantity < Number(item.stock)
                ? item.quantity + 1
                : item.quantity
          }
        : item
    )
    saveCart(updated)
  }

  const decreaseQty = (id) => {
    const updated = cart
      .map((item) =>
        item.id === id
          ? { ...item, quantity: item.quantity - 1 }
          : item
      )
      .filter((item) => item.quantity > 0)

    saveCart(updated)
  }

  const removeItem = (id) => {
    const updated = cart.filter((item) => item.id !== id)
    saveCart(updated)
  }

  const totalPrice = cart.reduce(
    (sum, item) => sum + Number(item.price) * item.quantity,
    0
  )

  const submitOrder = async () => {
    if (!customer.name || !customer.phone || cart.length === 0) {
      alert("Please fill in name, phone number, and cart.")
      return
    }

    try {
      const orderItems = cart.map((item) => ({
        product_id: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price
      }))

      const res = await axios.post("http://localhost:5000/api/orders", {
        customer_name: customer.name,
        phone: customer.phone,
        items: orderItems,
        total_price: totalPrice
      })

      setReceipt({
        orderId: res.data.id,
        customerName: customer.name,
        phone: customer.phone,
        items: orderItems,
        total: totalPrice,
        submittedAt: new Date().toLocaleString()
      })

      localStorage.removeItem(cartKey)
      setCart([])
    } catch (error) {
      console.log(error)
      alert(error.response?.data?.error || "Failed to submit order.")
    }
  }

  return (
    <div className="customer-home">
      <div className="customer-header">
        <div className="customer-header-top">
          <div>
            <h1>FishMan Cart</h1>
            <p className="customer-mode-text">
              {mode === "phone" ? `Phone Mode: ${phoneParam}` : "Guest Mode"}
            </p>
          </div>

          <button
            className="customer-top-btn"
            onClick={() =>
              navigate(
                `/order?mode=${mode}${phoneParam ? `&phone=${encodeURIComponent(phoneParam)}` : ""}`
              )
            }
          >
            ← Back to Order
          </button>
        </div>
      </div>

      <div className="cart-section">
        <h2>Your Cart</h2>

        <input
          type="text"
          placeholder="Your name"
          value={customer.name}
          onChange={(e) =>
            setCustomer({ ...customer, name: e.target.value })
          }
        />

        <input
          type="text"
          placeholder="Phone number"
          value={customer.phone}
          onChange={(e) =>
            setCustomer({ ...customer, phone: e.target.value })
          }
        />

        {cart.length === 0 ? (
          <p>No items in cart.</p>
        ) : (
          <>
            {cart.map((item) => (
              <div key={item.id} className="cart-item">
                <div>
                  <strong>{item.name}</strong>
                  <p>RM {item.price}</p>
                </div>

                <div className="cart-actions">
                  <button onClick={() => decreaseQty(item.id)}>-</button>
                  <span>{item.quantity}</span>
                  <button onClick={() => increaseQty(item.id)}>+</button>
                  <button
                    className="delete-btn"
                    onClick={() => removeItem(item.id)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}

            <h3>Total: RM {totalPrice.toFixed(2)}</h3>

            <button className="submit-order-btn" onClick={submitOrder}>
              Submit Order
            </button>
          </>
        )}
      </div>

      {receipt && (
        <div className="receipt-card">
          <h2>Order Submitted Successfully</h2>
          <p><strong>Order ID:</strong> #{receipt.orderId}</p>
          <p><strong>Name:</strong> {receipt.customerName}</p>
          <p><strong>Phone:</strong> {receipt.phone}</p>
          <p><strong>Submitted At:</strong> {receipt.submittedAt}</p>

          <div className="receipt-items">
            <h3>Items</h3>
            {receipt.items.map((item, index) => (
              <div key={index} className="receipt-item-row">
                <span>{item.name} x {item.quantity}</span>
                <span>RM {(Number(item.price) * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <h3>Total Paid: RM {receipt.total.toFixed(2)}</h3>
        </div>
      )}
    </div>
  )
}

export default Cart