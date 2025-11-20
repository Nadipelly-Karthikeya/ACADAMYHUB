import React, { useState } from "react";
import axiosClient from "../api/axiosClient";
import "./coordinatorRegister.css";
import { useNavigate } from "react-router-dom";

const CoordinatorRegister = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleRegister = async () => {
    try {
      // Clear old login/role data
      localStorage.clear();

      // IMPORTANT: USE ADMIN ROUTE FOR COORDINATOR
      const res = await axiosClient.post("/auth/admin/register", form);

      // Access token returned during register
      localStorage.setItem("coordinator_verify_jwt", res.data.data.accessToken);

      // Save coordinator role
      localStorage.setItem("role", "coordinator");

      navigate("/coordinator/login");
    } catch (err) {
      alert(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="cr-container">
      <div className="cr-card">
        <h2 className="cr-title">Coordinator Registration</h2>

        <label className="cr-label">Name</label>
        <input name="name" className="cr-input" onChange={handleChange} />

        <label className="cr-label">Email</label>
        <input name="email" className="cr-input" onChange={handleChange} />

        {/* <label className="cr-label">Mobile</label>
        <input name="mobile" className="cr-input" onChange={handleChange} /> */}

        <label className="cr-label">Password</label>
        <input
          type="password"
          name="password"
          className="cr-input"
          onChange={handleChange}
        />

        <button className="cr-btn" onClick={handleRegister}>
          Register
        </button>
      </div>
    </div>
  );
};

export default CoordinatorRegister;
