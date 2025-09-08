import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { io } from "socket.io-client";
import { Link } from "react-router";

const socket = io("http://localhost:3000"); // match your backend URL

const Homepage = () => {
  const [position, setPosition] = useState([26.0667, 50.5577]);
  const [drivers, setDrivers] = useState([]);

  useEffect(() => {
    // Get user current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setPosition([latitude, longitude]);
        },
        (err) => console.error(err)
      );
    }

    // Listen for live driver updates
    socket.on("driverLocations", (locations) => {
      setDrivers(locations);
    });

    return () => socket.off("driverLocations");
  }, []);

  return (
    <div className="homepage-container">
      <header>
        <h1>Welcome to SwiftRide </h1>
        
      </header>

      <MapContainer
        center={position}
        zoom={13}
        style={{ height: "500px", width: "100%", marginTop: "20px" }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Marker position={position}>
          <Popup>You are here</Popup>
        </Marker>
        {drivers.map((driver) => (
          <Marker key={driver.id} position={[driver.lat, driver.lng]}>
            <Popup>Driver {driver.id}</Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default Homepage;
