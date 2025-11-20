import React, { useState } from "react";
import axiosClient from "../api/axiosClient";
import "./coordinatorLogin.css";
import { Link, useNavigate } from "react-router-dom";

const CoordinatorLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await axiosClient.post("/auth/admin/login", {
        email,
        password,
      });

      const { accessToken, refreshToken, user } = res.data.data;

      // Save tokens
      localStorage.setItem("coordinator_token", accessToken);
      localStorage.setItem("coordinator_refresh_token", refreshToken);

      // Save role so ProtectedRoute works
      localStorage.setItem("role", "coordinator");

      // Redirect to correct dashboard
      navigate("/coordinator/dashboard");
    } catch (error) {
      alert(error.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="cl-container">
      {/* <Link to="/" className="cl-back">
        ← Back to Home
      </Link> */}

      <div className="cl-card">
        <div className="cl-icon">📘</div>

        <h2 className="cl-title">Coordinator Login</h2>
        <p className="cl-sub">SRU Academic Portal</p>

        <label className="cl-label">Email Address</label>
        <div className="cl-input-box">
          <span>📧</span>
          <input
            type="email"
            placeholder="your@sru.edu.in"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <label className="cl-label">Password</label>
        <div className="cl-input-box">
          <span>🔒</span>
          <input
            type="password"
            placeholder="•••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button className="cl-btn" onClick={handleLogin}>
          Login
        </button>

        <p className="cl-register">
          Don't have an account?{" "}
          <Link to="/coordinator/register">Register</Link>
        </p>
      </div>
    </div>
  );
};

export default CoordinatorLogin;
