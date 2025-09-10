import { useState, useEffect } from "react";
import { Link } from "react-router";
import { ClipLoader } from "react-spinners";
import { getAllRide as fetchRides } from "../../../lib/api";
import RideCancelButton from "./RideCancelButton";
import "./HistoryRideList.css";

const HistoryRideList = () => {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);

  const statusColors = {
    requested: "dodgerblue",
    accepted: "mediumseagreen",
    "in-progress": "orange",
    completed: "gray",
    cancelled: "crimson",
  };

  const getAllRide = async () => {
    try {
      const response = await fetchRides();
      setRides(response.data || []);
    } catch (err) {
      console.error("Failed to fetch rides:", err);
      setRides([]);
    }
  };

  useEffect(() => {
    (async () => {
      await getAllRide();
      setLoading(false);
    })();
  }, []);

  if (loading) return <div className="history-loader"><ClipLoader /></div>;

  return (
    <div className="history-container">
      <h2 className="history-title">My Rides</h2>
      {rides.length === 0 ? (
        <p className="history-empty">No rides found.</p>
      ) : (
        <ul className="history-list">
          {rides.map((ride) => (
            <li key={ride._id} className="history-item">
              <Link to={`/rides/${ride._id}`} className="history-link">
                <p><strong>Status:</strong> 
                <span style={{ color: statusColors[ride.status] }}>
                  {ride.status}
                </span>
                </p>
                {/* <p><strong>Fare:</strong> {ride.fare ?? 0} BHD</p> */}
                <p><strong>Pickup:</strong> {ride.pickup.address}</p>
                <p><strong>Dropoff:</strong> {ride.dropoff.address}</p>
              </Link>
              {ride.status === "requested" && (
                <div className="history-actions">
                  <RideCancelButton rideId={ride._id} getAllRide={getAllRide} />
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

    </div>
  );
};

export default HistoryRideList;
