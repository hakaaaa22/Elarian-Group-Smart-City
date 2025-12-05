"use client";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { name: "Jan", value: 400 },
  { name: "Feb", value: 900 },
  { name: "Mar", value: 300 },
  { name: "Apr", value: 650 },
];

export default function Analytics() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Analytics Dashboard</h1>
      <div className="h-[60vh] bg-[#1a1c1f] p-8 rounded-xl border border-gray-800">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={3} />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
