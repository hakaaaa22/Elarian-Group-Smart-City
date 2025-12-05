import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Settings, Camera, AlertTriangle, Car } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

const cameraOptions = [
  { id: 'cam-001', name: 'Entrance Gate A', zone: 'Zone A' },
  { id: 'cam-002', name: 'Parking Lot B', zone: 'Zone B' },
  { id: 'cam-003', name: 'Building Lobby', zone: 'Zone A' },
  { id: 'cam-004', name: 'Server Room', zone: 'Zone C' },
  { id: 'cam-005', name: 'Emergency Exit', zone: 'Zone B' },
  { id: 'cam-006', name: 'Rooftop', zone: 'Zone D' },
];

const qualityOptions = [
  { value: 'low', label: 'Low (480p)' },
  { value: 'medium', label: 'Medium (720p)' },
  { value: 'high', label: 'High (1080p)' },
  { value: 'ultra', label: 'Ultra (4K)' },
];

const incidentTypes = ['Security', 'Fire', 'Access', 'System', 'Environmental'];
const severityLevels = ['Critical', 'High', 'Medium', 'Low'];

const trafficMetrics = [
  { id: 'speed', label: 'Average Speed' },
  { id: 'volume', label: 'Traffic Volume' },
  { id: 'index', label: 'Congestion Index' },
  { id: 'incidents', label: 'Traffic Incidents' },
];

export default function WidgetConfigModal({ widget, onSave, onClose }) {
  const [config, setConfig] = useState(widget.config || getDefaultConfig(widget.type));

  function getDefaultConfig(type) {
    switch (type) {
      case 'camera_feed':
        return { cameraId: 'cam-001', quality: 'high', showOverlay: true };
      case 'incidents':
        return { types: incidentTypes, severities: severityLevels, showResolved: false };
      case 'traffic_chart':
        return { metrics: ['index', 'volume'], showComparison: true };
      default:
        return {};
    }
  }

  const handleSave = () => {
    onSave(widget.id, config);
    onClose();
  };

  const renderCameraConfig = () => (
    <div className="space-y-4">
      <div>
        <Label className="text-white mb-2 block">Select Camera</Label>
        <Select
          value={config.cameraId}
          onValueChange={(value) => setConfig({ ...config, cameraId: value })}
        >
          <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
            <SelectValue placeholder="Select camera" />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-700">
            {cameraOptions.map((cam) => (
              <SelectItem key={cam.id} value={cam.id}>
                {cam.name} ({cam.zone})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="text-white mb-2 block">Stream Quality</Label>
        <Select
          value={config.quality}
          onValueChange={(value) => setConfig({ ...config, quality: value })}
        >
          <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
            <SelectValue placeholder="Select quality" />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-700">
            {qualityOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center justify-between">
        <Label className="text-white">Show AI Detection Overlay</Label>
        <Switch
          checked={config.showOverlay}
          onCheckedChange={(checked) => setConfig({ ...config, showOverlay: checked })}
        />
      </div>
    </div>
  );

  const renderIncidentsConfig = () => (
    <div className="space-y-4">
      <div>
        <Label className="text-white mb-3 block">Incident Types</Label>
        <div className="grid grid-cols-2 gap-2">
          {incidentTypes.map((type) => (
            <div key={type} className="flex items-center gap-2">
              <Checkbox
                id={`type-${type}`}
                checked={config.types?.includes(type)}
                onCheckedChange={(checked) => {
                  const types = checked
                    ? [...(config.types || []), type]
                    : (config.types || []).filter((t) => t !== type);
                  setConfig({ ...config, types });
                }}
              />
              <label htmlFor={`type-${type}`} className="text-sm text-slate-300">
                {type}
              </label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <Label className="text-white mb-3 block">Severity Levels</Label>
        <div className="grid grid-cols-2 gap-2">
          {severityLevels.map((sev) => (
            <div key={sev} className="flex items-center gap-2">
              <Checkbox
                id={`sev-${sev}`}
                checked={config.severities?.includes(sev)}
                onCheckedChange={(checked) => {
                  const severities = checked
                    ? [...(config.severities || []), sev]
                    : (config.severities || []).filter((s) => s !== sev);
                  setConfig({ ...config, severities });
                }}
              />
              <label htmlFor={`sev-${sev}`} className="text-sm text-slate-300">
                {sev}
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Label className="text-white">Show Resolved Incidents</Label>
        <Switch
          checked={config.showResolved}
          onCheckedChange={(checked) => setConfig({ ...config, showResolved: checked })}
        />
      </div>
    </div>
  );

  const renderTrafficConfig = () => (
    <div className="space-y-4">
      <div>
        <Label className="text-white mb-3 block">Display Metrics</Label>
        <div className="space-y-2">
          {trafficMetrics.map((metric) => (
            <div key={metric.id} className="flex items-center gap-2">
              <Checkbox
                id={`metric-${metric.id}`}
                checked={config.metrics?.includes(metric.id)}
                onCheckedChange={(checked) => {
                  const metrics = checked
                    ? [...(config.metrics || []), metric.id]
                    : (config.metrics || []).filter((m) => m !== metric.id);
                  setConfig({ ...config, metrics });
                }}
              />
              <label htmlFor={`metric-${metric.id}`} className="text-sm text-slate-300">
                {metric.label}
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Label className="text-white">Show Previous Period Comparison</Label>
        <Switch
          checked={config.showComparison}
          onCheckedChange={(checked) => setConfig({ ...config, showComparison: checked })}
        />
      </div>
    </div>
  );

  const getWidgetIcon = () => {
    switch (widget.type) {
      case 'camera_feed': return <Camera className="w-5 h-5 text-cyan-400" />;
      case 'incidents': return <AlertTriangle className="w-5 h-5 text-amber-400" />;
      case 'traffic_chart': return <Car className="w-5 h-5 text-green-400" />;
      default: return <Settings className="w-5 h-5 text-slate-400" />;
    }
  };

  const getWidgetTitle = () => {
    switch (widget.type) {
      case 'camera_feed': return 'Camera Feed Settings';
      case 'incidents': return 'Incidents Widget Settings';
      case 'traffic_chart': return 'Traffic Chart Settings';
      default: return 'Widget Settings';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-[#0f1629] border border-indigo-500/20 rounded-xl w-full max-w-md overflow-hidden"
      >
        <div className="p-4 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getWidgetIcon()}
            <h3 className="text-white font-semibold">{getWidgetTitle()}</h3>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5 text-slate-400" />
          </Button>
        </div>

        <div className="p-4">
          {widget.type === 'camera_feed' && renderCameraConfig()}
          {widget.type === 'incidents' && renderIncidentsConfig()}
          {widget.type === 'traffic_chart' && renderTrafficConfig()}
        </div>

        <div className="p-4 border-t border-slate-700 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} className="border-slate-600 text-slate-400">
            Cancel
          </Button>
          <Button onClick={handleSave} className="bg-cyan-600 hover:bg-cyan-700">
            Save Changes
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}