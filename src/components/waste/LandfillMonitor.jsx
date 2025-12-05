import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  Mountain, Flame, Wind, ThermometerSun, Droplets, AlertTriangle, CheckCircle,
  Activity, Brain, RefreshCw, MapPin, TrendingUp, Shield, Eye
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { toast } from 'sonner';

const landfillData = {
  id: 'LF-001',
  name: 'مكب النفايات الرئيسي',
  location: 'شمال المدينة - 25 كم',
  capacity: 2500000, // طن
  currentFill: 1875000, // طن
  status: 'operational',
  lastInspection: '2024-12-01',
};

const gasEmissions = [
  { time: '00:00', methane: 45, co2: 120, h2s: 8 },
  { time: '04:00', methane: 48, co2: 125, h2s: 9 },
  { time: '08:00', methane: 52, co2: 130, h2s: 10 },
  { time: '12:00', methane: 58, co2: 145, h2s: 12 },
  { time: '16:00', methane: 55, co2: 140, h2s: 11 },
  { time: '20:00', methane: 50, co2: 135, h2s: 9 },
];

const sensorReadings = {
  methane: { value: 52, unit: 'ppm', max: 100, status: 'warning' },
  co2: { value: 145, unit: 'ppm', max: 300, status: 'normal' },
  h2s: { value: 12, unit: 'ppm', max: 25, status: 'normal' },
  temperature: { value: 42, unit: '°C', max: 60, status: 'normal' },
  soilMoisture: { value: 35, unit: '%', max: 100, status: 'normal' },
  leachateLevel: { value: 68, unit: '%', max: 100, status: 'warning' },
  groundwater: { value: 'normal', unit: '', status: 'normal' },
  compaction: { value: 85, unit: '%', max: 100, status: 'normal' },
};

const alerts = [
  { id: 1, type: 'warning', message: 'ارتفاع مستوى الميثان في القطاع B', time: '10:30' },
  { id: 2, type: 'info', message: 'صيانة مجدولة لنظام جمع الغاز', time: '14:00' },
  { id: 3, type: 'warning', message: 'مستوى الرشاحة يقترب من الحد الأعلى', time: '09:15' },
];

export default function LandfillMonitor() {
  const [predictions, setPredictions] = useState(null);

  const analyzeRisks = useMutation({
    mutationFn: async () => {
      return await base44.integrations.Core.InvokeLLM({
        prompt: `كخبير في مراقبة المكبات، حلل البيانات التالية وقدم تقييم المخاطر:

بيانات المكب:
- السعة: ${landfillData.capacity} طن
- الامتلاء الحالي: ${landfillData.currentFill} طن (${Math.round(landfillData.currentFill/landfillData.capacity*100)}%)

قراءات المستشعرات:
- الميثان: ${sensorReadings.methane.value} ppm
- CO2: ${sensorReadings.co2.value} ppm
- H2S: ${sensorReadings.h2s.value} ppm
- الحرارة: ${sensorReadings.temperature.value}°C
- رطوبة التربة: ${sensorReadings.soilMoisture.value}%
- مستوى الرشاحة: ${sensorReadings.leachateLevel.value}%

قدم:
1. تقييم خطر الحريق
2. تقييم تراكم الغاز
3. تقييم المخاطر الهيكلية
4. توقعات المشاكل المحتملة
5. توصيات وقائية`,
        response_json_schema: {
          type: "object",
          properties: {
            fireRisk: { type: "object", properties: { level: { type: "string" }, score: { type: "number" }, factors: { type: "array", items: { type: "string" } } } },
            gasRisk: { type: "object", properties: { level: { type: "string" }, score: { type: "number" }, factors: { type: "array", items: { type: "string" } } } },
            structuralRisk: { type: "object", properties: { level: { type: "string" }, score: { type: "number" }, factors: { type: "array", items: { type: "string" } } } },
            predictions: { type: "array", items: { type: "object", properties: { issue: { type: "string" }, probability: { type: "number" }, timeframe: { type: "string" } } } },
            recommendations: { type: "array", items: { type: "string" } }
          }
        }
      });
    },
    onSuccess: (data) => {
      setPredictions(data);
      toast.success('تم تحليل المخاطر بنجاح');
    }
  });

  const fillPercentage = Math.round(landfillData.currentFill / landfillData.capacity * 100);

  const getRiskColor = (level) => {
    switch (level?.toLowerCase()) {
      case 'high': case 'عالي': return 'red';
      case 'medium': case 'متوسط': return 'amber';
      default: return 'green';
    }
  };

  return (
    <div className="space-y-4" dir="rtl">
      {/* Landfill Overview */}
      <Card className="glass-card border-indigo-500/20 bg-gradient-to-r from-amber-500/10 to-red-500/10">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Mountain className="w-10 h-10 text-amber-400" />
              <div>
                <h3 className="text-white font-bold text-lg">{landfillData.name}</h3>
                <p className="text-slate-400 text-sm flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {landfillData.location}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-green-500/20 text-green-400">تشغيلي</Badge>
              <Button className="bg-purple-600 hover:bg-purple-700" onClick={() => analyzeRisks.mutate()} disabled={analyzeRisks.isPending}>
                {analyzeRisks.isPending ? <RefreshCw className="w-4 h-4 ml-2 animate-spin" /> : <Brain className="w-4 h-4 ml-2" />}
                تحليل المخاطر AI
              </Button>
            </div>
          </div>
          <div className="mb-2">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-slate-400">مستوى الامتلاء</span>
              <span className={`font-bold ${fillPercentage > 80 ? 'text-red-400' : fillPercentage > 60 ? 'text-amber-400' : 'text-green-400'}`}>
                {fillPercentage}%
              </span>
            </div>
            <Progress value={fillPercentage} className="h-4" />
            <p className="text-slate-500 text-xs mt-1">
              {landfillData.currentFill.toLocaleString()} / {landfillData.capacity.toLocaleString()} طن
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Sensor Readings */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { key: 'methane', label: 'الميثان CH4', icon: Wind, color: 'amber' },
          { key: 'co2', label: 'ثاني الأكسيد CO2', icon: Wind, color: 'blue' },
          { key: 'temperature', label: 'الحرارة', icon: ThermometerSun, color: 'red' },
          { key: 'leachateLevel', label: 'مستوى الرشاحة', icon: Droplets, color: 'cyan' },
        ].map(sensor => {
          const data = sensorReadings[sensor.key];
          return (
            <Card key={sensor.key} className={`bg-${sensor.color}-500/10 border-${sensor.color}-500/30`}>
              <CardContent className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <sensor.icon className={`w-5 h-5 text-${sensor.color}-400`} />
                  {data.status === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-400" />}
                </div>
                <p className="text-2xl font-bold text-white">{data.value}{data.unit}</p>
                <p className={`text-${sensor.color}-400 text-xs`}>{sensor.label}</p>
                {data.max && <Progress value={(data.value / data.max) * 100} className="h-1 mt-2" />}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Gas Emissions Chart */}
      <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
        <CardHeader className="pb-2">
          <CardTitle className="text-white text-sm">انبعاثات الغاز اليومية</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={gasEmissions}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                <Area type="monotone" dataKey="methane" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.3} name="الميثان" />
                <Area type="monotone" dataKey="co2" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} name="CO2" />
                <Area type="monotone" dataKey="h2s" stroke="#ef4444" fill="#ef4444" fillOpacity={0.3} name="H2S" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* AI Risk Analysis */}
      {predictions && (
        <Card className="glass-card border-purple-500/30 bg-purple-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <Brain className="w-4 h-4 text-purple-400" />
              تحليل المخاطر بالذكاء الاصطناعي
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-3 mb-4">
              {[
                { label: 'خطر الحريق', data: predictions.fireRisk, icon: Flame },
                { label: 'خطر الغاز', data: predictions.gasRisk, icon: Wind },
                { label: 'خطر هيكلي', data: predictions.structuralRisk, icon: Shield },
              ].map(risk => (
                <div key={risk.label} className={`p-3 rounded-lg bg-${getRiskColor(risk.data?.level)}-500/10 border border-${getRiskColor(risk.data?.level)}-500/30`}>
                  <div className="flex items-center justify-between mb-2">
                    <risk.icon className={`w-5 h-5 text-${getRiskColor(risk.data?.level)}-400`} />
                    <Badge className={`bg-${getRiskColor(risk.data?.level)}-500/20 text-${getRiskColor(risk.data?.level)}-400`}>
                      {risk.data?.level || 'منخفض'}
                    </Badge>
                  </div>
                  <p className="text-white font-medium text-sm">{risk.label}</p>
                  <p className="text-2xl font-bold text-white">{risk.data?.score || 0}%</p>
                </div>
              ))}
            </div>
            {predictions.recommendations?.length > 0 && (
              <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                <p className="text-green-400 font-medium text-sm mb-2">التوصيات:</p>
                <ul className="space-y-1">
                  {predictions.recommendations.map((rec, i) => (
                    <li key={i} className="text-white text-sm flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Alerts */}
      <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
        <CardHeader className="pb-2">
          <CardTitle className="text-white text-sm">التنبيهات الأخيرة</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {alerts.map(alert => (
              <div key={alert.id} className={`p-3 rounded-lg ${alert.type === 'warning' ? 'bg-amber-500/10 border border-amber-500/30' : 'bg-blue-500/10 border border-blue-500/30'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className={`w-4 h-4 ${alert.type === 'warning' ? 'text-amber-400' : 'text-blue-400'}`} />
                    <p className="text-white text-sm">{alert.message}</p>
                  </div>
                  <span className="text-slate-500 text-xs">{alert.time}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}