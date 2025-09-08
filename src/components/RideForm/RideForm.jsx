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
import { createRide } from "../../../lib/api";
import { useNavigate } from "react-router";
import CarMarker from "../DriverDashboard/CarMarker";

const DRIVER_POINTS = [
  {
    id: "d1", 
    path: [
      [26.2285, 50.5860], [26.2248, 50.5821], [26.2207, 50.5778], [26.2159, 50.5739],
      [26.2104, 50.5707], [26.2038, 50.5682], [26.1967, 50.5656], [26.1893, 50.5626],
      [26.1821, 50.5587], [26.1758, 50.5536], [26.1692, 50.5488], [26.1618, 50.5448],
      [26.1542, 50.5415], [26.1465, 50.5386], [26.1389, 50.5354], [26.1318, 50.5320],
      [26.1242, 50.5284], [26.1158, 50.5254], [26.1079, 50.5227], [26.1003, 50.5186],
      [26.0929, 50.5129], [26.0861, 50.5070], [26.0790, 50.5031], [26.0722, 50.5014],
      [26.0677, 50.5006], 
    ],
  },
  {
    id: "d2" ,
    path: [
      [26.1291, 50.5550], [26.1340, 50.5594], [26.1397, 50.5632], [26.1456, 50.5669],
      [26.1518, 50.5707], [26.1579, 50.5744], [26.1642, 50.5780], [26.1706, 50.5818],
      [26.1768, 50.5861], [26.1826, 50.5910], [26.1881, 50.5966], [26.1935, 50.6024],
      [26.1994, 50.6081], [26.2061, 50.6130], [26.2132, 50.6170], [26.2209, 50.6200],
      [26.2281, 50.6228], [26.2350, 50.6269], [26.2409, 50.6335], [26.2442, 50.6415],
      [26.2454, 50.6540], 
    ],
  },
  {
    id: "d3",
    path: [
      [26.2573, 50.6118], [26.2535, 50.6071], [26.2490, 50.6021], [26.2444, 50.5976],
      [26.2396, 50.5936], [26.2343, 50.5901], [26.2289, 50.5871], [26.2232, 50.5842],
      [26.2176, 50.5815], [26.2115, 50.5787], [26.2051, 50.5754], [26.1983, 50.5717],
      [26.1918, 50.5679], [26.1852, 50.5639], [26.1791, 50.5599], [26.1741, 50.5550],
      [26.1710, 50.5513], [26.1700, 50.5494], [26.1720, 50.5485], [26.1730, 50.5482],
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



  // Auto-set pickup to current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords;
          setPickup((prev) => ({
            ...prev,
            lat: latitude,
            lng: longitude,
          }));

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

        const fourFare = calculateFare(distanceKm, durationMin, "4-seater");
        const sixFare = calculateFare(distanceKm, durationMin, "6-seater");

        setTravelInfo({
          distanceKm,
          durationMin,
          fares: {
            "4-seater": fourFare,
            "6-seater": sixFare,
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
      if (setFormIsShown) setFormIsShown(false);
      navigate("/rides/myrides");
    } catch (err) {
      console.error(err);
      alert("Error creating ride");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetPoints = () => {
    setPickup({ address: "", lat: "", lng: "" });
    setDropoff({ address: "", lat: "", lng: "" });
    setRoute(null);
    setTravelInfo(null);
    setCarType("");
  };

  return (
    <div>
      <h2>Book Your Ride</h2>

      <form onSubmit={handleSubmit}>
        <strong>Pickup</strong>
        <input
          placeholder="Pickup address"
          value={pickup.address}
          onChange={(e) =>
            setPickup((prev) => ({ ...prev, address: e.target.value }))
          }
          required
        />

        <strong>Dropoff</strong>
        <input
          placeholder="Dropoff address"
          value={dropoff.address}
          onChange={(e) =>
            setDropoff((prev) => ({ ...prev, address: e.target.value }))
          }
          required
        />

        <strong>Choose Car Type</strong>
        <select
          value={carType}
          onChange={(e) => setCarType(e.target.value)}
          required
        >
          <option value="">-- Select Vehicle --</option>
          <option value="4-seater">4 Seater</option>
          <option value="6-seater">6 Seater</option>
        </select>

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Request Ride"}
        </button>
        <button
          type="button"
          onClick={resetPoints}
          style={{ marginLeft: "10px" }}
        >
          Reset
        </button>
      </form>

      {travelInfo && (
        <p>
          🚗 Distance: {travelInfo.distanceKm} km | ⏱️ Time:{" "}
          {travelInfo.durationMin} mins <br />
          💰 4-Seater: {travelInfo.fares["4-seater"].toFixed(2)} BHD | 💰
          6-Seater: {travelInfo.fares["6-seater"].toFixed(2)} BHD
        </p>
      )}

      <MapContainer
        center={[26.0667, 50.5577]} // Bahrain center
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

        {DRIVER_POINTS.map((d) => (
          <CarMarker key={d.id} path={d.path} playing={true} />
        ))}
      </MapContainer>
    </div>
  );
};

export default RideForm;
