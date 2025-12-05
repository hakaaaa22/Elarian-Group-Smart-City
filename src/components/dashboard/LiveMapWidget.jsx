import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Circle, Popup, useMap } from 'react-leaflet';
import { MapPin, Camera, AlertTriangle, Car, Plane } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import 'leaflet/dist/leaflet.css';

const layers = [
  { id: 'all', label: 'All', icon: MapPin },
  { id: 'cameras', label: 'Cameras', icon: Camera },
  { id: 'incidents', label: 'Incidents', icon: AlertTriangle },
  { id: 'traffic', label: 'Traffic', icon: Car },
  { id: 'drones', label: 'Drones', icon: Plane },
];

const generateLiveData = () => ({
  cameras: [
    { id: 1, lat: 30.0444, lng: 31.2357, status: 'online', name: 'Cam-001' },
    { id: 2, lat: 30.0500, lng: 31.2400, status: 'online', name: 'Cam-002' },
    { id: 3, lat: 30.0420, lng: 31.2450, status: 'offline', name: 'Cam-003' },
    { id: 4, lat: 30.0480, lng: 31.2280, status: 'online', name: 'Cam-004' },
  ],
  incidents: [
    { id: 1, lat: 30.0460, lng: 31.2380, severity: 'critical', type: 'Security Breach' },
    { id: 2, lat: 30.0520, lng: 31.2320, severity: 'warning', type: 'Suspicious Activity' },
  ],
  traffic: [
    { id: 1, lat: 30.0430, lng: 31.2340, congestion: 'high', flow: 234 },
    { id: 2, lat: 30.0490, lng: 31.2420, congestion: 'low', flow: 89 },
    { id: 3, lat: 30.0550, lng: 31.2300, congestion: 'medium', flow: 156 },
  ],
  drones: [
    { id: 1, lat: 30.0470, lng: 31.2360, status: 'active', battery: 78, name: 'Drone-A1' },
    { id: 2, lat: 30.0510, lng: 31.2290, status: 'standby', battery: 95, name: 'Drone-B2' },
  ],
});

function MapUpdater({ center }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

export default function LiveMapWidget({ compact = false }) {
  const [activeLayer, setActiveLayer] = useState('all');
  const [liveData, setLiveData] = useState(generateLiveData());

  // Simulate live updates
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveData(prev => ({
        ...prev,
        drones: prev.drones.map(d => ({
          ...d,
          lat: d.lat + (Math.random() - 0.5) * 0.001,
          lng: d.lng + (Math.random() - 0.5) * 0.001,
          battery: Math.max(0, d.battery - Math.random() * 0.5),
        })),
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const getColor = (type, item) => {
    if (type === 'cameras') return item.status === 'online' ? '#22d3ee' : '#ef4444';
    if (type === 'incidents') return item.severity === 'critical' ? '#ef4444' : '#f59e0b';
    if (type === 'traffic') {
      return item.congestion === 'high' ? '#ef4444' : item.congestion === 'medium' ? '#f59e0b' : '#22c55e';
    }
    if (type === 'drones') return item.status === 'active' ? '#a855f7' : '#64748b';
    return '#22d3ee';
  };

  const shouldShow = (type) => activeLayer === 'all' || activeLayer === type;

  return (
    <div className="h-full flex flex-col">
      {/* Layer Controls */}
      <div className="flex items-center gap-1 mb-2 flex-wrap">
        {layers.map((layer) => (
          <Button
            key={layer.id}
            variant="ghost"
            size="sm"
            onClick={() => setActiveLayer(layer.id)}
            className={`h-7 px-2 text-xs ${
              activeLayer === layer.id
                ? 'bg-cyan-500/20 text-cyan-400'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <layer.icon className="w-3 h-3 mr-1" />
            {!compact && layer.label}
          </Button>
        ))}
      </div>

      {/* Map */}
      <div className="flex-1 min-h-[200px] rounded-lg overflow-hidden relative">
        <MapContainer
          center={[30.0444, 31.2357]}
          zoom={14}
          className="h-full w-full"
          style={{ background: '#0a0e1a' }}
          zoomControl={false}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; OpenStreetMap'
          />

          {/* Cameras */}
          {shouldShow('cameras') && liveData.cameras.map((cam) => (
            <Circle
              key={`cam-${cam.id}`}
              center={[cam.lat, cam.lng]}
              radius={80}
              pathOptions={{
                color: getColor('cameras', cam),
                fillColor: getColor('cameras', cam),
                fillOpacity: 0.4,
                weight: 2,
              }}
            >
              <Popup>
                <div className="bg-slate-900 text-white p-2 rounded min-w-[120px]">
                  <p className="font-medium flex items-center gap-1">
                    <Camera className="w-3 h-3" /> {cam.name}
                  </p>
                  <Badge className={`mt-1 text-xs ${
                    cam.status === 'online' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                  }`}>
                    {cam.status}
                  </Badge>
                </div>
              </Popup>
            </Circle>
          ))}

          {/* Incidents */}
          {shouldShow('incidents') && liveData.incidents.map((inc) => (
            <Circle
              key={`inc-${inc.id}`}
              center={[inc.lat, inc.lng]}
              radius={120}
              pathOptions={{
                color: getColor('incidents', inc),
                fillColor: getColor('incidents', inc),
                fillOpacity: 0.5,
                weight: 3,
              }}
            >
              <Popup>
                <div className="bg-slate-900 text-white p-2 rounded min-w-[140px]">
                  <p className="font-medium flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> {inc.type}
                  </p>
                  <Badge className={`mt-1 text-xs ${
                    inc.severity === 'critical' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'
                  }`}>
                    {inc.severity}
                  </Badge>
                </div>
              </Popup>
            </Circle>
          ))}

          {/* Traffic */}
          {shouldShow('traffic') && liveData.traffic.map((t) => (
            <Circle
              key={`traffic-${t.id}`}
              center={[t.lat, t.lng]}
              radius={100}
              pathOptions={{
                color: getColor('traffic', t),
                fillColor: getColor('traffic', t),
                fillOpacity: 0.3,
                weight: 2,
              }}
            >
              <Popup>
                <div className="bg-slate-900 text-white p-2 rounded min-w-[120px]">
                  <p className="font-medium flex items-center gap-1">
                    <Car className="w-3 h-3" /> Traffic Zone
                  </p>
                  <p className="text-xs text-slate-400 mt-1">Flow: {t.flow} vehicles/hr</p>
                  <Badge className={`mt-1 text-xs ${
                    t.congestion === 'high' ? 'bg-red-500/20 text-red-400' :
                    t.congestion === 'medium' ? 'bg-amber-500/20 text-amber-400' :
                    'bg-green-500/20 text-green-400'
                  }`}>
                    {t.congestion} congestion
                  </Badge>
                </div>
              </Popup>
            </Circle>
          ))}

          {/* Drones */}
          {shouldShow('drones') && liveData.drones.map((drone) => (
            <Circle
              key={`drone-${drone.id}`}
              center={[drone.lat, drone.lng]}
              radius={60}
              pathOptions={{
                color: getColor('drones', drone),
                fillColor: getColor('drones', drone),
                fillOpacity: 0.6,
                weight: 2,
              }}
            >
              <Popup>
                <div className="bg-slate-900 text-white p-2 rounded min-w-[130px]">
                  <p className="font-medium flex items-center gap-1">
                    <Plane className="w-3 h-3" /> {drone.name}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">Battery: {Math.round(drone.battery)}%</p>
                  <Badge className={`mt-1 text-xs ${
                    drone.status === 'active' ? 'bg-purple-500/20 text-purple-400' : 'bg-slate-500/20 text-slate-400'
                  }`}>
                    {drone.status}
                  </Badge>
                </div>
              </Popup>
            </Circle>
          ))}
        </MapContainer>

        {/* Live indicator */}
        <div className="absolute top-2 right-2 flex items-center gap-2 px-2 py-1 bg-slate-900/80 rounded-lg">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-green-400 text-xs">LIVE</span>
        </div>
      </div>
    </div>
  );
}