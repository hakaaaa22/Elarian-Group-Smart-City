"use client";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

export default function SmartMap() {
  return (
    <MapContainer
      center={[24.7136, 46.6753]}
      zoom={11}
      className="h-[80vh] w-full rounded-xl"
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <Marker position={[24.7136, 46.6753]}>
        <Popup>ELARIAN HQ</Popup>
      </Marker>
    </MapContainer>
  );
}
