import { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link  } from "react-router";

import Homepage from "./components/Homepage/Homepage"
import RegisterForm from "./components/RegisterForm/RegisterForm"
import RideForm from "./components/RideForm/RideForm";
import HistoryRideList from "./components/HistoryRideList/HistoryRideList"
const App = () => {
  const [formIsShown, setFormIsShown] = useState(false);
  return (
  <div>

    <Router>

      <nav>
        {/* <Link to="/">Home</Link> */}
        <Link to="/signup">Sign Up</Link>
        <Link to="/rides/request">Request Ride</Link>
        <Link to="/rides/myrides">My Rides</Link>
      </nav>
      <Routes>
       <Route path="/signup" element={<RegisterForm/>}/>
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
    
      </Routes>
    </Router>
  </div>


  )
};

export default App;