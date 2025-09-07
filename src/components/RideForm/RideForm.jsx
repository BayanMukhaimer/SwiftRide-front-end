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

const RideForm = ({ setFormIsShown }) => {
    const [pickup, setPickup] = useState({ address: "", lat: "", lng: "" });
    const [dropoff, setDropoff] = useState({ address: "", lat: "", lng: "" });
    const [route, setRoute] = useState(null);
    const [travelInfo, setTravelInfo] = useState(null);
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
                    setPickup({ address: results[0]?.label || `${lat},${lng}`, lat, lng });
                } else if (!dropoff.lat && !dropoff.lng) {
                    setDropoff({ address: results[0]?.label || `${lat},${lng}`, lat, lng });

                    // fetch route when both are set
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

                const baseFare = 2;
                const perKmRate = 0.5;
                const perMinuteRate = 0.2;
                const fare =
                    baseFare + distanceKm * perKmRate + durationMin * perMinuteRate;

                setTravelInfo({ distanceKm, durationMin, fare });
            }
        } catch (err) {
            console.error("Error fetching route:", err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;
        if (!pickup.lat || !dropoff.lat) {
            alert("Please select both pickup and dropoff.");
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

                <button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Submitting..." : "Request Ride"}
                </button>
                <button type="button" onClick={resetPoints} style={{ marginLeft: "10px" }}>
                    Reset
                </button>
            </form>

            {travelInfo && (
                <p>
                    🚗 Distance: {travelInfo.distanceKm} km | ⏱️ Time: {travelInfo.durationMin} mins <br />
                    💰 Estimated Fare: {travelInfo.fare.toFixed(2)} BHD
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
            </MapContainer>
        </div>
    );
};

export default RideForm;
