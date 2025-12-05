import React from 'react';
import { motion } from 'framer-motion';
import {
  Camera, AlertTriangle, Users, Car, MapPin, Plane,
  Shield, Activity, Thermometer, Wifi, X
} from 'lucide-react';
import { Button } from '@/components/ui/button';

import { BarChart3 } from 'lucide-react';

const widgetTypes = [
  { type: 'camera_feed', title: 'Camera Feed', icon: Camera, defaultSize: { w: 2, h: 2 } },
  { type: 'incidents', title: 'Incidents', icon: AlertTriangle, defaultSize: { w: 1, h: 2 } },
  { type: 'people_count', title: 'People Count', icon: Users, defaultSize: { w: 1, h: 1 } },
  { type: 'people_chart', title: 'People Chart', icon: BarChart3, defaultSize: { w: 2, h: 2 } },
  { type: 'traffic_index', title: 'Traffic Index', icon: Car, defaultSize: { w: 1, h: 1 } },
  { type: 'traffic_chart', title: 'Traffic Chart', icon: BarChart3, defaultSize: { w: 2, h: 2 } },
  { type: 'cameras_online', title: 'Cameras Online', icon: Camera, defaultSize: { w: 1, h: 1 } },
  { type: 'active_incidents', title: 'Active Incidents', icon: AlertTriangle, defaultSize: { w: 1, h: 1 } },
  { type: 'city_map', title: 'Live City Map', icon: MapPin, defaultSize: { w: 2, h: 2 } },
  { type: 'drone_status', title: 'Drone Status', icon: Plane, defaultSize: { w: 1, h: 1 } },
  { type: 'threat_level', title: 'Threat Level', icon: Shield, defaultSize: { w: 1, h: 1 } },
  { type: 'system_health', title: 'System Health', icon: Activity, defaultSize: { w: 1, h: 1 } },
  { type: 'iot_sensors', title: 'IoT Sensors', icon: Wifi, defaultSize: { w: 1, h: 1 } },
  { type: 'modules', title: 'Modules Grid', icon: Activity, defaultSize: { w: 3, h: 1 } },
];

export { widgetTypes };

export default function WidgetCatalog({ onAddWidget, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 300 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 300 }}
      className="fixed right-0 top-0 h-full w-80 bg-[#0f1629]/95 backdrop-blur-xl border-l border-indigo-500/20 z-50 overflow-y-auto"
    >
      <div className="p-4 border-b border-indigo-500/20 flex items-center justify-between">
        <h3 className="text-white font-semibold">Add Widget</h3>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-5 h-5 text-slate-400" />
        </Button>
      </div>
      <div className="p-4 space-y-2">
        {widgetTypes.map((widget) => (
          <motion.div
            key={widget.type}
            whileHover={{ scale: 1.02 }}
            onClick={() => onAddWidget(widget)}
            className="p-4 bg-slate-800/50 rounded-lg border border-slate-700 hover:border-cyan-500/50 cursor-pointer transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-cyan-500/20">
                <widget.icon className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <p className="text-white font-medium">{widget.title}</p>
                <p className="text-slate-400 text-xs">
                  Size: {widget.defaultSize.w}x{widget.defaultSize.h}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}