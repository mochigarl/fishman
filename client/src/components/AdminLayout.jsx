import Topbar from "./Topbar"

function AdminLayout({ children }) {
  return (
    <div className="fm-admin-shell">
      <Topbar />
      <main className="fm-admin-content-topbar">{children}</main>
    </div>
  )
}

export default AdminLayout