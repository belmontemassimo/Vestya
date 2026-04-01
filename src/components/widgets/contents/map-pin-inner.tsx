"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";

// CSS is imported via globals.css to avoid Next.js bundling issues

// Fix default marker icon issue in Leaflet + webpack
const icon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface MapPinInnerProps {
  latitude: number;
  longitude: number;
  name: string;
}

export function MapPinInner({ latitude, longitude, name }: MapPinInnerProps) {
  return (
    <MapContainer
      center={[latitude, longitude]}
      zoom={13}
      className="h-full w-full rounded-lg"
      scrollWheelZoom={false}
      zoomControl={false}
      attributionControl={false}
      dragging={false}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <Marker position={[latitude, longitude]} icon={icon}>
        <Popup>{name}</Popup>
      </Marker>
    </MapContainer>
  );
}
