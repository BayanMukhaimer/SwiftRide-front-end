import { useNavigate } from "react-router";
import { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { io } from "socket.io-client";
import "./Homepage.css";

// Connect to backend Socket.IO
const socket = io("http://localhost:3000");

// Car icon
const carIcon = new L.Icon({
  iconUrl: "/car-icon.png", // provide a small car PNG in /public
  iconSize: [40, 40],
  iconAnchor: [20, 20], // center of rotation
});

const RotatingCarMarker = ({ position }) => {
  const markerRef = useRef(null);
  const prevPosition = useRef(position);
  const angleRef = useRef(0);

  const calculateAngle = (start, end) => {
    const dx = end.lng - start.lng;
    const dy = end.lat - start.lat;
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);
    return angle;
  };

  useEffect(() => {
    if (markerRef.current) {
      const marker = markerRef.current;
      const startLatLng = L.latLng(prevPosition.current);
      const endLatLng = L.latLng(position);
      const duration = 1000;
      let startTime = null;
      const angle = calculateAngle(prevPosition.current, position);

      const animate = (time) => {
        if (!startTime) startTime = time;
        const progress = Math.min((time - startTime) / duration, 1);

        const lat = startLatLng.lat + (endLatLng.lat - startLatLng.lat) * progress;
        const lng = startLatLng.lng + (endLatLng.lng - startLatLng.lng) * progress;

        marker.setLatLng([lat, lng]);

        // Rotate icon by updating its CSS transform
        const iconElement = marker.getElement();
        if (iconElement) {
          iconElement.style.transform = `rotate(${angle}deg)`;
        }

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          prevPosition.current = position;
          angleRef.current = angle;
        }
      };

      requestAnimationFrame(animate);
    }
  }, [position]);

  return <Marker ref={markerRef} position={position} icon={carIcon} />;
};

const Homepage = () => {
  const navigate = useNavigate();
  const [drivers, setDrivers] = useState([]);

  const handleClick = () => navigate("/login");

  useEffect(() => {
    socket.on("driverLocations", (data) => setDrivers(data));
    return () => socket.off("driverLocations");
  }, []);

  return (
    <div className="homepage">
      <MapContainer
        center={[26.0667, 50.5577]}
        zoom={12}
        style={{ height: "100vh", width: "100%" }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {drivers.map((driver) => (
          <RotatingCarMarker key={driver.id} position={[driver.lat, driver.lng]} />
        ))}
      </MapContainer>

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
