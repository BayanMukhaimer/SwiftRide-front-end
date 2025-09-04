import { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { OpenStreetMapProvider } from "leaflet-geosearch";
import { createRide } from "../../../lib/api"; 

const RideRequest = () => {
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");
  const [pickupPos, setPickupPos] = useState(null);
  const [dropoffPos, setDropoffPos] = useState(null);
  const [pickupSuggestions, setPickupSuggestions] = useState([]);
  const [dropoffSuggestions, setDropoffSuggestions] = useState([]);

  const provider = new OpenStreetMapProvider();

  const searchLocation = async (query, type) => {
    if (!query) return;
    const results = await provider.search({ query, countrycodes: ["BH"] });
    if (type === "pickup") setPickupSuggestions(results);
    else setDropoffSuggestions(results);
  };

  const selectSuggestion = (place, type) => {
    const coords = [place.y, place.x];
    if (type === "pickup") {
      setPickup(place.label);
      setPickupPos(coords);
      setPickupSuggestions([]);
    } else {
      setDropoff(place.label);
      setDropoffPos(coords);
      setDropoffSuggestions([]);
    }
  };

  const handleRequestRide = async () => {
    if (!pickupPos || !dropoffPos) {
      alert("Please select both pickup and dropoff locations from suggestions.");
      return;
    }

    const token = localStorage.getItem("token");
    const data = {
      pickup: { address: pickup, location: { lat: pickupPos[0], lng: pickupPos[1] } },
      dropoff: { address: dropoff, location: { lat: dropoffPos[0], lng: dropoffPos[1] } },
    };

    try {
      const res = await createRide({ ...data, token }); // send token inside headers in api.js
      alert("Ride requested successfully!");
      console.log("Ride response:", res.data);
    } catch (err) {
      console.error(err);
      alert("Error creating ride");
    }
  };

  return (
    <div>
      <h2>Request a Ride</h2>

      {/* Pickup Input */}
      <div style={{ position: "relative" }}>
        <input
          type="text"
          placeholder="Pickup Location"
          value={pickup}
          onChange={(e) => {
            setPickup(e.target.value);
            searchLocation(e.target.value, "pickup");
          }}
        />
        {pickupSuggestions.length > 0 && (
          <ul style={{ position: "absolute", background: "white", zIndex: 1000, width: "100%" }}>
            {pickupSuggestions.map((p) => (
              <li
                key={p.label}
                onClick={() => selectSuggestion(p, "pickup")}
                style={{ cursor: "pointer", padding: "5px" }}
              >
                {p.label}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Dropoff Input */}
      <div style={{ position: "relative", marginTop: "10px" }}>
        <input
          type="text"
          placeholder="Dropoff Location"
          value={dropoff}
          onChange={(e) => {
            setDropoff(e.target.value);
            searchLocation(e.target.value, "dropoff");
          }}
        />
        {dropoffSuggestions.length > 0 && (
          <ul style={{ position: "absolute", background: "white", zIndex: 1000, width: "100%" }}>
            {dropoffSuggestions.map((p) => (
              <li
                key={p.label}
                onClick={() => selectSuggestion(p, "dropoff")}
                style={{ cursor: "pointer", padding: "5px" }}
              >
                {p.label}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Request Button */}
      <button
        onClick={handleRequestRide}
        style={{ marginTop: "10px", padding: "8px 16px", cursor: "pointer" }}
      >
        Request Ride
      </button>

      {/* Map */}
      <MapContainer
        center={[26.0667, 50.5577]} // Bahrain
        zoom={12}
        style={{ height: "400px", width: "100%", marginTop: "20px" }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {pickupPos && <Marker position={pickupPos}><Popup>Pickup</Popup></Marker>}
        {dropoffPos && <Marker position={dropoffPos}><Popup>Dropoff</Popup></Marker>}
      </MapContainer>
    </div>
  );
};

export default RideRequest;
