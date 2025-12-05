import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import {
  Camera, AlertTriangle, Users, Car, MapPin, Plane,
  Shield, Activity, Wifi, GripVertical, X, Maximize2, Minimize2, ChevronRight, Settings
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import ChartWidget from './ChartWidget';
import LiveMapWidget from './LiveMapWidget';

const incidentsList = [
  { type: 'Critical', count: 7, description: 'Security breaches detected' },
  { type: 'High', count: 12, description: 'Unauthorized access attempts' },
  { type: 'Medium', count: 23, description: 'System anomalies' },
  { type: 'Low', count: 45, description: 'Routine alerts' },
];

const modules = [
  { name: 'People Analytics', icon: Users, desc: 'Crowd monitoring', page: 'Modules' },
  { name: 'Industrial Security', icon: Shield, desc: 'Vulnerability assessments', page: 'Modules' },
  { name: 'Threat Detection', icon: AlertTriangle, desc: 'Real-time threats', page: 'CybersecurityMap' },
  { name: 'Traffic Analysis', icon: Car, desc: 'Flow optimization', page: 'TrafficIntelligence' },
  { name: 'Smart City', icon: MapPin, desc: 'Infrastructure monitoring', page: 'SmartCityMap' },
  { name: 'Drone Fusion', icon: Plane, desc: 'Aerial surveillance', page: 'DroneFusion' },
];

const cameraData = {
  'cam-001': { name: 'Entrance Gate A', image: 'https://images.unsplash.com/photo-1517732306149-e8f829eb588a?w=800&h=450&fit=crop' },
  'cam-002': { name: 'Parking Lot B', image: 'https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=800&h=450&fit=crop' },
  'cam-003': { name: 'Building Lobby', image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=450&fit=crop' },
  'cam-004': { name: 'Server Room', image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&h=450&fit=crop' },
  'cam-005': { name: 'Emergency Exit', image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=450&fit=crop' },
  'cam-006': { name: 'Rooftop', image: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&h=450&fit=crop' },
};

const allIncidents = [
  { type: 'Critical', category: 'Security', count: 7 },
  { type: 'High', category: 'Fire', count: 3 },
  { type: 'High', category: 'Access', count: 9 },
  { type: 'Medium', category: 'System', count: 15 },
  { type: 'Medium', category: 'Environmental', count: 8 },
  { type: 'Low', category: 'Security', count: 12 },
  { type: 'Low', category: 'System', count: 33 },
];

export default function DashboardWidget({ 
  widget, 
  isEditMode, 
  onRemove, 
  onResize,
  onConfigure,
  dragHandleProps 
}) {
  const config = widget.config || {};
  const hasConfig = ['camera_feed', 'incidents', 'traffic_chart'].includes(widget.type);
  const renderWidgetContent = () => {
    switch (widget.type) {
      case 'cameras_online':
        return (
          <div className="flex items-center justify-between h-full">
            <div>
              <p className="text-3xl lg:text-4xl font-bold text-white">472</p>
              <p className="text-xs lg:text-sm text-slate-400 mt-1">Cameras Online</p>
            </div>
            <div className="p-3 rounded-xl bg-cyan-500/20">
              <Camera className="w-6 h-6 text-cyan-400" />
            </div>
          </div>
        );

      case 'active_incidents':
        return (
          <div className="flex items-center justify-between h-full">
            <div>
              <p className="text-3xl lg:text-4xl font-bold text-white">16</p>
              <p className="text-xs lg:text-sm text-slate-400 mt-1">Active Incidents</p>
            </div>
            <div className="p-3 rounded-xl bg-red-500/20">
              <AlertTriangle className="w-6 h-6 text-red-400" />
            </div>
          </div>
        );

      case 'people_count':
        return (
          <div className="flex items-center justify-between h-full">
            <div>
              <p className="text-3xl lg:text-4xl font-bold text-white">1,308</p>
              <p className="text-xs lg:text-sm text-slate-400 mt-1">People Count</p>
            </div>
            <div className="p-3 rounded-xl bg-purple-500/20">
              <Users className="w-6 h-6 text-purple-400" />
            </div>
          </div>
        );

      case 'people_chart':
        return <ChartWidget type="people" title="People Count" icon={Users} color="purple" />;

      case 'traffic_chart':
        return <ChartWidget type="traffic" title="Traffic Chart" icon={Car} color="green" config={config} />;

      case 'traffic_index':
        return (
          <div className="flex items-center justify-between h-full">
            <div>
              <p className="text-3xl lg:text-4xl font-bold text-white">2.5</p>
              <p className="text-xs lg:text-sm text-slate-400 mt-1">Traffic Index</p>
            </div>
            <div className="p-3 rounded-xl bg-green-500/20">
              <Car className="w-6 h-6 text-green-400" />
            </div>
          </div>
        );

      case 'drone_status':
        return (
          <div className="flex items-center justify-between h-full">
            <div>
              <p className="text-3xl lg:text-4xl font-bold text-white">8</p>
              <p className="text-xs lg:text-sm text-slate-400 mt-1">Active Drones</p>
            </div>
            <div className="p-3 rounded-xl bg-purple-500/20">
              <Plane className="w-6 h-6 text-purple-400" />
            </div>
          </div>
        );

      case 'threat_level':
        return (
          <div className="flex items-center justify-between h-full">
            <div>
              <p className="text-3xl lg:text-4xl font-bold text-amber-400">Medium</p>
              <p className="text-xs lg:text-sm text-slate-400 mt-1">Threat Level</p>
            </div>
            <div className="p-3 rounded-xl bg-amber-500/20">
              <Shield className="w-6 h-6 text-amber-400" />
            </div>
          </div>
        );

      case 'system_health':
        return (
          <div className="flex items-center justify-between h-full">
            <div>
              <p className="text-3xl lg:text-4xl font-bold text-green-400">98%</p>
              <p className="text-xs lg:text-sm text-slate-400 mt-1">System Health</p>
            </div>
            <div className="p-3 rounded-xl bg-green-500/20">
              <Activity className="w-6 h-6 text-green-400" />
            </div>
          </div>
        );

      case 'iot_sensors':
        return (
          <div className="flex items-center justify-between h-full">
            <div>
              <p className="text-3xl lg:text-4xl font-bold text-white">234</p>
              <p className="text-xs lg:text-sm text-slate-400 mt-1">IoT Sensors</p>
            </div>
            <div className="p-3 rounded-xl bg-blue-500/20">
              <Wifi className="w-6 h-6 text-blue-400" />
            </div>
          </div>
        );

      case 'camera_feed': {
        const camId = config.cameraId || 'cam-001';
        const cam = cameraData[camId] || cameraData['cam-001'];
        const quality = config.quality || 'high';
        const showOverlay = config.showOverlay !== false;
        return (
          <div className="h-full flex flex-col">
            <div className="flex items-center gap-2 mb-2">
              <Camera className="w-5 h-5 text-cyan-400" />
              <span className="text-white font-medium truncate">{cam.name}</span>
              <Badge className="ml-auto bg-red-500/20 text-red-400 border-red-500/30">LIVE</Badge>
              <Badge variant="outline" className="text-slate-400 border-slate-600 text-xs">{quality.toUpperCase()}</Badge>
            </div>
            <div className="relative flex-1 min-h-[150px] bg-slate-900 rounded-lg overflow-hidden">
              <img
                src={cam.image}
                alt={cam.name}
                className="w-full h-full object-cover opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0f1629] via-transparent to-transparent" />
              {showOverlay && (
                <>
                  <div className="absolute top-2 left-2 px-2 py-1 bg-cyan-500/20 border border-cyan-500/50 rounded text-xs">
                    <span className="text-cyan-400">🔍 PERSON DETECTED</span>
                  </div>
                  <div className="absolute bottom-2 left-2 flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-green-400 text-xs">AI Active</span>
                  </div>
                </>
              )}
            </div>
          </div>
        );
      }

      case 'incidents': {
        const filterTypes = config.types || ['Security', 'Fire', 'Access', 'System', 'Environmental'];
        const filterSeverities = config.severities || ['Critical', 'High', 'Medium', 'Low'];
        const filtered = allIncidents.filter(inc => 
          filterTypes.includes(inc.category) && filterSeverities.includes(inc.type)
        );
        const grouped = filtered.reduce((acc, inc) => {
          acc[inc.type] = (acc[inc.type] || 0) + inc.count;
          return acc;
        }, {});
        const displayList = Object.entries(grouped).map(([type, count]) => ({ type, count }));
        
        return (
          <div className="h-full flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                <span className="text-white font-medium">Incidents</span>
              </div>
              <Link to={createPageUrl('IncidentCenter')}>
                <ChevronRight className="w-5 h-5 text-slate-400 hover:text-cyan-400" />
              </Link>
            </div>
            <div className="flex-1 space-y-2 overflow-auto">
              {displayList.length === 0 ? (
                <div className="text-slate-400 text-sm text-center py-4">No incidents match filters</div>
              ) : (
                displayList.map((incident) => (
                  <div key={incident.type} className="flex items-center justify-between p-2 rounded-lg bg-slate-800/50">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        incident.type === 'Critical' ? 'bg-red-500' :
                        incident.type === 'High' ? 'bg-orange-500' :
                        incident.type === 'Medium' ? 'bg-yellow-500' : 'bg-green-500'
                      }`} />
                      <span className="text-white text-sm">{incident.type}</span>
                    </div>
                    <span className="text-white font-bold">{incident.count}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        );
      }

      case 'city_map':
        return <LiveMapWidget compact={widget.w < 3} />;

      case 'modules':
        return (
          <div className="h-full">
            <div className="flex items-center gap-2 mb-3">
              <Activity className="w-5 h-5 text-cyan-400" />
              <span className="text-white font-medium">Modules</span>
            </div>
            <div className="grid grid-cols-3 lg:grid-cols-6 gap-2">
              {modules.map((module) => (
                <Link key={module.name} to={createPageUrl(module.page)}>
                  <div className="p-2 rounded-lg bg-slate-800/50 hover:bg-slate-800 border border-slate-700 hover:border-cyan-500/50 transition-all cursor-pointer text-center">
                    <module.icon className="w-4 h-4 text-cyan-400 mx-auto mb-1" />
                    <p className="text-white text-xs truncate">{module.name}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        );

      default:
        return (
          <div className="flex items-center justify-center h-full text-slate-400">
            Widget: {widget.type}
          </div>
        );
    }
  };

  return (
    <Card className="glass-card glow-border border-indigo-500/20 bg-[#0f1629]/80 h-full relative group">
      {isEditMode && (
        <div className="absolute top-2 right-2 z-10 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {hasConfig && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 bg-slate-800/80 hover:bg-slate-700"
              onClick={() => onConfigure(widget)}
            >
              <Settings className="w-3 h-3 text-cyan-400" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 bg-slate-800/80 hover:bg-slate-700"
            onClick={() => onResize(widget.id, 'increase')}
          >
            <Maximize2 className="w-3 h-3 text-slate-400" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 bg-slate-800/80 hover:bg-slate-700"
            onClick={() => onResize(widget.id, 'decrease')}
          >
            <Minimize2 className="w-3 h-3 text-slate-400" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 bg-red-500/20 hover:bg-red-500/40"
            onClick={() => onRemove(widget.id)}
          >
            <X className="w-3 h-3 text-red-400" />
          </Button>
        </div>
      )}
      {isEditMode && (
        <div 
          {...dragHandleProps}
          className="absolute top-2 left-2 z-10 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <GripVertical className="w-5 h-5 text-slate-400" />
        </div>
      )}
      <CardContent className="p-4 h-full">
        {renderWidgetContent()}
      </CardContent>
    </Card>
  );
}