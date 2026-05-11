import { BrowserRouter, Routes, Route } from "react-router-dom"
import Login from "./pages/Login"
import Dashboard from "./pages/Dashboard"
import Products from "./pages/Products"
import Orders from "./pages/Orders"
import Weather from "./pages/Weather"
import CustomerOrder from "./pages/CustomerOrder"
import Cart from "./pages/Cart"
import CustomerEntry from "./pages/CustomerEntry"
import SalesReport from "./pages/SalesReport"
import MyOrders from "./pages/MyOrders"
import TrackOrder from "./pages/TrackOrder"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/products" element={<Products />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/weather" element={<Weather />} />
        <Route path="/sales-report" element={<SalesReport />} />

        <Route path="/customer-entry" element={<CustomerEntry />} />
        <Route path="/order" element={<CustomerOrder />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/my-orders" element={<MyOrders />} />
        <Route path="/track-order" element={<TrackOrder />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App