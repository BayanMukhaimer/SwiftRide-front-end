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
import CarMarker from "../DriverDashboard/CarMarker";
import "./RideDetails.css"; 

export default function RideDetails() {
  const statusColors = {
    requested: "dodgerblue",
    accepted: "mediumseagreen",
    "in-progress": "orange",
    completed: "gray",
    cancelled: "crimson",
  };

  const { id } = useParams();
  const navigate = useNavigate();

  const [ride, setRide] = useState(null);
  const [loading, setLoading] = useState(true);

  const [custPath, setCustPath] = useState(null);
  const [drvPath, setDrvPath] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getRideById(id);
        setRide(data);

        if (data?.pickup && data?.dropoff) {
          const url = `https://router.project-osrm.org/route/v1/driving/${data.pickup.lng},${data.pickup.lat};${data.dropoff.lng},${data.dropoff.lat}?overview=full&geometries=geojson`;
          const res = await fetch(url);
          const json = await res.json();
          const coords =
            json?.routes?.[0]?.geometry?.coordinates?.map(([lng, lat]) => [
              Number(lat),
              Number(lng),
            ]) || [];
          setCustPath(coords);
        } else {
          setCustPath(null);
        }
      } catch (e) {
        console.error("Failed to load ride:", e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  useEffect(() => {
    const loadDriverPath = async () => {
      if (!ride) return;

      const statusOk =
        ride.status === "accepted" || ride.status === "in-progress";
      const start = { lat: 26.2285, lng: 50.586 };
      const pk = ride.pickup;

      if (!statusOk || !start?.lat || !start?.lng || !pk?.lat || !pk?.lng) {
        setDrvPath(null);
        return;
      }

      try {
        const url = `https://router.project-osrm.org/route/v1/driving/${start.lng},${start.lat};${pk.lng},${pk.lat}?overview=full&geometries=geojson`;
        const res = await fetch(url);
        const json = await res.json();
        const coords =
          json?.routes?.[0]?.geometry?.coordinates?.map(([lng, lat]) => [
            Number(lat),
            Number(lng),
          ]) || [];
        setDrvPath(coords);
      } catch (e) {
        console.error("Failed to load driver path:", e);
        setDrvPath(null);
      }
    };
    loadDriverPath();
  }, [
    ride?.status,
    ride?.driverStart,
    ride?.driver?.location,
    ride?.pickup?.lat,
    ride?.pickup?.lng,
  ]);

  if (loading) return <p>Loading ride...</p>;
  if (!ride) return <p>Ride not found</p>;

  const center = [Number(ride.pickup.lat), Number(ride.pickup.lng)];
  const showCar = ride.status === "accepted" || ride.status === "in-progress";
  const playing = ride.status === "in-progress";

  return (
    <div className="ride-details-container">
      <div className="ride-details-left">
        <h2>Ride Details</h2>
        <p>
          <strong>Status:</strong>{" "}
          <span style={{ color: statusColors[ride.status] }}>
            {ride.status}
          </span>
        </p>
        <p>
          <strong>Fare:</strong> {ride.fare.toFixed(2) ?? 0} BHD
        </p>
        <p>
          <strong>Driver:</strong> {ride.driver?.name || "Unassigned"}
        </p>
        <p>
          <strong>Pickup:</strong> {ride.pickup?.address}
        </p>
        <p>
          <strong>Dropoff:</strong> {ride.dropoff?.address}
        </p>

        {ride.status === "requested" && (
          <button
            onClick={async () => {
              try {
                await cancelRide(ride._id);
                alert("Ride cancelled");
                navigate("/rides/myrides");
              } catch {
                alert("Failed to cancel ride");
              }
            }}
          >
            Cancel Ride
          </button>
        )}
      </div>

      
      <div className="ride-details-right">
        <MapContainer
          center={center}
          zoom={13}
          className="ride-map"
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

          {ride.pickup && (
            <Marker position={[Number(ride.pickup.lat), Number(ride.pickup.lng)]}>
              <Popup>Pickup</Popup>
            </Marker>
          )}

          {ride.dropoff && (
            <Marker position={[Number(ride.dropoff.lat), Number(ride.dropoff.lng)]}>
              <Popup>Dropoff</Popup>
            </Marker>
          )}

          {showCar && drvPath?.length > 1 && (
            <CarMarker path={drvPath} playing={playing} />
          )}

          {custPath && <Polyline positions={custPath} />}
          {drvPath && <Polyline positions={drvPath} />}
        </MapContainer>
      </div>
    </div>
  );
}
