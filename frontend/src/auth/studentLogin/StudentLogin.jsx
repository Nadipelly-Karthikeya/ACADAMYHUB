import React, { useState } from "react";
import axiosClient from "../api/axiosClient";
import "./studentLogin.css";
import { useNavigate } from "react-router-dom";

const StudentLogin = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const res = await axiosClient.post("/auth/student/login", {
        email,
        password,
      });

      // 👇 log once to see exact shape if needed
      console.log("LOGIN RESPONSE:", res.data);

      // Assuming same structure as register
      const { accessToken, refreshToken, user } = res.data.data;

      // Save tokens
      localStorage.setItem("student_token", accessToken);
      localStorage.setItem("student_refresh_token", refreshToken);

      // Save role for universal logout
      localStorage.setItem("role", user.role || "student");

      navigate("/student/dashboard");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="sl-container">
      <div className="sl-card">
        <h2 className="sl-title">Student Login</h2>

        <label className="sl-label">Email</label>
        <input
          type="email"
          className="sl-input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="student@sru.edu.in"
        />

        <label className="sl-label">Password</label>
        <input
          type="password"
          className="sl-input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="sl-btn" onClick={handleLogin}>
          Login
        </button>

        <p className="sl-register">
          Don’t have an account? <a href="/student/register">Register</a>
        </p>
      </div>
    </div>
  );
};

export default StudentLogin;
