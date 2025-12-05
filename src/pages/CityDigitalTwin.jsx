import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Globe, Building2, Car, Users, Zap, Droplets, Leaf, AlertTriangle,
  Play, Pause, RefreshCw, Layers, Eye, Activity, MapPin, Box
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';

const cityLayers = [
  { id: 'buildings', name: 'المباني', icon: Building2, color: 'cyan', active: true },
  { id: 'traffic', name: 'المرور', icon: Car, color: 'amber', active: true },
  { id: 'utilities', name: 'المرافق', icon: Zap, color: 'yellow', active: false },
  { id: 'people', name: 'السكان', icon: Users, color: 'purple', active: false },
  { id: 'environment', name: 'البيئة', icon: Leaf, color: 'green', active: true },
];

const liveStats = [
  { label: 'المركبات النشطة', value: '485,230', change: '+2.3%' },
  { label: 'استهلاك الطاقة', value: '1.2 GW', change: '-5.1%' },
  { label: 'استهلاك المياه', value: '2.4M m³', change: '+1.2%' },
  { label: 'جودة الهواء AQI', value: '52', change: '-8%' },
];

const emergencyScenarios = [
  { name: 'إخلاء حريق', buildings: 12, affected: 5400, time: '15 دقيقة' },
  { name: 'فيضان', zones: 3, affected: 12000, time: '2 ساعة' },
  { name: 'زلزال', magnitude: '5.5', affected: 45000, time: 'فوري' },
];

export default function CityDigitalTwin() {
  const [activeTab, setActiveTab] = useState('live');
  const [layers, setLayers] = useState(cityLayers);
  const [simulationRunning, setSimulationRunning] = useState(false);
  const [timeOfDay, setTimeOfDay] = useState([12]);

  const toggleLayer = (id) => {
    setLayers(prev => prev.map(l => l.id === id ? { ...l, active: !l.active } : l));
  };

  return (
    <div className="min-h-screen p-4 lg:p-6" dir="rtl">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white flex items-center gap-3">
              <Globe className="w-8 h-8 text-cyan-400" />
              التوأم الرقمي للمدينة
            </h1>
            <p className="text-slate-400 mt-1">نموذج ثلاثي الأبعاد تفاعلي ومحاكاة مباشرة</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className={simulationRunning ? 'border-red-500 text-red-400' : 'border-green-500 text-green-400'} onClick={() => setSimulationRunning(!simulationRunning)}>
              {simulationRunning ? <Pause className="w-4 h-4 ml-2" /> : <Play className="w-4 h-4 ml-2" />}
              {simulationRunning ? 'إيقاف' : 'تشغيل'} المحاكاة
            </Button>
          </div>
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* 3D View Area */}
        <div className="lg:col-span-3">
          <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80 h-[500px]">
            <CardContent className="p-0 h-full relative">
              {/* Simulated 3D City View */}
              <div className="absolute inset-0 bg-gradient-to-b from-slate-900 to-slate-800 rounded-lg overflow-hidden">
                <div className="absolute inset-0" style={{
                  backgroundImage: `radial-gradient(circle at 50% 50%, rgba(34, 211, 238, 0.1) 0%, transparent 50%)`,
                }} />
                
                {/* Grid Lines */}
                <div className="absolute inset-0" style={{
                  backgroundImage: 'linear-gradient(rgba(148, 163, 184, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(148, 163, 184, 0.05) 1px, transparent 1px)',
                  backgroundSize: '50px 50px',
                  transform: 'perspective(500px) rotateX(60deg)',
                  transformOrigin: 'center center'
                }} />

                {/* Animated Elements */}
                {layers.find(l => l.id === 'traffic')?.active && (
                  <div className="absolute bottom-1/3 left-1/4 w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
                )}
                {layers.find(l => l.id === 'buildings')?.active && (
                  <>
                    <div className="absolute top-1/3 left-1/3 w-16 h-24 bg-cyan-500/20 border border-cyan-500/50 rounded" />
                    <div className="absolute top-1/4 right-1/3 w-12 h-32 bg-purple-500/20 border border-purple-500/50 rounded" />
                    <div className="absolute bottom-1/4 left-1/2 w-20 h-20 bg-green-500/20 border border-green-500/50 rounded" />
                  </>
                )}

                {/* Center Label */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <Globe className="w-16 h-16 text-cyan-400/50 mx-auto mb-4" />
                    <p className="text-slate-400">نموذج ثلاثي الأبعاد تفاعلي</p>
                    <p className="text-slate-500 text-sm">اختر الطبقات للعرض</p>
                  </div>
                </div>

                {/* Time Indicator */}
                <div className="absolute top-4 left-4 bg-slate-900/80 rounded-lg p-3">
                  <p className="text-cyan-400 text-sm">الوقت: {timeOfDay[0]}:00</p>
                </div>

                {/* Live Badge */}
                {simulationRunning && (
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-red-500/20 text-red-400 animate-pulse">
                      <span className="w-2 h-2 bg-red-400 rounded-full inline-block ml-2" />
                      مباشر
                    </Badge>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Time Control */}
          <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80 mt-4">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <span className="text-slate-400 text-sm w-20">00:00</span>
                <Slider value={timeOfDay} onValueChange={setTimeOfDay} min={0} max={24} step={1} className="flex-1" />
                <span className="text-slate-400 text-sm w-20">24:00</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Layers */}
          <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                الطبقات
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {layers.map(layer => (
                <div key={layer.id} onClick={() => toggleLayer(layer.id)} className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${layer.active ? `bg-${layer.color}-500/20 border border-${layer.color}-500/50` : 'bg-slate-800/50 border border-transparent'}`}>
                  <div className="flex items-center gap-2">
                    <layer.icon className={`w-4 h-4 ${layer.active ? `text-${layer.color}-400` : 'text-slate-500'}`} />
                    <span className={layer.active ? 'text-white' : 'text-slate-500'}>{layer.name}</span>
                  </div>
                  <div className={`w-3 h-3 rounded-full ${layer.active ? `bg-${layer.color}-400` : 'bg-slate-600'}`} />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Live Stats */}
          <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <Activity className="w-4 h-4 text-green-400" />
                إحصائيات مباشرة
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {liveStats.map((stat, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-slate-400 text-sm">{stat.label}</span>
                  <div className="text-left">
                    <span className="text-white font-bold">{stat.value}</span>
                    <Badge className={`mr-2 ${stat.change.startsWith('+') ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                      {stat.change}
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Emergency Scenarios */}
          <Card className="glass-card border-red-500/20 bg-[#0f1629]/80">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                سيناريوهات الطوارئ
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {emergencyScenarios.map((scenario, i) => (
                <Button key={i} variant="outline" className="w-full border-slate-700 text-slate-300 justify-start text-sm">
                  {scenario.name}
                </Button>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}