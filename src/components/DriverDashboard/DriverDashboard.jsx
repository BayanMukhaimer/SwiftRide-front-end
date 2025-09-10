import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import { authHeader } from "../../../lib/api";
import DriverMap from "./DriverMap";
import "./DriverDashboard.css";

const baseUrl = import.meta.env.VITE_BACKEND_URL;
const SOCKET_URL = "http://localhost:3000";

const statusColors = {
  requested: "dodgerblue",
  accepted: "mediumseagreen",
  "in-progress": "orange",
  completed: "gray",
  cancelled: "crimson",
};
const DriverDashboard = () => {
  const socketRef = useRef(null);
  const [rides, setRides] = useState([]);

  const token = localStorage.getItem("token");
  console.log("driver token", token);

  const driverId = (() => {
    try {
      console.log("decoded", jwtDecode(token));
      return token ? jwtDecode(token).id : null;
    } catch {
      return null;
    }
  })();

  useEffect(() => {
    if (!driverId) return;

    const socket = io(SOCKET_URL);
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Driver socket connected:", socket.id);
    });

    socket.emit("register", { userId: driverId, role: "driver" });

    socket.on("newRide", (ride) => {
      if (ride && ride.status === "requested") {
        setRides((current) => [ride, ...current]);
      }
    });

    return () => socket.disconnect();
  }, [driverId]);

  const handleAccept = async (ride) => {
    try {
      console.log("header", authHeader());
      await axios.put(
        `${baseUrl}/rides/${ride._id}/accept`,
        {},
        { headers: authHeader() }
      );
      socketRef.current.emit("accepted", {
        riderId: ride.rider,
        driverId,
        rideId: ride._id,
      });
      const updated = rides.map((oneRide) => {
        if (oneRide._id === ride._id) {
          return { ...oneRide, status: "accepted" };
        }
        return oneRide;
      });

      setRides(updated);
    } catch (error) {
      return error;
    }
  };

  const handleStart = async (ride) => {
    try {
      await axios.put(
        `${baseUrl}/rides/${ride._id}/start`,
        {},
        { headers: authHeader() }
      );
      socketRef.current.emit("in-progress", {
        riderId: ride.rider,
        driverId,
        rideId: ride._id,
      });

      const updated = rides.map((oneRide) => {
        if (oneRide._id === ride._id) {
          return { ...oneRide, status: "in-progress" };
        }
        return oneRide;
      });

      setRides(updated);
    } catch (error) {
      return error;
    }
  };

  const handleComplete = async (ride) => {
    try {
      await axios.put(
        `${baseUrl}/rides/${ride._id}/complete`,
        {},
        { headers: authHeader() }
      );
      socketRef.current.emit("completed", {
        riderId: ride.rider,
        driverId,
        rideId: ride._id,
      });
      const updated = rides.map((oneRide) => {
        if (oneRide._id === ride._id) {
          return { ...oneRide, status: "completed" };
        }
        return oneRide;
      });

      setRides(updated);
    } catch (error) {
      return error;
    }
  };

  function RideActions({ ride }) {
    if (ride.status === "requested") {
      return <button onClick={() => handleAccept(ride)}>Accept</button>;
    }
    if (ride.status === "accepted") {
      return <button onClick={() => handleStart(ride)}>Start</button>;
    }
    if (ride.status === "in-progress") {
      return <button onClick={() => handleComplete(ride)}>Complete</button>;
    } else return;
  }

  return (
    <div className="dashboard">
      <h2 className="dashboard__title">Driver Dashboard</h2>
      <h3 className="subtle"><b>Live updates & current rides</b></h3>
      {rides.length === 0 ? (
        <p className="card">No incoming rides…</p>
      ) : (
        <div className="rides">
          {rides.map((ride) => (
            <div key={ride._id} className="ride-info">
              <p>
                <b>Ride Status: </b>
                <span style={{ color: statusColors[ride.status] }}>
                  {ride.status}
                </span>
              </p>
              <p><b>Pickup:</b> {ride.pickup.address}</p>
              <p><b>Dropoff:</b> {ride.dropoff.address}</p>
              <p><b>Fare:</b> {ride.fare.toFixed(2) ?? 0}</p>

              <div className="ride-actions">
                <RideActions ride={ride} />
              </div>

              <div className="ride-map">
                <DriverMap
                  pickup={ride.pickup}
                  playing={ride.status === "in-progress"}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
export default DriverDashboard;
