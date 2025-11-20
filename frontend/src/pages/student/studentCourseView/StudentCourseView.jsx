// StudentCourseView.jsx
import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import "./StudentCourseView.css";
import axiosClient from "../../../auth/api/axiosClient";

// Universal submit modal
import SubmitFileModal from "./components/submitAssignmentModal/SubmitFileModal";

const StudentCourseView = () => {
  const { courseId } = useParams();

  const [course, setCourse] = useState(null);
  const [notes, setNotes] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [exams, setExams] = useState([]);

  const [activeTab, setActiveTab] = useState("assignments");
  const [loading, setLoading] = useState(true);

  // Popup state
  const [showSubmitPopup, setShowSubmitPopup] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  /** ==============================
   *   FETCH COURSE DATA
   *  ============================== */
  const fetchCourseData = async () => {
    try {
      const res = await axiosClient.get(`/student/courses/${courseId}`);
      const data = res.data.data;

      setCourse(data.course);
      setNotes(data.notes || []);
      setAssignments(data.assignments || []);
      setExams(data.exams || []);
    } catch (err) {
      console.error("COURSE FETCH ERROR:", err);
      alert(err.response?.data?.message || "Failed to load course");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourseData();
  }, [courseId]);

  /** ==============================
   *   DOWNLOAD LECTURE NOTE
   *  ============================== */

  const downloadFile = async (url, filename = "file") => {
    try {
      const res = await axiosClient.get(url, { responseType: "blob" });
      const blob = new Blob([res.data]);
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Download failed", err);
      alert(err.response?.data?.message || "Download failed");
    }
  };

  const downloadNote = async (note) => {
    const url = `/courses/${courseId}/notes/${note._id}/file`;
    downloadFile(url, note.filename || `note-${note._id}.pdf`);
  };

  const handleDownloadAssignmentAttachment = (assignment) => {
    const url = `/courses/${courseId}/assignments/${assignment._id}/attachment`;
    downloadFile(
      url,
      assignment.filename || `assignment-${assignment._id}.pdf`
    );
  };

  /** ==============================
   *   OPEN ASSIGNMENT / EXAM SUBMIT
   *  ============================== */
  const openSubmit = (item) => {
    setSelectedItem(item);
    setShowSubmitPopup(true);
  };

  if (loading) return <p className="svc-loading">Loading course...</p>;

  return (
    <div className="svc-container">
      {/* Back */}
      <Link to="/student/dashboard" className="svc-back">
        ← Back to Dashboard
      </Link>

      {/* Header */}
      <div className="svc-header-box">
        <h1 className="svc-title">{course?.name}</h1>

        <div className="svc-meta">
          <span>👥 {course?.students?.length || 0} students</span>
          <span>
            📅{" "}
            {course?.createdAt
              ? new Date(course.createdAt).toLocaleDateString()
              : ""}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="svc-tabs">
        <button
          onClick={() => setActiveTab("notes")}
          className={activeTab === "notes" ? "svc-tab active" : "svc-tab"}
        >
          📘 Lecture Notes
        </button>

        <button
          onClick={() => setActiveTab("assignments")}
          className={activeTab === "assignments" ? "svc-tab active" : "svc-tab"}
        >
          📝 Assignments
        </button>

        <button
          onClick={() => setActiveTab("exams")}
          className={activeTab === "exams" ? "svc-tab active" : "svc-tab"}
        >
          🧪 Exams
        </button>
      </div>

      {/* Section Title */}
      <h2 className="svc-section-title">
        {activeTab === "notes"
          ? "Lecture Notes"
          : activeTab === "assignments"
          ? "Assignments"
          : "Exams & Quizzes"}
      </h2>

      {/* ==============================
          NOTES TAB
      ============================== */}
      {activeTab === "notes" && (
        <>
          {notes.length === 0 ? (
            <p className="svc-empty">No lecture notes available.</p>
          ) : (
            notes.map((note) => (
              <div className="svc-note-card" key={note._id}>
                <div className="svc-note-icon">📘</div>

                <div>
                  <h3 className="svc-note-title">{note.title}</h3>
                  <p className="svc-note-unit">Unit: {note.unit || "N/A"}</p>
                </div>

                <button
                  className="svc-note-download"
                  onClick={() => downloadNote(note)}
                >
                  ⬇ Download
                </button>
              </div>
            ))
          )}
        </>
      )}

      {/* ==============================
          ASSIGNMENTS TAB
      ============================== */}
      {activeTab === "assignments" && (
        <>
          {assignments.length === 0 ? (
            <p className="svc-empty">No assignments available.</p>
          ) : (
            assignments.map((a) => (
              <div className="svc-item-card" key={a._id}>
                <span className="svc-tag">LAB</span>

                <h3 className="svc-item-title">{a.title}</h3>
                <p className="svc-item-desc">{a.description}</p>

                <p className="svc-due">
                  <strong>Due:</strong> {new Date(a.dueDate).toLocaleString()}
                </p>
                <div className="item-actions" style={{ marginTop: "5px" }}>
                  {a.attachmentUrl ? (
                    <button
                      onClick={() => handleDownloadAssignmentAttachment(a)}
                    >
                      Download Attachment
                    </button>
                  ) : (
                    <span className="muted">No attachment</span>
                  )}
                </div>

                <button
                  className="svc-submit-btn"
                  onClick={() => openSubmit(a)}
                >
                  ⬆ Submit
                </button>
              </div>
            ))
          )}
        </>
      )}

      {/* ==============================
          EXAMS TAB
      ============================== */}
      {activeTab === "exams" && (
        <>
          {exams.length === 0 ? (
            <p className="svc-empty">No exams available.</p>
          ) : (
            exams.map((e) => (
              <div className="svc-item-card" key={e._id}>
                <span className="svc-tag svc-exam-tag">
                  {e.type.includes("MCQ") ? "MCQ" : "Exam"}
                </span>

                <h3 className="svc-item-title">{e.type}</h3>

                <p className="svc-item-desc">{e.instructions}</p>

                <p className="svc-due">
                  <strong>Due:</strong> {new Date(e.dueDate).toLocaleString()}
                </p>

                <button
                  className="svc-submit-btn"
                  onClick={() => openSubmit(e)}
                >
                  ⬆ Submit
                </button>
              </div>
            ))
          )}
        </>
      )}

      {/* ==============================
          SUBMISSION POPUP
      ============================== */}
      {showSubmitPopup && (
        <SubmitFileModal
          item={selectedItem}
          onClose={() => setShowSubmitPopup(false)}
        />
      )}
    </div>
  );
};

export default StudentCourseView;
