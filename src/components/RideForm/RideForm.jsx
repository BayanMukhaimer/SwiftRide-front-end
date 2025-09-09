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
  {
    id: "d1",
    path: [
      [26.2038, 50.462],
      [26.1989, 50.469],
      [26.1935, 50.476],
      [26.188, 50.4825],
      [26.1825, 50.489],
      [26.177, 50.4955],
      [26.1715, 50.502],
      [26.166, 50.508],
      [26.1605, 50.514],
      [26.155, 50.52],
      [26.15, 50.527],
      [26.145, 50.534],
      [26.141, 50.54],
      [26.1375, 50.5455],
      [26.134, 50.55],
      [26.1315, 50.553],
      [26.1291, 50.555],
    ],
  },
  {
    id: "d2", 
    path: [
      [26.155, 50.528],
      [26.161, 50.533],
      [26.1665, 50.5375],
      [26.172, 50.542],
      [26.178, 50.547],
      [26.1835, 50.551],
      [26.189, 50.555],
      [26.1945, 50.559],
      [26.2, 50.563],
      [26.2055, 50.567],
      [26.211, 50.571],
      [26.2165, 50.575],
      [26.222, 50.579],
      [26.2275, 50.583],
      [26.233, 50.587],
      [26.2385, 50.591],
    ],
  },
  {
    id: "d3", 
    path: [
  [26.2573, 50.6118],
  [26.2485, 50.6080],
  [26.2420, 50.6020],
  [26.2370, 50.5960],
  [26.2300, 50.5850],
  [26.2230, 50.5770],
  [26.2180, 50.5700],
  [26.2100, 50.5650],
  [26.2020, 50.5600],
  [26.1920, 50.5550],
  [26.1830, 50.5520],
  [26.1760, 50.5490],
  [26.1736, 50.5477],
    ],
  },
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
          setPickup({
            address: results[0]?.label || `${lat},${lng}`,
            lat,
            lng,
          });
        } else if (!dropoff.lat && !dropoff.lng) {
          setDropoff({
            address: results[0]?.label || `${lat},${lng}`,
            lat,
            lng,
          });
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
        const routeCoords = data.routes[0].geometry.coordinates.map((c) => [
          c[1],
          c[0],
        ]);
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
      pickup: {
        address: pickup.address,
        lat: Number(pickup.lat),
        lng: Number(pickup.lng),
      },
      dropoff: {
        address: dropoff.address,
        lat: Number(dropoff.lat),
        lng: Number(dropoff.lng),
      },
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
            onChange={(e) =>
              setPickup((prev) => ({ ...prev, address: e.target.value }))
            }
            required
          />
          <label>Dropoff</label>
          <input
            placeholder="Dropoff address"
            value={dropoff.address}
            onChange={(e) =>
              setDropoff((prev) => ({ ...prev, address: e.target.value }))
            }
            required
          />
          <label>Choose Car Type</label>
          <select
            value={carType}
            onChange={(e) => setCarType(e.target.value)}
            required
          >
            <option value="">-- Select Vehicle --</option>
            <option value="4-seater">4 Seater</option>
            <option value="6-seater">6 Seater</option>
          </select>
          <button type="submit" disabled={isSubmitting} className="submit-btn">
            {isSubmitting ? "Submitting..." : "Request Ride"}
          </button>
          <button type="button" onClick={resetPoints} className="reset-btn">
            Reset
          </button>
        </form>
        {travelInfo && (
          <p>
            :car: Distance: {travelInfo.distanceKm} km | :stopwatch: Time:{" "}
            {travelInfo.durationMin} mins <br />
            :moneybag: 4-Seater: {travelInfo.fares["4-seater"].toFixed(2)} BHD |
            :moneybag: 6-Seater: {travelInfo.fares["6-seater"].toFixed(2)} BHD
          </p>
        )}
      </div>
      {/* Right Map */}
      <div className="ride-form-right">
        <MapContainer
          center={[26.0667, 50.5577]}
          zoom={12}
          style={{ height: "100%", width: "100%" }}
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
          {DRIVER_POINTS.map((d) => (
            <CarMarker key={d.id} path={d.path} playing={true} />
          ))}
        </MapContainer>
      </div>
    </div>
  );
};
export default RideForm;
