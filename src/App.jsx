import { jwtDecode } from "jwt-decode";
import { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router";

import Homepage from "./components/Homepage/Homepage";
import RegisterForm from "./components/RegisterForm/RegisterForm";
import LoginForm from "./components/LoginForm/LoginForm";
import RideForm from "./components/RideForm/RideForm";
import HistoryRideList from "./components/HistoryRideList/HistoryRideList";
import RideRequest from "./components/RideRequest/RideRequest";
import DriverDashboard from "./components/DriverDashboard/DriverDashboard";
import NavBar from "./components/NavBar/NavBar";

const App = () => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [formIsShown, setFormIsShown] = useState(false);

  function handleLogin(newToken) {
    setToken(newToken);
  }

  if (token) {
    const decodedToken = jwtDecode(token);
    console.log(decodedToken);
  }

  function handleLogout() {
    setToken(null);
    localStorage.removeItem("token");
  }

  return (
    <div>
      <Router>
        <NavBar onLogout={handleLogout} />

        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/signup" element={<RegisterForm />} />
          <Route path="/login" element={<LoginForm onLogin={handleLogin} />} />

          <Route
            path="/rides/request"
            element={<RideForm setFormIsShown={setFormIsShown} />}
          />
          <Route path="/ride-request" element={<RideRequest />} />
          <Route path="/rides/myrides" element={<HistoryRideList />} />
          <Route path="/driver" element={<DriverDashboard />} />
        </Routes>
      </Router>
    </div>
  );
};

export default App;
