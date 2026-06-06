import { useEffect, useMemo, useState } from "react"
import axios from "axios"
import { useLocation } from "react-router-dom"
import CustomerLayout from "../components/CustomerLayout"

function Cart() {
  const location = useLocation()
  const API_BASE = import.meta.env.VITE_API_BASE_URL

  const query = new URLSearchParams(location.search)
  const mode = query.get("mode") || "guest"
  const phoneParam = query.get("phone") || ""

  const [search, setSearch] = useState("")
  const [cart, setCart] = useState([])
  const [customer, setCustomer] = useState({
    name: "",
    phone: phoneParam,
    remark: ""
  })
  const [receipt, setReceipt] = useState(null)

  const cartKey = useMemo(() => {
    return mode === "phone" && phoneParam
      ? `fishman_cart_${phoneParam}`
      : "fishman_cart_guest"
  }, [mode, phoneParam])

  const getStorage = () => {
    return mode === "guest" ? sessionStorage : localStorage
  }

  const loadCart = () => {
    const storage = getStorage()
    const saved = JSON.parse(storage.getItem(cartKey) || "[]")
    setCart(saved)
  }

  useEffect(() => {
    loadCart()
  }, [cartKey])

  const saveCart = (updatedCart) => {
    const storage = getStorage()
    storage.setItem(cartKey, JSON.stringify(updatedCart))
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
    (sum, item) => sum + Number(item.price) * Number(item.quantity),
    0
  )

  const cartCount = cart.reduce(
    (sum, item) => sum + Number(item.quantity),
    0
  )

  const submitOrder = async () => {
    if (!customer.name.trim() || !customer.phone.trim()) {
      alert("Please fill in your name and phone number.")
      return
    }

    if (cart.length === 0) {
      alert("Your cart is empty.")
      return
    }

    try {
      const orderItems = cart.map((item) => ({
        product_id: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price
      }))

      const res = await axios.post(`${API_BASE}/api/orders`, {
        customer_name: customer.name,
        phone: customer.phone,
        items: orderItems,
        total_price: totalPrice,
        remark: customer.remark
      })

      setReceipt({
        orderId: res.data.id,
        customerName: customer.name,
        phone: customer.phone,
        remark: customer.remark,
        items: orderItems,
        total: totalPrice,
        submittedAt: new Date().toLocaleString()
      })

      const storage = getStorage()
      storage.removeItem(cartKey)

      setCart([])
      setCustomer({
        name: "",
        phone: phoneParam,
        remark: ""
      })
    } catch (error) {
      console.log("Submit order error:", error)
      console.log("Response data:", error.response?.data)
      console.log("Status:", error.response?.status)

      alert(
        error.response?.data?.error ||
          error.message ||
          "Failed to submit order."
      )
    }
  }

  return (
    <CustomerLayout
      mode={mode}
      phone={phoneParam}
      search={search}
      onSearchChange={setSearch}
      cartCount={cartCount}
    >
      <div className="cart-page">
        <div className="cart-wrapper">
          <div className="cart-left">
            <div className="cart-section-head">
              <h3>Your Cart</h3>
              <p>{cart.length} item(s) in cart</p>
            </div>

            {cart.length === 0 ? (
              <div className="cart-empty-box">
                <h4>Your cart is empty</h4>
                <p>Add some seafood from the product page first.</p>
              </div>
            ) : (
              <div className="cart-item-list">
                {cart.map((item) => (
                  <div className="cart-item-card" key={item.id}>
                    <div className="cart-item-image-wrap">
                      {item.image ? (
                        <img
                          src={`${API_BASE}/uploads/${item.image}`}
                          alt={item.name}
                          className="cart-item-image"
                        />
                      ) : (
                        <div className="cart-item-no-image">No Image</div>
                      )}
                    </div>

                    <div className="cart-item-info">
                      <h4>{item.name}</h4>
                      <p>{item.category || "Fresh seafood"}</p>
                      <strong>RM {Number(item.price).toFixed(2)}</strong>
                    </div>

                    <div className="cart-item-controls">
                      <div className="cart-qty-box">
                        <button onClick={() => decreaseQty(item.id)}>-</button>
                        <span>{item.quantity}</span>
                        <button onClick={() => increaseQty(item.id)}>+</button>
                      </div>

                      <div className="cart-subtotal">
                        RM {(Number(item.price) * Number(item.quantity)).toFixed(2)}
                      </div>

                      <button
                        className="cart-remove-btn"
                        onClick={() => removeItem(item.id)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="cart-right">
            <div className="cart-side-card">
              <div className="cart-section-head">
                <h3>Checkout</h3>
                <p>Fill in your details</p>
              </div>

              <div className="cart-form-group">
                <label>Your Name</label>
                <input
                  type="text"
                  value={customer.name}
                  onChange={(e) =>
                    setCustomer({ ...customer, name: e.target.value })
                  }
                  placeholder="Enter your name"
                />
              </div>

              <div className="cart-form-group">
                <label>Phone Number</label>
                <input
                  type="text"
                  value={customer.phone}
                  onChange={(e) =>
                    setCustomer({ ...customer, phone: e.target.value })
                  }
                  placeholder="Enter your phone number"
                />
              </div>

              <div className="cart-form-group">
                <label>Remark</label>
                <textarea
                  value={customer.remark}
                  onChange={(e) =>
                    setCustomer({ ...customer, remark: e.target.value })
                  }
                  placeholder="Example: clean the fish, separate packing, pickup at 5 PM"
                  rows="4"
                />
              </div>

              <div className="cart-summary-box">
                <div className="cart-summary-line">
                  <span>Total Items</span>
                  <strong>{cartCount}</strong>
                </div>

                <div className="cart-summary-line total">
                  <span>Total Price</span>
                  <strong>RM {totalPrice.toFixed(2)}</strong>
                </div>
              </div>

              <button className="cart-submit-btn" onClick={submitOrder}>
                Submit Order
              </button>
            </div>
          </div>
        </div>

        {receipt && (
          <div className="cart-receipt-card">
            <h3>Order Submitted Successfully</h3>
            <p><strong>Order ID:</strong> #{receipt.orderId}</p>
            <p><strong>Name:</strong> {receipt.customerName}</p>
            <p><strong>Phone:</strong> {receipt.phone}</p>
            <p><strong>Remark:</strong> {receipt.remark || "-"}</p>
            <p><strong>Submitted At:</strong> {receipt.submittedAt}</p>

            <div className="cart-receipt-items">
              {receipt.items.map((item, index) => (
                <div className="cart-receipt-row" key={index}>
                  <span>{item.name} x {item.quantity}</span>
                  <span>RM {(Number(item.price) * Number(item.quantity)).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="cart-receipt-total">
              Total Paid: RM {receipt.total.toFixed(2)}
            </div>
          </div>
        )}
      </div>
    </CustomerLayout>
  )
}

export default Cart
