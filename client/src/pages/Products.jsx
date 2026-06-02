import { useEffect, useMemo, useState } from "react"
import axios from "axios"
import AdminLayout from "../components/AdminLayout"

const initialForm = {
  name: "",
  category: "",
  price: "",
  stock: "",
  status: "Available"
}

function Products() {
  const [products, setProducts] = useState([])
  const [form, setForm] = useState(initialForm)
  const [image, setImage] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const res = await axios.get("http://localhost:5000/api/products")
      setProducts(res.data)
    } catch (error) {
      console.log("Failed to fetch products:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const resetForm = () => {
    setForm(initialForm)
    setImage(null)
    setEditingId(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!form.name || !form.price || !form.stock) {
      alert("Please fill in product name, price and stock.")
      return
    }

    try {
      const formData = new FormData()
      formData.append("name", form.name)
      formData.append("category", form.category)
      formData.append("price", form.price)
      formData.append("stock", form.stock)
      formData.append("status", form.status)

      if (image) {
        formData.append("image", image)
      }

      if (editingId) {
        await axios.put(`http://localhost:5000/api/products/${editingId}`, formData)
      } else {
        await axios.post("http://localhost:5000/api/products", formData)
      }

      resetForm()
      fetchProducts()
    } catch (error) {
      console.log("Failed to save product:", error)
      alert(error.response?.data?.error || "Failed to save product")
    }
  }

  const handleEdit = (product) => {
    setEditingId(product.id)
    setForm({
      name: product.name || "",
      category: product.category || "",
      price: product.price || "",
      stock: product.stock || "",
      status: product.status || "Available"
    })
    setImage(null)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Delete this product?")
    if (!confirmDelete) return

    try {
      await axios.delete(`http://localhost:5000/api/products/${id}`)
      fetchProducts()
    } catch (error) {
      console.log("Failed to delete product:", error)
      alert(error.response?.data?.error || "Failed to delete product")
    }
  }

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        String(product.name || "").toLowerCase().includes(search.toLowerCase()) ||
        String(product.category || "").toLowerCase().includes(search.toLowerCase())

      const matchesStatus =
        statusFilter === "All"
          ? true
          : String(product.status || "").toLowerCase() === statusFilter.toLowerCase()

      return matchesSearch && matchesStatus
    })
  }, [products, search, statusFilter])

  const getStockLabel = (product) => {
    const stock = Number(product.stock)

    if (stock <= 0 || String(product.status).toLowerCase() === "out of stock") {
      return "Out of Stock"
    }

    if (stock <= 5) {
      return "Low Stock"
    }

    return "Available"
  }

  const getStockClass = (product) => {
    const label = getStockLabel(product)
    if (label === "Out of Stock") return "fm-status pending"
    if (label === "Low Stock") return "fm-status confirmed"
    return "fm-status completed"
  }

  return (
    <AdminLayout>
      

      <div className="fm-card-topbar" style={{ marginBottom: "24px" }}>
        <div className="fm-card-head-gradient orange-grad">
          {editingId ? "Edit Product" : "Add Product"}
        </div>

        <div className="fm-card-body">
          <form className="fm-product-form" onSubmit={handleSubmit}>
            <div className="fm-form-grid">
              <div className="fm-form-group">
                <label>Product Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Enter product name"
                />
              </div>

              <div className="fm-form-group">
                <label>Category</label>
                <input
                  type="text"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  placeholder="Enter category"
                />
              </div>

              <div className="fm-form-group">
                <label>Price (RM)</label>
                <input
                  type="number"
                  step="0.01"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  placeholder="Enter price"
                />
              </div>

              <div className="fm-form-group">
                <label>Stock</label>
                <input
                  type="number"
                  value={form.stock}
                  onChange={(e) => setForm({ ...form, stock: e.target.value })}
                  placeholder="Enter stock"
                />
              </div>

              <div className="fm-form-group">
                <label>Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                >
                  <option value="Available">Available</option>
                  <option value="Out of Stock">Out of Stock</option>
                </select>
              </div>

              <div className="fm-form-group">
                <label>Product Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImage(e.target.files[0])}
                />
              </div>
            </div>

            <div className="fm-form-actions">
              <button type="submit" className="fm-submit-btn">
                {editingId ? "Update Product" : "Add Product"}
              </button>

              {editingId && (
                <button
                  type="button"
                  className="fm-cancel-btn"
                  onClick={resetForm}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      <div className="fm-products-toolbar">
        <div className="fm-products-search-wrap">
          <input
            type="text"
            className="fm-products-search"
            placeholder="Search product or category"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="fm-orders-filter-group">
          <button
            className={statusFilter === "All" ? "fm-filter-btn active" : "fm-filter-btn"}
            onClick={() => setStatusFilter("All")}
          >
            All
          </button>
          <button
            className={statusFilter === "Available" ? "fm-filter-btn active" : "fm-filter-btn"}
            onClick={() => setStatusFilter("Available")}
          >
            Available
          </button>
          <button
            className={statusFilter === "Out of Stock" ? "fm-filter-btn active" : "fm-filter-btn"}
            onClick={() => setStatusFilter("Out of Stock")}
          >
            Out of Stock
          </button>
        </div>
      </div>

      <div className="fm-card-topbar">
        <div className="fm-card-head-gradient blue-grad">
          Product List
        </div>

        <div className="fm-card-body">
          {loading ? (
            <p>Loading products...</p>
          ) : filteredProducts.length === 0 ? (
            <p>No products found.</p>
          ) : (
            <div className="fm-product-grid">
              {filteredProducts.map((product) => (
                <div className="fm-product-card" key={product.id}>
                  <div className="fm-product-image-wrap">
                    {product.image ? (
                      <img
                        src={`http://localhost:5000/uploads/${product.image}`}
                        alt={product.name}
                        className="fm-product-image"
                      />
                    ) : (
                      <div className="fm-product-image-placeholder">No Image</div>
                    )}
                  </div>

                  <div className="fm-product-card-body">
                    <div className="fm-product-card-top">
                      <div>
                        <h3>{product.name}</h3>
                        <p>{product.category || "No category"}</p>
                      </div>

                      <span className={getStockClass(product)}>
                        {getStockLabel(product)}
                      </span>
                    </div>

                    <div className="fm-product-meta">
                      <div>
                        <span>Price</span>
                        <strong>RM {Number(product.price).toFixed(2)}</strong>
                      </div>

                      <div>
                        <span>Stock</span>
                        <strong>{product.stock}</strong>
                      </div>
                    </div>

                    <div className="fm-product-actions">
                      <button
                        className="fm-action-btn confirm"
                        onClick={() => handleEdit(product)}
                      >
                        Edit
                      </button>

                      <button
                        className="fm-action-btn delete"
                        onClick={() => handleDelete(product.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}

export default Products