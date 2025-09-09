import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
} from "react-leaflet";
import CarMarker from "./CarMarker";


const DRIVER_START = { lat: 26.2285, lng: 50.586 };

const DriverMap = ({ pickup, playing }) => {
  const [driverRoute, setDriverRoute] = useState(null);

  useEffect(() => {
    if (!pickup?.lat) return;
    const fetchRoute = async () => {
      const url = `https://router.project-osrm.org/route/v1/driving/${DRIVER_START.lng},${DRIVER_START.lat};${pickup.lng},${pickup.lat}?overview=full&geometries=geojson`;
      const res = await fetch(url);
      const data = await res.json();
      const coords =
        data.routes?.[0]?.geometry?.coordinates?.map(([x, y]) => [y, x]) || [];
      setDriverRoute(coords);

      c
    };
    fetchRoute();
  }, [pickup]);

  const center = pickup?.lat
    ? [pickup.lat, pickup.lng]
    : [DRIVER_START.lat, DRIVER_START.lng];

  return (
    <div>
      <MapContainer
        center={[DRIVER_START.lat, DRIVER_START.lng]}
        zoom={13}
        style={{ height: "400px", width: "100%", marginTop: "20px" }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {pickup && (
          <Marker position={[pickup.lat, pickup.lng]}>
            <Popup>Pickup</Popup>
          </Marker>
        )}
        {DRIVER_START && (
          <Marker position={[DRIVER_START.lat, DRIVER_START.lng]}>
            <Popup>Driver</Popup>
          </Marker>
        )}
        {driverRoute && <Polyline positions={driverRoute} />}
        {driverRoute?.length > 1 && (
          <CarMarker path={driverRoute} playing={playing} />
        )}
      </MapContainer>
    </div>
  );
};
export default DriverMap;
