import React, { useState } from "react";
import axiosClient from "../../../auth/api/axiosClient";
import "./createCourse.css";
import { Link, useNavigate } from "react-router-dom";

const CreateCourse = () => {
  const [courseName, setCourseName] = useState("");
  const [emails, setEmails] = useState([""]);
  const navigate = useNavigate();

  // Add Email Field
  const addEmailField = () => setEmails([...emails, ""]);

  // Update Email
  const updateEmail = (index, value) => {
    const updated = [...emails];
    updated[index] = value;
    setEmails(updated);
  };

  // Remove Email Field
  const removeEmailField = (index) =>
    setEmails(emails.filter((_, i) => i !== index));

  // CREATE COURSE API
  const handleCreate = async () => {
    try {
      const body = {
        courseName,
        studentEmails: emails, // ⬅️ send directly (backend filters)
      };

      const res = await axiosClient.post("/auth/admin/courses", body);

      alert("Course created successfully!");

      navigate("/coordinator/dashboard"); // redirect after success
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Course creation failed");
    }
  };

  return (
    <div className="course-container">
      <Link to="/coordinator/dashboard" className="back-link">
        ← Back to Dashboard
      </Link>

      <div className="course-card">
        <h2 className="course-title">Create New Course</h2>
        <p className="course-subtitle">Set up your course and enroll students</p>

        {/* Course Name */}
        <label className="label">Course Name *</label>
        <input
          type="text"
          placeholder="Enter course name"
          className="input"
          value={courseName}
          onChange={(e) => setCourseName(e.target.value)}
        />

        {/* Student Emails */}
        <label className="label">Student Emails</label>

        {emails.map((email, index) => (
          <div className="email-row" key={index}>
            <input
              type="email"
              className="input"
              placeholder="student@sru.edu"
              value={email}
              onChange={(e) => updateEmail(index, e.target.value)}
            />

            {emails.length > 1 && (
              <button
                className="remove-btn"
                onClick={() => removeEmailField(index)}
              >
                ✕
              </button>
            )}
          </div>
        ))}

        <button className="add-btn" onClick={addEmailField}>
          + Add Email
        </button>

        <p className="hint">
          Enter student email addresses. Backend will filter invalid users.
        </p>

        {/* Buttons */}
        <div className="btn-row">
          {/* <button className="cancel-btn">Cancel</button> */}
          <button className="create-btn" onClick={handleCreate}>
            Create Course
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateCourse;
