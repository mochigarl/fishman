import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import AdminLayout from "../components/AdminLayout"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts"

function Dashboard() {
  const navigate = useNavigate()

  const [stats, setStats] = useState({
    totalSales: 0,
    todayOrders: 0,
    pendingOrders: 0,
    recentOrders: [],
    salesAnalytics: [],
    topProducts: []
  })

  const fetchDashboard = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/dashboard")
      setStats(res.data)
    } catch (error) {
      console.log("Failed to fetch dashboard stats:", error)
    }
  }

  useEffect(() => {
    fetchDashboard()

    const interval = setInterval(() => {
      fetchDashboard()
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  return (
    <AdminLayout>

      <div className="fm-stats-grid-simple">
        <div
          className="fm-stat-card-simple stat-yellow"
          onClick={() => navigate("/sales-report")}
        >
          <p>Total Sales</p>
          <h2>RM {Number(stats.totalSales).toFixed(2)}</h2>
          <span>View report</span>
        </div>

        <div
          className="fm-stat-card-simple stat-pink"
          onClick={() => navigate("/orders")}
        >
          <p>Today Orders</p>
          <h2>{stats.todayOrders}</h2>
          <span>View orders</span>
        </div>

        <div
          className="fm-stat-card-simple stat-blue"
          onClick={() => navigate("/orders?status=pending")}
        >
          <p>Pending Orders</p>
          <h2>{stats.pendingOrders}</h2>
          <span>Need action</span>
        </div>
      </div>

      <div className="fm-dashboard-grid-topbar">
        <div className="fm-card-topbar large">
          <div className="fm-card-head-gradient blue-grad">
            Sales Analytics (Last 7 Days)
          </div>

          <div className="fm-card-body">
            <div className="fm-chart-wrap">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={stats.salesAnalytics}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(value) =>
                      new Date(value).toLocaleDateString("en-MY", {
                        month: "short",
                        day: "numeric"
                      })
                    }
                  />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="total"
                    stroke="#2563eb"
                    strokeWidth={3}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="fm-card-topbar">
          <div className="fm-card-head-gradient orange-grad">
            Top Selling Fish
          </div>

          <div className="fm-card-body">
            {stats.topProducts.length === 0 ? (
              <p>No product data yet.</p>
            ) : (
              stats.topProducts.map((product, index) => {
                const maxQty = Math.max(
                  ...stats.topProducts.map((item) => Number(item.quantity))
                )
                const width = maxQty
                  ? (Number(product.quantity) / maxQty) * 100
                  : 0

                return (
                  <div className="fm-product-row" key={index}>
                    <div className="fm-product-row-top">
                      <span>{product.name}</span>
                      <strong>{product.quantity} sold</strong>
                    </div>

                    <div className="fm-progress-bar">
                      <div
                        className="fm-progress-fill"
                        style={{ width: `${width}%` }}
                      ></div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>

      <div className="fm-dashboard-grid-topbar">
        <div className="fm-card-topbar large">
          <div className="fm-card-head-gradient green-grad">
            Recent Orders
          </div>

          <div className="fm-card-body">
            <table className="fm-table-clean">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Status</th>
                  <th>Total</th>
                </tr>
              </thead>

              <tbody>
                {stats.recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan="4">No orders yet</td>
                  </tr>
                ) : (
                  stats.recentOrders.map((order) => (
                    <tr key={order.id} onClick={() => navigate("/orders")}>
                      <td>#{order.id}</td>
                      <td>{order.customer_name}</td>
                      <td>{order.status}</td>
                      <td>RM {Number(order.total_price).toFixed(2)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="fm-card-topbar">
          <div className="fm-card-head-gradient purple-grad">
            Weather & Sea Safety
          </div>

          <div className="fm-card-body">
            <p>View current weather, forecast and safety recommendation.</p>

            <button
              className="fm-open-page-btn"
              onClick={() => navigate("/weather")}
            >
              Open Weather Page
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

export default Dashboard