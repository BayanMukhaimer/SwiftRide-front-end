import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import { authHeader } from "../../../lib/api";

const baseUrl = import.meta.env.VITE_BACKEND_URL;
const SOCKET_URL = "http://localhost:3000";

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

    socket.on("connect", () => {console.log("Driver socket connected:", socket.id);
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
      await axios.put(
        `${baseUrl}/rides/${ride._id}/accept`,
        {},
        { headers: authHeader() }
      );
      socketRef.current.emit("acceptRide", {
        riderId: ride.rider,
        driverId,
        rideId: ride._id,
      });
      const updated = rides.map((oneRide) => {
        if (oneRide._id === ride._id) {
          return { ...oneRide, status: "acceptRide" };
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
      socketRef.current.emit("in-progres", {
        riderId: ride.rider,
        driverId,
        rideId: ride._id,
      });
      const updated = rides.map((oneRide) => {
        if (oneRide._id === ride._id) {
          return { ...oneRide, status: "in-progres" };
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
    }
    return null;
  }

  return (
    <div>
      <h2>Driver Dashboard</h2>
      {rides.length === 0 ? (
        <p>No incoming rides…</p>
      ) : (
        rides.map((ride) => (
          <div key={ride._id}>
            <div>
              <b>Pickup:</b> {ride.pickup.address}
            </div>
            <div>
              <b>Dropoff:</b> {ride.dropoff.address}
            </div>
            <div>
              <b>Fare:</b> {ride.fare ?? 0}
            </div>
            <RideActions ride={ride} />
          </div>
        ))
      )}
    </div>
  );
};
export default DriverDashboard;
