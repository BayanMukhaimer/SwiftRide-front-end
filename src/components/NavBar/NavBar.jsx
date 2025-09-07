import { Link } from "react-router";
import LogoutButton from "../LogoutButton/LogoutButton";

const NavBar = ({ onLogout }) => {
  const token = localStorage.getItem("token");

  return (
    <nav>
      <div>
        <ul>
          <li>
            <Link to="/signup">Sign Up</Link>
          </li>
          <li>
            <Link to="/login">Log in</Link>
          </li>
          <li>
            <Link to="/rides/request">Request Ride</Link>
          </li>
          <li>
            <Link to="/rides/myrides">My Rides</Link>
          </li>
          <li>
            <Link to="/signup">Sign Up</Link>
          </li>
          <li>
            <LogoutButton onLogout={onLogout} />
          </li>
        </ul>
      </div>
    </nav>
  );
};
export default NavBar;
