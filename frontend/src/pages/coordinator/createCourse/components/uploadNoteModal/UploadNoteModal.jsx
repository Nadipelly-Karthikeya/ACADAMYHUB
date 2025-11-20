import React, { useState } from "react";
import "./uploadNoteModal.css";
import axiosClient from "../../../../../auth/api/axiosClient";
import { useParams } from "react-router-dom";

const UploadNoteModal = ({ onClose }) => {
  const { courseId } = useParams(); // <-- GET courseId from route

  const [title, setTitle] = useState("");
  const [unit, setUnit] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!title || !unit || !file) {
      alert("All fields are required");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("title", title);
      formData.append("unit", unit);
      formData.append("file", file);

      const res = await axiosClient.post(
        `/courses/${courseId}/notes`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      alert("Lecture Note Uploaded!");
      onClose();
    } catch (err) {
      console.log(err);
      alert(err.response?.data?.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <div className="modal-header">
          <h3>Upload Lecture Note</h3>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <label className="label">Title</label>
        <input
          className="input"
          placeholder="Enter note title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <label className="label">Unit</label>
        <input
          className="input"
          placeholder="e.g., Unit 1"
          value={unit}
          onChange={(e) => setUnit(e.target.value)}
        />

        <label className="label">File (PDF)</label>
        <input
          type="file"
          className="file-input"
          accept="application/pdf"
          onChange={(e) => setFile(e.target.files[0])}
        />

        <button
          className="upload-btn"
          onClick={handleUpload}
          disabled={loading}
        >
          {loading ? "Uploading..." : "Upload"}
        </button>
      </div>
    </div>
  );
};

export default UploadNoteModal;
