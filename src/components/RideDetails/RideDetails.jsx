import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { getRideById, cancelRide } from "../../../lib/api";
import "./RideDetails.css"; 

const RideDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [ride, setRide] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getRideById(id);
        setRide(data);

        if (data?.pickup && data?.dropoff) {
          const url = `https://router.project-osrm.org/route/v1/driving/${data.pickup.lng},${data.pickup.lat};${data.dropoff.lng},${data.dropoff.lat}?overview=full&geometries=geojson`;
          const res = await fetch(url);
          const routeData = await res.json();
          if (routeData.routes && routeData.routes.length > 0) {
            const coords = routeData.routes[0].geometry.coordinates.map(([lng, lat]) => [lat, lng]);
            setRouteCoords(coords);
          }
        }
      } catch (e) {
        console.error("Failed to load ride:", e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleCancel = async () => {
    try {
      await cancelRide(ride._id);
      alert("Ride cancelled successfully");
      navigate("/rides/myrides");
    } catch (err) {
      console.error(err);
      alert("Failed to cancel ride");
    }
  };

  if (loading) return <p className="ride-details-loading">Loading ride details...</p>;
  if (!ride) return <p className="ride-details-error">Ride not found</p>;

  return (
    <div className="ride-details-container">
      {/* Left side - details */}
      <div className="ride-details-info">
        <h2>Ride Details</h2>
        <p><strong>Status:</strong> {ride.status}</p>
        <p><strong>Fare:</strong> {ride.fare ?? 0} BHD</p>
        <p><strong>Driver:</strong> {ride.driver?.name || "Unassigned"}</p>
        <p><strong>Pickup:</strong> {ride.pickup.address}</p>
        <p><strong>Dropoff:</strong> {ride.dropoff.address}</p>

        {ride.status === "requested" && (
          <button onClick={handleCancel} className="cancel-btn">Cancel Ride</button>
        )}
      </div>

      {/* Right side - map */}
      <div className="ride-details-map">
        {ride.pickup && ride.dropoff && (
          <MapContainer
            center={[ride.pickup.lat, ride.pickup.lng]}
            zoom={12}
            className="ride-map"
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <Marker position={[ride.pickup.lat, ride.pickup.lng]}>
              <Popup>Pickup</Popup>
            </Marker>
            <Marker position={[ride.dropoff.lat, ride.dropoff.lng]}>
              <Popup>Dropoff</Popup>
            </Marker>
            {routeCoords && <Polyline positions={routeCoords} color="blue" />}
          </MapContainer>
        )}
      </div>
    </div>
  );
}
