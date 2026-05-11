const db = require("../config/db")

const getSalesReport = (req, res) => {
  const { type = "daily" } = req.query

  let labelSql = ""
  let groupBySql = ""
  let orderBySql = ""

  if (type === "daily") {
    labelSql = "DATE(created_at)"
    groupBySql = "DATE(created_at)"
    orderBySql = "DATE(created_at) DESC"
  } else if (type === "weekly") {
    labelSql = "CONCAT(YEAR(created_at), '-W', WEEK(created_at, 1))"
    groupBySql = "YEAR(created_at), WEEK(created_at, 1)"
    orderBySql = "YEAR(created_at) DESC, WEEK(created_at, 1) DESC"
  } else if (type === "monthly") {
    labelSql = "DATE_FORMAT(created_at, '%Y-%m')"
    groupBySql = "YEAR(created_at), MONTH(created_at)"
    orderBySql = "YEAR(created_at) DESC, MONTH(created_at) DESC"
  } else if (type === "yearly") {
    labelSql = "YEAR(created_at)"
    groupBySql = "YEAR(created_at)"
    orderBySql = "YEAR(created_at) DESC"
  } else {
    return res.status(400).json({ error: "Invalid report type" })
  }

  const summarySql = `
    SELECT 
      IFNULL(SUM(total_price), 0) AS totalSales,
      COUNT(*) AS totalOrders,
      IFNULL(AVG(total_price), 0) AS averageOrder
    FROM orders
  `

  const tableSql = `
    SELECT 
      ${labelSql} AS label,
      COUNT(*) AS orders,
      IFNULL(SUM(total_price), 0) AS sales
    FROM orders
    GROUP BY ${groupBySql}
    ORDER BY ${orderBySql}
  `

  db.query(summarySql, (summaryErr, summaryResult) => {
    if (summaryErr) {
      return res.status(500).json({ error: summaryErr.message })
    }

    db.query(tableSql, (tableErr, tableResult) => {
      if (tableErr) {
        return res.status(500).json({ error: tableErr.message })
      }

      res.json({
        summary: {
          totalSales: Number(summaryResult[0]?.totalSales || 0),
          totalOrders: Number(summaryResult[0]?.totalOrders || 0),
          averageOrder: Number(summaryResult[0]?.averageOrder || 0)
        },
        rows: tableResult.map((row) => ({
          label: String(row.label),
          orders: Number(row.orders),
          sales: Number(row.sales)
        }))
      })
    })
  })
}

module.exports = {
  getSalesReport
}