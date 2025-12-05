import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Camera, CheckCircle, XCircle, AlertTriangle, 
  Grid, List, Search, Filter, Activity
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

const cameras = [
  { id: 'CAM-001', name: 'Main Entrance', zone: 'Zone A', status: 'online', health: 98, fps: 30, resolution: '4K' },
  { id: 'CAM-002', name: 'Parking Lot A', zone: 'Zone A', status: 'online', health: 95, fps: 30, resolution: '1080p' },
  { id: 'CAM-003', name: 'Server Room', zone: 'Zone B', status: 'offline', health: 0, fps: 0, resolution: '4K' },
  { id: 'CAM-004', name: 'Lobby', zone: 'Zone A', status: 'online', health: 87, fps: 25, resolution: '1080p' },
  { id: 'CAM-005', name: 'Emergency Exit', zone: 'Zone C', status: 'maintenance', health: 45, fps: 0, resolution: '720p' },
  { id: 'CAM-006', name: 'Warehouse', zone: 'Zone D', status: 'online', health: 92, fps: 30, resolution: '4K' },
  { id: 'CAM-007', name: 'Loading Dock', zone: 'Zone D', status: 'online', health: 88, fps: 25, resolution: '1080p' },
  { id: 'CAM-008', name: 'Rooftop', zone: 'Zone E', status: 'online', health: 76, fps: 20, resolution: '720p' },
];

const statusConfig = {
  online: { icon: CheckCircle, color: 'emerald', label: 'Online' },
  offline: { icon: XCircle, color: 'red', label: 'Offline' },
  maintenance: { icon: AlertTriangle, color: 'amber', label: 'Maintenance' },
};

export default function CameraHealth() {
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const onlineCount = cameras.filter(c => c.status === 'online').length;
  const offlineCount = cameras.filter(c => c.status === 'offline').length;
  const avgHealth = Math.round(cameras.filter(c => c.status === 'online').reduce((sum, c) => sum + c.health, 0) / onlineCount);

  const filteredCameras = cameras.filter(cam => {
    const matchesSearch = cam.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         cam.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || cam.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen p-4 lg:p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl lg:text-3xl font-bold text-white flex items-center gap-3">
          <Camera className="w-8 h-8 text-cyan-400" />
          Camera Health
        </h1>
        <p className="text-slate-400 mt-1">Monitor camera network status and performance</p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Cameras', value: cameras.length, icon: Camera, color: 'cyan' },
          { label: 'Online', value: onlineCount, icon: CheckCircle, color: 'emerald' },
          { label: 'Offline', value: offlineCount, icon: XCircle, color: 'red' },
          { label: 'Avg Health', value: `${avgHealth}%`, icon: Activity, color: 'purple' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-white">{stat.value}</p>
                    <p className="text-xs text-slate-400">{stat.label}</p>
                  </div>
                  <div className={`p-3 rounded-xl bg-${stat.color}-500/20`}>
                    <stat.icon className={`w-5 h-5 text-${stat.color}-400`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search cameras..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-slate-800/50 border-slate-700 text-white"
              />
            </div>
            <Tabs value={statusFilter} onValueChange={setStatusFilter}>
              <TabsList className="bg-slate-800/50 border border-slate-700">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="online">Online</TabsTrigger>
                <TabsTrigger value="offline">Offline</TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="flex items-center gap-2 border border-slate-700 rounded-lg p-1">
              <Button
                variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                size="icon"
                onClick={() => setViewMode('grid')}
                className="h-8 w-8"
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                size="icon"
                onClick={() => setViewMode('list')}
                className="h-8 w-8"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Camera Grid/List */}
      <div className={viewMode === 'grid' ? 'grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4' : 'space-y-3'}>
        {filteredCameras.map((camera, i) => {
          const status = statusConfig[camera.status];
          const StatusIcon = status.icon;

          return (
            <motion.div
              key={camera.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80 hover:border-cyan-500/50 transition-all cursor-pointer">
                <CardContent className={viewMode === 'grid' ? 'p-4' : 'p-4 flex items-center gap-4'}>
                  {viewMode === 'grid' ? (
                    <>
                      {/* Grid View */}
                      <div className="aspect-video bg-slate-900 rounded-lg mb-4 relative overflow-hidden">
                        <img
                          src={`https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=400&h=225&fit=crop`}
                          alt={camera.name}
                          className={`w-full h-full object-cover ${camera.status !== 'online' ? 'opacity-30 grayscale' : 'opacity-70'}`}
                        />
                        <div className="absolute top-2 right-2">
                          <Badge className={`bg-${status.color}-500/20 text-${status.color}-400 border-${status.color}-500/30 border`}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {status.label}
                          </Badge>
                        </div>
                        {camera.status === 'online' && (
                          <div className="absolute bottom-2 left-2 flex items-center gap-1">
                            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                            <span className="text-white text-xs">LIVE</span>
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className="text-white font-medium">{camera.name}</h3>
                        <p className="text-slate-400 text-sm">{camera.id} • {camera.zone}</p>
                      </div>
                      {camera.status === 'online' && (
                        <div className="mt-3">
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="text-slate-400">Health</span>
                            <span className="text-white">{camera.health}%</span>
                          </div>
                          <Progress value={camera.health} className="h-1.5 bg-slate-700" />
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      {/* List View */}
                      <div className="w-20 h-14 bg-slate-900 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={`https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=200&h=112&fit=crop`}
                          alt={camera.name}
                          className={`w-full h-full object-cover ${camera.status !== 'online' ? 'opacity-30 grayscale' : ''}`}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-medium">{camera.name}</h3>
                        <p className="text-slate-400 text-sm">{camera.id} • {camera.zone}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        {camera.status === 'online' && (
                          <div className="w-24">
                            <Progress value={camera.health} className="h-1.5 bg-slate-700" />
                            <p className="text-xs text-slate-400 mt-1">{camera.health}% health</p>
                          </div>
                        )}
                        <Badge className={`bg-${status.color}-500/20 text-${status.color}-400 border-${status.color}-500/30 border`}>
                          {status.label}
                        </Badge>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}