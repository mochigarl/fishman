import { useEffect, useMemo, useState } from "react"
import axios from "axios"
import { useLocation } from "react-router-dom"
import CustomerLayout from "../components/CustomerLayout"

function CustomerOrder() {
  const location = useLocation()

  const query = new URLSearchParams(location.search)
  const mode = query.get("mode") || "guest"
  const phone = query.get("phone") || ""

  const [products, setProducts] = useState([])
  const [search, setSearch] = useState("")
  const [cartCount, setCartCount] = useState(0)
  const [categoryFilter, setCategoryFilter] = useState("All")

  const cartKey = useMemo(() => {
    return mode === "phone" && phone
      ? `fishman_cart_${phone}`
      : "fishman_cart_guest"
  }, [mode, phone])

  const getStorage = () => {
    return mode === "guest" ? sessionStorage : localStorage
  }

  const fetchProducts = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/products")
      setProducts(res.data)
    } catch (error) {
      console.log("Failed to fetch products:", error)
    }
  }

  const refreshCartCount = () => {
    const storage = getStorage()
    const saved = JSON.parse(storage.getItem(cartKey) || "[]")
    const totalQty = saved.reduce((sum, item) => sum + Number(item.quantity), 0)
    setCartCount(totalQty)
  }

  useEffect(() => {
    fetchProducts()
    refreshCartCount()
  }, [cartKey])

  const addToCart = (product) => {
    const storage = getStorage()
    const saved = JSON.parse(storage.getItem(cartKey) || "[]")
    const existing = saved.find((item) => item.id === product.id)

    let updatedCart = []

    if (existing) {
      if (existing.quantity < Number(product.stock)) {
        updatedCart = saved.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      } else {
        alert(`Only ${product.stock} items available for ${product.name}`)
        return
      }
    } else {
      if (Number(product.stock) > 0) {
        updatedCart = [...saved, { ...product, quantity: 1 }]
      } else {
        return
      }
    }

    storage.setItem(cartKey, JSON.stringify(updatedCart))
    refreshCartCount()
  }

  const getProductBadge = (product) => {
    const stock = Number(product.stock)

    if (stock <= 0 || String(product.status).toLowerCase() === "out of stock") {
      return { text: "Out of Stock", className: "out" }
    }

    if (stock <= 5) {
      return { text: "Low Stock", className: "low" }
    }

    return { text: "Available", className: "available" }
  }

  const categories = useMemo(() => {
    const raw = products
      .map((p) => p.category)
      .filter(Boolean)
      .map((c) => String(c).trim())

    return ["All", ...new Set(raw)]
  }, [products])

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        String(product.name || "").toLowerCase().includes(search.toLowerCase()) ||
        String(product.category || "").toLowerCase().includes(search.toLowerCase())

      const matchesCategory =
        categoryFilter === "All"
          ? true
          : String(product.category || "").toLowerCase() === categoryFilter.toLowerCase()

      return matchesSearch && matchesCategory
    })
  }, [products, search, categoryFilter])

  return (
    <CustomerLayout
      mode={mode}
      phone={phone}
      search={search}
      onSearchChange={setSearch}
      cartCount={cartCount}
    >
      <section className="cust-chip-row">
        {categories.map((category) => (
          <button
            key={category}
            className={categoryFilter === category ? "cust-chip active" : "cust-chip"}
            onClick={() => setCategoryFilter(category)}
          >
            {category}
          </button>
        ))}
      </section>

      <section className="cust-products" id="customer-products">
        <div className="cust-products-head">
          <h3>Available Products</h3>
          <p>{filteredProducts.length} item(s) found</p>
        </div>

        <div className="cust-grid">
          {filteredProducts.map((product) => {
            const badge = getProductBadge(product)
            const isOut =
              Number(product.stock) <= 0 ||
              String(product.status).toLowerCase() === "out of stock"

            return (
              <div className="cust-card" key={product.id}>
                <div className="cust-card-image-wrap">
                  {product.image ? (
                    <img
                      src={`http://localhost:5000/uploads/${product.image}`}
                      alt={product.name}
                      className="cust-card-image"
                    />
                  ) : (
                    <div className="cust-card-no-image">No Image</div>
                  )}

                  <span className={`cust-badge ${badge.className}`}>
                    {badge.text}
                  </span>
                </div>

                <div className="cust-card-body">
                  <h4>{product.name}</h4>
                  <p className="cust-card-subtitle">
                    {product.category || "Fresh seafood"}
                  </p>

                  <div className="cust-card-meta">
                    <span>RM {Number(product.price).toFixed(2)}</span>
                    <span>Stock: {product.stock}</span>
                  </div>

                  <button
                    className={isOut ? "cust-add-btn disabled" : "cust-add-btn"}
                    disabled={isOut}
                    onClick={() => addToCart(product)}
                  >
                    {isOut ? "Out of Stock" : "Add to Cart"}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </section>
    </CustomerLayout>
  )
}

export default CustomerOrder