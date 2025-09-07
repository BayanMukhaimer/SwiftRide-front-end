import { useEffect, useState, useRef } from "react";
import { LeafletTrackingMarker } from "react-leaflet-tracking-marker";
import L from "leaflet";

import carPhoto from "../../assets/carPhoto.png";
import { Popup } from "react-leaflet";

const icon = L.icon({
  iconSize: [45, 45],
  popupAnchor: [2, -20],
  iconUrl: carPhoto
});

export default function CarMarker({ path, playing } ) {
  const [pos, setPos] = useState(path?.[0] || null);
  const [prev, setPrev] = useState(path?.[0] || null);
  const idxRef = useRef(0);
  const timerRef = useRef(null);

  useEffect(() => {
    idxRef.current = 0;
    const start = path?.[0] || null;
    setPos(start);
    setPrev(start);
  }, [path]);

  useEffect(() => {
    
    if (!playing || !path || path.length < 2) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    timerRef.current = setInterval(() => {
      const i = idxRef.current;
      if (i >= path.length - 1) {
        clearInterval(timerRef.current);
        return;
      }
      setPrev(path[i]);
      setPos(path[i + 1]);
      idxRef.current = i + 1;
    }, 800);
    return () => clearInterval(timerRef.current);
  }, [playing, path]);

  if (!pos) return null;

  return (
    <LeafletTrackingMarker
      icon={icon}
      position={pos}
      previousPosition={prev}
      duration={700}
    >
      <Popup>Driver on the round 🚗</Popup>
    </LeafletTrackingMarker>
  );
}
