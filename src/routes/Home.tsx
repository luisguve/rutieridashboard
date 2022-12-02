import { useState, useContext, useEffect } from "react"
import { Navigate, useLocation, useNavigate } from "react-router-dom";

import Login from "../components/Login"
import AuthContext from "../context/AuthContext"

function App() {
  const { user } = useContext(AuthContext)
  const { state } = useLocation();
  const navigate = useNavigate();

  if (user !== null) {
    return (<Navigate to="/dashboard" replace />);
  }

  const handleLogin = () => {
    navigate((state as any)?.path || "/dashboard");
  }
  return (
    <div className="container-md py-5">
      <Login onLogin={handleLogin} />
    </div>
  )
}

export default App
