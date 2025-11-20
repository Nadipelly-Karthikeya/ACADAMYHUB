import React, { useState } from "react";
import axiosClient from "../api/axiosClient";
import "./coordinatorEmailVerify.css";
import { useNavigate } from "react-router-dom";

const CoordinatorEmailVerify = () => {
  const navigate = useNavigate();
  const [otp, setOtp] = useState("");

  const handleVerify = async () => {
    try {
      const token = localStorage.getItem("coordinator_verify_jwt");

      await axiosClient.post(
        "/auth/admin/verify-email",
        { otp },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Email Verified!");

      localStorage.removeItem("coordinator_verify_jwt");

      navigate("/coordinator/login");
    } catch (err) {
      alert(err.response?.data?.message || "Verification failed");
    }
  };

  return (
    <div className="cev-container">
      <div className="cev-card">
        <h2>Coordinator Email Verification</h2>
        <p>Enter the OTP sent to your email</p>

        <input
          className="cev-input"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          placeholder="Enter OTP"
        />

        <button className="cev-btn" onClick={handleVerify}>
          Verify Email
        </button>
      </div>
    </div>
  );
};

export default CoordinatorEmailVerify;
