import Card from "@/components/Card";

export default function Home() {
  return (
    <div>
      <h1 className="text-4xl font-bold mb-8">Smart City Dashboard</h1>
      <div className="grid grid-cols-3 gap-6">
        <Card title="Vehicles Active" value="122" />
        <Card title="Cameras Online" value="984" />
        <Card title="Sensors Active" value="12441" />
      </div>
    </div>
  );
}
