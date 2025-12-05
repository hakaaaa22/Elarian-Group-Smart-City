export default function Card({ title, value }) {
  return (
    <div className="bg-[#1a1c1f] p-6 rounded-xl border border-gray-800">
      <h2 className="text-xl">{title}</h2>
      <p className="text-3xl mt-3 font-bold text-blue-400">{value}</p>
    </div>
  );
}
