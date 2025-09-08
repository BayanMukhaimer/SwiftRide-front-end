import { Link } from "react-router";
import LogoutButton from "../LogoutButton/LogoutButton";
import { jwtDecode } from "jwt-decode";
import { useEffect, useState } from "react";

const NavBar = ({ onLogout, currentUser }) => {
  const token = localStorage.getItem("token");

  const [dummyState,setDummyState] = useState(null)
  useEffect(()=>{setDummyState("populated")},[currentUser])
  return (
    <nav className="navbar">
      <div className="navbar__inner">
        {/* <div className="logo">
          <img
            src="../../../images/Logo.png"
            alt="Logo"
          /> */}
        </div>

        <ul className="menu">
       
          {!token &&  (

            <>
              <li>
                <Link to="/login">Login</Link>
              </li>
              <li>
                <Link to="/signup">SignUp</Link>
              </li>
            </>
          )}

          {currentUser && currentUser.role == 'rider'
           &&  (

            <>
              <li>
                <Link to="/">Home</Link>
              </li>
              <li>
                <Link to="/rides/request">Request Ride</Link>
              </li>
              <li>
                <Link to="/rides/myrides">My Rides</Link>
              </li>
              <li className="logout">
                <LogoutButton onLogout={onLogout} />
              </li>
            </>
          ) } 
          
          {currentUser && currentUser.role == 'driver' && (
            <>
              <li>
                <Link to="/">Home</Link>
              </li>
              <li>
                <Link to="/driver">Driver Dashboard</Link>
              </li>
              <li className="logout">
                <LogoutButton onLogout={onLogout} />
              </li>
            </>) } 

  
        </ul>
    </nav>
  );
};
export default NavBar;