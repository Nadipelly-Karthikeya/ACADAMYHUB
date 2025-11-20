// StudentDashboard.jsx
import React, { useEffect, useState } from "react";
import "./studentDashboard.css";
import { Link } from "react-router-dom";
import axiosClient from "../../../auth/api/axiosClient"; // adjust if needed

const StudentDashboard = () => {
  const [overview, setOverview] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch Overview (stats)
  const fetchOverview = async () => {
    try {
      const res = await axiosClient.get("/student/courses/overview");
      const data = res.data.data;

      setOverview({
        totalCourses: data.totalCourses,
        activeCourses: data.activeCourses,
        currentSemester: data.currentSemester,
      });
    } catch (err) {
      console.error("Overview Error:", err);
      alert(err.response?.data?.message || "Failed to load overview");
    }
  };

  // Fetch Courses List
  const fetchCoursesList = async () => {
    try {
      const res = await axiosClient.get("/student/courses");

      /*
        Backend Response:
        {
          items: [...],
          pagination: { ... }
        }
      */

      const data = res.data.data;
      setCourses(data.items || []); // FIX: only store items array
    } catch (err) {
      console.error("Courses Error:", err);
      alert(err.response?.data?.message || "Failed to load courses");
    }
  };

  useEffect(() => {
    const run = async () => {
      await Promise.all([fetchOverview(), fetchCoursesList()]);
      setLoading(false);
    };
    run();
  }, []);

  if (loading) return <p className="stu-loading">Loading dashboard...</p>;

  return (
    <div className="stu-container">
      <h1 className="stu-title">My Courses</h1>

      <p className="stu-subtitle">
        Access your <span className="stu-link-underline">enrolled</span> courses
        and track your progress
      </p>

      {/* Stats Section */}
      <div className="stu-stats-row">
        {/* Total */}
        <div className="stu-stat-box">
          <h4>Total Courses</h4>
          <div className="stu-stat-info">
            <span className="stu-stat-number">
              {overview?.totalCourses || 0}
            </span>
            <div className="stu-icon stu-blue">📘</div>
          </div>
        </div>

        {/* Active */}
        <div className="stu-stat-box">
          <h4>Active Courses</h4>
          <div className="stu-stat-info">
            <span className="stu-stat-number">{courses.length || 0}</span>
            <div className="stu-icon stu-green">📈</div>
          </div>
        </div>

        {/* Semester */}
        <div className="stu-stat-box">
          <h4>This Semester</h4>
          <div className="stu-stat-info">
            <span className="stu-stat-number">
              {overview?.currentSemester || 0}
            </span>
            <div className="stu-icon stu-purple">📅</div>
          </div>
        </div>
      </div>

      {/* Course Grid */}
      <div className="stu-course-grid">
        {courses.length === 0 ? (
          <p className="stu-no-courses">You are not enrolled in any courses.</p>
        ) : (
          courses.map((course) => (
            <div className="stu-course-card" key={course._id}>
              <div className="stu-course-icon">📘</div>

              <h3 className="stu-course-title">{course.name}</h3>

              <p className="stu-course-meta">
                👥 {course.students?.length || 0} students enrolled
              </p>

              <Link
                to={`/student/course/${course._id}`}
                className="stu-view-btn"
              >
                View Course →
              </Link>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
