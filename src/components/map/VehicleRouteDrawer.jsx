import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Car, MapPin, Navigation, Play, Pause, RotateCcw, Clock, Route,
  ChevronRight, Eye, Trash2, Plus
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// بيانات المركبات
const vehiclesData = [
  { id: 'VEH-001', name: 'سيارة الدورية 1', driver: 'أحمد محمد', status: 'moving', speed: 45 },
  { id: 'VEH-002', name: 'شاحنة النفايات 3', driver: 'خالد العلي', status: 'moving', speed: 30 },
  { id: 'VEH-003', name: 'سيارة الصيانة 2', driver: 'سعد الدوسري', status: 'stopped', speed: 0 },
];

// المسارات المحفوظة
const savedRoutes = [
  {
    id: 'route-1',
    name: 'مسار الدورية الصباحية',
    vehicle: 'VEH-001',
    points: [
      { lat: 24.7136, lng: 46.6753, name: 'المقر الرئيسي' },
      { lat: 24.7150, lng: 46.6780, name: 'نقطة التفتيش 1' },
      { lat: 24.7180, lng: 46.6800, name: 'المنطقة التجارية' },
      { lat: 24.7200, lng: 46.6750, name: 'الحديقة المركزية' },
    ],
    distance: '12.5 كم',
    duration: '45 دقيقة',
    status: 'active'
  },
  {
    id: 'route-2',
    name: 'مسار جمع النفايات A',
    vehicle: 'VEH-002',
    points: [
      { lat: 24.7100, lng: 46.6700, name: 'المحطة' },
      { lat: 24.7120, lng: 46.6720, name: 'الحي السكني' },
      { lat: 24.7140, lng: 46.6760, name: 'الشارع الرئيسي' },
      { lat: 24.7160, lng: 46.6790, name: 'المجمع التجاري' },
    ],
    distance: '8.3 كم',
    duration: '60 دقيقة',
    status: 'active'
  }
];

export default function VehicleRouteDrawer({ onRouteSelect, onDrawRoute }) {
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingPoints, setDrawingPoints] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [playbackActive, setPlaybackActive] = useState(false);

  const startDrawing = () => {
    setIsDrawing(true);
    setDrawingPoints([]);
    onDrawRoute?.({ action: 'start' });
  };

  const finishDrawing = () => {
    setIsDrawing(false);
    onDrawRoute?.({ action: 'finish', points: drawingPoints });
  };

  const cancelDrawing = () => {
    setIsDrawing(false);
    setDrawingPoints([]);
    onDrawRoute?.({ action: 'cancel' });
  };

  const togglePlayback = () => {
    setPlaybackActive(!playbackActive);
  };

  return (
    <div className="space-y-4" dir="rtl">
      {/* Vehicle Selection */}
      <Card className="glass-card border-amber-500/30 bg-amber-500/5">
        <CardHeader className="pb-2">
          <CardTitle className="text-white text-sm flex items-center gap-2">
            <Car className="w-4 h-4 text-amber-400" />
            المركبات النشطة
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {vehiclesData.map(vehicle => (
              <div
                key={vehicle.id}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  selectedVehicle?.id === vehicle.id
                    ? 'bg-amber-500/20 border-amber-500/50'
                    : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
                }`}
                onClick={() => setSelectedVehicle(vehicle)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${vehicle.status === 'moving' ? 'bg-green-500/20' : 'bg-slate-700'}`}>
                      <Car className={`w-4 h-4 ${vehicle.status === 'moving' ? 'text-green-400' : 'text-slate-400'}`} />
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">{vehicle.name}</p>
                      <p className="text-slate-400 text-xs">{vehicle.driver}</p>
                    </div>
                  </div>
                  <div className="text-left">
                    <Badge className={vehicle.status === 'moving' ? 'bg-green-500/20 text-green-400' : 'bg-slate-700 text-slate-400'}>
                      {vehicle.status === 'moving' ? `${vehicle.speed} كم/س` : 'متوقف'}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Route Drawing */}
      <Card className="glass-card border-cyan-500/30 bg-cyan-500/5">
        <CardHeader className="pb-2">
          <CardTitle className="text-white text-sm flex items-center gap-2">
            <Route className="w-4 h-4 text-cyan-400" />
            رسم المسار
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!isDrawing ? (
            <div className="space-y-3">
              <p className="text-slate-400 text-sm">
                اضغط على الزر أدناه ثم انقر على الخريطة لرسم نقاط المسار
              </p>
              <Button className="w-full bg-cyan-600 hover:bg-cyan-700" onClick={startDrawing} disabled={!selectedVehicle}>
                <Plus className="w-4 h-4 ml-2" />
                بدء رسم مسار جديد
              </Button>
              {!selectedVehicle && (
                <p className="text-amber-400 text-xs text-center">اختر مركبة أولاً</p>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="p-3 bg-cyan-500/10 rounded-lg border border-cyan-500/30">
                <p className="text-cyan-400 text-sm flex items-center gap-2">
                  <Navigation className="w-4 h-4 animate-pulse" />
                  جاري الرسم... انقر على الخريطة لإضافة نقاط
                </p>
                {drawingPoints.length > 0 && (
                  <p className="text-slate-400 text-xs mt-1">
                    {drawingPoints.length} نقطة مضافة
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <Button className="flex-1 bg-green-600 hover:bg-green-700" onClick={finishDrawing}>
                  <MapPin className="w-4 h-4 ml-2" />
                  حفظ المسار
                </Button>
                <Button variant="outline" className="border-red-500/50 text-red-400" onClick={cancelDrawing}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Saved Routes */}
      <Card className="glass-card border-purple-500/30 bg-purple-500/5">
        <CardHeader className="pb-2">
          <CardTitle className="text-white text-sm flex items-center gap-2">
            <MapPin className="w-4 h-4 text-purple-400" />
            المسارات المحفوظة
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {savedRoutes.map(route => (
              <div
                key={route.id}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  selectedRoute?.id === route.id
                    ? 'bg-purple-500/20 border-purple-500/50'
                    : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
                }`}
                onClick={() => {
                  setSelectedRoute(route);
                  onRouteSelect?.(route);
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-white font-medium text-sm">{route.name}</p>
                  <Badge className={route.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-slate-700 text-slate-400'}>
                    {route.status === 'active' ? 'نشط' : 'غير نشط'}
                  </Badge>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <Route className="w-3 h-3" />
                    {route.distance}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {route.duration}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {route.points.length} نقاط
                  </span>
                </div>

                {/* Route Points Preview */}
                {selectedRoute?.id === route.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-3 pt-3 border-t border-slate-700"
                  >
                    <div className="space-y-2">
                      {route.points.map((point, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                            i === 0 ? 'bg-green-500' : i === route.points.length - 1 ? 'bg-red-500' : 'bg-slate-600'
                          }`}>
                            <span className="text-white text-[10px]">{i + 1}</span>
                          </div>
                          <span className="text-slate-300">{point.name}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Button size="sm" className="flex-1 bg-purple-600 hover:bg-purple-700" onClick={togglePlayback}>
                        {playbackActive ? <Pause className="w-3 h-3 ml-1" /> : <Play className="w-3 h-3 ml-1" />}
                        {playbackActive ? 'إيقاف' : 'تشغيل'}
                      </Button>
                      <Button size="sm" variant="outline" className="border-slate-600">
                        <Eye className="w-3 h-3 ml-1" />
                        عرض
                      </Button>
                    </div>
                  </motion.div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}