"use client";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";

const Map = dynamic(() => import("@/components/Map"), { ssr: false });

export default function SmartMap() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Smart City Map</h1>
      <Map />
    </div>
  );
}
