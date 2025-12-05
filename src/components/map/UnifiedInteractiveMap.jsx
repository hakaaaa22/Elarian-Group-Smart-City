import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Map, Camera, Trash2, Radio, Car, Building2, AlertTriangle, Eye, Filter,
  Layers, MapPin, Activity, Thermometer, Wind, Signal, Battery, Wifi,
  ChevronRight, X, RefreshCw, ZoomIn, ZoomOut, Maximize, Target, Clock,
  Search, Route, Cloud
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import WeatherLayer from './WeatherLayer';
import VehicleRouteDrawer from './VehicleRouteDrawer';
import AssetSearch from './AssetSearch';

// بيانات الأصول على الخريطة
const mapAssets = {
  cameras: [
    { id: 'CAM-001', name: 'كاميرا المدخل الرئيسي', lat: 24.7136, lng: 46.6753, status: 'online', detections: 245, module: 'ai_vision' },
    { id: 'CAM-002', name: 'كاميرا الموقف A', lat: 24.7150, lng: 46.6780, status: 'online', detections: 189, module: 'ai_vision' },
    { id: 'CAM-003', name: 'كاميرا المنطقة الصناعية', lat: 24.7080, lng: 46.6820, status: 'warning', detections: 78, module: 'ai_vision' },
    { id: 'CAM-004', name: 'كاميرا الحديقة', lat: 24.7200, lng: 46.6700, status: 'offline', detections: 0, module: 'ai_vision' },
  ],
  waste_bins: [
    { id: 'BIN-001', name: 'حاوية الشارع الرئيسي', lat: 24.7140, lng: 46.6760, status: 'online', fillLevel: 85, module: 'municipality' },
    { id: 'BIN-002', name: 'حاوية المجمع التجاري', lat: 24.7160, lng: 46.6790, status: 'online', fillLevel: 45, module: 'municipality' },
    { id: 'BIN-003', name: 'حاوية الحي السكني', lat: 24.7100, lng: 46.6720, status: 'warning', fillLevel: 92, module: 'municipality' },
  ],
  towers: [
    { id: 'TWR-001', name: 'برج الاتصالات المركزي', lat: 24.7136, lng: 46.6753, status: 'online', signal: 95, module: 'towers' },
    { id: 'TWR-002', name: 'برج المنطقة الشرقية', lat: 24.7200, lng: 46.6900, status: 'warning', signal: 82, module: 'towers' },
    { id: 'TWR-003', name: 'برج المراقبة الجنوبي', lat: 24.7000, lng: 46.6600, status: 'critical', signal: 68, module: 'towers' },
  ],
  vehicles: [
    { id: 'VEH-001', name: 'سيارة الدورية 1', lat: 24.7180, lng: 46.6800, status: 'online', speed: 45, module: 'fleet' },
    { id: 'VEH-002', name: 'شاحنة النفايات 3', lat: 24.7120, lng: 46.6740, status: 'online', speed: 30, module: 'fleet' },
  ],
  hospital_beds: [
    { id: 'BED-ICU-01', name: 'سرير العناية المركزة 1', lat: 24.7155, lng: 46.6775, status: 'occupied', patient: 'مريض A', module: 'hospital' },
    { id: 'BED-ER-05', name: 'سرير الطوارئ 5', lat: 24.7155, lng: 46.6778, status: 'available', module: 'hospital' },
  ]
};

// بيانات الخريطة الحرارية
const heatmapData = {
  crime: [
    { lat: 24.7140, lng: 46.6760, intensity: 0.8 },
    { lat: 24.7160, lng: 46.6790, intensity: 0.6 },
    { lat: 24.7100, lng: 46.6720, intensity: 0.9 },
    { lat: 24.7180, lng: 46.6800, intensity: 0.4 },
  ],
  waste_density: [
    { lat: 24.7140, lng: 46.6760, intensity: 0.9 },
    { lat: 24.7160, lng: 46.6790, intensity: 0.5 },
    { lat: 24.7100, lng: 46.6720, intensity: 0.95 },
  ],
  traffic: [
    { lat: 24.7140, lng: 46.6760, intensity: 0.7 },
    { lat: 24.7160, lng: 46.6790, intensity: 0.8 },
    { lat: 24.7180, lng: 46.6800, intensity: 0.6 },
  ]
};

const assetIcons = {
  cameras: Camera,
  waste_bins: Trash2,
  towers: Radio,
  vehicles: Car,
  hospital_beds: Building2
};

const assetColors = {
  cameras: 'purple',
  waste_bins: 'green',
  towers: 'cyan',
  vehicles: 'amber',
  hospital_beds: 'pink'
};

const assetLabels = {
  cameras: 'الكاميرات',
  waste_bins: 'حاويات النفايات',
  towers: 'الأبراج',
  vehicles: 'المركبات',
  hospital_beds: 'أسرة المستشفى'
};

export default function UnifiedInteractiveMap() {
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [visibleLayers, setVisibleLayers] = useState({
    cameras: true,
    waste_bins: true,
    towers: true,
    vehicles: true,
    hospital_beds: false
  });
  const [activeHeatmap, setActiveHeatmap] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(14);
  const [statusFilter, setStatusFilter] = useState('all');
  const [activePanel, setActivePanel] = useState(null); // 'weather', 'routes', 'search'

  // إحصائيات الأصول
  const stats = useMemo(() => {
    const allAssets = Object.entries(mapAssets).flatMap(([type, assets]) => 
      assets.map(a => ({ ...a, assetType: type }))
    );
    return {
      total: allAssets.length,
      online: allAssets.filter(a => a.status === 'online').length,
      warning: allAssets.filter(a => a.status === 'warning').length,
      critical: allAssets.filter(a => a.status === 'critical' || a.status === 'offline').length
    };
  }, []);

  // الأصول المفلترة
  const filteredAssets = useMemo(() => {
    const result = {};
    Object.entries(mapAssets).forEach(([type, assets]) => {
      if (visibleLayers[type]) {
        result[type] = assets.filter(a => 
          statusFilter === 'all' || a.status === statusFilter
        );
      }
    });
    return result;
  }, [visibleLayers, statusFilter]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'online': case 'available': return 'green';
      case 'warning': return 'amber';
      case 'critical': case 'offline': return 'red';
      case 'occupied': return 'blue';
      default: return 'slate';
    }
  };

  const toggleLayer = (layer) => {
    setVisibleLayers(prev => ({ ...prev, [layer]: !prev[layer] }));
  };

  return (
    <div className="space-y-4" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Map className="w-6 h-6 text-cyan-400" />
            الخريطة التفاعلية الموحدة
          </h2>
          <p className="text-slate-400 text-sm">عرض جميع الأصول من كافة الوحدات</p>
        </div>
        <div className="flex gap-2">
          <Button variant={activePanel === 'search' ? 'default' : 'outline'} size="sm" 
            className={activePanel === 'search' ? 'bg-cyan-600' : 'border-slate-600'} 
            onClick={() => setActivePanel(activePanel === 'search' ? null : 'search')}>
            <Search className="w-4 h-4 ml-1" />
            بحث
          </Button>
          <Button variant={activePanel === 'weather' ? 'default' : 'outline'} size="sm" 
            className={activePanel === 'weather' ? 'bg-amber-600' : 'border-slate-600'} 
            onClick={() => setActivePanel(activePanel === 'weather' ? null : 'weather')}>
            <Cloud className="w-4 h-4 ml-1" />
            الطقس
          </Button>
          <Button variant={activePanel === 'routes' ? 'default' : 'outline'} size="sm" 
            className={activePanel === 'routes' ? 'bg-purple-600' : 'border-slate-600'} 
            onClick={() => setActivePanel(activePanel === 'routes' ? null : 'routes')}>
            <Route className="w-4 h-4 ml-1" />
            المسارات
          </Button>
          <Button variant="outline" size="sm" className="border-slate-600" onClick={() => setShowFilters(!showFilters)}>
            <Filter className="w-4 h-4 ml-1" />
            الفلاتر
          </Button>
          <Button variant="outline" size="sm" className="border-slate-600">
            <Maximize className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-4 gap-3">
        <Card className="glass-card border-cyan-500/30 bg-cyan-500/5">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-white">{stats.total}</p>
            <p className="text-xs text-slate-400">إجمالي الأصول</p>
          </CardContent>
        </Card>
        <Card className="glass-card border-green-500/30 bg-green-500/5">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-green-400">{stats.online}</p>
            <p className="text-xs text-slate-400">متصل</p>
          </CardContent>
        </Card>
        <Card className="glass-card border-amber-500/30 bg-amber-500/5">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-amber-400">{stats.warning}</p>
            <p className="text-xs text-slate-400">تحذير</p>
          </CardContent>
        </Card>
        <Card className="glass-card border-red-500/30 bg-red-500/5">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-red-400">{stats.critical}</p>
            <p className="text-xs text-slate-400">حرج/غير متصل</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
          <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
            <CardContent className="p-4">
              <div className="grid md:grid-cols-3 gap-6">
                {/* Layer Toggles */}
                <div>
                  <p className="text-white font-medium mb-3 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-cyan-400" />
                    الطبقات
                  </p>
                  <div className="space-y-2">
                    {Object.entries(assetLabels).map(([key, label]) => {
                      const Icon = assetIcons[key];
                      return (
                        <div key={key} className="flex items-center justify-between p-2 bg-slate-800/50 rounded">
                          <div className="flex items-center gap-2">
                            <Icon className={`w-4 h-4 text-${assetColors[key]}-400`} />
                            <span className="text-slate-300 text-sm">{label}</span>
                          </div>
                          <Switch checked={visibleLayers[key]} onCheckedChange={() => toggleLayer(key)} />
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Heatmaps */}
                <div>
                  <p className="text-white font-medium mb-3 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-purple-400" />
                    الخرائط الحرارية
                  </p>
                  <div className="space-y-2">
                    {[
                      { id: 'crime', label: 'النقاط الأمنية الساخنة', color: 'red' },
                      { id: 'waste_density', label: 'كثافة النفايات', color: 'green' },
                      { id: 'traffic', label: 'حركة المرور', color: 'amber' }
                    ].map(hm => (
                      <Button key={hm.id} size="sm" variant={activeHeatmap === hm.id ? 'default' : 'outline'}
                        className={activeHeatmap === hm.id ? `bg-${hm.color}-600` : 'border-slate-600'}
                        onClick={() => setActiveHeatmap(activeHeatmap === hm.id ? null : hm.id)}>
                        {hm.label}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Status Filter */}
                <div>
                  <p className="text-white font-medium mb-3 flex items-center gap-2">
                    <Target className="w-4 h-4 text-amber-400" />
                    فلتر الحالة
                  </p>
                  <div className="space-y-2">
                    {[
                      { id: 'all', label: 'الكل' },
                      { id: 'online', label: 'متصل' },
                      { id: 'warning', label: 'تحذير' },
                      { id: 'critical', label: 'حرج' }
                    ].map(s => (
                      <Button key={s.id} size="sm" variant={statusFilter === s.id ? 'default' : 'outline'}
                        className={statusFilter === s.id ? 'bg-cyan-600' : 'border-slate-600'}
                        onClick={() => setStatusFilter(s.id)}>
                        {s.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Side Panels */}
      {activePanel && (
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80 mb-4">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  {activePanel === 'weather' && <><Cloud className="w-4 h-4 text-amber-400" />بيانات الطقس</>}
                  {activePanel === 'routes' && <><Route className="w-4 h-4 text-purple-400" />مسارات المركبات</>}
                  {activePanel === 'search' && <><Search className="w-4 h-4 text-cyan-400" />بحث الأصول</>}
                </CardTitle>
                <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => setActivePanel(null)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="max-h-96 overflow-y-auto">
              {activePanel === 'weather' && <WeatherLayer onAssetImpactClick={(asset) => setSelectedAsset(asset)} />}
              {activePanel === 'routes' && <VehicleRouteDrawer onRouteSelect={(route) => console.log(route)} />}
              {activePanel === 'search' && <AssetSearch onAssetSelect={(asset) => setSelectedAsset(asset)} />}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Map Container */}
      <div className="grid lg:grid-cols-4 gap-4">
        {/* Map View */}
        <Card className="lg:col-span-3 glass-card border-indigo-500/20 bg-[#0f1629]/80 overflow-hidden">
          <div className="relative h-[500px] bg-slate-900">
            {/* Simulated Map Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900">
              {/* Grid lines */}
              <div className="absolute inset-0" style={{
                backgroundImage: 'linear-gradient(rgba(34, 211, 238, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(34, 211, 238, 0.05) 1px, transparent 1px)',
                backgroundSize: '50px 50px'
              }} />
            </div>

            {/* Assets Markers */}
            {Object.entries(filteredAssets).map(([type, assets]) => 
              assets.map((asset, i) => {
                const Icon = assetIcons[type];
                const color = assetColors[type];
                const statusColor = getStatusColor(asset.status);
                // Simulate position based on lat/lng
                const top = 50 + (asset.lat - 24.71) * 5000;
                const left = 50 + (asset.lng - 46.67) * 5000;
                
                return (
                  <motion.div
                    key={asset.id}
                    className="absolute cursor-pointer"
                    style={{ top: `${Math.max(10, Math.min(90, top))}%`, left: `${Math.max(10, Math.min(90, left))}%` }}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    whileHover={{ scale: 1.2 }}
                    onClick={() => setSelectedAsset({ ...asset, assetType: type })}
                  >
                    <div className={`relative p-2 rounded-full bg-${color}-500/20 border-2 border-${statusColor}-500`}>
                      <Icon className={`w-4 h-4 text-${color}-400`} />
                      {/* Status indicator */}
                      <span className={`absolute -top-1 -right-1 w-3 h-3 rounded-full bg-${statusColor}-500 ${asset.status === 'warning' || asset.status === 'critical' ? 'animate-pulse' : ''}`} />
                    </div>
                  </motion.div>
                );
              })
            )}

            {/* Heatmap Overlay */}
            {activeHeatmap && (
              <div className="absolute inset-0 pointer-events-none">
                {heatmapData[activeHeatmap]?.map((point, i) => {
                  const top = 50 + (point.lat - 24.71) * 5000;
                  const left = 50 + (point.lng - 46.67) * 5000;
                  const size = point.intensity * 100;
                  const heatColor = activeHeatmap === 'crime' ? 'rgba(239, 68, 68' : activeHeatmap === 'waste_density' ? 'rgba(34, 197, 94' : 'rgba(245, 158, 11';
                  
                  return (
                    <div
                      key={i}
                      className="absolute rounded-full"
                      style={{
                        top: `${Math.max(10, Math.min(90, top))}%`,
                        left: `${Math.max(10, Math.min(90, left))}%`,
                        width: `${size}px`,
                        height: `${size}px`,
                        background: `radial-gradient(circle, ${heatColor}, ${point.intensity}) 0%, ${heatColor}, 0) 100%)`,
                        transform: 'translate(-50%, -50%)'
                      }}
                    />
                  );
                })}
              </div>
            )}

            {/* Zoom Controls */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              <Button size="icon" variant="outline" className="bg-slate-800/80 border-slate-600 h-8 w-8">
                <ZoomIn className="w-4 h-4" />
              </Button>
              <Button size="icon" variant="outline" className="bg-slate-800/80 border-slate-600 h-8 w-8">
                <ZoomOut className="w-4 h-4" />
              </Button>
            </div>

            {/* Legend */}
            <div className="absolute bottom-4 left-4 p-3 bg-slate-800/90 rounded-lg">
              <p className="text-white text-xs font-medium mb-2">دليل الرموز</p>
              <div className="space-y-1">
                {Object.entries(assetLabels).filter(([key]) => visibleLayers[key]).map(([key, label]) => {
                  const Icon = assetIcons[key];
                  return (
                    <div key={key} className="flex items-center gap-2 text-xs">
                      <Icon className={`w-3 h-3 text-${assetColors[key]}-400`} />
                      <span className="text-slate-300">{label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </Card>

        {/* Asset List */}
        <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm">الأصول المرئية</CardTitle>
          </CardHeader>
          <CardContent className="p-2">
            <div className="space-y-2 max-h-[450px] overflow-y-auto">
              {Object.entries(filteredAssets).map(([type, assets]) => 
                assets.map(asset => {
                  const Icon = assetIcons[type];
                  const statusColor = getStatusColor(asset.status);
                  
                  return (
                    <div key={asset.id}
                      className={`p-2 rounded-lg border cursor-pointer transition-all hover:scale-[1.02] ${selectedAsset?.id === asset.id ? 'bg-cyan-500/20 border-cyan-500/50' : 'bg-slate-800/50 border-slate-700'}`}
                      onClick={() => setSelectedAsset({ ...asset, assetType: type })}>
                      <div className="flex items-center gap-2">
                        <Icon className={`w-4 h-4 text-${assetColors[type]}-400`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-xs truncate">{asset.name}</p>
                          <p className="text-slate-500 text-[10px]">{asset.id}</p>
                        </div>
                        <span className={`w-2 h-2 rounded-full bg-${statusColor}-500`} />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Asset Detail Dialog */}
      <Dialog open={!!selectedAsset} onOpenChange={() => setSelectedAsset(null)}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              {selectedAsset && React.createElement(assetIcons[selectedAsset.assetType], { className: `w-5 h-5 text-${assetColors[selectedAsset.assetType]}-400` })}
              {selectedAsset?.name}
            </DialogTitle>
          </DialogHeader>
          {selectedAsset && (
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-800/50 rounded-lg">
                  <p className="text-slate-400 text-xs">المعرف</p>
                  <p className="text-white font-mono">{selectedAsset.id}</p>
                </div>
                <div className="p-3 bg-slate-800/50 rounded-lg">
                  <p className="text-slate-400 text-xs">الحالة</p>
                  <Badge className={`bg-${getStatusColor(selectedAsset.status)}-500/20 text-${getStatusColor(selectedAsset.status)}-400`}>
                    {selectedAsset.status}
                  </Badge>
                </div>
              </div>
              
              <div className="p-3 bg-slate-800/50 rounded-lg">
                <p className="text-slate-400 text-xs mb-2">الموقع</p>
                <p className="text-white text-sm">
                  <MapPin className="w-3 h-3 inline ml-1" />
                  {selectedAsset.lat.toFixed(4)}, {selectedAsset.lng.toFixed(4)}
                </p>
              </div>

              {/* Type-specific data */}
              {selectedAsset.assetType === 'cameras' && (
                <div className="p-3 bg-purple-500/10 rounded-lg">
                  <p className="text-purple-400 text-xs mb-2">بيانات AI Vision</p>
                  <p className="text-white">الكشوفات اليوم: <span className="text-purple-400 font-bold">{selectedAsset.detections}</span></p>
                </div>
              )}
              
              {selectedAsset.assetType === 'waste_bins' && (
                <div className="p-3 bg-green-500/10 rounded-lg">
                  <p className="text-green-400 text-xs mb-2">مستوى الامتلاء</p>
                  <Progress value={selectedAsset.fillLevel} className="h-2" />
                  <p className="text-white mt-1">{selectedAsset.fillLevel}%</p>
                </div>
              )}
              
              {selectedAsset.assetType === 'towers' && (
                <div className="p-3 bg-cyan-500/10 rounded-lg">
                  <p className="text-cyan-400 text-xs mb-2">قوة الإشارة</p>
                  <Progress value={selectedAsset.signal} className="h-2" />
                  <p className="text-white mt-1">{selectedAsset.signal}%</p>
                </div>
              )}
              
              {selectedAsset.assetType === 'vehicles' && (
                <div className="p-3 bg-amber-500/10 rounded-lg">
                  <p className="text-amber-400 text-xs mb-2">السرعة الحالية</p>
                  <p className="text-2xl font-bold text-white">{selectedAsset.speed} <span className="text-sm text-slate-400">كم/س</span></p>
                </div>
              )}

              <div className="flex gap-2">
                <Button className="flex-1 bg-cyan-600 hover:bg-cyan-700">
                  <Eye className="w-4 h-4 ml-2" />
                  عرض التفاصيل
                </Button>
                <Button variant="outline" className="border-slate-600">
                  <MapPin className="w-4 h-4 ml-2" />
                  توجيه
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}