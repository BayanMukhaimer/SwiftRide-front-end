import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router";

import Homepage from "./components/Homepage/Homepage";
import RideForm from "./components/RideForm/RideForm";
import RideRequest from "./components/RideRequest/RideRequest";

const App = () => {
  const [formIsShown, setFormIsShown] = useState(false);
  return (
    <div>

      <Router>


        <Routes>

          <Route path="/" element={<Homepage />} />

          <Route
            path="/rides/request"
            element={
              <RideForm
                setFormIsShown={setFormIsShown}
              />
            }
          />

          <Route
            path="/ride-request"
            element={
              <RideRequest
              />}
          />


        </Routes>
      </Router>
    </div>


  )
};

export default App;