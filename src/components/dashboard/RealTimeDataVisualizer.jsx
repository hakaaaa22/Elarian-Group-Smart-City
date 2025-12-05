import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Map, Layers, Filter, RefreshCw, Maximize2, Eye, EyeOff,
  Car, Package, Shield, Droplets, Building2, Activity, Zap,
  AlertTriangle, CheckCircle, Clock, MapPin, TrendingUp, Brain, Sparkles
} from 'lucide-react';
import CrossDepartmentInsights from './CrossDepartmentInsights';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart
} from 'recharts';

// ألوان اللوجو الموحدة
const BRAND_COLORS = {
  primary: '#8B5CF6',
  secondary: '#06B6D4',
  accent: '#EC4899',
};

// طبقات البيانات
const dataLayers = [
  { id: 'traffic', name: 'حركة المرور', icon: Car, color: '#8B5CF6', enabled: true },
  { id: 'waste', name: 'النفايات', icon: Package, color: '#22C55E', enabled: true },
  { id: 'safety', name: 'السلامة', icon: Shield, color: '#EC4899', enabled: true },
  { id: 'utilities', name: 'المرافق', icon: Droplets, color: '#06B6D4', enabled: false },
  { id: 'energy', name: 'الطاقة', icon: Zap, color: '#F59E0B', enabled: false },
];

// بيانات الخريطة المحاكاة
const mapPoints = [
  { id: 1, type: 'traffic', lat: 24.7136, lng: 46.6753, status: 'warning', name: 'تقاطع الملك فهد', value: 'ازدحام متوسط' },
  { id: 2, type: 'waste', lat: 24.7200, lng: 46.6800, status: 'critical', name: 'حاوية A-45', value: '95% ممتلئة' },
  { id: 3, type: 'safety', lat: 24.7100, lng: 46.6700, status: 'online', name: 'كاميرا C-12', value: 'نشطة' },
  { id: 4, type: 'traffic', lat: 24.7180, lng: 46.6850, status: 'online', name: 'تقاطع العليا', value: 'حركة سلسة' },
  { id: 5, type: 'utilities', lat: 24.7050, lng: 46.6600, status: 'warning', name: 'محطة مياه M-3', value: 'ضغط منخفض' },
];

// بيانات الرسوم البيانية المتعددة
const combinedData = [
  { time: '00:00', traffic: 20, waste: 45, energy: 30, safety: 98 },
  { time: '04:00', traffic: 15, waste: 50, energy: 25, safety: 99 },
  { time: '08:00', traffic: 75, waste: 55, energy: 65, safety: 95 },
  { time: '12:00', traffic: 60, waste: 70, energy: 80, safety: 92 },
  { time: '16:00', traffic: 85, waste: 75, energy: 70, safety: 94 },
  { time: '20:00', traffic: 45, waste: 80, energy: 55, safety: 97 },
];

export default function RealTimeDataVisualizer() {
  const [layers, setLayers] = useState(dataLayers);
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [isLive, setIsLive] = useState(true);
  const [activeTab, setActiveTab] = useState('map');

  // Simulate real-time updates
  useEffect(() => {
    if (!isLive) return;
    const interval = setInterval(() => {
      setLastUpdate(new Date());
    }, 5000);
    return () => clearInterval(interval);
  }, [isLive]);

  const toggleLayer = (layerId) => {
    setLayers(prev => prev.map(l => 
      l.id === layerId ? { ...l, enabled: !l.enabled } : l
    ));
  };

  const visiblePoints = useMemo(() => {
    const enabledLayerIds = layers.filter(l => l.enabled).map(l => l.id);
    return mapPoints.filter(p => enabledLayerIds.includes(p.type));
  }, [layers]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return '#22C55E';
      case 'warning': return '#F59E0B';
      case 'critical': return '#EF4444';
      default: return '#94A3B8';
    }
  };

  return (
    <div className="space-y-4" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ rotate: isLive ? [0, 360] : 0 }}
            transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
            className="p-2 rounded-xl"
            style={{ background: `linear-gradient(135deg, ${BRAND_COLORS.primary}30, ${BRAND_COLORS.secondary}30)` }}
          >
            <Map className="w-6 h-6" style={{ color: BRAND_COLORS.primary }} />
          </motion.div>
          <div>
            <h2 className="text-lg font-bold text-white">البيانات الحية التفاعلية</h2>
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
          <Button variant="outline" size="icon" className="border-slate-700">
            <RefreshCw className={`w-4 h-4 ${isLive ? 'animate-spin' : ''}`} />
          </Button>
          <Button variant="outline" size="icon" className="border-slate-700" onClick={() => setIsFullscreen(!isFullscreen)}>
            <Maximize2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 bg-slate-800/50 p-1 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab('map')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
            activeTab === 'map' ? 'bg-purple-500/20 text-purple-400' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Map className="w-4 h-4" />
          الخريطة
        </button>
        <button
          onClick={() => setActiveTab('insights')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
            activeTab === 'insights' ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Brain className="w-4 h-4" />
          رؤى AI
          <Sparkles className="w-3 h-3" />
        </button>
      </div>

      {activeTab === 'insights' ? (
        <CrossDepartmentInsights />
      ) : (
        <>
          {/* Layer Controls */}
          <Card className="border-slate-700/50 bg-slate-800/30">
            <CardContent className="p-3">
              <div className="flex items-center gap-2 flex-wrap">
                <Layers className="w-4 h-4 text-slate-400" />
                <span className="text-slate-400 text-sm ml-2">الطبقات:</span>
                {layers.map(layer => (
                  <motion.button
                    key={layer.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => toggleLayer(layer.id)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${
                      layer.enabled ? 'text-white' : 'bg-slate-800/50 text-slate-500'
                    }`}
                    style={layer.enabled ? { background: `${layer.color}30`, borderColor: layer.color } : {}}
                  >
                    <layer.icon className="w-4 h-4" style={{ color: layer.enabled ? layer.color : undefined }} />
                    <span className="text-sm">{layer.name}</span>
                    {layer.enabled ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                  </motion.button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Main Content */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Interactive Map */}
        <Card className="lg:col-span-2 border-slate-700/50 bg-slate-800/30 overflow-hidden">
          <CardContent className="p-0">
            <div className="relative h-[400px] bg-slate-900">
              {/* Grid Background */}
              <div className="absolute inset-0" style={{
                backgroundImage: `linear-gradient(${BRAND_COLORS.primary}10 1px, transparent 1px), linear-gradient(90deg, ${BRAND_COLORS.primary}10 1px, transparent 1px)`,
                backgroundSize: '40px 40px'
              }} />
              
              {/* Map Points */}
              {visiblePoints.map((point, i) => {
                const layer = layers.find(l => l.id === point.type);
                const top = 20 + (point.lat - 24.70) * 3000;
                const left = 20 + (point.lng - 46.65) * 2000;
                
                return (
                  <motion.div
                    key={point.id}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className="absolute cursor-pointer"
                    style={{ top: `${Math.max(10, Math.min(85, top))}%`, left: `${Math.max(10, Math.min(85, left))}%` }}
                    onClick={() => setSelectedPoint(point)}
                    whileHover={{ scale: 1.2 }}
                  >
                    <div className="relative">
                      <div 
                        className="p-2 rounded-full"
                        style={{ 
                          background: `${layer?.color}30`,
                          border: `2px solid ${getStatusColor(point.status)}`,
                          boxShadow: `0 0 15px ${getStatusColor(point.status)}50`
                        }}
                      >
                        {layer && <layer.icon className="w-4 h-4" style={{ color: layer.color }} />}
                      </div>
                      {point.status === 'critical' && (
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping" />
                      )}
                    </div>
                  </motion.div>
                );
              })}

              {/* Selected Point Info */}
              {selectedPoint && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute bottom-4 left-4 right-4 p-4 bg-slate-800/90 backdrop-blur-xl rounded-xl border border-slate-700"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div 
                        className="p-2 rounded-lg"
                        style={{ background: `${getStatusColor(selectedPoint.status)}20` }}
                      >
                        <MapPin className="w-5 h-5" style={{ color: getStatusColor(selectedPoint.status) }} />
                      </div>
                      <div>
                        <p className="text-white font-medium">{selectedPoint.name}</p>
                        <p className="text-slate-400 text-sm">{selectedPoint.value}</p>
                      </div>
                    </div>
                    <Badge 
                      style={{ 
                        background: `${getStatusColor(selectedPoint.status)}20`,
                        color: getStatusColor(selectedPoint.status)
                      }}
                    >
                      {selectedPoint.status === 'online' ? 'نشط' : selectedPoint.status === 'warning' ? 'تحذير' : 'حرج'}
                    </Badge>
                  </div>
                </motion.div>
              )}

              {/* Legend */}
              <div className="absolute top-4 right-4 p-3 bg-slate-800/80 backdrop-blur rounded-lg">
                <p className="text-white text-xs font-medium mb-2">وسيلة الإيضاح</p>
                {layers.filter(l => l.enabled).map(layer => (
                  <div key={layer.id} className="flex items-center gap-2 text-xs mb-1">
                    <div className="w-3 h-3 rounded-full" style={{ background: layer.color }} />
                    <span className="text-slate-300">{layer.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Panel */}
        <Card className="border-slate-700/50 bg-slate-800/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <Activity className="w-4 h-4" style={{ color: BRAND_COLORS.secondary }} />
              ملخص البيانات
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {layers.filter(l => l.enabled).map((layer, i) => {
              const points = mapPoints.filter(p => p.type === layer.id);
              const activeCount = points.filter(p => p.status === 'online').length;
              const warningCount = points.filter(p => p.status === 'warning').length;
              const criticalCount = points.filter(p => p.status === 'critical').length;
              
              return (
                <motion.div
                  key={layer.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="p-3 rounded-lg"
                  style={{ background: `${layer.color}10` }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <layer.icon className="w-4 h-4" style={{ color: layer.color }} />
                      <span className="text-white text-sm font-medium">{layer.name}</span>
                    </div>
                    <span className="text-slate-400 text-xs">{points.length} نقطة</span>
                  </div>
                  <div className="flex gap-2">
                    {activeCount > 0 && (
                      <Badge className="bg-green-500/20 text-green-400 text-xs">
                        <CheckCircle className="w-3 h-3 ml-1" />
                        {activeCount} نشط
                      </Badge>
                    )}
                    {warningCount > 0 && (
                      <Badge className="bg-amber-500/20 text-amber-400 text-xs">
                        <AlertTriangle className="w-3 h-3 ml-1" />
                        {warningCount} تحذير
                      </Badge>
                    )}
                    {criticalCount > 0 && (
                      <Badge className="bg-red-500/20 text-red-400 text-xs">
                        <AlertTriangle className="w-3 h-3 ml-1" />
                        {criticalCount} حرج
                      </Badge>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </CardContent>
        </Card>
      </div>

          {/* Combined Chart */}
          <Card className="border-slate-700/50 bg-slate-800/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <TrendingUp className="w-4 h-4" style={{ color: BRAND_COLORS.primary }} />
                تحليل البيانات المجمعة (24 ساعة)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={combinedData}>
                    <defs>
                      {layers.map(layer => (
                        <linearGradient key={layer.id} id={`gradient-${layer.id}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={layer.color} stopOpacity={0.3}/>
                          <stop offset="95%" stopColor={layer.color} stopOpacity={0}/>
                        </linearGradient>
                      ))}
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} />
                    <YAxis stroke="#94a3b8" fontSize={11} />
                    <Tooltip 
                      contentStyle={{ 
                        background: '#1e293b', 
                        border: '1px solid #334155', 
                        borderRadius: '12px' 
                      }} 
                    />
                    {layers.filter(l => l.enabled).map(layer => (
                      <Area
                        key={layer.id}
                        type="monotone"
                        dataKey={layer.id}
                        stroke={layer.color}
                        fill={`url(#gradient-${layer.id})`}
                        strokeWidth={2}
                        name={layer.name}
                      />
                    ))}
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}