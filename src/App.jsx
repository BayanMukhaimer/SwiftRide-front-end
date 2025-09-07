import { jwtDecode } from "jwt-decode";
import { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router";


import Homepage from "./components/Homepage/Homepage"
import RegisterForm from "./components/RegisterForm/RegisterForm"
import LoginForm from "./components/LoginForm/LoginForm";
import RideForm from "./components/RideForm/RideForm";
import HistoryRideList from "./components/HistoryRideList/HistoryRideList"
import RideDetails from "./components/RideDetails/RideDetails";


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

  return (

    <div>

      <Router>

        <nav>
          {/* <Link to="/">Home</Link> */}
          <Link to="/signup">Sign Up</Link>
          <Link to="/login">Log in</Link>
          <Link to="/rides/request">Request Ride</Link>
          <Link to="/rides/myrides">My Rides</Link>
        </nav>

        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/signup" element={<RegisterForm />} />
          <Route path="/login" element={<LoginForm onLogin={handleLogin} />} />

          <Route
            path="/rides/request"
            element={
              <RideForm
                setFormIsShown={setFormIsShown}
              />
            }
          />

          <Route
            path="/rides/myrides"
            element={
              <HistoryRideList

              />
            }
          />

          <Route
            path="/rides/:id"
            element={
              <RideDetails />
            }
          />

        </Routes>
      </Router>
    </div>



  )
};

export default App;