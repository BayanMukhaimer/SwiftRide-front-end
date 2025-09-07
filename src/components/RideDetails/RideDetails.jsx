import { useState, useEffect } from "react";
import { useParams } from "react-router";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { getRideById } from "../../../lib/api";

const RideDetails = () => {
  const { id } = useParams(); // ride ID from URL
  const [ride, setRide] = useState(null);
  const [route, setRoute] = useState(null);

  useEffect(() => {
    const fetchRide = async () => {
      try {
        const data = await getRideById(id);
        setRide(data);

        // If pickup & dropoff locations exist, fetch route from OSRM
        if (data.pickup?.location && data.dropoff?.location) {
          const start = [data.pickup.location.lng, data.pickup.location.lat];
          const end = [data.dropoff.location.lng, data.dropoff.location.lat];
          const url = `https://router.project-osrm.org/route/v1/driving/${start[0]},${start[1]};${end[0]},${end[1]}?overview=full&geometries=geojson`;
          const res = await fetch(url);
          const routeData = await res.json();
          if (routeData.routes && routeData.routes.length > 0) {
            const routeCoords = routeData.routes[0].geometry.coordinates.map(
              (c) => [c[1], c[0]]
            );
            setRoute(routeCoords);
          }
        }
      } catch (err) {
        console.error("Error fetching ride:", err);
      }
    };

    fetchRide();
  }, [id]);

  if (!ride) return <p>Loading ride details...</p>;

  return (
    <div>
      <h2>Ride Details</h2>
      <p>
        <strong>Status:</strong> {ride.status}
      </p>
      <p>
        <strong>Pickup:</strong> {ride.pickup?.address}
      </p>
      <p>
        <strong>Dropoff:</strong> {ride.dropoff?.address}
      </p>
      {ride.driver && (
        <p>
          <strong>Driver:</strong> {ride.driver.name} | {ride.driver.email} |{" "}
          {ride.driver.vehicle || "No vehicle info"}
        </p>
      )}
      {ride.fare && (
        <p>
          <strong>Fare:</strong> {ride.fare}
        </p>
      )}

      {route && (
        <MapContainer
          center={[
            ride.pickup.location.lat,
            ride.pickup.location.lng,
          ]}
          zoom={13}
          style={{ height: "400px", width: "100%", marginTop: "20px" }}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <Marker
            position={[ride.pickup.location.lat, ride.pickup.location.lng]}
          >
            <Popup>Pickup</Popup>
          </Marker>
          <Marker
            position={[ride.dropoff.location.lat, ride.dropoff.location.lng]}
          >
            <Popup>Dropoff</Popup>
          </Marker>
          <Polyline positions={route} color="blue" />
        </MapContainer>
      )}
    </div>
  );
};

export default RideDetails;
