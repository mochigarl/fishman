import { useEffect, useMemo, useState } from "react"
import axios from "axios"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import AdminLayout from "../components/AdminLayout"

function SalesReport() {
  const [type, setType] = useState("daily")
  const [report, setReport] = useState({
    summary: {
      totalSales: 0,
      totalOrders: 0,
      averageOrder: 0
    },
    rows: []
  })
  const [loading, setLoading] = useState(false)

  const fetchReport = async (reportType = type) => {
    try {
      setLoading(true)
      const res = await axios.get(
        `http://localhost:5000/api/sales-report?type=${reportType}`
      )
      setReport(res.data)
    } catch (error) {
      console.log("Failed to fetch sales report:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReport(type)
  }, [type])

  const titleLabel = useMemo(() => {
    return type.charAt(0).toUpperCase() + type.slice(1)
  }, [type])

  const generatePDF = () => {
    const doc = new jsPDF()

    doc.setFontSize(18)
    doc.text("FishMan Sales Report", 14, 18)

    doc.setFontSize(11)
    doc.text(`Report Type: ${titleLabel}`, 14, 28)
    doc.text(`Generated At: ${new Date().toLocaleString()}`, 14, 35)

    doc.text(
      `Total Sales: RM ${Number(report.summary.totalSales).toFixed(2)}`,
      14,
      48
    )
    doc.text(`Total Orders: ${report.summary.totalOrders}`, 14, 55)
    doc.text(
      `Average Order Value: RM ${Number(report.summary.averageOrder).toFixed(2)}`,
      14,
      62
    )

    autoTable(doc, {
      startY: 72,
      head: [["Period", "Orders", "Total Sales (RM)"]],
      body: report.rows.map((item) => [
        item.label,
        item.orders,
        Number(item.sales).toFixed(2)
      ])
    })

    doc.save(`fishman-${type}-sales-report.pdf`)
  }

  return (
    <AdminLayout>
      <div className="fm-page-header">
        <div>
          <h1>Sales Report</h1>
          <p>View real sales performance by period</p>
        </div>
      </div>

      <div className="fm-card-topbar" style={{ marginBottom: "24px" }}>
        <div className="fm-card-head-gradient blue-grad">Report Type</div>

        <div className="fm-card-body">
          <div className="fm-report-type-row">
            <button
              className={type === "daily" ? "fm-filter-btn active" : "fm-filter-btn"}
              onClick={() => setType("daily")}
            >
              Daily
            </button>

            <button
              className={type === "weekly" ? "fm-filter-btn active" : "fm-filter-btn"}
              onClick={() => setType("weekly")}
            >
              Weekly
            </button>

            <button
              className={type === "monthly" ? "fm-filter-btn active" : "fm-filter-btn"}
              onClick={() => setType("monthly")}
            >
              Monthly
            </button>

            <button
              className={type === "yearly" ? "fm-filter-btn active" : "fm-filter-btn"}
              onClick={() => setType("yearly")}
            >
              Yearly
            </button>
          </div>
        </div>
      </div>

      <div className="fm-stats-grid-simple" style={{ marginBottom: "24px" }}>
        <div className="fm-stat-card-simple stat-yellow">
          <p>Total Sales</p>
          <h2>RM {Number(report.summary.totalSales).toFixed(2)}</h2>
          <span>{titleLabel} report</span>
        </div>

        <div className="fm-stat-card-simple stat-pink">
          <p>Total Orders</p>
          <h2>{report.summary.totalOrders}</h2>
          <span>{titleLabel} report</span>
        </div>

        <div className="fm-stat-card-simple stat-blue">
          <p>Average Order</p>
          <h2>RM {Number(report.summary.averageOrder).toFixed(2)}</h2>
          <span>{titleLabel} report</span>
        </div>
      </div>

      <div className="fm-card-topbar">
        <div className="fm-card-head-gradient green-grad">Sales Table</div>

        <div className="fm-card-body">
          <div className="fm-sales-toolbar">
            <button className="fm-open-page-btn" onClick={generatePDF}>
              Generate PDF Report
            </button>
          </div>

          {loading ? (
            <p>Loading report...</p>
          ) : report.rows.length === 0 ? (
            <p>No sales data found.</p>
          ) : (
            <div className="fm-table-wrap">
              <table className="fm-table-clean">
                <thead>
                  <tr>
                    <th>Period</th>
                    <th>Orders</th>
                    <th>Total Sales</th>
                  </tr>
                </thead>
                <tbody>
                  {report.rows.map((item, index) => (
                    <tr key={index}>
                      <td>{item.label}</td>
                      <td>{item.orders}</td>
                      <td>RM {Number(item.sales).toFixed(2)}</td>
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

export default SalesReport