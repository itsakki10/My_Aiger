import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate, useNavigate, Outlet } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Pending from "./pages/Pending";
import Complete from "./pages/Complete";
import Profile from "./components/Profile";
import Login from "./components/Login";
import SignUp from "./components/SignUp";
import ProjectPortal from "./components/ProjectPortal"; // 🔑 1. IMPORT THE NEW COMPONENT
import "./index.css";

const App = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(() => {
    // Check for both user data and a valid token/session indicator
    const stored = localStorage.getItem("currentUser");
    const token = localStorage.getItem("token");
    return stored && token ? JSON.parse(stored) : null;
  });

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem("currentUser", JSON.stringify(currentUser));
    } else {
      localStorage.removeItem("currentUser");
    }
  }, [currentUser]);

  const handleAuthSubmit = (data) => {
    // This function assumes `data` contains token, userId, name, and email
    const user = {
      email: data.email,
      name: data.name || "User", // Use the logic from your Login/SignUp components to set user data correctly
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(
        data.name || "User"
      )}&background=random`,
    };
    setCurrentUser(user);
    navigate("/", { replace: true });
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId"); // Important to clear userId as well
    setCurrentUser(null);
    navigate("/login", { replace: true });
  };

  const ProtectedLayout = () => (
    <Layout user={currentUser} onLogout={handleLogout}>
            <Outlet />   {" "}
    </Layout>
  );

  return (
    <Routes>
            {/* Authentication Routes (Using Full-Page Components) */}
           {" "}
      <Route
        path="/login"
        element={
          <Login
            onSubmit={handleAuthSubmit}
            onSwitchMode={() => navigate("/signup")}
          />
        }
      />
           {" "}
      <Route
        path="/signup"
        element={
          <SignUp
            onSubmit={handleAuthSubmit}
            onSwitchMode={() => navigate("/login")}
          />
        }
      />
            {/* Protected Routes (Authenticated Application Shell) */}     {" "}
      <Route
        element={
          currentUser ? <ProtectedLayout /> : <Navigate to="/login" replace />
        }
      >
                <Route index element={<Dashboard />} />
                <Route path="pending" element={<Pending />} />
                <Route path="complete" element={<Complete />} />
        {/* 🔑 2. NEW ROUTE FOR NOTES PORTAL 🔑 */}
        <Route path="notes" element={<ProjectPortal />} />
               {" "}
        <Route
          path="profile"
          element={
            <Profile
              user={currentUser}
              setCurrentUser={setCurrentUser}
              onLogout={handleLogout}
            />
          }
        />
             {" "}
      </Route>
            {/* Catch-all route for navigation */}
           {" "}
      <Route
        path="*"
        element={<Navigate to={currentUser ? "/" : "/login"} replace />}
      />
         {" "}
    </Routes>
  );
};

export default App;
