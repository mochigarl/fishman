import CustomerTopbar from "./CustomerTopbar"

function CustomerLayout({
  children,
  mode = "guest",
  phone = "",
  search = "",
  onSearchChange,
  cartCount = 0
}) {
  return (
    <div className="cust-page">
      <div className="cust-container">
        <CustomerTopbar
          mode={mode}
          phone={phone}
          search={search}
          onSearchChange={onSearchChange}
          cartCount={cartCount}
        />

        {children}
      </div>
    </div>
  )
}

export default CustomerLayout