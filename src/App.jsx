import { jwtDecode } from "jwt-decode";
import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router";

import Homepage from "./components/Homepage/Homepage";
import RegisterForm from "./components/RegisterForm/RegisterForm";
import LoginForm from "./components/LoginForm/LoginForm";
import RideForm from "./components/RideForm/RideForm";
import HistoryRideList from "./components/HistoryRideList/HistoryRideList";
import DriverDashboard from "./components/DriverDashboard/DriverDashboard";
import NavBar from "./components/NavBar/NavBar";
import RideDetails from "./components/RideDetails/RideDetails";


const App = () => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token);
        console.log("decoded", decoded);
        setCurrentUser(decoded);
      } catch (err) {
        console.error("Invalid token:", err);
        setCurrentUser(null);
      }
    }
  }, [token]);

  const handleLogin = (newToken) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setCurrentUser(null);
  };

  return (
    <Router>
      <NavBar currentUser={currentUser} onLogout={handleLogout} />
      <main className="main">
        <Routes>
          <Route path="/" element={<Homepage />} />

          <Route path="/signup" element={<RegisterForm />} />

          <Route
            path="/login"
            element={
              <LoginForm
                onLogin={handleLogin}
                setCurrentUser={setCurrentUser}
                currentUser={currentUser}
              />
            }
          />

          <Route
            path="/rides/request"
            element={
              <RideForm />
            }
          />

          <Route
            path="/rides/myrides"
            element={
              <HistoryRideList />
            }
          />

          <Route
            path="/rides/:id"
            element={
              <RideDetails />
            }
          />

          <Route
            path="/driver"
            element={
              <DriverDashboard />
            }
          />
        </Routes>
      </main>
    </Router>
  );
};

export default App;
