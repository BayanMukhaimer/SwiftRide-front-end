import { useState, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { OpenStreetMapProvider } from "leaflet-geosearch";
import { createRide, getAllRide, updateAcceptRide } from "../../../lib/api";

const RideRequest = () => {
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");
  const [pickupPos, setPickupPos] = useState(null);
  const [dropoffPos, setDropoffPos] = useState(null);
  const [route, setRoute] = useState(null);
  const [travelInfo, setTravelInfo] = useState(null);

  const provider = new OpenStreetMapProvider();

  // Auto-set pickup to current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords;
          setPickupPos([latitude, longitude]);

          const results = await provider.search({
            query: `${latitude},${longitude}`,
          });
          setPickup(results[0]?.label || `${latitude},${longitude}`);
        },
        (err) => console.error("Error fetching current location:", err)
      );
    }
  }, []);

  // Handle map clicks
  const LocationSelector = () => {
    useMapEvents({
      click: async (e) => {
        const { lat, lng } = e.latlng;
        const results = await provider.search({ query: `${lat},${lng}` });

        if (!pickupPos) {
          setPickupPos([lat, lng]);
          setPickup(results[0]?.label || `${lat},${lng}`);
        } else if (!dropoffPos) {
          setDropoffPos([lat, lng]);
          setDropoff(results[0]?.label || `${lat},${lng}`);

          // Fetch route when both points are chosen
          fetchRoute([pickupPos[1], pickupPos[0]], [lng, lat]);
        }
      },
    });
    return null;
  };

  // Fetch route using OSRM API
  const fetchRoute = async (start, end) => {
    try {
      const url = `https://router.project-osrm.org/route/v1/driving/${start[0]},${start[1]};${end[0]},${end[1]}?overview=full&geometries=geojson`;
      const res = await fetch(url);
      const data = await res.json();

      if (data.routes && data.routes.length > 0) {
        const routeCoords = data.routes[0].geometry.coordinates.map((c) => [
          c[1],
          c[0],
        ]);
        setRoute(routeCoords);

        const distanceKm = (data.routes[0].distance / 1000).toFixed(2);
        const durationMin = Math.round(data.routes[0].duration / 60);
        setTravelInfo({ distanceKm, durationMin });
      }
    } catch (err) {
      console.error("Error fetching route:", err);
    }
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
    setRoute(null);
    setTravelInfo(null);
  };

  return (
    <div>
      <h2>Request a Ride</h2>

      <input type="text" value={pickup} placeholder="Pickup" readOnly />
      <input type="text" value={dropoff} placeholder="Dropoff" readOnly />

      <button onClick={handleRequestRide}>Request Ride</button>
      <button onClick={resetPoints} style={{ marginLeft: "10px" }}>
        Reset
      </button>

      {travelInfo && (
        <p>
          🚗 Distance: {travelInfo.distanceKm} km | ⏱️ Estimated Time:{" "}
          {travelInfo.durationMin} mins
        </p>
      )}

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
        {route && <Polyline positions={route} color="blue" />}
      </MapContainer>
    </div>
  );
};

export default RideRequest;
