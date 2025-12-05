export default function LiveCameras() {
  const feeds = [
    "/streams/cam1.m3u8",
    "/streams/cam2.m3u8",
    "/streams/cam3.m3u8",
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Live Cameras</h1>
      <div className="grid grid-cols-3 gap-6">
        {feeds.map((url, i) => (
          <video key={i} src={url} controls autoPlay muted className="rounded-xl border border-gray-700"/>
        ))}
      </div>
    </div>
  );
}
