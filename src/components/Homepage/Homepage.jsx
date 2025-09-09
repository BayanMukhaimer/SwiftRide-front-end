import { useNavigate } from "react-router";
import "./Homepage.css";
import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { io } from "socket.io-client";
import { Link } from "react-router";


const socket = io("http://localhost:3000"); // match your backend URL


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
