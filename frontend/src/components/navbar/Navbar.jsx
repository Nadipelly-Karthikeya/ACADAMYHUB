import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { logout } from "../../auth/api/logout";
import { isLoggedIn } from "../../auth/api/authUtils";

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const role = localStorage.getItem("role");

  return (
    <nav className="topbar" style={{margin:"10px 0", borderRadius:"5px"}}>
      <div className="logo">
        <Link to="/">Academy Hub</Link>
      </div>

      <div className="user-box">
        {/* <button className="logout" onClick={logout}>
          Logout
        </button> */}
        {isLoggedIn() && <span className="role">{role}</span>}
        {isLoggedIn() && (
          <button className="logout" onClick={handleLogout}>
            Logout
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
