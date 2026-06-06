import { useState } from "react"
import { useNavigate } from "react-router-dom"

function CustomerEntry() {
  const navigate = useNavigate()
  const [phone, setPhone] = useState("")

  const continueAsGuest = () => {
    navigate("/order?mode=guest")
  }

  const continueWithPhone = () => {
    if (!phone.trim()) {
      alert("Please enter phone number")
      return
    }

    navigate(`/order?mode=phone&phone=${encodeURIComponent(phone.trim())}`)
  }

  return (
    <div className="customer-entry-page">
      <div className="customer-entry-card">
        <h1>Welcome to FishMan</h1>
        <p>Choose how you would like to continue</p>

        <button className="entry-main-btn" onClick={continueAsGuest}>
          Continue as Guest
        </button>

        <div className="entry-divider">or</div>

        <input
          type="text"
          placeholder="Enter phone number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        <button className="entry-main-btn" onClick={continueWithPhone}>
          Continue with Phone Number
        </button>
      </div>
    </div>
  )
}

export default CustomerEntry
