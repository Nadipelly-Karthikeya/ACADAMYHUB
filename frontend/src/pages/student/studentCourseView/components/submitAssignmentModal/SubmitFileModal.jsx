import React, { useState } from "react";
import "./submitFileModal.css";
import axiosClient from "../../../../../auth/api/axiosClient";
import { useParams } from "react-router-dom";

const SubmitFileModal = ({ item, onClose }) => {
  const { courseId } = useParams();

  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  /** ===============================
   *  SUBMIT ASSIGNMENT FILE
   *  =============================== */
  const handleSubmit = async () => {
    if (!item) return alert("Invalid assignment data");
    if (!file) return alert("Please upload a file");

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const url = `/student/courses/${courseId}/assignments/${item._id}/submissions`;

      const res = await axiosClient.post(url, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert(res.data.message || "Submitted successfully");
      onClose();
    } catch (err) {
      console.error("SUBMIT ERROR:", err);
      alert(err.response?.data?.message || "Submission failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sfm-overlay">
      <div className="sfm-modal">
        <div className="sfm-header">
          <h3>Submit Assignment</h3>
          <button className="sfm-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <label className="sfm-label">Upload PDF</label>
        <input
          type="file"
          accept="application/pdf"
          className="sfm-input"
          onChange={(e) => setFile(e.target.files[0])}
        />

        <button className="sfm-btn" onClick={handleSubmit} disabled={loading}>
          {loading ? "Submitting..." : "Submit"}
        </button>
      </div>
    </div>
  );
};

export default SubmitFileModal;
