const db = require("../config/db")

const getOrders = (req, res) => {
  const sql = "SELECT * FROM orders ORDER BY id DESC"

  db.query(sql, (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message })
    }

    const orders = result.map((order) => ({
      ...order,
      items: JSON.parse(order.items)
    }))

    res.json(orders)
  })
}

const addOrder = (req, res) => {
  const { customer_name, phone, items, total_price } = req.body

  if (!customer_name || !phone || !items || items.length === 0) {
    return res.status(400).json({ error: "Incomplete order data" })
  }

  const productIds = items.map((item) => item.product_id)

  const selectSql = `SELECT * FROM products WHERE id IN (${productIds
    .map(() => "?")
    .join(",")})`

  db.query(selectSql, productIds, (err, products) => {
    if (err) {
      return res.status(500).json({ error: err.message })
    }

    for (const item of items) {
      const product = products.find((p) => p.id === item.product_id)

      if (!product) {
        return res.status(400).json({ error: `Product not found: ${item.name}` })
      }

      const currentStock = Number(product.stock)
      const orderedQty = Number(item.quantity)

      if (product.status === "Out of Stock" || currentStock < orderedQty) {
        return res.status(400).json({
          error: `Insufficient stock for ${item.name}`
        })
      }
    }

    const insertOrderSql =
      "INSERT INTO orders (customer_name, phone, items, total_price, status) VALUES (?, ?, ?, ?, ?)"

    db.query(
      insertOrderSql,
      [customer_name, phone, JSON.stringify(items), total_price, "Pending"],
      (insertErr, result) => {
        if (insertErr) {
          return res.status(500).json({ error: insertErr.message })
        }

        let completedUpdates = 0

        for (const item of items) {
          const product = products.find((p) => p.id === item.product_id)
          const newStock = Number(product.stock) - Number(item.quantity)
          const newStatus = newStock <= 0 ? "Out of Stock" : "Available"

          const updateStockSql =
            "UPDATE products SET stock = ?, status = ? WHERE id = ?"

          db.query(
            updateStockSql,
            [newStock, newStatus, item.product_id],
            (updateErr) => {
              if (updateErr) {
                return res.status(500).json({ error: updateErr.message })
              }

              completedUpdates++

              if (completedUpdates === items.length) {
                return res.json({
                  message: "Order submitted successfully and stock updated",
                  id: result.insertId
                })
              }
            }
          )
        }
      }
    )
  })
}

const updateOrderStatus = (req, res) => {
  const { id } = req.params
  const { status } = req.body

  let sql = ""
  let values = []

  if (status === "Confirmed") {
    sql = "UPDATE orders SET status = ?, confirmed_at = NOW() WHERE id = ?"
    values = [status, id]
  } else if (status === "Completed") {
    sql = "UPDATE orders SET status = ?, completed_at = NOW() WHERE id = ?"
    values = [status, id]
  } else {
    sql = "UPDATE orders SET status = ? WHERE id = ?"
    values = [status, id]
  }

  db.query(sql, values, (err) => {
    if (err) {
      return res.status(500).json({ error: err.message })
    }

    res.json({ message: "Order status updated successfully" })
  })
}

const deleteOrder = (req, res) => {
  const { id } = req.params

  const sql = "DELETE FROM orders WHERE id = ?"

  db.query(sql, [id], (err) => {
    if (err) {
      return res.status(500).json({ error: err.message })
    }

    res.json({ message: "Order deleted successfully" })
  })
}
const getOrdersByPhone = (req, res) => {
  const { phone } = req.params

  const sql = "SELECT * FROM orders WHERE phone = ? ORDER BY id DESC"

  db.query(sql, [phone], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message })
    }

    const orders = result.map((order) => ({
      ...order,
      items: JSON.parse(order.items)
    }))

    res.json(orders)
  })
}
module.exports = {
  getOrders,
  addOrder,
  updateOrderStatus,
  deleteOrder,
  getOrdersByPhone
}
