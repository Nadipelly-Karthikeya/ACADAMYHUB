import React, { useState } from "react";
import axiosClient from "../api/axiosClient";
import "./studentRegister.css";
import { useNavigate } from "react-router-dom";

const StudentRegister = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async () => {
    try {
      const res = await axiosClient.post("/auth/student/register", form);

      // Save access token ONLY (required for verify-email)
      localStorage.setItem("student_verify_jwt", res.data.data.accessToken);

      navigate("/student/login");
    } catch (err) {
      alert(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="sr-container">
      <div className="sr-card">
        <h2 className="sr-title">Student Registration</h2>

        <label className="sr-label">Full Name</label>
        <input
          className="sr-input"
          name="name"
          value={form.name}
          onChange={handleChange}
        />

        <label className="sr-label">Email</label>
        <input
          type="email"
          className="sr-input"
          name="email"
          value={form.email}
          onChange={handleChange}
        />

        {/* <label className="sr-label">Mobile Number</label>
        <input
          type="text"
          className="sr-input"
          name="mobile"
          value={form.mobile}
          onChange={handleChange}
        /> */}

        <label className="sr-label">Password</label>
        <input
          type="password"
          className="sr-input"
          name="password"
          value={form.password}
          onChange={handleChange}
        />

        <button className="sr-btn" onClick={handleRegister}>
          Register
        </button>
      </div>
    </div>
  );
};

export default StudentRegister;
