import React, { useState } from 'react';
import {
  BarChart3, TrendingUp, Gauge, Fuel, Car, User, Clock, Target,
  Download, Settings, Plus, X, GripVertical
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { toast } from 'sonner';

const availableWidgets = [
  { id: 'total_distance', name: 'إجمالي المسافة', icon: Car, value: '12,450 كم', trend: '+5%' },
  { id: 'avg_speed', name: 'متوسط السرعة', icon: Gauge, value: '65 كم/س', trend: '-2%' },
  { id: 'fuel_efficiency', name: 'كفاءة الوقود', icon: Fuel, value: '8.5 كم/ل', trend: '+3%' },
  { id: 'driver_score', name: 'تقييم السائقين', icon: User, value: '82/100', trend: '+1%' },
  { id: 'uptime', name: 'وقت التشغيل', icon: Clock, value: '94%', trend: '+2%' },
  { id: 'maintenance', name: 'الصيانة المتوقعة', icon: Target, value: '3 مركبات', trend: '0%' },
];

const historicalData = [
  { month: 'يناير', current: 11200, average: 10500, target: 12000 },
  { month: 'فبراير', current: 11800, average: 10800, target: 12000 },
  { month: 'مارس', current: 12100, average: 11000, target: 12000 },
  { month: 'أبريل', current: 11500, average: 11200, target: 12000 },
  { month: 'مايو', current: 12300, average: 11500, target: 12000 },
  { month: 'يونيو', current: 12450, average: 11800, target: 12000 },
];

const benchmarkData = [
  { name: 'شاحنة #12', score: 88, average: 75 },
  { name: 'فان #08', score: 72, average: 75 },
  { name: 'شاحنة #15', score: 95, average: 75 },
  { name: 'سيدان #03', score: 80, average: 75 },
];

export default function FleetAnalyticsDashboard() {
  const [activeWidgets, setActiveWidgets] = useState(['total_distance', 'avg_speed', 'fuel_efficiency', 'driver_score']);
  const [timeRange, setTimeRange] = useState('6months');
  const [editMode, setEditMode] = useState(false);

  const toggleWidget = (id) => {
    if (activeWidgets.includes(id)) {
      setActiveWidgets(prev => prev.filter(w => w !== id));
    } else {
      setActiveWidgets(prev => [...prev, id]);
    }
  };

  const exportDashboard = (format) => {
    toast.success(`جاري تصدير لوحة التحكم بصيغة ${format}`);
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-cyan-400" />
          لوحة التحليلات المتقدمة
        </h3>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32 bg-slate-800/50 border-slate-700 text-white h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              <SelectItem value="1month">شهر</SelectItem>
              <SelectItem value="3months">3 أشهر</SelectItem>
              <SelectItem value="6months">6 أشهر</SelectItem>
              <SelectItem value="1year">سنة</SelectItem>
            </SelectContent>
          </Select>
          <Button size="sm" variant="outline" className="border-slate-600" onClick={() => setEditMode(!editMode)}>
            <Settings className="w-3 h-3 ml-1" />
            {editMode ? 'حفظ' : 'تخصيص'}
          </Button>
          <Button size="sm" variant="outline" className="border-green-500/50 text-green-400" onClick={() => exportDashboard('PDF')}>
            <Download className="w-3 h-3 ml-1" />
            تصدير
          </Button>
        </div>
      </div>

      {/* Widget Selector */}
      {editMode && (
        <Card className="bg-purple-500/10 border-purple-500/30">
          <CardContent className="p-4">
            <p className="text-purple-400 text-sm mb-3">اختر المؤشرات لعرضها:</p>
            <div className="flex flex-wrap gap-2">
              {availableWidgets.map(widget => (
                <Badge
                  key={widget.id}
                  className={`cursor-pointer ${activeWidgets.includes(widget.id) ? 'bg-cyan-500/20 text-cyan-400' : 'bg-slate-700 text-slate-400'}`}
                  onClick={() => toggleWidget(widget.id)}
                >
                  {activeWidgets.includes(widget.id) && <X className="w-3 h-3 ml-1" />}
                  {widget.name}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* KPI Widgets */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {availableWidgets.filter(w => activeWidgets.includes(w.id)).map(widget => (
          <Card key={widget.id} className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <widget.icon className="w-5 h-5 text-cyan-400" />
                <Badge className={widget.trend.startsWith('+') ? 'bg-green-500/20 text-green-400' : widget.trend.startsWith('-') ? 'bg-red-500/20 text-red-400' : 'bg-slate-600 text-slate-400'}>
                  {widget.trend}
                </Badge>
              </div>
              <p className="text-2xl font-bold text-white">{widget.value}</p>
              <p className="text-slate-400 text-sm">{widget.name}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Comparative Analysis */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white text-sm">المقارنة مع البيانات التاريخية</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={historicalData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} />
                  <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                  <Line type="monotone" dataKey="current" stroke="#22d3ee" strokeWidth={2} name="الحالي" />
                  <Line type="monotone" dataKey="average" stroke="#f59e0b" strokeWidth={2} strokeDasharray="5 5" name="المتوسط" />
                  <Line type="monotone" dataKey="target" stroke="#22c55e" strokeWidth={2} strokeDasharray="3 3" name="الهدف" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white text-sm">مقارنة أداء المركبات</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={benchmarkData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} />
                  <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                  <Bar dataKey="score" fill="#22d3ee" name="التقييم" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="average" fill="#64748b" name="متوسط الأسطول" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Predictive Maintenance Summary */}
      <Card className="bg-amber-500/10 border-amber-500/30">
        <CardHeader>
          <CardTitle className="text-white text-sm flex items-center gap-2">
            <Target className="w-4 h-4 text-amber-400" />
            توقعات الصيانة والتوقف
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-800/50 rounded-lg text-center">
              <p className="text-3xl font-bold text-amber-400">3</p>
              <p className="text-slate-400 text-sm">مركبات تحتاج صيانة قريباً</p>
            </div>
            <div className="p-4 bg-slate-800/50 rounded-lg text-center">
              <p className="text-3xl font-bold text-red-400">1</p>
              <p className="text-slate-400 text-sm">توقف متوقع هذا الأسبوع</p>
            </div>
            <div className="p-4 bg-slate-800/50 rounded-lg text-center">
              <p className="text-3xl font-bold text-green-400">15,000</p>
              <p className="text-slate-400 text-sm">ر.س توفير متوقع</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}