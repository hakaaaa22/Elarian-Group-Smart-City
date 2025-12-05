import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle, Polygon, useMap } from 'react-leaflet';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Car, MapPin, Navigation, AlertTriangle, Shield, Route, Clock,
  Play, Pause, ChevronLeft, ChevronRight, Plus, Trash2, Edit,
  Eye, EyeOff, Layers, Target, Zap, History
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix leaflet icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom vehicle icons
const createVehicleIcon = (status, type) => {
  const colors = {
    moving: '#10b981',
    parked: '#06b6d4',
    alert: '#ef4444',
    offline: '#64748b',
    idle: '#f59e0b',
  };
  const color = colors[status] || colors.offline;
  
  return L.divIcon({
    className: 'custom-vehicle-marker',
    html: `
      <div style="
        background: ${color};
        width: 36px;
        height: 36px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 10px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
      ">
        ${type === 'patrol_car' ? '🚔' : type === 'ambulance' ? '🚑' : type === 'bus' ? '🚌' : type === 'truck' ? '🚛' : '🚗'}
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });
};

// Geofence zones
const defaultGeofences = [
  {
    id: 'zone-1',
    name: 'المنطقة الصناعية',
    type: 'restricted',
    color: '#ef4444',
    coordinates: [
      [24.72, 46.66],
      [24.72, 46.68],
      [24.74, 46.68],
      [24.74, 46.66],
    ],
    alerts: { enter: true, exit: true }
  },
  {
    id: 'zone-2',
    name: 'منطقة الصيانة',
    type: 'priority',
    color: '#f59e0b',
    coordinates: [
      [24.70, 46.68],
      [24.70, 46.70],
      [24.72, 46.70],
      [24.72, 46.68],
    ],
    alerts: { enter: false, exit: true }
  },
  {
    id: 'zone-3',
    name: 'المقر الرئيسي',
    type: 'safe',
    color: '#10b981',
    center: [24.7136, 46.6753],
    radius: 500,
    alerts: { enter: true, exit: true }
  }
];

// Historical route data
const generateHistoricalRoute = (baseCoords, points = 20) => {
  const route = [];
  let lat = baseCoords[0];
  let lng = baseCoords[1];
  
  for (let i = 0; i < points; i++) {
    lat += (Math.random() - 0.5) * 0.005;
    lng += (Math.random() - 0.5) * 0.005;
    route.push({
      position: [lat, lng],
      timestamp: new Date(Date.now() - (points - i) * 300000).toISOString(),
      speed: Math.floor(Math.random() * 80) + 20
    });
  }
  return route;
};

// Map center controller
function MapController({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, zoom || 13, { duration: 1 });
    }
  }, [center, zoom, map]);
  return null;
}

export default function FleetMap({ vehicles, selectedVehicle, onSelectVehicle }) {
  const [mapCenter, setMapCenter] = useState([24.7136, 46.6753]);
  const [mapZoom, setMapZoom] = useState(12);
  const [showGeofences, setShowGeofences] = useState(true);
  const [showRoutes, setShowRoutes] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [geofences, setGeofences] = useState(defaultGeofences);
  const [showGeofenceDialog, setShowGeofenceDialog] = useState(false);
  const [newGeofence, setNewGeofence] = useState({ name: '', type: 'restricted' });
  const [showLayers, setShowLayers] = useState(false);
  const [trackingVehicle, setTrackingVehicle] = useState(null);
  const [historicalRoute, setHistoricalRoute] = useState(null);
  const [playingRoute, setPlayingRoute] = useState(false);
  const [routeIndex, setRouteIndex] = useState(0);

  // Track selected vehicle
  useEffect(() => {
    if (trackingVehicle) {
      const vehicle = vehicles.find(v => v.id === trackingVehicle);
      if (vehicle?.coordinates) {
        setMapCenter([vehicle.coordinates.lat, vehicle.coordinates.lng]);
      }
    }
  }, [trackingVehicle, vehicles]);

  // Play historical route
  useEffect(() => {
    if (playingRoute && historicalRoute) {
      const interval = setInterval(() => {
        setRouteIndex(prev => {
          if (prev >= historicalRoute.length - 1) {
            setPlayingRoute(false);
            return 0;
          }
          return prev + 1;
        });
      }, 500);
      return () => clearInterval(interval);
    }
  }, [playingRoute, historicalRoute]);

  const handleShowHistory = (vehicle) => {
    const route = generateHistoricalRoute([vehicle.coordinates.lat, vehicle.coordinates.lng]);
    setHistoricalRoute(route);
    setSelectedRoute(vehicle.id);
    setRouteIndex(0);
  };

  const focusVehicle = (vehicle) => {
    if (vehicle.coordinates) {
      setMapCenter([vehicle.coordinates.lat, vehicle.coordinates.lng]);
      setMapZoom(15);
      onSelectVehicle(vehicle);
    }
  };

  return (
    <div className="relative h-[600px] rounded-xl overflow-hidden border border-indigo-500/20">
      {/* Map Controls */}
      <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
        <Card className="bg-slate-900/95 backdrop-blur border-slate-700">
          <CardContent className="p-2 space-y-2">
            <Button
              size="sm"
              variant={showLayers ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => setShowLayers(!showLayers)}
            >
              <Layers className="w-4 h-4 ml-2" />
              الطبقات
            </Button>
            
            <AnimatePresence>
              {showLayers && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2 pt-2 border-t border-slate-700"
                >
                  <div className="flex items-center justify-between">
                    <Label className="text-xs text-slate-400">المناطق الجغرافية</Label>
                    <Switch checked={showGeofences} onCheckedChange={setShowGeofences} />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-xs text-slate-400">المسارات</Label>
                    <Switch checked={showRoutes} onCheckedChange={setShowRoutes} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>

        <Button
          size="sm"
          className="bg-cyan-600 hover:bg-cyan-700"
          onClick={() => setShowGeofenceDialog(true)}
        >
          <Plus className="w-4 h-4 ml-1" />
          منطقة جديدة
        </Button>
      </div>

      {/* Vehicle List Panel */}
      <div className="absolute top-4 left-4 z-[1000] w-64">
        <Card className="bg-slate-900/95 backdrop-blur border-slate-700 max-h-[400px] overflow-hidden">
          <CardHeader className="py-2 px-3 border-b border-slate-700">
            <CardTitle className="text-sm text-white">المركبات ({vehicles.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-2 max-h-[340px] overflow-y-auto">
            <div className="space-y-1">
              {vehicles.map(vehicle => (
                <div
                  key={vehicle.id}
                  className={`p-2 rounded-lg cursor-pointer transition-all ${
                    selectedVehicle?.id === vehicle.id 
                      ? 'bg-cyan-500/20 border border-cyan-500/50' 
                      : 'hover:bg-slate-800'
                  }`}
                  onClick={() => focusVehicle(vehicle)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{vehicle.type === 'patrol_car' ? '🚔' : vehicle.type === 'ambulance' ? '🚑' : '🚗'}</span>
                      <div>
                        <p className="text-white text-xs font-medium">{vehicle.plate}</p>
                        <p className="text-slate-400 text-[10px]">{vehicle.driver}</p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6"
                        onClick={(e) => {
                          e.stopPropagation();
                          setTrackingVehicle(trackingVehicle === vehicle.id ? null : vehicle.id);
                        }}
                      >
                        <Target className={`w-3 h-3 ${trackingVehicle === vehicle.id ? 'text-cyan-400' : 'text-slate-400'}`} />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleShowHistory(vehicle);
                        }}
                      >
                        <History className="w-3 h-3 text-slate-400" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Historical Route Controls */}
      {historicalRoute && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[1000]">
          <Card className="bg-slate-900/95 backdrop-blur border-slate-700">
            <CardContent className="p-3 flex items-center gap-3">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setHistoricalRoute(null);
                  setSelectedRoute(null);
                }}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setRouteIndex(Math.max(0, routeIndex - 1))}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                onClick={() => setPlayingRoute(!playingRoute)}
                className={playingRoute ? 'bg-red-600' : 'bg-green-600'}
              >
                {playingRoute ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setRouteIndex(Math.min(historicalRoute.length - 1, routeIndex + 1))}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <div className="text-xs text-white">
                {routeIndex + 1} / {historicalRoute.length}
              </div>
              {historicalRoute[routeIndex] && (
                <Badge className="bg-cyan-500/20 text-cyan-400">
                  {historicalRoute[routeIndex].speed} كم/س
                </Badge>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Geofence Legend */}
      {showGeofences && (
        <div className="absolute bottom-4 right-4 z-[1000]">
          <Card className="bg-slate-900/95 backdrop-blur border-slate-700">
            <CardContent className="p-2">
              <p className="text-xs text-slate-400 mb-2">أنواع المناطق</p>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-red-500" />
                  <span className="text-xs text-white">منطقة محظورة</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-amber-500" />
                  <span className="text-xs text-white">منطقة أولوية</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-green-500" />
                  <span className="text-xs text-white">منطقة آمنة</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Map */}
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        className="h-full w-full"
        style={{ background: '#0a0e1a' }}
      >
        <MapController center={mapCenter} zoom={mapZoom} />
        
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; OpenStreetMap'
        />

        {/* Geofences */}
        {showGeofences && geofences.map(zone => (
          zone.radius ? (
            <Circle
              key={zone.id}
              center={zone.center}
              radius={zone.radius}
              pathOptions={{
                color: zone.color,
                fillColor: zone.color,
                fillOpacity: 0.2,
                weight: 2
              }}
            >
              <Popup>
                <div className="text-center p-2">
                  <p className="font-bold">{zone.name}</p>
                  <p className="text-sm text-gray-600">نصف القطر: {zone.radius}م</p>
                  <div className="flex gap-2 mt-2 justify-center">
                    {zone.alerts.enter && <Badge className="bg-green-100 text-green-800 text-xs">تنبيه دخول</Badge>}
                    {zone.alerts.exit && <Badge className="bg-red-100 text-red-800 text-xs">تنبيه خروج</Badge>}
                  </div>
                </div>
              </Popup>
            </Circle>
          ) : (
            <Polygon
              key={zone.id}
              positions={zone.coordinates}
              pathOptions={{
                color: zone.color,
                fillColor: zone.color,
                fillOpacity: 0.2,
                weight: 2
              }}
            >
              <Popup>
                <div className="text-center p-2">
                  <p className="font-bold">{zone.name}</p>
                  <div className="flex gap-2 mt-2 justify-center">
                    {zone.alerts.enter && <Badge className="bg-green-100 text-green-800 text-xs">تنبيه دخول</Badge>}
                    {zone.alerts.exit && <Badge className="bg-red-100 text-red-800 text-xs">تنبيه خروج</Badge>}
                  </div>
                </div>
              </Popup>
            </Polygon>
          )
        ))}

        {/* Historical Route */}
        {historicalRoute && (
          <>
            <Polyline
              positions={historicalRoute.map(p => p.position)}
              pathOptions={{ color: '#06b6d4', weight: 3, opacity: 0.7 }}
            />
            {historicalRoute[routeIndex] && (
              <Marker
                position={historicalRoute[routeIndex].position}
                icon={L.divIcon({
                  className: 'route-marker',
                  html: `<div style="background: #06b6d4; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px #06b6d4;"></div>`,
                  iconSize: [16, 16],
                  iconAnchor: [8, 8],
                })}
              />
            )}
          </>
        )}

        {/* Vehicle Markers */}
        {vehicles.map(vehicle => vehicle.coordinates && (
          <Marker
            key={vehicle.id}
            position={[vehicle.coordinates.lat, vehicle.coordinates.lng]}
            icon={createVehicleIcon(vehicle.status, vehicle.type)}
            eventHandlers={{
              click: () => onSelectVehicle(vehicle)
            }}
          >
            <Popup>
              <div className="p-2 min-w-[200px]" dir="rtl">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{vehicle.type === 'patrol_car' ? '🚔' : '🚗'}</span>
                  <div>
                    <p className="font-bold">{vehicle.plate}</p>
                    <p className="text-sm text-gray-600">{vehicle.driver}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>السرعة: <strong>{vehicle.speed} كم/س</strong></div>
                  <div>الوقود: <strong>{vehicle.fuel}%</strong></div>
                  <div>المنطقة: <strong>{vehicle.zone}</strong></div>
                  <div>الحالة: <strong>{vehicle.status}</strong></div>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Add Geofence Dialog */}
      <Dialog open={showGeofenceDialog} onOpenChange={setShowGeofenceDialog}>
        <DialogContent className="bg-slate-900 border-slate-700" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-white">إضافة منطقة جغرافية جديدة</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-slate-300">اسم المنطقة</Label>
              <Input
                value={newGeofence.name}
                onChange={(e) => setNewGeofence({ ...newGeofence, name: e.target.value })}
                className="bg-slate-800 border-slate-700 text-white mt-1"
                placeholder="مثال: منطقة التحميل"
              />
            </div>
            <div>
              <Label className="text-slate-300">نوع المنطقة</Label>
              <Select
                value={newGeofence.type}
                onValueChange={(v) => setNewGeofence({ ...newGeofence, type: v })}
              >
                <SelectTrigger className="bg-slate-800 border-slate-700 text-white mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="restricted">محظورة (أحمر)</SelectItem>
                  <SelectItem value="priority">أولوية (برتقالي)</SelectItem>
                  <SelectItem value="safe">آمنة (أخضر)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Switch id="enter-alert" />
                <Label htmlFor="enter-alert" className="text-slate-300">تنبيه عند الدخول</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch id="exit-alert" />
                <Label htmlFor="exit-alert" className="text-slate-300">تنبيه عند الخروج</Label>
              </div>
            </div>
            <p className="text-slate-400 text-sm">
              * انقر على الخريطة لتحديد حدود المنطقة
            </p>
            <Button className="w-full bg-cyan-600 hover:bg-cyan-700">
              حفظ المنطقة
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}