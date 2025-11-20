import { useEffect, useState } from "react";
import axiosClient from "../../../auth/api/axiosClient";
import "./dashboard.css";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const [overview, setOverview] = useState(null);
  const [courses, setCourses] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchOverview = async () => {
    try {
      const res = await axiosClient.get("/auth/admin/dashboard/overview");
      setOverview(res.data.data);
    } catch (error) {
      console.error("DASHBOARD ERROR:", error);
      alert(error.response?.data?.message || "Failed to load dashboard");
    }
  };

  const fetchCourses = async (page = 1) => {
    try {
      const res = await axiosClient.get(
        `/auth/admin/courses?page=${page}&limit=20`
      );

      setCourses(res.data.data.items);
      setPagination(res.data.data.pagination);
      setLoading(false);
    } catch (error) {
      // console.error("COURSES ERROR:", error);
      alert("Failed to load courses");
    }
  };

  useEffect(() => {
    fetchOverview();
    fetchCourses();
  }, []);

  if (loading) return <p>Loading dashboard...</p>;

  return (
    <div className="dashboard">
      {/* Top Navbar */}
     

      {/* Page Title */}
      <div className="flex">
        <div>
          <h2 className="page-title">My Courses</h2>
          <p className="subtitle">
            Manage your courses and student performance
          </p>
        </div>
        <div>
          <Link to="/create/course">
            <button className="manage-btn">Create Course</button>
          </Link>
        </div>
      </div>

      {/* Stats Boxes */}
      <div className="stats-grid">
        <div className="stat-box">
          <h4>Total Courses</h4>
          <span className="count">{overview?.totalCourses}</span>
        </div>

        <div className="stat-box">
          <h4>Total Students</h4>
          <span className="count">{overview?.totalStudents}</span>
        </div>

        <div className="stat-box">
          <h4>This Semester</h4>
          <span className="count">{overview?.totalSemesters}</span>
        </div>
      </div>

      {/* Course List */}
      <div className="courses-list">
        {courses.map((course) => (
          <div className="course-card-dashboard" key={course._id}>
            <h3>{course.name}</h3>
            <p>{course.students?.length || 0} student(s) enrolled</p>
            <Link to={`/manage-course/${course._id}`}>
              <button className="manage-btn">Manage Course →</button>
            </Link>
          </div>
        ))}
      </div>

      {/* Pagination or Load More */}
      {pagination?.page < pagination?.totalPages && (
        <button
          className="load-more-btn"
          onClick={() => fetchCourses(pagination.page + 1)}
        >
          Load More
        </button>
      )}
    </div>
  );
};

export default Dashboard;
