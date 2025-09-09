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
import { useNavigate } from "react-router";
import "./RideForm.css";
import CarMarker from "../DriverDashboard/CarMarker";
import { createRide } from "../../../lib/api";

const DRIVER_POINTS = [
 
];

const RideForm = ({ setFormIsShown }) => {
  const [pickup, setPickup] = useState({ address: "", lat: "", lng: "" });
  const [dropoff, setDropoff] = useState({ address: "", lat: "", lng: "" });
  const [route, setRoute] = useState(null);
  const [travelInfo, setTravelInfo] = useState(null);
  const [carType, setCarType] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const provider = new OpenStreetMapProvider();
  const navigate = useNavigate();

  const resetPoints = () => {
    setPickup({ address: "", lat: "", lng: "" });
    setDropoff({ address: "", lat: "", lng: "" });
    setRoute(null);
    setTravelInfo(null);
    setCarType("");
  };

  
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords;
          setPickup({ lat: latitude, lng: longitude });

          const results = await provider.search({
            query: `${latitude},${longitude}`,
          });
          setPickup((prev) => ({
            ...prev,
            address: results[0]?.label || `${latitude},${longitude}`,
          }));
        },
        (err) => console.error(err)
      );
    }
  }, []);

  
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

  const calculateFare = (distanceKm, durationMin, type) => {
    const pricing = {
      "4-seater": { base: 2, perKm: 0.5, perMin: 0.2 },
      "6-seater": { base: 3, perKm: 0.8, perMin: 0.3 },
    };
    const rates = pricing[type];
    return rates.base + distanceKm * rates.perKm + durationMin * rates.perMin;
  };

  const fetchRoute = async (start, end) => {
    try {
      const url = `https://router.project-osrm.org/route/v1/driving/${start[0]},${start[1]};${end[0]},${end[1]}?overview=full&geometries=geojson`;
      const res = await fetch(url);
      const data = await res.json();

      if (data.routes && data.routes.length > 0) {
        const routeCoords = data.routes[0].geometry.coordinates.map((c) => [c[1], c[0]]);
        setRoute(routeCoords);

        const distanceKm = (data.routes[0].distance / 1000).toFixed(2);
        const durationMin = Math.round(data.routes[0].duration / 60);

        setTravelInfo({
          distanceKm,
          durationMin,
          fares: {
            "4-seater": calculateFare(distanceKm, durationMin, "4-seater"),
            "6-seater": calculateFare(distanceKm, durationMin, "6-seater"),
          },
        });
      }
    } catch (err) {
      console.error("Error fetching route:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (!pickup.lat || !dropoff.lat || !carType) {
      alert("Please select pickup, dropoff, and car type.");
      return;
    }

    setIsSubmitting(true);

    const submitData = {
      pickup: { address: pickup.address, lat: Number(pickup.lat), lng: Number(pickup.lng) },
      dropoff: { address: dropoff.address, lat: Number(dropoff.lat), lng: Number(dropoff.lng) },
      distanceKm: travelInfo?.distanceKm,
      durationMin: travelInfo?.durationMin,
      fare: travelInfo?.fares[carType],
      vehicle: carType,
    };

    try {
      const token = localStorage.getItem("token");
      await createRide(submitData, token);
      alert("Ride requested successfully!");
      setFormIsShown && setFormIsShown(false);
      navigate("/rides/myrides");
    } catch (err) {
      console.error(err);
      alert("Error creating ride");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="ride-form-container">
      {/* Left Form */}
      <div className="ride-form-left">
        <h2>Book Your Ride</h2>
        <form onSubmit={handleSubmit}>
          <label>Pickup</label>
          <input
            placeholder="Pickup address"
            value={pickup.address}
            onChange={(e) => setPickup((prev) => ({ ...prev, address: e.target.value }))}
            required
          />

          <label>Dropoff</label>
          <input
            placeholder="Dropoff address"
            value={dropoff.address}
            onChange={(e) => setDropoff((prev) => ({ ...prev, address: e.target.value }))}
            required
          />

          <label>Choose Car Type</label>
          <select value={carType} onChange={(e) => setCarType(e.target.value)} required>
            <option value="">-- Select Vehicle --</option>
            <option value="4-seater">4 Seater</option>
            <option value="6-seater">6 Seater</option>
          </select>
        <div className="form-buttons">
          <button type="submit" disabled={isSubmitting} className="submit-btn">
            {isSubmitting ? "Submitting..." : "Request Ride"} 
          </button>
          <button type="button" onClick={resetPoints} className="reset-btn">
            Reset
          </button>
          </div>
        </form>

        {travelInfo && (
          <p>
            🚗 Distance: {travelInfo.distanceKm} km | ⏱️ Time: {travelInfo.durationMin} mins <br />
            💰 4-Seater: {travelInfo.fares["4-seater"].toFixed(2)} BHD | 
            💰 6-Seater: {travelInfo.fares["6-seater"].toFixed(2)} BHD
          </p>
        )}
      </div>

      {/* Right Map */}
      <div className="ride-form-right">
        <MapContainer center={[26.0667, 50.5577]} zoom={12} style={{ height: "100%", width: "100%" }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <LocationSelector />

          {pickup.lat && pickup.lng && <Marker position={[pickup.lat, pickup.lng]}><Popup>Pickup</Popup></Marker>}
          {dropoff.lat && dropoff.lng && <Marker position={[dropoff.lat, dropoff.lng]}><Popup>Dropoff</Popup></Marker>}
          {route && <Polyline positions={route} color="blue" />}

          {DRIVER_POINTS.map((d) => (
            <CarMarker key={d.id} path={d.path} playing={true} />
          ))}
        </MapContainer>
      </div>
    </div>
  );
};

export default RideForm;
