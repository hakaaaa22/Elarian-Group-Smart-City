import dynamic from "next/dynamic";
const Map = dynamic(() => import("@/components/Map"), { ssr: false });

export default function SmartMapPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Smart Map</h1>
      <Map />
    </div>
  );
}
