import { useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { OpenStreetMapProvider } from "leaflet-geosearch";
import { createRide } from "../../../lib/api";

const RideRequest = () => {
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");
  const [pickupPos, setPickupPos] = useState(null);
  const [dropoffPos, setDropoffPos] = useState(null);

  const provider = new OpenStreetMapProvider();

  // handle map clicks
  const LocationSelector = () => {
    useMapEvents({
      click: async (e) => {
        const { lat, lng } = e.latlng;
        const results = await provider.search({ query: `${lat},${lng}` });

        if (!pickupPos) {
          // set pickup first
          setPickupPos([lat, lng]);
          setPickup(results[0]?.label || `${lat},${lng}`);
        } else if (!dropoffPos) {
          // set dropoff second
          setDropoffPos([lat, lng]);
          setDropoff(results[0]?.label || `${lat},${lng}`);
        } else {
          alert("Pickup and dropoff are already selected. Reset to choose again.");
        }
      },
    });
    return null;
  };

  const handleRequestRide = async () => {
    if (!pickupPos || !dropoffPos) {
      alert("Please select both pickup and dropoff locations.");
      return;
    }
    const token = localStorage.getItem("token");
    const data = {
      pickup: {
        address: pickup,
        location: { lat: pickupPos[0], lng: pickupPos[1] },
      },
      dropoff: {
        address: dropoff,
        location: { lat: dropoffPos[0], lng: dropoffPos[1] },
      },
    };

    try {
      const res = await createRide(data, token);
      alert("Ride requested successfully!");
      console.log("Ride response:", res.data);
    } catch (err) {
      console.error(err);
      alert("Error creating ride");
    }
  };

  const resetPoints = () => {
    setPickup("");
    setDropoff("");
    setPickupPos(null);
    setDropoffPos(null);
  };

  return (
    <div>
      <h2>Request a Ride</h2>

      <input
        type="text"
        placeholder="Pickup Location"
        value={pickup}
        readOnly
        style={{ marginBottom: "10px", width: "100%", padding: "6px" }}
      />
      <input
        type="text"
        placeholder="Dropoff Location"
        value={dropoff}
        readOnly
        style={{ marginBottom: "10px", width: "100%", padding: "6px" }}
      />

      <button
        onClick={handleRequestRide}
        style={{ marginRight: "10px", padding: "8px 16px", cursor: "pointer" }}
      >
        Request Ride
      </button>
      <button onClick={resetPoints} style={{ padding: "8px 16px", cursor: "pointer" }}>
        Reset
      </button>

      {/* Map */}
      <MapContainer
        center={[26.0667, 50.5577]} // Bahrain center
        zoom={12}
        style={{ height: "400px", width: "100%", marginTop: "20px" }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <LocationSelector />

        {pickupPos && (
          <Marker position={pickupPos}>
            <Popup>Pickup</Popup>
          </Marker>
        )}
        {dropoffPos && (
          <Marker position={dropoffPos}>
            <Popup>Dropoff</Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
};

export default RideRequest;
