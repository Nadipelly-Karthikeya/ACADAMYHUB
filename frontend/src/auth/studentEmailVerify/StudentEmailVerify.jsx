import React, { useState } from "react";
import axiosClient from "../api/axiosClient";
import "./studentEmailVerify.css";
import { useNavigate } from "react-router-dom";

const StudentEmailVerify = () => {
  const navigate = useNavigate();
  const [otp, setOtp] = useState("");

  const handleVerify = async () => {
    try {
      const token = localStorage.getItem("student_verify_jwt");

      if (!token) {
        alert("Missing verification token. Please register again.");
        return;
      }

      await axiosClient.post(
        "/auth/student/verify-email",
        { otp },                   // user manually entered otp
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Email verified successfully!");

      // cleanup saved jwt
      localStorage.removeItem("student_verify_jwt");

      navigate("/student/login");

    } catch (err) {
      alert(err.response?.data?.message || "OTP verification failed");
    }
  };

  return (
    <div className="sev-container">
      <div className="sev-card">
        <h2>Email Verification</h2>
        <p>Please enter the OTP sent to your email.</p>

        <input
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          className="sev-input"
          placeholder="Enter OTP"
        />

        <button onClick={handleVerify} className="sev-btn">
          Verify Email
        </button>
      </div>
    </div>
  );
};

export default StudentEmailVerify;
