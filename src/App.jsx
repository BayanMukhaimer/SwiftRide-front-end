import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router";

import Homepage from "./components/Homepage/Homepage"
import RideForm from "./components/RideForm/RideForm";
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
    
      </Routes>
    </Router>
  </div>


  )
};

export default App;