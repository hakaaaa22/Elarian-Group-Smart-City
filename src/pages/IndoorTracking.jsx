import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import {
  Radar, MapPin, Users, Shield, Package, AlertTriangle, Activity, Radio,
  Filter, Search, Eye, Settings, RefreshCw, Zap, Target, Navigation
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { toast } from 'sonner';

// بيانات محاكاة للموقع الداخلي
const mockLocations = [
  { id: 'l1', tagId: 'UWB001', entityType: 'person', entityName: 'أحمد محمد', building: 'المبنى A', floor: '3', zone: 'مكتب الإدارة', x: 25, y: 30, accuracy: 15, batteryLevel: 85, status: 'stationary' },
  { id: 'l2', tagId: 'RFID045', entityType: 'weapon', entityName: 'M4 Carbine #245', building: 'المبنى B', floor: '1', zone: 'مخزن الأسلحة', x: 10, y: 15, accuracy: 50, batteryLevel: 92, status: 'stationary' },
  { id: 'l3', tagId: 'UWB003', entityType: 'asset', entityName: 'معدة ثقيلة #102', building: 'المبنى C', floor: '1', zone: 'ورشة الصيانة', x: 40, y: 20, accuracy: 20, batteryLevel: 68, status: 'moving' },
  { id: 'l4', tagId: 'BLE012', entityType: 'visitor', entityName: 'زائر - محمد علي', building: 'المبنى A', floor: '1', zone: 'الاستقبال', x: 5, y: 8, accuracy: 100, batteryLevel: 100, status: 'moving' },
];

// مناطق محظورة
const restrictedZones = [
  { id: 'z1', name: 'غرفة الخوادم', building: 'المبنى A', floor: '2', x: 30, y: 40, radius: 5, severity: 'high' },
  { id: 'z2', name: 'مخزن الكيماويات', building: 'المبنى C', floor: '1', x: 50, y: 50, radius: 8, severity: 'critical' },
];

export default function IndoorTracking() {
  const [activeTab, setActiveTab] = useState('map');
  const [selectedBuilding, setSelectedBuilding] = useState('all');
  const [selectedFloor, setSelectedFloor] = useState('all');
  const [filter, setFilter] = useState({ entityType: 'all', search: '' });
  const [liveData, setLiveData] = useState(mockLocations);

  const { data: indoorLocations = [] } = useQuery({
    queryKey: ['indoorLocations'],
    queryFn: () => base44.entities.IndoorLocation.list('-last_seen', 100),
    initialData: []
  });

  // محاكاة تحديثات مباشرة
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveData(prev => prev.map(loc => ({
        ...loc,
        x: loc.status === 'moving' ? loc.x + (Math.random() - 0.5) * 2 : loc.x,
        y: loc.status === 'moving' ? loc.y + (Math.random() - 0.5) * 2 : loc.y,
        batteryLevel: Math.max(0, loc.batteryLevel - 0.1)
      })));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const stats = {
    total: liveData.length,
    people: liveData.filter(l => l.entityType === 'person').length,
    weapons: liveData.filter(l => l.entityType === 'weapon').length,
    assets: liveData.filter(l => l.entityType === 'asset').length,
  };

  const filteredLocations = liveData.filter(loc => {
    if (filter.entityType !== 'all' && loc.entityType !== filter.entityType) return false;
    if (filter.search && !loc.entityName?.toLowerCase().includes(filter.search.toLowerCase())) return false;
    if (selectedBuilding !== 'all' && loc.building !== selectedBuilding) return false;
    if (selectedFloor !== 'all' && loc.floor !== selectedFloor) return false;
    return true;
  });

  const getEntityIcon = (type) => {
    switch (type) {
      case 'person': return Users;
      case 'weapon': return Shield;
      case 'asset': return Package;
      case 'visitor': return Eye;
      default: return MapPin;
    }
  };

  return (
    <div className="min-h-screen p-4 lg:p-6" dir="rtl">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white flex items-center gap-3">
              <Radar className="w-8 h-8 text-cyan-400" />
              نظام التتبع الداخلي المتقدم
            </h1>
            <p className="text-slate-400 mt-1">RFID / UWB / BLE - تتبع عالي الدقة</p>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <Card className="bg-cyan-500/10 border-cyan-500/30">
          <CardContent className="p-3 text-center">
            <Activity className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
            <p className="text-xl font-bold text-white">{stats.total}</p>
            <p className="text-cyan-400 text-xs">نقاط نشطة</p>
          </CardContent>
        </Card>
        <Card className="bg-purple-500/10 border-purple-500/30">
          <CardContent className="p-3 text-center">
            <Users className="w-5 h-5 text-purple-400 mx-auto mb-1" />
            <p className="text-xl font-bold text-white">{stats.people}</p>
            <p className="text-purple-400 text-xs">أشخاص</p>
          </CardContent>
        </Card>
        <Card className="bg-red-500/10 border-red-500/30">
          <CardContent className="p-3 text-center">
            <Shield className="w-5 h-5 text-red-400 mx-auto mb-1" />
            <p className="text-xl font-bold text-white">{stats.weapons}</p>
            <p className="text-red-400 text-xs">أسلحة</p>
          </CardContent>
        </Card>
        <Card className="bg-green-500/10 border-green-500/30">
          <CardContent className="p-3 text-center">
            <Package className="w-5 h-5 text-green-400 mx-auto mb-1" />
            <p className="text-xl font-bold text-white">{stats.assets}</p>
            <p className="text-green-400 text-xs">أصول</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap mb-4">
        <Select value={selectedBuilding} onValueChange={setSelectedBuilding}>
          <SelectTrigger className="w-32 bg-slate-800/50 border-slate-700 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">كل المباني</SelectItem>
            <SelectItem value="المبنى A">المبنى A</SelectItem>
            <SelectItem value="المبنى B">المبنى B</SelectItem>
            <SelectItem value="المبنى C">المبنى C</SelectItem>
          </SelectContent>
        </Select>
        <Select value={selectedFloor} onValueChange={setSelectedFloor}>
          <SelectTrigger className="w-32 bg-slate-800/50 border-slate-700 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">كل الطوابق</SelectItem>
            <SelectItem value="1">الطابق 1</SelectItem>
            <SelectItem value="2">الطابق 2</SelectItem>
            <SelectItem value="3">الطابق 3</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filter.entityType} onValueChange={(v) => setFilter(prev => ({ ...prev, entityType: v }))}>
          <SelectTrigger className="w-32 bg-slate-800/50 border-slate-700 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">الكل</SelectItem>
            <SelectItem value="person">أشخاص</SelectItem>
            <SelectItem value="weapon">أسلحة</SelectItem>
            <SelectItem value="asset">أصول</SelectItem>
            <SelectItem value="visitor">زوار</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-slate-800/50 border border-slate-700">
          <TabsTrigger value="map" className="data-[state=active]:bg-cyan-500/20">
            <MapPin className="w-4 h-4 ml-1" />
            الخريطة المباشرة
          </TabsTrigger>
          <TabsTrigger value="list" className="data-[state=active]:bg-purple-500/20">
            <Activity className="w-4 h-4 ml-1" />
            القائمة
          </TabsTrigger>
          <TabsTrigger value="zones" className="data-[state=active]:bg-red-500/20">
            <AlertTriangle className="w-4 h-4 ml-1" />
            المناطق المحظورة
          </TabsTrigger>
        </TabsList>

        {/* Map Tab */}
        <TabsContent value="map" className="mt-4">
          <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
            <CardContent className="p-4">
              <div className="relative w-full h-96 bg-slate-900 rounded-lg border border-slate-700 overflow-hidden">
                {/* Grid Background */}
                <div className="absolute inset-0" style={{
                  backgroundImage: 'linear-gradient(rgba(148, 163, 184, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(148, 163, 184, 0.1) 1px, transparent 1px)',
                  backgroundSize: '20px 20px'
                }} />

                {/* Restricted Zones */}
                {restrictedZones.map(zone => (
                  <div
                    key={zone.id}
                    className="absolute rounded-full border-2 border-red-500/50 bg-red-500/10"
                    style={{
                      left: `${zone.x}%`,
                      top: `${zone.y}%`,
                      width: `${zone.radius * 2}%`,
                      height: `${zone.radius * 2}%`,
                      transform: 'translate(-50%, -50%)'
                    }}
                  />
                ))}

                {/* Live Locations */}
                {filteredLocations.map(loc => {
                  const Icon = getEntityIcon(loc.entityType);
                  return (
                    <motion.div
                      key={loc.id}
                      className="absolute"
                      animate={{ left: `${loc.x}%`, top: `${loc.y}%` }}
                      transition={{ duration: 1, ease: 'linear' }}
                      style={{ transform: 'translate(-50%, -50%)' }}
                    >
                      <div className="relative">
                        <div className={`w-8 h-8 rounded-full ${loc.entityType === 'weapon' ? 'bg-red-500/30 border-2 border-red-500' : loc.entityType === 'person' ? 'bg-cyan-500/30 border-2 border-cyan-500' : 'bg-purple-500/30 border-2 border-purple-500'} flex items-center justify-center`}>
                          <Icon className="w-4 h-4 text-white" />
                        </div>
                        {loc.status === 'moving' && (
                          <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
              <div className="flex gap-2 mt-4 flex-wrap">
                <Badge className="bg-cyan-500/20 text-cyan-400"><Users className="w-3 h-3 ml-1" />أشخاص</Badge>
                <Badge className="bg-red-500/20 text-red-400"><Shield className="w-3 h-3 ml-1" />أسلحة</Badge>
                <Badge className="bg-purple-500/20 text-purple-400"><Package className="w-3 h-3 ml-1" />أصول</Badge>
                <Badge className="bg-amber-500/20 text-amber-400"><AlertTriangle className="w-3 h-3 ml-1" />مناطق محظورة</Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* List Tab */}
        <TabsContent value="list" className="mt-4">
          <div className="space-y-3">
            {filteredLocations.map(loc => {
              const Icon = getEntityIcon(loc.entityType);
              return (
                <Card key={loc.id} className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${loc.entityType === 'weapon' ? 'bg-red-500/20' : loc.entityType === 'person' ? 'bg-cyan-500/20' : 'bg-purple-500/20'}`}>
                          <Icon className={`w-5 h-5 ${loc.entityType === 'weapon' ? 'text-red-400' : loc.entityType === 'person' ? 'text-cyan-400' : 'text-purple-400'}`} />
                        </div>
                        <div>
                          <p className="text-white font-medium">{loc.entityName}</p>
                          <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                            <span>{loc.building}</span>
                            <span>•</span>
                            <span>طابق {loc.floor}</span>
                            <span>•</span>
                            <span>{loc.zone}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={loc.tagType === 'uwb' ? 'bg-cyan-500/20 text-cyan-400' : 'bg-purple-500/20 text-purple-400'}>
                          {loc.tagType === 'uwb' ? 'UWB' : loc.tagType === 'rfid' ? 'RFID' : 'BLE'}
                        </Badge>
                        {loc.status === 'moving' && (
                          <Badge className="bg-green-500/20 text-green-400">
                            <Activity className="w-3 h-3 ml-1 animate-pulse" />
                            متحرك
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 mt-3">
                      <div className="text-center p-2 bg-slate-800/50 rounded">
                        <p className="text-cyan-400 font-bold">{loc.accuracy} سم</p>
                        <p className="text-slate-500 text-xs">الدقة</p>
                      </div>
                      <div className="text-center p-2 bg-slate-800/50 rounded">
                        <p className="text-green-400 font-bold">{loc.batteryLevel}%</p>
                        <p className="text-slate-500 text-xs">البطارية</p>
                      </div>
                      <div className="text-center p-2 bg-slate-800/50 rounded">
                        <p className="text-purple-400 font-bold">{loc.x.toFixed(0)},{loc.y.toFixed(0)}</p>
                        <p className="text-slate-500 text-xs">الموقع</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Zones Tab */}
        <TabsContent value="zones" className="mt-4">
          <div className="space-y-3">
            {restrictedZones.map(zone => (
              <Card key={zone.id} className="glass-card border-red-500/30 bg-red-500/5">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="w-5 h-5 text-red-400" />
                      <div>
                        <p className="text-white font-medium">{zone.name}</p>
                        <p className="text-slate-400 text-sm">{zone.building} - طابق {zone.floor}</p>
                      </div>
                    </div>
                    <Badge className={zone.severity === 'critical' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'}>
                      {zone.severity === 'critical' ? 'حرج' : 'عالي'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}