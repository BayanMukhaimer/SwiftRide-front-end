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
import { createRide, getAllRide } from "../../../lib/api";

const RideRequest = () => {
  const [pickup, setPickup] = useState({ address: "", lat: "", lng: "" });
  const [dropoff, setDropoff] = useState({ address: "", lat: "", lng: "" });
  const [route, setRoute] = useState(null);
  const [travelInfo, setTravelInfo] = useState(null);
  const [rides, setRides] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const provider = new OpenStreetMapProvider();

  // Fetch user's rides
  const fetchMyRides = async () => {
    try {
      const res = await getAllRide();
      setRides(res.data || []);
    } catch (err) {
      console.error("Failed to fetch rides:", err);
    }
  };

  useEffect(() => {
    fetchMyRides();
  }, []);

  // Auto-set pickup to current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords;
          setPickup((prev) => ({ ...prev, lat: latitude, lng: longitude }));

          const results = await provider.search({
            query: `${latitude},${longitude}`,
          });
          setPickup((prev) => ({
            ...prev,
            address: results[0]?.label || `${latitude},${longitude}`,
          }));
        },
        (err) => console.error("Error fetching current location:", err)
      );
    }
  }, []);

  // Map click to select pickup/dropoff
  const LocationSelector = () => {
    useMapEvents({
      click: async (e) => {
        const { lat, lng } = e.latlng;
        const results = await provider.search({ query: `${lat},${lng}` });

        if (!pickup.lat && !pickup.lng) {
          setPickup({ address: results[0]?.label || `${lat},${lng}`, lat, lng });
        } else if (!dropoff.lat && !dropoff.lng) {
          setDropoff({ address: results[0]?.label || `${lat},${lng}`, lat, lng });
          fetchRoute([pickup.lng, pickup.lat], [lng, lat]);
        }
      },
    });
    return null;
  };

  // Fetch route using OSRM
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
    if (!pickup.lat || !dropoff.lat) {
      alert("Please select both pickup and dropoff locations.");
      return;
    }

    setIsSubmitting(true);
    const token = localStorage.getItem("token");

    try {
      await createRide(
        {
          pickup,
          dropoff,
        },
        token
      );
      alert("Ride requested successfully!");
      setPickup({ address: "", lat: "", lng: "" });
      setDropoff({ address: "", lat: "", lng: "" });
      setRoute(null);
      setTravelInfo(null);
      fetchMyRides(); // Refresh rides list
    } catch (err) {
      console.error(err);
      alert("Error creating ride");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <h2>Request a Ride</h2>

      <input type="text" value={pickup.address} placeholder="Pickup" readOnly />
      <input type="text" value={dropoff.address} placeholder="Dropoff" readOnly />

      <button onClick={handleRequestRide} disabled={isSubmitting}>
        {isSubmitting ? "Submitting..." : "Request Ride"}
      </button>
      <button
        onClick={() => {
          setPickup({ address: "", lat: "", lng: "" });
          setDropoff({ address: "", lat: "", lng: "" });
          setRoute(null);
          setTravelInfo(null);
        }}
        style={{ marginLeft: "10px" }}
      >
        Reset
      </button>

      {travelInfo && (
        <p>
          🚗 Distance: {travelInfo.distanceKm} km | ⏱️ Estimated Time:{" "}
          {travelInfo.durationMin} mins
        </p>
      )}

      <MapContainer
        center={[26.0667, 50.5577]}
        zoom={12}
        style={{ height: "400px", width: "100%", marginTop: "20px" }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <LocationSelector />

        {pickup.lat && pickup.lng && (
          <Marker position={[pickup.lat, pickup.lng]}>
            <Popup>Pickup</Popup>
          </Marker>
        )}
        {dropoff.lat && dropoff.lng && (
          <Marker position={[dropoff.lat, dropoff.lng]}>
            <Popup>Dropoff</Popup>
          </Marker>
        )}
        {route && <Polyline positions={route} color="blue" />}
      </MapContainer>

      <h3>My Rides</h3>
      {rides.length === 0 ? (
        <p>No rides yet</p>
      ) : (
        <ul>
          {rides.map((ride) => (
            <li key={ride._id}>
              {ride.pickup.address} ➜ {ride.dropoff.address} | Status: {ride.status}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default RideRequest;
