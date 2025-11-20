import React, { useState } from "react";
import axiosClient from "../../../../../auth/api/axiosClient";
import "./assignmentModal.css";

const CreateAssignmentModal = ({ courseId, onClose, onCreated }) => {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [attachment, setAttachment] = useState(null);

  const handleSubmit = async () => {
    if (!title || !desc || !dueDate) {
      alert("Title, description and due date required");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", desc);
    formData.append("dueDate", dueDate);
    if (attachment) formData.append("attachment", attachment);

    try {
      const res = await axiosClient.post(
        `/courses/${courseId}/assignments`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      alert("Assignment created!");

      onClose();
      onCreated && onCreated();
    } catch (err) {
      alert(err.response?.data?.message || "Creation failed!");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <div className="modal-header">
          <h3>Create Assignment</h3>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <label className="label">Title</label>
        <input
          className="input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <label className="label">Description</label>
        <textarea
          className="textarea"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
        />

        <label className="label">Due Date</label>
        <input
          type="datetime-local"
          className="input"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />

        <label className="label">Attachment (optional)</label>
        <input
          type="file"
          className="file-input"
          onChange={(e) => setAttachment(e.target.files[0])}
        />

        <button className="create-btn" onClick={handleSubmit}>
          Create
        </button>
      </div>
    </div>
  );
};

export default CreateAssignmentModal;
