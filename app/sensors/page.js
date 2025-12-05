"use client";
import { useEffect, useState } from "react";

export default function Sensors() {
  const [temp, setTemp] = useState("--");
  const [humidity, setHumidity] = useState("--");

  useEffect(() => {
    const ws = new WebSocket("wss://YOUR-MQTT-WEBSOCKET");
    ws.onmessage = (msg) => {
      const data = JSON.parse(msg.data);
      setTemp(data.temp);
      setHumidity(data.humidity);
    };
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">IoT Sensors — Real Time</h1>
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-[#1a1c1f] p-6 rounded-xl border border-gray-800">
          <h2 className="text-xl">Temperature</h2>
          <p className="text-4xl mt-2 font-bold text-blue-400">{temp}°C</p>
        </div>
        <div className="bg-[#1a1c1f] p-6 rounded-xl border border-gray-800">
          <h2 className="text-xl">Humidity</h2>
          <p className="text-4xl mt-2 font-bold text-green-400">{humidity}%</p>
        </div>
      </div>
    </div>
  );
}
