import "./App.css";
import ManageCourse from "./pages/coordinator/createCourse/components/manageCourse/ManageCourse";
import CreateCourse from "./pages/coordinator/createCourse/CreateCourse";
import Dashboard from "./pages/coordinator/dashoboard/Dashboard";
import Home from "./pages/landingpage/Home";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import StudentDashboard from "./pages/student/studentDashboard/StudentDashboard";
import StudentCourseView from "./pages/student/studentCourseView/StudentCourseView";
import Login from "./auth/coordinatorLogin/CoordinatorLogin";
import OTPVerify from "./auth/coordinatorEmailVerify/CoordinatorEmailVerify";
import StudentRegister from "./auth/studentRegister/StudentRegister";
import StudentLogin from "./auth/studentLogin/StudentLogin";
import StudentEmailVerify from "./auth/studentEmailVerify/StudentEmailVerify";
import ProtectedStudentRoute from "./routing/ProtectedStudentRoute";
import Navbar from "./components/navbar/Navbar";
import PreventAuthRoute from "./routing/PreventAuthRoute";
import CoordinatorRegister from "./auth/coordinatorRegister/CoordinatorRegister";
import ProtectedCoordinatorRoute from "./routing/ProtectedCoordinatorRoute";
import CoordinatorEmailVerify from "./auth/coordinatorEmailVerify/CoordinatorEmailVerify";
import CoordinatorLogin from "./auth/coordinatorLogin/CoordinatorLogin";

function App() {
  return (
    <>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />

          {/* student protected route  */}

          <Route
            path="/student/login"
            element={
              <PreventAuthRoute>
                <StudentLogin />
              </PreventAuthRoute>
            }
          />
          <Route
            path="/student/register"
            element={
              <PreventAuthRoute>
                <StudentRegister />
              </PreventAuthRoute>
            }
          />
          <Route
            path="/student/verify-email"
            element={
              <PreventAuthRoute>
                <StudentEmailVerify />
              </PreventAuthRoute>
            }
          />
          <Route
            path="/student/dashboard"
            element={
              <ProtectedStudentRoute>
                <StudentDashboard />
              </ProtectedStudentRoute>
            }
          />
          <Route
            path="/student/course"
            element={
              <ProtectedStudentRoute>
                <StudentCourseView />
              </ProtectedStudentRoute>
            }
          />
          <Route
            path="/student/course/:courseId"
            element={
              <ProtectedStudentRoute>
                <StudentCourseView />
              </ProtectedStudentRoute>
            }
          />

          <Route path="/login" element={<Login />} />
          {/* <Route path="/otp-verification" element={<OTPVerify />} /> */}

          {/* coordinator protected route */}
          <Route
            path="/coordinator/verify-email"
            element={
              <PreventAuthRoute>
                <CoordinatorEmailVerify />
              </PreventAuthRoute>
            }
          />
          <Route
            path="/coordinator/register"
            element={
              <PreventAuthRoute>
                <CoordinatorRegister />
              </PreventAuthRoute>
            }
          />
          <Route
            path="/coordinator/login"
            element={
              <PreventAuthRoute>
                <CoordinatorLogin />
              </PreventAuthRoute>
            }
          />
          <Route
            path="/coordinator/dashboard"
            element={
              <ProtectedCoordinatorRoute>
                <Dashboard />
              </ProtectedCoordinatorRoute>
            }
          />
          <Route
            path="/create/course"
            element={
              <ProtectedCoordinatorRoute>
                <CreateCourse />
              </ProtectedCoordinatorRoute>
            }
          />
          <Route
            path="/manage-course/:courseId"
            element={
              <ProtectedCoordinatorRoute>
                <ManageCourse />
              </ProtectedCoordinatorRoute>
            }
          />

          
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
