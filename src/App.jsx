import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router";

import Homepage from "./components/Homepage/Homepage"
import RideForm from "./components/RideForm/RideForm";
import HistoryRideList from "./components/HistoryRideList/HistoryRideList"
const App = () => {
  const [formIsShown, setFormIsShown] = useState(false);
  return (
  <div>

    <Router>

    
      <Routes>
       
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