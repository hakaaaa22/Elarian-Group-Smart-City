import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, CircleMarker, Polyline } from 'react-leaflet';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Map, Layers, Eye, EyeOff, RefreshCw, Maximize2, Filter,
  Camera, Car, Package, Shield, Droplets, Zap, Radio, Thermometer,
  AlertTriangle, CheckCircle, Clock, MapPin, Navigation, Activity
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// تعريف الطبقات
const MAP_LAYERS = {
  cameras: { id: 'cameras', name: 'الكاميرات', icon: Camera, color: '#8B5CF6', enabled: true },
  vehicles: { id: 'vehicles', name: 'الأسطول', icon: Car, color: '#22C55E', enabled: true },
  iot: { id: 'iot', name: 'أجهزة IoT', icon: Radio, color: '#06B6D4', enabled: true },
  waste: { id: 'waste', name: 'النفايات', icon: Package, color: '#F59E0B', enabled: false },
  traffic: { id: 'traffic', name: 'المرور', icon: Navigation, color: '#EF4444', enabled: false },
  safety: { id: 'safety', name: 'السلامة', icon: Shield, color: '#EC4899', enabled: false },
};

// بيانات الأصول
const mockAssets = [
  // كاميرات
  { id: 'cam-1', type: 'cameras', name: 'كاميرا المدخل الرئيسي', lat: 24.7136, lng: 46.6753, status: 'online', data: { fps: 30, recording: true } },
  { id: 'cam-2', type: 'cameras', name: 'كاميرا موقف السيارات', lat: 24.7156, lng: 46.6773, status: 'warning', data: { fps: 25, recording: true } },
  { id: 'cam-3', type: 'cameras', name: 'كاميرا البوابة الشرقية', lat: 24.7116, lng: 46.6793, status: 'offline', data: { fps: 0, recording: false } },
  { id: 'cam-4', type: 'cameras', name: 'كاميرا منطقة الشحن', lat: 24.7180, lng: 46.6720, status: 'online', data: { fps: 30, recording: true } },
  
  // مركبات
  { id: 'veh-1', type: 'vehicles', name: 'شاحنة نفايات #12', lat: 24.7200, lng: 46.6800, status: 'online', data: { speed: 45, fuel: 78 } },
  { id: 'veh-2', type: 'vehicles', name: 'سيارة صيانة #5', lat: 24.7100, lng: 46.6650, status: 'online', data: { speed: 0, fuel: 92 } },
  { id: 'veh-3', type: 'vehicles', name: 'حافلة نقل #8', lat: 24.7250, lng: 46.6850, status: 'warning', data: { speed: 30, fuel: 25 } },
  
  // أجهزة IoT
  { id: 'iot-1', type: 'iot', name: 'مستشعر حرارة #1', lat: 24.7140, lng: 46.6780, status: 'online', data: { temp: 32, humidity: 45 } },
  { id: 'iot-2', type: 'iot', name: 'مستشعر جودة الهواء', lat: 24.7170, lng: 46.6730, status: 'online', data: { aqi: 52, pm25: 15 } },
  { id: 'iot-3', type: 'iot', name: 'مستشعر ضغط المياه', lat: 24.7190, lng: 46.6770, status: 'critical', data: { pressure: 2.1, flow: 120 } },
  
  // حاويات نفايات
  { id: 'waste-1', type: 'waste', name: 'حاوية A-45', lat: 24.7160, lng: 46.6760, status: 'warning', data: { level: 85 } },
  { id: 'waste-2', type: 'waste', name: 'حاوية B-12', lat: 24.7120, lng: 46.6710, status: 'online', data: { level: 45 } },
  
  // نقاط المرور
  { id: 'traffic-1', type: 'traffic', name: 'تقاطع الملك فهد', lat: 24.7145, lng: 46.6745, status: 'warning', data: { congestion: 75 } },
  { id: 'traffic-2', type: 'traffic', name: 'تقاطع العليا', lat: 24.7185, lng: 46.6795, status: 'online', data: { congestion: 30 } },
  
  // نقاط السلامة
  { id: 'safety-1', type: 'safety', name: 'نقطة إسعاف #1', lat: 24.7130, lng: 46.6740, status: 'online', data: { available: true } },
  { id: 'safety-2', type: 'safety', name: 'مركز إطفاء', lat: 24.7210, lng: 46.6810, status: 'online', data: { available: true } },
];

// مكون تحديث الخريطة
function MapUpdater({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.setView(center, 14);
  }, [center, map]);
  return null;
}

// أيقونات مخصصة
const createCustomIcon = (color, status) => {
  const statusColor = status === 'online' ? '#22C55E' : status === 'warning' ? '#F59E0B' : status === 'critical' ? '#EF4444' : '#64748B';
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      width: 32px; height: 32px; 
      background: ${color}40; 
      border: 3px solid ${statusColor}; 
      border-radius: 50%; 
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 0 10px ${statusColor}50;
      ${status === 'critical' ? 'animation: pulse 1s infinite;' : ''}
    "></div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
};

export default function LiveAssetMap({ height = '500px', showControls = true }) {
  const [layers, setLayers] = useState(MAP_LAYERS);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [isLive, setIsLive] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [showLayerPanel, setShowLayerPanel] = useState(true);
  const center = [24.7136, 46.6753];

  // تحديث البيانات الحية
  useEffect(() => {
    if (!isLive) return;
    const interval = setInterval(() => {
      setLastUpdate(new Date());
    }, 5000);
    return () => clearInterval(interval);
  }, [isLive]);

  const toggleLayer = (layerId) => {
    setLayers(prev => ({
      ...prev,
      [layerId]: { ...prev[layerId], enabled: !prev[layerId].enabled }
    }));
  };

  const visibleAssets = useMemo(() => {
    return mockAssets.filter(asset => layers[asset.type]?.enabled);
  }, [layers]);

  const stats = useMemo(() => {
    const visible = visibleAssets;
    return {
      total: visible.length,
      online: visible.filter(a => a.status === 'online').length,
      warning: visible.filter(a => a.status === 'warning').length,
      critical: visible.filter(a => a.status === 'critical' || a.status === 'offline').length,
    };
  }, [visibleAssets]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return 'green';
      case 'warning': return 'amber';
      case 'critical': case 'offline': return 'red';
      default: return 'slate';
    }
  };

  return (
    <div className="space-y-4" dir="rtl">
      {/* Header */}
      {showControls && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20">
              <Map className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">خريطة الأصول الحية</h3>
              <p className="text-slate-400 text-xs flex items-center gap-2">
                <Clock className="w-3 h-3" />
                آخر تحديث: {lastUpdate.toLocaleTimeString('ar-SA')}
                {isLive && <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/50 rounded-lg">
              <span className="text-slate-400 text-sm">مباشر</span>
              <Switch checked={isLive} onCheckedChange={setIsLive} />
            </div>
            <Button variant="outline" size="icon" className="border-slate-700" onClick={() => setShowLayerPanel(!showLayerPanel)}>
              <Layers className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { label: 'إجمالي الأصول', value: stats.total, color: 'cyan' },
          { label: 'نشط', value: stats.online, color: 'green' },
          { label: 'تحذير', value: stats.warning, color: 'amber' },
          { label: 'حرج', value: stats.critical, color: 'red' },
        ].map((stat, i) => (
          <Card key={i} className={`bg-${stat.color}-500/10 border-${stat.color}-500/30`}>
            <CardContent className="p-2 text-center">
              <p className={`text-xl font-bold text-${stat.color}-400`}>{stat.value}</p>
              <p className="text-slate-400 text-xs">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-4 gap-4">
        {/* Layer Panel */}
        <AnimatePresence>
          {showLayerPanel && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <Card className="bg-slate-800/30 border-slate-700/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-sm flex items-center gap-2">
                    <Layers className="w-4 h-4 text-cyan-400" />
                    الطبقات
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {Object.values(layers).map(layer => {
                    const LayerIcon = layer.icon;
                    const assetCount = mockAssets.filter(a => a.type === layer.id).length;
                    const criticalCount = mockAssets.filter(a => a.type === layer.id && (a.status === 'critical' || a.status === 'offline')).length;
                    
                    return (
                      <div
                        key={layer.id}
                        className={`p-2 rounded-lg cursor-pointer transition-all ${
                          layer.enabled ? 'bg-slate-700/50' : 'bg-slate-800/30'
                        }`}
                        onClick={() => toggleLayer(layer.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-lg" style={{ background: `${layer.color}30` }}>
                              <LayerIcon className="w-4 h-4" style={{ color: layer.color }} />
                            </div>
                            <div>
                              <span className="text-white text-sm">{layer.name}</span>
                              <div className="flex items-center gap-1">
                                <span className="text-slate-500 text-xs">{assetCount} أصل</span>
                                {criticalCount > 0 && (
                                  <Badge className="bg-red-500/20 text-red-400 text-xs h-4 px-1">
                                    {criticalCount}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          {layer.enabled ? (
                            <Eye className="w-4 h-4 text-green-400" />
                          ) : (
                            <EyeOff className="w-4 h-4 text-slate-500" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Map */}
        <div className={showLayerPanel ? 'lg:col-span-3' : 'lg:col-span-4'}>
          <Card className="bg-slate-800/30 border-slate-700/50 overflow-hidden">
            <div style={{ height }}>
              <MapContainer
                center={center}
                zoom={14}
                style={{ height: '100%', width: '100%' }}
                className="rounded-lg"
              >
                <TileLayer
                  url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                />
                <MapUpdater center={center} />

                {visibleAssets.map(asset => {
                  const layer = layers[asset.type];
                  return (
                    <Marker
                      key={asset.id}
                      position={[asset.lat, asset.lng]}
                      icon={createCustomIcon(layer.color, asset.status)}
                      eventHandlers={{
                        click: () => setSelectedAsset(asset)
                      }}
                    >
                      <Popup className="custom-popup">
                        <div className="p-2 min-w-[200px]" dir="rtl">
                          <div className="flex items-center gap-2 mb-2">
                            {React.createElement(layer.icon, { className: 'w-4 h-4', style: { color: layer.color } })}
                            <span className="font-bold text-sm">{asset.name}</span>
                          </div>
                          <div className={`px-2 py-1 rounded text-xs mb-2 ${
                            asset.status === 'online' ? 'bg-green-100 text-green-700' :
                            asset.status === 'warning' ? 'bg-amber-100 text-amber-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {asset.status === 'online' ? 'نشط' : asset.status === 'warning' ? 'تحذير' : 'غير متصل'}
                          </div>
                          {asset.data && (
                            <div className="space-y-1 text-xs">
                              {Object.entries(asset.data).map(([key, value]) => (
                                <div key={key} className="flex justify-between">
                                  <span className="text-gray-500">{key}:</span>
                                  <span className="font-medium">{typeof value === 'boolean' ? (value ? 'نعم' : 'لا') : value}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </Popup>
                    </Marker>
                  );
                })}

                {/* Critical markers with animation */}
                {visibleAssets.filter(a => a.status === 'critical').map(asset => (
                  <CircleMarker
                    key={`critical-${asset.id}`}
                    center={[asset.lat, asset.lng]}
                    radius={20}
                    pathOptions={{ color: '#EF4444', fillColor: '#EF4444', fillOpacity: 0.2, weight: 2 }}
                  />
                ))}
              </MapContainer>
            </div>
          </Card>
        </div>
      </div>

      {/* Selected Asset Details */}
      <AnimatePresence>
        {selectedAsset && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className={`bg-${getStatusColor(selectedAsset.status)}-500/10 border-${getStatusColor(selectedAsset.status)}-500/30`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl" style={{ background: `${layers[selectedAsset.type].color}20` }}>
                      {React.createElement(layers[selectedAsset.type].icon, {
                        className: 'w-6 h-6',
                        style: { color: layers[selectedAsset.type].color }
                      })}
                    </div>
                    <div>
                      <h4 className="text-white font-bold">{selectedAsset.name}</h4>
                      <p className="text-slate-400 text-sm">{layers[selectedAsset.type].name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge className={`bg-${getStatusColor(selectedAsset.status)}-500/20 text-${getStatusColor(selectedAsset.status)}-400`}>
                      {selectedAsset.status === 'online' ? 'نشط' : selectedAsset.status === 'warning' ? 'تحذير' : 'حرج'}
                    </Badge>
                    <div className="grid grid-cols-2 gap-4">
                      {selectedAsset.data && Object.entries(selectedAsset.data).slice(0, 4).map(([key, value]) => (
                        <div key={key} className="text-center">
                          <p className="text-white font-bold">{typeof value === 'boolean' ? (value ? '✓' : '✗') : value}</p>
                          <p className="text-slate-500 text-xs">{key}</p>
                        </div>
                      ))}
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => setSelectedAsset(null)}>
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.7; }
        }
        .leaflet-popup-content-wrapper {
          background: #1e293b;
          color: white;
          border-radius: 12px;
          border: 1px solid #334155;
        }
        .leaflet-popup-tip {
          background: #1e293b;
        }
      `}</style>
    </div>
  );
}