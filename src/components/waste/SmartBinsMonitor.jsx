import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  Trash2, ThermometerSun, Battery, Signal, Wifi, AlertTriangle, CheckCircle,
  MapPin, Clock, Flame, Wind, Droplets, RefreshCw, Brain, Eye, Truck, Settings
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import { toast } from 'sonner';

const smartBinsData = [
  { id: 'BIN-001', location: 'شارع الملك فهد - تقاطع 1', zone: 'تجاري', type: 'general', fillLevel: 85, temperature: 32, methane: 12, battery: 78, signal: 'good', tilt: false, fireAlert: false, lastCollection: '2024-12-03 08:30', status: 'needs_collection' },
  { id: 'BIN-002', location: 'حي الورود - مجمع A', zone: 'سكني', type: 'recyclable', fillLevel: 45, temperature: 28, methane: 0, battery: 92, signal: 'excellent', tilt: false, fireAlert: false, lastCollection: '2024-12-03 14:00', status: 'normal' },
  { id: 'BIN-003', location: 'المنطقة الصناعية - بوابة 3', zone: 'صناعي', type: 'hazardous', fillLevel: 62, temperature: 35, methane: 8, battery: 65, signal: 'good', tilt: false, fireAlert: false, lastCollection: '2024-12-02 16:00', status: 'normal' },
  { id: 'BIN-004', location: 'المنتزه المركزي', zone: 'عام', type: 'organic', fillLevel: 92, temperature: 45, methane: 35, battery: 45, signal: 'weak', tilt: true, fireAlert: false, lastCollection: '2024-12-03 06:00', status: 'alert' },
  { id: 'BIN-005', location: 'مركز التسوق الرئيسي', zone: 'تجاري', type: 'general', fillLevel: 78, temperature: 30, methane: 5, battery: 88, signal: 'excellent', tilt: false, fireAlert: false, lastCollection: '2024-12-03 10:00', status: 'needs_collection' },
  { id: 'BIN-006', location: 'مستشفى المدينة', zone: 'طبي', type: 'medical', fillLevel: 55, temperature: 22, methane: 0, battery: 95, signal: 'excellent', tilt: false, fireAlert: false, lastCollection: '2024-12-04 06:00', status: 'normal' },
  { id: 'BIN-007', location: 'جامعة الملك سعود', zone: 'تعليمي', type: 'recyclable', fillLevel: 40, temperature: 27, methane: 0, battery: 82, signal: 'good', tilt: false, fireAlert: false, lastCollection: '2024-12-03 16:00', status: 'normal' },
  { id: 'BIN-008', location: 'محطة الوقود - طريق الملك', zone: 'تجاري', type: 'hazardous', fillLevel: 70, temperature: 38, methane: 15, battery: 60, signal: 'good', tilt: false, fireAlert: true, lastCollection: '2024-12-02 12:00', status: 'alert' },
];

const binTypes = {
  general: { name: 'عام', color: 'slate' },
  recyclable: { name: 'قابل للتدوير', color: 'green' },
  organic: { name: 'عضوي', color: 'amber' },
  hazardous: { name: 'خطر', color: 'red' },
  medical: { name: 'طبي', color: 'pink' },
};

export default function SmartBinsMonitor() {
  const [bins, setBins] = useState(smartBinsData);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedBin, setSelectedBin] = useState(null);
  const [showBinDialog, setShowBinDialog] = useState(false);

  const predictOverflow = useMutation({
    mutationFn: async () => {
      return await base44.integrations.Core.InvokeLLM({
        prompt: `كخبير في إدارة النفايات الذكية، حلل بيانات الحاويات التالية وتنبأ بأوقات الامتلاء:

${bins.map(b => `- ${b.id}: ${b.location}, امتلاء ${b.fillLevel}%, نوع ${binTypes[b.type]?.name}`).join('\n')}

قدم:
1. توقعات الامتلاء للـ 24 ساعة القادمة
2. أولوية الجمع لكل حاوية
3. توصيات تحسين`,
        response_json_schema: {
          type: "object",
          properties: {
            predictions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  binId: { type: "string" },
                  predictedFillTime: { type: "string" },
                  priority: { type: "string" },
                  recommendation: { type: "string" }
                }
              }
            },
            overallInsights: { type: "array", items: { type: "string" } }
          }
        }
      });
    },
    onSuccess: (data) => {
      toast.success('تم تحليل البيانات وإنشاء التوقعات');
    }
  });

  const filteredBins = bins.filter(bin => {
    const matchesSearch = bin.location.includes(searchQuery) || bin.id.includes(searchQuery);
    const matchesType = filterType === 'all' || bin.type === filterType;
    const matchesStatus = filterStatus === 'all' || bin.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const stats = {
    total: bins.length,
    needsCollection: bins.filter(b => b.fillLevel >= 75).length,
    alerts: bins.filter(b => b.status === 'alert' || b.fireAlert || b.tilt).length,
    avgFill: Math.round(bins.reduce((s, b) => s + b.fillLevel, 0) / bins.length),
    lowBattery: bins.filter(b => b.battery < 30).length,
  };

  const getStatusBadge = (bin) => {
    if (bin.fireAlert) return <Badge className="bg-red-500 text-white animate-pulse">حريق!</Badge>;
    if (bin.tilt) return <Badge className="bg-amber-500 text-white">مائلة</Badge>;
    if (bin.status === 'alert') return <Badge className="bg-red-500/20 text-red-400">تنبيه</Badge>;
    if (bin.status === 'needs_collection') return <Badge className="bg-amber-500/20 text-amber-400">يحتاج جمع</Badge>;
    return <Badge className="bg-green-500/20 text-green-400">طبيعي</Badge>;
  };

  return (
    <div className="space-y-4" dir="rtl">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'إجمالي الحاويات', value: stats.total, color: 'cyan' },
          { label: 'تحتاج جمع', value: stats.needsCollection, color: 'amber' },
          { label: 'تنبيهات', value: stats.alerts, color: 'red' },
          { label: 'متوسط الامتلاء', value: `${stats.avgFill}%`, color: 'blue' },
          { label: 'بطارية منخفضة', value: stats.lowBattery, color: 'purple' },
        ].map(stat => (
          <Card key={stat.label} className={`bg-${stat.color}-500/10 border-${stat.color}-500/30`}>
            <CardContent className="p-3 text-center">
              <p className="text-xl font-bold text-white">{stat.value}</p>
              <p className={`text-${stat.color}-400 text-xs`}>{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters & AI */}
      <div className="flex gap-3 flex-wrap">
        <Input
          placeholder="بحث بالموقع أو الرقم..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-64 bg-slate-800/50 border-slate-700 text-white"
        />
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-40 bg-slate-800/50 border-slate-700 text-white">
            <SelectValue placeholder="النوع" />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-700">
            <SelectItem value="all">جميع الأنواع</SelectItem>
            {Object.entries(binTypes).map(([k, v]) => <SelectItem key={k} value={k}>{v.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-40 bg-slate-800/50 border-slate-700 text-white">
            <SelectValue placeholder="الحالة" />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-700">
            <SelectItem value="all">جميع الحالات</SelectItem>
            <SelectItem value="normal">طبيعي</SelectItem>
            <SelectItem value="needs_collection">يحتاج جمع</SelectItem>
            <SelectItem value="alert">تنبيه</SelectItem>
          </SelectContent>
        </Select>
        <Button className="bg-purple-600 hover:bg-purple-700 mr-auto" onClick={() => predictOverflow.mutate()} disabled={predictOverflow.isPending}>
          {predictOverflow.isPending ? <RefreshCw className="w-4 h-4 ml-2 animate-spin" /> : <Brain className="w-4 h-4 ml-2" />}
          توقع الامتلاء AI
        </Button>
      </div>

      {/* Bins Grid */}
      <ScrollArea className="h-[450px]">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredBins.map(bin => (
            <Card key={bin.id} className={`glass-card border-indigo-500/20 bg-[#0f1629]/80 ${bin.fireAlert ? 'border-red-500 animate-pulse' : bin.status === 'alert' ? 'border-red-500/50' : ''}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-white font-bold text-sm">{bin.id}</p>
                    <p className="text-slate-400 text-xs">{bin.location}</p>
                  </div>
                  {getStatusBadge(bin)}
                </div>

                {/* Fill Level */}
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-slate-400 text-xs">الامتلاء</span>
                    <span className={`font-bold text-sm ${bin.fillLevel >= 80 ? 'text-red-400' : bin.fillLevel >= 60 ? 'text-amber-400' : 'text-green-400'}`}>
                      {bin.fillLevel}%
                    </span>
                  </div>
                  <Progress value={bin.fillLevel} className="h-2" />
                </div>

                {/* Sensors Grid */}
                <div className="grid grid-cols-4 gap-1 mb-3">
                  <div className="p-1.5 bg-slate-800/50 rounded text-center" title="الحرارة">
                    <ThermometerSun className={`w-3 h-3 mx-auto ${bin.temperature > 40 ? 'text-red-400' : 'text-amber-400'}`} />
                    <p className="text-white text-xs">{bin.temperature}°</p>
                  </div>
                  <div className="p-1.5 bg-slate-800/50 rounded text-center" title="الميثان">
                    <Wind className={`w-3 h-3 mx-auto ${bin.methane > 20 ? 'text-red-400' : bin.methane > 10 ? 'text-amber-400' : 'text-green-400'}`} />
                    <p className="text-white text-xs">{bin.methane}%</p>
                  </div>
                  <div className="p-1.5 bg-slate-800/50 rounded text-center" title="البطارية">
                    <Battery className={`w-3 h-3 mx-auto ${bin.battery < 30 ? 'text-red-400' : bin.battery < 60 ? 'text-amber-400' : 'text-green-400'}`} />
                    <p className="text-white text-xs">{bin.battery}%</p>
                  </div>
                  <div className="p-1.5 bg-slate-800/50 rounded text-center" title="الإشارة">
                    <Signal className={`w-3 h-3 mx-auto ${bin.signal === 'excellent' ? 'text-green-400' : bin.signal === 'good' ? 'text-cyan-400' : 'text-amber-400'}`} />
                    <p className="text-white text-xs">{bin.signal === 'excellent' ? '✓' : bin.signal === 'good' ? '○' : '!'}</p>
                  </div>
                </div>

                {/* Alerts */}
                {(bin.fireAlert || bin.tilt) && (
                  <div className="flex gap-2 mb-3">
                    {bin.fireAlert && <Badge className="bg-red-500 text-white text-xs"><Flame className="w-3 h-3 ml-1" />حريق</Badge>}
                    {bin.tilt && <Badge className="bg-amber-500 text-white text-xs">حاوية مائلة</Badge>}
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <p className="text-slate-500 text-xs">
                    <Clock className="w-3 h-3 inline ml-1" />
                    {bin.lastCollection}
                  </p>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" className="h-7" onClick={() => { setSelectedBin(bin); setShowBinDialog(true); }}>
                      <Eye className="w-3 h-3" />
                    </Button>
                    {bin.fillLevel >= 75 && (
                      <Button size="sm" className="bg-green-600 hover:bg-green-700 h-7">
                        <Truck className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>

      {/* Bin Details Dialog */}
      <Dialog open={showBinDialog} onOpenChange={setShowBinDialog}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-green-400" />
              تفاصيل الحاوية {selectedBin?.id}
            </DialogTitle>
          </DialogHeader>
          {selectedBin && (
            <div className="space-y-4 mt-4">
              <div className="p-3 bg-slate-800/50 rounded-lg">
                <p className="text-white font-medium">{selectedBin.location}</p>
                <p className="text-slate-400 text-sm">المنطقة: {selectedBin.zone} | النوع: {binTypes[selectedBin.type]?.name}</p>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'الامتلاء', value: `${selectedBin.fillLevel}%`, icon: Trash2 },
                  { label: 'الحرارة', value: `${selectedBin.temperature}°C`, icon: ThermometerSun },
                  { label: 'الميثان', value: `${selectedBin.methane}%`, icon: Wind },
                  { label: 'البطارية', value: `${selectedBin.battery}%`, icon: Battery },
                  { label: 'الإشارة', value: selectedBin.signal, icon: Signal },
                  { label: 'الحالة', value: selectedBin.status, icon: CheckCircle },
                ].map(item => (
                  <div key={item.label} className="p-2 bg-slate-800/30 rounded text-center">
                    <item.icon className="w-4 h-4 mx-auto text-cyan-400 mb-1" />
                    <p className="text-white text-sm font-bold">{item.value}</p>
                    <p className="text-slate-500 text-xs">{item.label}</p>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Button className="flex-1 bg-green-600 hover:bg-green-700">
                  <Truck className="w-4 h-4 ml-2" />
                  جدولة جمع
                </Button>
                <Button variant="outline" className="border-slate-600">
                  <Settings className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}