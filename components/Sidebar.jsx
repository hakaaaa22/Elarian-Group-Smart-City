import Link from "next/link";

export default function Sidebar() {
  const links = [
    ["", "📊 Dashboard"],
    ["map", "🗺 Smart Map"],
    ["fleet", "🚚 Fleet"],
    ["cameras/live", "📡 Live Cameras"],
    ["anpr", "🔍 ANPR Stream"],
    ["sensors", "📟 IoT Sensors"],
    ["analytics", "📈 Analytics"],
    ["parking", "🅿️ Smart Parking"],
    ["waste", "♻️ Waste Management"],
    ["energy", "⚡ Energy"],
    ["alerts", "🚨 Alerts Center"]
  ];

  return (
    <div className="w-64 h-screen bg-black border-r border-gray-800 p-5">
      <h1 className="text-2xl font-bold mb-8 text-blue-400">ELARIAN OS</h1>
      <nav className="space-y-4">
        {links.map(([href, label]) => (
          <Link key={href} href={`/${href}`} className="block hover:text-blue-400">
            {label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
