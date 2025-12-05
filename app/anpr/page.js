export default function ANPR() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">ANPR Live Stream</h1>
      <video src="/streams/anpr.m3u8" autoPlay muted className="w-full rounded-xl border border-gray-700"/>
      <div className="mt-6 p-6 bg-[#1a1c1f] rounded-xl">
        <h2 className="text-xl font-bold text-blue-400">Plates Detected</h2>
        <ul className="mt-4 space-y-2 text-lg">
          <li>🚘 7821 • ABC</li>
          <li>🚚 5510 • DFR</li>
        </ul>
      </div>
    </div>
  );
}
