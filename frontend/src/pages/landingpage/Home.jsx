import React from "react";
import "./home.css";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div>
      {/* Top Navbar */}
      {/* <nav className="topbar">
        <div className="logo">Academy Hub</div>

        <div className="user-box">
          <span className="user-name">vyshu</span>
          <button className="logout">Logout</button>
        </div>
      </nav> */}

      <div className="landing-container">
        {/* Left Section */}
        <div className="left-section">
          <span className="welcome-badge">Welcome to Academy Hub</span>

          <h1 className="title">
            Academic <span className="highlight">Excellence</span> <br />
            Starts Here
          </h1>

          <p className="desc">
            A comprehensive platform connecting students and course coordinators
            for seamless learning experience.
          </p>

          {/* Features */}
          <div className="feature-boxes">
            <div className="feature-card">
              <div className="icon">📘</div>
              <h3>Course Materials</h3>
              <p>Access notes & resources</p>
            </div>

            <div className="feature-card">
              <div className="icon">📝</div>
              <h3>Assignments</h3>
              <p>Submit & track progress</p>
            </div>
          </div>

          {/* Role Selection */}
          <h3 className="role-heading">Select Your Role to Continue</h3>

          <div className="role-boxes">
            <div className="role-card">
              <h3>Student</h3>
              <p>Access your courses, assignments, and grades</p>
              <Link to="/student/login" className="role-link">
                Login as Student →
              </Link>
            </div>

            <div className="role-card active">
              <h3>Course Coordinator</h3>
              <p>Manage courses, assignments, and student performance</p>
              <Link to="/coordinator/login" className="role-link">
                Login as Coordinator →
              </Link>
            </div>
          </div>
        </div>

        {/* Right Section - Hero Image */}
        <div className="right-section">
          <img
            src="https://images.unsplash.com/photo-1522071820081-009f0129c71c"
            alt="students"
          />
        </div>
      </div>
    </div>
  );
};

export default Home;
