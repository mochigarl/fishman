import { HashRouter as Router, Routes, Route } from "react-router-dom"
import Login from "./pages/Login"
import Dashboard from "./pages/Dashboard"
import Orders from "./pages/Orders"
import Products from "./pages/Products"
import Weather from "./pages/Weather"
import SalesReport from "./pages/SalesReport"
import Notifications from "./pages/Notifications"
import CustomerEntry from "./pages/CustomerEntry"
import CustomerOrder from "./pages/CustomerOrder"
import Cart from "./pages/Cart"
import TrackOrder from "./pages/TrackOrder"
import MyOrders from "./pages/MyOrders"
import ProtectedRoute from "./components/ProtectedRoute"

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <Orders />
            </ProtectedRoute>
          }
        />

        <Route
          path="/products"
          element={
            <ProtectedRoute>
              <Products />
            </ProtectedRoute>
          }
        />

        <Route
          path="/weather"
          element={
            <ProtectedRoute>
              <Weather />
            </ProtectedRoute>
          }
        />

        <Route
          path="/sales-report"
          element={
            <ProtectedRoute>
              <SalesReport />
            </ProtectedRoute>
          }
        />

        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <Notifications />
            </ProtectedRoute>
          }
        />

        <Route path="/customer-entry" element={<CustomerEntry />} />
        <Route path="/order" element={<CustomerOrder />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/track-order" element={<TrackOrder />} />
        <Route path="/my-orders" element={<MyOrders />} />
      </Routes>
    </Router>
  )
}

export default App