import React, { useState } from "react";
import axiosClient from "../../../../../auth/api/axiosClient";
import { useParams } from "react-router-dom";
import "./createExamModal.css";

const CreateExamModal = ({ onClose }) => {
  const { courseId } = useParams();
  const [type, setType] = useState("Quiz (MCQ)");
  const [instructions, setInstructions] = useState("");
  const [dueDate, setDueDate] = useState("");

  const handleCreate = async () => {
    try {
      await axiosClient.post(`/courses/${courseId}/exams`, {
        type,
        instructions,
        dueDate: new Date(dueDate).toISOString(),
      });

      alert("Exam created successfully");
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || "Creation failed");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">

        <div className="modal-header">
          <h3>Create Exam</h3>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <label className="label">Type</label>
        <select className="input" value={type} onChange={(e) => setType(e.target.value)}>
          <option>Exam</option>
          <option>Quiz (MCQ)</option>
        </select>

        <label className="label">Add Exam Quetion</label>
        <textarea className="textarea" value={instructions} onChange={(e) => setInstructions(e.target.value)} />

        <label className="label">Due Date</label>
        <input type="datetime-local" className="input" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />

        <button className="create-btn" onClick={handleCreate}>Create</button>
      </div>
    </div>
  );
};

export default CreateExamModal;
