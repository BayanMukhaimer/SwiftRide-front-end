import { React, useState, useEffect } from "react";
import { useNavigate, Link } from "react-router";
import { ClipLoader } from "react-spinners";
import { getAllRide as fetchRides } from "../../../lib/api";
import RideCancelButton from "./RideCancelButton";

const HistoryRideList = () => {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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
  
  if (loading) return <ClipLoader />;
  
  return (
    <div>
      <h2>My Rides</h2>
      <ol>
        {rides.map((ride) => (
          <li key={ride._id} style={{ marginBottom: "20px" }}>
            <Link to={`/rides/${ride._id}`}>
              <p>
                <strong>Status:</strong> {ride.status}
              </p>
              <p>
                <strong>Fare:</strong> {ride.fare ?? 0}
              </p>
              <p>
                <strong>Pickup:</strong> {ride.pickup.address}
              </p>
              <p>
                <strong>Dropoff:</strong> {ride.dropoff.address}
              </p>
            </Link>
            {ride.status === "requested" && (
              <RideCancelButton rideId={ride._id} getAllRide={getAllRide} />
            )}
          </li>
        ))}
      </ol>
    </div>
  );
};

export default HistoryRideList;
