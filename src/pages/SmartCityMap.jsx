import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import {
  Map, Camera, AlertTriangle, Car, Plane, Wifi, 
  Activity, Thermometer, Zap, ChevronRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import 'leaflet/dist/leaflet.css';

const sensors = [
  { id: 1, name: 'Camera Zone A', type: 'camera', status: 'online', lat: 30.0444, lng: 31.2357 },
  { id: 2, name: 'Traffic Sensor B', type: 'traffic', status: 'online', lat: 30.0500, lng: 31.2400 },
  { id: 3, name: 'Drone Unit 1', type: 'drone', status: 'active', lat: 30.0380, lng: 31.2300 },
  { id: 4, name: 'IoT Hub C', type: 'iot', status: 'online', lat: 30.0550, lng: 31.2250 },
  { id: 5, name: 'Camera Zone D', type: 'camera', status: 'offline', lat: 30.0420, lng: 31.2450 },
  { id: 6, name: 'Alert Zone E', type: 'alert', status: 'warning', lat: 30.0480, lng: 31.2320 },
];

const zones = [
  { name: 'Zone A', cameras: 45, incidents: 2, traffic: 'moderate' },
  { name: 'Zone B', cameras: 32, incidents: 0, traffic: 'low' },
  { name: 'Zone C', cameras: 28, incidents: 5, traffic: 'high' },
  { name: 'Zone D', cameras: 51, incidents: 1, traffic: 'moderate' },
];

export default function SmartCityMap() {
  const [selectedSensor, setSelectedSensor] = useState(null);
  const [activeLayer, setActiveLayer] = useState('all');

  return (
    <div className="min-h-screen p-4 lg:p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white flex items-center gap-3">
            <Map className="w-8 h-8 text-cyan-400" />
            Smart City Map
          </h1>
          <p className="text-slate-400 mt-1">Real-time infrastructure monitoring</p>
        </div>
        <Tabs value={activeLayer} onValueChange={setActiveLayer}>
          <TabsList className="bg-slate-800/50 border border-slate-700">
            <TabsTrigger value="all" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">All</TabsTrigger>
            <TabsTrigger value="cameras" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">Cameras</TabsTrigger>
            <TabsTrigger value="traffic" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">Traffic</TabsTrigger>
            <TabsTrigger value="drones" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">Drones</TabsTrigger>
          </TabsList>
        </Tabs>
      </motion.div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Map */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="lg:col-span-3"
        >
          <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80 overflow-hidden">
            <div className="h-[500px] lg:h-[600px] relative">
              <MapContainer
                center={[30.0444, 31.2357]}
                zoom={13}
                className="h-full w-full"
                style={{ background: '#0a0e1a' }}
              >
                <TileLayer
                  url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                  attribution='&copy; OpenStreetMap'
                />
                {sensors.map((sensor) => (
                  <Circle
                    key={sensor.id}
                    center={[sensor.lat, sensor.lng]}
                    radius={200}
                    pathOptions={{
                      color: sensor.status === 'online' || sensor.status === 'active' ? '#22d3ee' :
                             sensor.status === 'warning' ? '#f59e0b' : '#ef4444',
                      fillColor: sensor.status === 'online' || sensor.status === 'active' ? '#22d3ee' :
                                 sensor.status === 'warning' ? '#f59e0b' : '#ef4444',
                      fillOpacity: 0.3,
                      weight: 2
                    }}
                  >
                    <Popup className="custom-popup">
                      <div className="bg-slate-900 text-white p-3 rounded-lg min-w-[200px]">
                        <h3 className="font-semibold">{sensor.name}</h3>
                        <p className="text-slate-400 text-sm capitalize">{sensor.type}</p>
                        <Badge className={`mt-2 ${
                          sensor.status === 'online' || sensor.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' :
                          sensor.status === 'warning' ? 'bg-amber-500/20 text-amber-400' : 'bg-red-500/20 text-red-400'
                        }`}>
                          {sensor.status}
                        </Badge>
                      </div>
                    </Popup>
                  </Circle>
                ))}
              </MapContainer>

              {/* Legend */}
              <div className="absolute bottom-4 left-4 glass-card bg-slate-900/90 backdrop-blur-sm p-4 rounded-xl border border-slate-700 z-[1000]">
                <h4 className="text-white text-sm font-medium mb-3">Legend</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-cyan-500"></div>
                    <span className="text-slate-300 text-xs">Online/Active</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                    <span className="text-slate-300 text-xs">Warning</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span className="text-slate-300 text-xs">Offline/Alert</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-4"
        >
          {/* Stats */}
          <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-lg">Infrastructure</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { icon: Camera, label: 'Cameras', value: 156, color: 'cyan' },
                { icon: Car, label: 'Traffic Sensors', value: 48, color: 'green' },
                { icon: Plane, label: 'Drones', value: 12, color: 'purple' },
                { icon: Wifi, label: 'IoT Devices', value: 234, color: 'amber' },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <item.icon className={`w-5 h-5 text-${item.color}-400`} />
                    <span className="text-slate-300">{item.label}</span>
                  </div>
                  <span className="text-white font-semibold">{item.value}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Zones */}
          <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-lg">Zones</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {zones.map((zone) => (
                <div key={zone.name} className="p-3 bg-slate-800/50 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer">
                  <div className="flex items-center justify-between">
                    <span className="text-white font-medium">{zone.name}</span>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-sm">
                    <span className="text-slate-400">{zone.cameras} cams</span>
                    <span className={`${zone.incidents > 0 ? 'text-red-400' : 'text-green-400'}`}>
                      {zone.incidents} incidents
                    </span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}