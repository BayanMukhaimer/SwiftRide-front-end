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
    id: "d1", // Manama -> Zallaq
    path: [
       [26.2038, 50.4620],
  [26.1989, 50.4690],
  [26.1935, 50.4760],
  [26.1880, 50.4825],
  [26.1825, 50.4890],
  [26.1770, 50.4955],
  [26.1715, 50.5020],
  [26.1660, 50.5080],
  [26.1605, 50.5140],
  [26.1550, 50.5200],
  [26.1500, 50.5270],
  [26.1450, 50.5340],
  [26.1410, 50.5400],
  [26.1375, 50.5455],
  [26.1340, 50.5500],
  [26.1315, 50.5530],
  [26.1291, 50.5550],
    ],
  },
  {
    id: "d2" , // Riffa -> Hidd
    path: [
      [26.1550, 50.5280], [26.1610, 50.5330], [26.1665, 50.5375], [26.1720, 50.5420], [26.1780, 50.5470], [26.1835, 50.5510], [26.1890, 50.5550], [26.1945, 50.5590], [26.2000, 50.5630], [26.2055, 50.5670], [26.2110, 50.5710], [26.2165, 50.5750], [26.2220, 50.5790], [26.2275, 50.5830], [26.2330, 50.5870], [26.2385, 50.5910]
    ],
  
  },
  {
    id: "d3", // Muharraq -> Isa Town
    path: [
      [26.2573, 50.6118], [26.2535, 50.6071], [26.2490, 50.6021], [26.2444, 50.5976],
      [26.2396, 50.5936], [26.2343, 50.5901], [26.2289, 50.5871], [26.2232, 50.5842],
      [26.2176, 50.5815], [26.2115, 50.5787], [26.2051, 50.5754], [26.1983, 50.5717],
      [26.1918, 50.5679], [26.1852, 50.5639], [26.1791, 50.5599], [26.1741, 50.5550],
      [26.1710, 50.5513], [26.1700, 50.5494], [26.1720, 50.5485], [26.1730, 50.5482],
      [26.1736, 50.5477], // Isa Town-ish
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
          <button type="submit" disabled={isSubmitting} className="submit-btn">
            {isSubmitting ? "Submitting..." : "Request Ride"}
          </button>
          <button type="button" onClick={resetPoints} className="reset-btn">
            Reset
          </button>
        </form>
        {travelInfo && (
          <p>
            :car: Distance: {travelInfo.distanceKm} km | :stopwatch: Time: {travelInfo.durationMin} mins <br />
            :moneybag: 4-Seater: {travelInfo.fares["4-seater"].toFixed(2)} BHD |
            :moneybag: 6-Seater: {travelInfo.fares["6-seater"].toFixed(2)} BHD
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