import { useNavigate } from "react-router";
import "./Homepage.css";

const Homepage = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate("/login");
  };

  return (
    <div className="homepage">
      <div className="overlay">
        <h1 className="homepage-title">Welcome to SwiftRide</h1>
        <button className="homepage-btn" onClick={handleClick}>
          Sign In
        </button>
      </div>
    </div>
  );
};

export default Homepage;
