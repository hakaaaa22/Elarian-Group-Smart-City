import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Plane, Battery, Gauge, MapPin, Activity, 
  Play, Pause, RotateCw, ChevronRight, Wifi
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

const drones = [
  { id: 'DRN-001', name: 'Alpha Unit', status: 'active', battery: 87, altitude: 350, speed: 46.8, mission: 'Patrol Zone A' },
  { id: 'DRN-002', name: 'Beta Unit', status: 'active', battery: 65, altitude: 280, speed: 42.1, mission: 'Surveillance B' },
  { id: 'DRN-003', name: 'Gamma Unit', status: 'standby', battery: 100, altitude: 0, speed: 0, mission: 'Standby' },
  { id: 'DRN-004', name: 'Delta Unit', status: 'charging', battery: 34, altitude: 0, speed: 0, mission: 'Charging' },
  { id: 'DRN-005', name: 'Epsilon Unit', status: 'active', battery: 72, altitude: 420, speed: 51.2, mission: 'Emergency Response' },
];

const statusColors = {
  active: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  standby: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  charging: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  offline: 'bg-red-500/20 text-red-400 border-red-500/30',
};

export default function DroneFusion() {
  const [selectedDrone, setSelectedDrone] = useState(drones[0]);

  const activeDrones = drones.filter(d => d.status === 'active').length;

  return (
    <div className="min-h-screen p-4 lg:p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl lg:text-3xl font-bold text-white flex items-center gap-3">
          <Plane className="w-8 h-8 text-cyan-400" />
          Drone Fusion
        </h1>
        <p className="text-slate-400 mt-1">Aerial surveillance & coordination center</p>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Drone Visualization */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="lg:col-span-2"
        >
          <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
            <CardContent className="p-6">
              {/* 3D Drone Visualization */}
              <div className="aspect-video bg-slate-900 rounded-xl relative overflow-hidden">
                {/* Grid Background */}
                <div className="absolute inset-0" style={{
                  backgroundImage: `
                    linear-gradient(rgba(99, 102, 241, 0.1) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(99, 102, 241, 0.1) 1px, transparent 1px)
                  `,
                  backgroundSize: '40px 40px'
                }} />

                {/* Drone SVG */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.svg
                    initial={{ y: 10 }}
                    animate={{ y: -10 }}
                    transition={{ repeat: Infinity, repeatType: 'reverse', duration: 2 }}
                    className="w-64 h-64"
                    viewBox="0 0 200 200"
                  >
                    {/* Drone Body */}
                    <ellipse cx="100" cy="100" rx="30" ry="15" fill="rgba(99, 102, 241, 0.5)" stroke="#6366f1" strokeWidth="1" />
                    
                    {/* Arms */}
                    <line x1="70" y1="100" x2="30" y2="70" stroke="#6366f1" strokeWidth="2" />
                    <line x1="130" y1="100" x2="170" y2="70" stroke="#6366f1" strokeWidth="2" />
                    <line x1="70" y1="100" x2="30" y2="130" stroke="#6366f1" strokeWidth="2" />
                    <line x1="130" y1="100" x2="170" y2="130" stroke="#6366f1" strokeWidth="2" />
                    
                    {/* Propellers */}
                    <circle cx="30" cy="70" r="15" fill="none" stroke="#22d3ee" strokeWidth="1" strokeDasharray="5 5">
                      <animateTransform attributeName="transform" type="rotate" from="0 30 70" to="360 30 70" dur="0.5s" repeatCount="indefinite" />
                    </circle>
                    <circle cx="170" cy="70" r="15" fill="none" stroke="#22d3ee" strokeWidth="1" strokeDasharray="5 5">
                      <animateTransform attributeName="transform" type="rotate" from="0 170 70" to="360 170 70" dur="0.5s" repeatCount="indefinite" />
                    </circle>
                    <circle cx="30" cy="130" r="15" fill="none" stroke="#22d3ee" strokeWidth="1" strokeDasharray="5 5">
                      <animateTransform attributeName="transform" type="rotate" from="0 30 130" to="360 30 130" dur="0.5s" repeatCount="indefinite" />
                    </circle>
                    <circle cx="170" cy="130" r="15" fill="none" stroke="#22d3ee" strokeWidth="1" strokeDasharray="5 5">
                      <animateTransform attributeName="transform" type="rotate" from="0 170 130" to="360 170 130" dur="0.5s" repeatCount="indefinite" />
                    </circle>
                    
                    {/* Camera */}
                    <circle cx="100" cy="110" r="5" fill="#22d3ee" />
                  </motion.svg>
                </div>

                {/* Stats Overlay */}
                <div className="absolute bottom-4 left-4 right-4 flex justify-between">
                  <div className="bg-slate-900/80 backdrop-blur-sm px-4 py-2 rounded-lg border border-slate-700">
                    <p className="text-slate-400 text-xs">Altitude</p>
                    <p className="text-white font-bold">{selectedDrone.altitude}<span className="text-cyan-400 text-sm ml-1">m</span></p>
                  </div>
                  <div className="bg-slate-900/80 backdrop-blur-sm px-4 py-2 rounded-lg border border-slate-700">
                    <p className="text-slate-400 text-xs">Speed</p>
                    <p className="text-white font-bold">{selectedDrone.speed}<span className="text-cyan-400 text-sm ml-1">mph</span></p>
                  </div>
                  <div className="bg-slate-900/80 backdrop-blur-sm px-4 py-2 rounded-lg border border-slate-700">
                    <p className="text-slate-400 text-xs">Status</p>
                    <p className="text-emerald-400 font-bold capitalize">{selectedDrone.status}</p>
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center gap-4 mt-6">
                <Button variant="outline" className="border-slate-700 text-slate-400 hover:text-white">
                  <Pause className="w-4 h-4 mr-2" />
                  Pause
                </Button>
                <Button className="bg-cyan-500 hover:bg-cyan-600">
                  <Play className="w-4 h-4 mr-2" />
                  Start Mission
                </Button>
                <Button variant="outline" className="border-slate-700 text-slate-400 hover:text-white">
                  <RotateCw className="w-4 h-4 mr-2" />
                  Return
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Drone List */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-4"
        >
          {/* Summary Card */}
          <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
            <CardContent className="p-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-slate-800/50 rounded-lg">
                  <p className="text-2xl font-bold text-white">{drones.length}</p>
                  <p className="text-xs text-slate-400">Total Fleet</p>
                </div>
                <div className="text-center p-3 bg-slate-800/50 rounded-lg">
                  <p className="text-2xl font-bold text-emerald-400">{activeDrones}</p>
                  <p className="text-xs text-slate-400">Active</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Drone List */}
          <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-lg">Fleet Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {drones.map((drone) => (
                <div
                  key={drone.id}
                  onClick={() => setSelectedDrone(drone)}
                  className={`p-4 rounded-xl cursor-pointer transition-all ${
                    selectedDrone?.id === drone.id 
                      ? 'bg-indigo-500/20 border border-indigo-500/50' 
                      : 'bg-slate-800/50 hover:bg-slate-800 border border-transparent'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Plane className={`w-4 h-4 ${drone.status === 'active' ? 'text-cyan-400' : 'text-slate-400'}`} />
                      <span className="text-white font-medium">{drone.name}</span>
                    </div>
                    <Badge className={`${statusColors[drone.status]} border text-xs`}>
                      {drone.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Battery className={`w-4 h-4 ${
                      drone.battery > 50 ? 'text-emerald-400' : 
                      drone.battery > 20 ? 'text-amber-400' : 'text-red-400'
                    }`} />
                    <Progress value={drone.battery} className="h-2 flex-1 bg-slate-700" />
                    <span className="text-sm text-slate-400">{drone.battery}%</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-2">{drone.mission}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}