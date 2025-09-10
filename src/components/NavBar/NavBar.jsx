import { Link } from "react-router";
import LogoutButton from "../LogoutButton/LogoutButton";
import { jwtDecode } from "jwt-decode";
import { useEffect, useState } from "react";
import "./NavBar.css";

const NavBar = ({ onLogout, currentUser }) => {
  const token = localStorage.getItem("token");

  const [dummyState, setDummyState] = useState(null);
  useEffect(() => {
    setDummyState("populated");
  }, [currentUser]);
  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <Link to="/" className="sidebar__brand-link"></Link>
        {/* <img src="../../../images/Logo.png" alt="Logo"/> */}
        <span className="sidebar__name">RideApp</span>
      </div>

      <ul className="menu">
        {!token && (
          <>
            <li>
              <Link to="/login" className="menu__link">
                Login
              </Link>
            </li>
            <li>
              <Link to="/signup" className="menu__link menu__link--primary">
                SignUp
              </Link>
            </li>
          </>
        )}

        {currentUser && currentUser.role == "rider" && (
          <>
            <li>
              <Link to="/" className="menu__link">
                Home
              </Link>
            </li>
            <li>
              <Link to="/rides/request" className="menu__link">
                Request Ride
              </Link>
            </li>
            <li>
              <Link to="/rides/myrides" className="menu__link">
                My Rides
              </Link>
            </li>
          </>
        )}

        {currentUser && currentUser.role == "driver" && (
          <>
            <li>
              <Link to="/" className="menu__link">
                Home
              </Link>
            </li>
            <li>
              <Link to="/driver" className="menu__link">
                Driver Dashboard
              </Link>
            </li>
          </>
        )}
      </ul>
      {currentUser && (
        <div className="sidebar__logout">
          <LogoutButton onLogout={onLogout} />
        </div>
      )}
    </aside>
  );
};
export default NavBar;