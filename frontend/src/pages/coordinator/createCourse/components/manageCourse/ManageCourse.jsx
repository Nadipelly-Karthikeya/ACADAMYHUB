import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axiosClient from "../../../../../auth/api/axiosClient";
import "./manageCourse.css";

// Modals
import UploadNoteModal from "../uploadNoteModal/UploadNoteModal";
import CreateAssignmentModal from "../assignmentModal/AssignmentModal";
import CreateExamModal from "../createExamModal/CreateExamModal";

const ManageCourse = () => {
  const { courseId } = useParams();

  const [activeTab, setActiveTab] = useState("notes");

  const [course, setCourse] = useState(null);

  const [notes, setNotes] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [exams, setExams] = useState([]);
  const [submissions, setSubmissions] = useState([]);

  const [loading, setLoading] = useState(true);
  const [loadingList, setLoadingList] = useState(false);

  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [showExamModal, setShowExamModal] = useState(false);

  // ==============================
  // FETCH COURSE BASIC DETAILS
  // ==============================
  const fetchCourseDetails = async () => {
    try {
      const res = await axiosClient.get(`/courses/${courseId}`);
      setCourse(res.data.data || null);
    } catch (err) {
      console.warn("Course details error:", err);
    }
  };

  // ==============================
  // FETCH SUBMISSIONS LIST
  // ==============================
  const fetchSubmissions = async () => {
    try {
      const res = await axiosClient.get(`/auth/admin/assignments/submissions`);

      // Filter only submissions belonging to this course
      const filtered = res.data.data.items.filter(
        (s) => s.courseId === courseId
      );
      // console.log(filtered);
      setSubmissions(filtered);
    } catch (err) {
      console.warn("Submission fetch failed", err);
    }
  };

  // ==============================
  // NOTES
  // ==============================
  const fetchNotes = async () => {
    setLoadingList(true);
    try {
      const res = await axiosClient.get(`/courses/${courseId}/notes`);
      const data = res.data.data ?? res.data;
      setNotes(Array.isArray(data.items) ? data.items : data);
    } catch (err) {
      setNotes([]);
    } finally {
      setLoadingList(false);
    }
  };

  // ==============================
  // ASSIGNMENTS
  // ==============================
  const fetchAssignments = async () => {
    setLoadingList(true);
    try {
      const res = await axiosClient.get(`/courses/${courseId}/assignments`);
      const data = res.data.data ?? res.data;
      setAssignments(Array.isArray(data.items) ? data.items : data);
    } catch (err) {
      setAssignments([]);
    } finally {
      setLoadingList(false);
    }
  };

  // ==============================
  // EXAMS
  // ==============================
  const fetchExams = async () => {
    setLoadingList(true);
    try {
      const res = await axiosClient.get(`/courses/${courseId}/exams`);
      const data = res.data.data ?? res.data;
      setExams(Array.isArray(data.items) ? data.items : data);
    } catch (err) {
      setExams([]);
    } finally {
      setLoadingList(false);
    }
  };

  // ==============================
  // MASTER FETCH
  // ==============================
  const fetchAll = async () => {
    setLoading(true);
    await Promise.all([
      fetchCourseDetails(),
      fetchNotes(),
      fetchAssignments(),
      fetchExams(),
      fetchSubmissions(),
    ]);
    setLoading(false);
  };

  // ==============================
  // FILE DOWNLOAD
  // ==============================
  const downloadFile = async (url, filename) => {
    try {
      const res = await axiosClient.get(url, { responseType: "blob" });
      const blob = new Blob([res.data]);
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = filename;
      link.click();
    } catch (err) {
      alert("Download failed");
    }
  };

  // NOTE download
  const handleDownloadNote = (note) => {
    downloadFile(
      `/courses/${courseId}/notes/${note._id}/file`,
      `${note.title}.pdf`
    );
  };

  // ASSIGNMENT attachment download
  const handleDownloadAssignmentAttachment = (a) => {
    downloadFile(
      `/courses/${courseId}/assignments/${a._id}/attachment`,
      `${a.title}-attachment.pdf`
    );
  };
  const handleDownloadAssignmentSubmission = (a) => {
    // console.log(a);
    downloadFile(
      `/courses/${courseId}/assignments/${a.assignmentId._id}/attachment`,
      `${a.fileId}-attachment.pdf`
    );
  };

  // ==============================
  // HANDLE CREATED ITEM
  // ==============================
  const handleCreated = (type) => {
    if (type === "note") fetchNotes();
    if (type === "assignment") fetchAssignments();
    if (type === "exam") fetchExams();
    setShowNoteModal(false);
    setShowAssignmentModal(false);
    setShowExamModal(false);
  };

  useEffect(() => {
    fetchAll();
  }, [courseId]);

  if (loading) return <p>Loading course...</p>;

  return (
    <div className="manage-container">
      {/* Back */}
      <Link to="/coordinator/dashboard" className="back-btn">
        ← Back to Dashboard
      </Link>

      {/* Course Header */}
      <div className="course-header">
        <div>
          <h1 className="course-title">{course?.name}</h1>
          <div className="course-meta">
            <span>👥 {course?.students?.length || 0} students</span>
            {/* <span>📅 {new Date(course?.createdAt).toLocaleDateString()}</span> */}
          </div>
        </div>

        <div className="stats-boxes">
          <div className="stat-card blue">
            <h2>{assignments.length}</h2>
            <p>Assignments</p>
          </div>
          <div className="stat-card green">
            <h2>{exams.length}</h2>
            <p>Exams</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button
          className={activeTab === "notes" ? "tab active" : "tab"}
          onClick={() => setActiveTab("notes")}
        >
          📚 Notes
        </button>

        <button
          className={activeTab === "assignments" ? "tab active" : "tab"}
          onClick={() => setActiveTab("assignments")}
        >
          📝 Assignments
        </button>

        <button
          className={activeTab === "exams" ? "tab active" : "tab"}
          onClick={() => setActiveTab("exams")}
        >
          🧪 Exams
        </button>
      </div>

      {/* Section Header */}
      <div className="section-header">
        <h2>
          {activeTab === "notes"
            ? "Lecture Notes"
            : activeTab === "assignments"
            ? "Assignments"
            : "Exams"}
        </h2>

        <button
          className="add-note-btn"
          onClick={() => {
            if (activeTab === "notes") setShowNoteModal(true);
            if (activeTab === "assignments") setShowAssignmentModal(true);
            if (activeTab === "exams") setShowExamModal(true);
          }}
        >
          {activeTab === "notes" && "+ Add Note"}
          {activeTab === "assignments" && "+ Create Assignment"}
          {activeTab === "exams" && "+ Create Exam"}
        </button>
      </div>

      {/* CONTENT LIST */}
      <div className="list-container">
        {/* NOTES */}
        {activeTab === "notes" && (
          <div className="items-grid">
            {notes.length === 0 ? (
              <p>No notes available.</p>
            ) : (
              notes.map((n) => (
                <div className="item-card" key={n._id}>
                  <h4>{n.title}</h4>
                  <p className="muted">
                    Uploaded {new Date(n.createdAt).toLocaleString()}
                  </p>
                  <button onClick={() => handleDownloadNote(n)}>
                    Download
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {/* ASSIGNMENTS */}
        {activeTab === "assignments" && (
          <div className="items-grid">
            {assignments.length === 0 ? (
              <p>No assignments found.</p>
            ) : (
              assignments.map((a) => {
                const related = submissions.filter(
                  (s) => s.assignmentId._id === a._id
                );

                return (
                  <div className="item-card" key={a._id}>
                    <h4>{a.title}</h4>
                    <p className="muted">
                      Due {new Date(a.dueDate).toLocaleString()}
                    </p>

                    <button
                      onClick={() => handleDownloadAssignmentAttachment(a)}
                    >
                      Download Attachment
                    </button>

                    {/* SUBMISSIONS LIST */}
                    <div
                      className="submission-box"
                      style={{ marginTop: "5px" }}
                    >
                      <h5>Submissions ({related.length})</h5>

                      {related.length === 0 ? (
                        <p className="muted">No submissions yet.</p>
                      ) : (
                        related.map((sub) => (
                          <div className="submission-row" key={sub._id}>
                            <strong>{sub.studentId.name}</strong>

                            <span>
                              {new Date(sub.submittedAt).toLocaleString()}
                            </span>

                            {/* Download submission */}
                            <button
                              // onClick={() =>
                              //   downloadFile(
                              //     `/student/courses/${sub.courseId}/assignments/${sub.assignmentId._id}/file`,
                              //     `${sub.fileId}.pdf`
                              //   )
                              // }
                              onClick={() =>
                                handleDownloadAssignmentSubmission(sub)
                              }
                            >
                              View
                            </button>

                            {/* Give Marks */}
                            {/* <button className="marks-btn">Give Marks</button> */}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* EXAMS */}
        {activeTab === "exams" && (
          <div className="items-grid">
            {exams.length === 0 ? (
              <p>No exams created.</p>
            ) : (
              exams.map((e) => (
                <div className="item-card" key={e._id}>
                  <h4>{e.type}</h4>
                  <p>{e.instructions}</p>
                  <p className="muted">
                    Due {new Date(e.dueDate).toLocaleString()}
                  </p>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* MODALS */}
      {showNoteModal && (
        <UploadNoteModal
          courseId={courseId}
          onClose={() => setShowNoteModal(false)}
          onCreated={() => handleCreated("note")}
        />
      )}

      {showAssignmentModal && (
        <CreateAssignmentModal
          courseId={courseId}
          onClose={() => setShowAssignmentModal(false)}
          onCreated={() => handleCreated("assignment")}
        />
      )}

      {showExamModal && (
        <CreateExamModal
          courseId={courseId}
          onClose={() => setShowExamModal(false)}
          onCreated={() => handleCreated("exam")}
        />
      )}
    </div>
  );
};

export default ManageCourse;
