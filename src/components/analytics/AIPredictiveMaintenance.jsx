import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  AlertTriangle, Clock, Wrench, TrendingUp, Brain, Zap, CheckCircle,
  Activity, Thermometer, Gauge, Battery, Wifi, Calendar, RefreshCw,
  FileText, Bell
} from 'lucide-react';
import {
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

// محاكاة بيانات الحساسات
const sensorData = {
  temperature: [
    { time: '00:00', value: 22 }, { time: '04:00', value: 21 }, { time: '08:00', value: 24 },
    { time: '12:00', value: 28 }, { time: '16:00', value: 32 }, { time: '20:00', value: 26 },
  ],
  vibration: [
    { time: '00:00', value: 0.5 }, { time: '04:00', value: 0.6 }, { time: '08:00', value: 1.2 },
    { time: '12:00', value: 1.8 }, { time: '16:00', value: 2.4 }, { time: '20:00', value: 1.5 },
  ],
  powerConsumption: [
    { time: '00:00', value: 2.1 }, { time: '04:00', value: 2.0 }, { time: '08:00', value: 3.5 },
    { time: '12:00', value: 4.2 }, { time: '16:00', value: 4.8 }, { time: '20:00', value: 3.2 },
  ]
};

const devicePredictions = [
  {
    id: 1,
    device: 'مكيف المبنى أ - الطابق 3',
    type: 'تكييف',
    healthScore: 45,
    riskLevel: 'high',
    predictedFailure: '5-7 أيام',
    failureProbability: 78,
    anomalies: [
      { type: 'حرارة مرتفعة', severity: 'high', value: '35°C', threshold: '30°C' },
      { type: 'اهتزاز غير طبيعي', severity: 'medium', value: '2.4mm/s', threshold: '2.0mm/s' }
    ],
    sensorStatus: { temperature: 'warning', vibration: 'critical', power: 'normal' },
    lastMaintenance: '2024-09-15',
    maintenanceHistory: 8,
    estimatedCost: 1500,
    recommendedAction: 'صيانة عاجلة - فحص الضاغط والمروحة'
  },
  {
    id: 2,
    device: 'مضخة المياه الرئيسية',
    type: 'ميكانيكي',
    healthScore: 62,
    riskLevel: 'medium',
    predictedFailure: '2-3 أسابيع',
    failureProbability: 45,
    anomalies: [
      { type: 'استهلاك طاقة متزايد', severity: 'medium', value: '4.8kW', threshold: '4.0kW' }
    ],
    sensorStatus: { temperature: 'normal', vibration: 'warning', power: 'warning' },
    lastMaintenance: '2024-10-20',
    maintenanceHistory: 5,
    estimatedCost: 800,
    recommendedAction: 'جدولة صيانة وقائية - فحص المحامل'
  },
  {
    id: 3,
    device: 'كاميرا المدخل الرئيسي',
    type: 'إلكتروني',
    healthScore: 88,
    riskLevel: 'low',
    predictedFailure: '3+ أشهر',
    failureProbability: 12,
    anomalies: [],
    sensorStatus: { temperature: 'normal', vibration: 'normal', power: 'normal' },
    lastMaintenance: '2024-11-01',
    maintenanceHistory: 2,
    estimatedCost: 0,
    recommendedAction: 'لا يلزم إجراء حالياً'
  }
];

const riskColors = {
  low: 'bg-green-500/20 text-green-400',
  medium: 'bg-amber-500/20 text-amber-400',
  high: 'bg-red-500/20 text-red-400',
  critical: 'bg-red-600/30 text-red-500'
};

const sensorStatusColors = {
  normal: 'text-green-400',
  warning: 'text-amber-400',
  critical: 'text-red-400'
};

export default function AIPredictiveMaintenance({ onCreateWorkOrder }) {
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [showWorkOrderDialog, setShowWorkOrderDialog] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analysisMutation = useMutation({
    mutationFn: async (device) => {
      return await base44.integrations.Core.InvokeLLM({
        prompt: `حلل بيانات الجهاز التالي وتوقع الأعطال:

الجهاز: ${device.device}
النوع: ${device.type}
درجة الصحة: ${device.healthScore}%
الشذوذات: ${device.anomalies.map(a => `${a.type}: ${a.value}`).join(', ')}
آخر صيانة: ${device.lastMaintenance}
عدد الصيانات السابقة: ${device.maintenanceHistory}

قدم:
1. تحليل تفصيلي للحالة
2. الأسباب المحتملة للمشكلة
3. خطة الصيانة المقترحة
4. الأولوية والإطار الزمني`,
        response_json_schema: {
          type: "object",
          properties: {
            analysis: { type: "string" },
            rootCauses: { type: "array", items: { type: "string" } },
            maintenancePlan: { type: "array", items: { type: "string" } },
            priority: { type: "string" },
            timeframe: { type: "string" },
            confidence: { type: "number" }
          }
        }
      });
    },
    onSuccess: (data) => {
      setSelectedDevice(prev => ({ ...prev, aiAnalysis: data }));
      setIsAnalyzing(false);
    },
    onError: () => {
      toast.error('فشل التحليل');
      setIsAnalyzing(false);
    }
  });

  const analyzeDevice = (device) => {
    setSelectedDevice(device);
    setIsAnalyzing(true);
    analysisMutation.mutate(device);
  };

  const createWorkOrder = (device) => {
    const workOrder = {
      device_name: device.device,
      device_type: device.type,
      maintenance_type: device.riskLevel === 'high' ? 'emergency' : 'preventive',
      priority: device.riskLevel === 'high' ? 'critical' : device.riskLevel === 'medium' ? 'high' : 'medium',
      description: device.recommendedAction,
      estimated_cost: device.estimatedCost,
      source: 'ai_prediction'
    };
    onCreateWorkOrder?.(workOrder);
    toast.success('تم إنشاء أمر العمل');
    setShowWorkOrderDialog(false);
  };

  const highRiskDevices = devicePredictions.filter(d => d.riskLevel === 'high' || d.riskLevel === 'critical');

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Brain className="w-6 h-6 text-purple-400" />
            الصيانة التنبؤية AI
          </h2>
          <p className="text-slate-400 text-sm">تنبؤ بالأعطال قبل حدوثها</p>
        </div>
        <Button variant="outline" className="border-slate-600">
          <RefreshCw className="w-4 h-4 ml-2" />
          تحديث التحليل
        </Button>
      </div>

      {/* Alerts */}
      {highRiskDevices.length > 0 && (
        <Card className="glass-card border-red-500/30 bg-red-500/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-2">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              <span className="text-red-300 font-bold">تحذيرات عاجلة ({highRiskDevices.length})</span>
            </div>
            <div className="space-y-2">
              {highRiskDevices.map(d => (
                <div key={d.id} className="flex items-center justify-between p-2 bg-red-500/10 rounded-lg">
                  <div>
                    <p className="text-white text-sm">{d.device}</p>
                    <p className="text-red-400 text-xs">احتمال العطل: {d.failureProbability}% خلال {d.predictedFailure}</p>
                  </div>
                  <Button size="sm" className="bg-red-600 hover:bg-red-700" onClick={() => createWorkOrder(d)}>
                    <Wrench className="w-3 h-3 ml-1" />
                    أمر صيانة
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass-card border-green-500/20 bg-green-500/5">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-400">
              {devicePredictions.filter(d => d.riskLevel === 'low').length}
            </p>
            <p className="text-slate-400 text-xs">أجهزة سليمة</p>
          </CardContent>
        </Card>
        <Card className="glass-card border-amber-500/20 bg-amber-500/5">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-amber-400">
              {devicePredictions.filter(d => d.riskLevel === 'medium').length}
            </p>
            <p className="text-slate-400 text-xs">تحتاج مراقبة</p>
          </CardContent>
        </Card>
        <Card className="glass-card border-red-500/20 bg-red-500/5">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-red-400">{highRiskDevices.length}</p>
            <p className="text-slate-400 text-xs">خطورة عالية</p>
          </CardContent>
        </Card>
        <Card className="glass-card border-purple-500/20 bg-purple-500/5">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-purple-400">
              {devicePredictions.reduce((s, d) => s + d.estimatedCost, 0).toLocaleString()}
            </p>
            <p className="text-slate-400 text-xs">تكلفة متوقعة (ر.س)</p>
          </CardContent>
        </Card>
      </div>

      {/* Device Predictions */}
      <div className="space-y-3">
        {devicePredictions.map((device) => (
          <motion.div
            key={device.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className={`glass-card border-indigo-500/20 bg-[#0f1629]/80 ${
              device.riskLevel === 'high' ? 'ring-1 ring-red-500/50' : ''
            }`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-white font-bold">{device.device}</h3>
                      <Badge className={riskColors[device.riskLevel]}>
                        {device.riskLevel === 'low' ? 'منخفض' : device.riskLevel === 'medium' ? 'متوسط' : 'عالي'}
                      </Badge>
                    </div>
                    <p className="text-slate-400 text-sm">{device.type}</p>
                  </div>
                  <div className="text-left">
                    <div className="flex items-center gap-1">
                      <span className={`text-2xl font-bold ${
                        device.healthScore > 70 ? 'text-green-400' : 
                        device.healthScore > 40 ? 'text-amber-400' : 'text-red-400'
                      }`}>
                        {device.healthScore}%
                      </span>
                    </div>
                    <p className="text-slate-500 text-xs">صحة الجهاز</p>
                  </div>
                </div>

                {/* Sensor Status */}
                <div className="flex items-center gap-4 mb-3 p-2 bg-slate-800/50 rounded-lg">
                  <div className="flex items-center gap-1">
                    <Thermometer className={`w-4 h-4 ${sensorStatusColors[device.sensorStatus.temperature]}`} />
                    <span className="text-slate-400 text-xs">الحرارة</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Activity className={`w-4 h-4 ${sensorStatusColors[device.sensorStatus.vibration]}`} />
                    <span className="text-slate-400 text-xs">الاهتزاز</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Gauge className={`w-4 h-4 ${sensorStatusColors[device.sensorStatus.power]}`} />
                    <span className="text-slate-400 text-xs">الطاقة</span>
                  </div>
                </div>

                {/* Anomalies */}
                {device.anomalies.length > 0 && (
                  <div className="space-y-1 mb-3">
                    {device.anomalies.map((anomaly, i) => (
                      <div key={i} className={`p-2 rounded-lg text-xs ${
                        anomaly.severity === 'high' ? 'bg-red-500/10 text-red-400' : 'bg-amber-500/10 text-amber-400'
                      }`}>
                        <span className="font-medium">{anomaly.type}:</span> {anomaly.value} (الحد: {anomaly.threshold})
                      </div>
                    ))}
                  </div>
                )}

                {/* Prediction */}
                <div className="flex items-center justify-between p-2 bg-slate-800/30 rounded-lg mb-3">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-300 text-sm">العطل المتوقع: {device.predictedFailure}</span>
                  </div>
                  <Badge className="bg-slate-700">
                    احتمال {device.failureProbability}%
                  </Badge>
                </div>

                {/* Recommendation */}
                <div className="p-2 bg-cyan-500/10 border border-cyan-500/30 rounded-lg mb-3">
                  <p className="text-cyan-400 text-sm">
                    <Zap className="w-4 h-4 inline ml-1" />
                    {device.recommendedAction}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="bg-purple-600 hover:bg-purple-700"
                    onClick={() => analyzeDevice(device)}
                    disabled={isAnalyzing && selectedDevice?.id === device.id}
                  >
                    {isAnalyzing && selectedDevice?.id === device.id ? (
                      <RefreshCw className="w-3 h-3 ml-1 animate-spin" />
                    ) : (
                      <Brain className="w-3 h-3 ml-1" />
                    )}
                    تحليل AI
                  </Button>
                  {device.riskLevel !== 'low' && (
                    <Button
                      size="sm"
                      className={device.riskLevel === 'high' ? 'bg-red-600 hover:bg-red-700' : 'bg-amber-600 hover:bg-amber-700'}
                      onClick={() => createWorkOrder(device)}
                    >
                      <FileText className="w-3 h-3 ml-1" />
                      أمر صيانة
                    </Button>
                  )}
                </div>

                {/* AI Analysis */}
                {selectedDevice?.id === device.id && selectedDevice?.aiAnalysis && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <Brain className="w-5 h-5 text-purple-400" />
                      <span className="text-purple-300 font-medium">تحليل AI التفصيلي</span>
                      <Badge className="bg-purple-500/20 text-purple-400">
                        دقة: {selectedDevice.aiAnalysis.confidence}%
                      </Badge>
                    </div>
                    
                    <p className="text-slate-300 text-sm mb-3">{selectedDevice.aiAnalysis.analysis}</p>
                    
                    {selectedDevice.aiAnalysis.rootCauses?.length > 0 && (
                      <div className="mb-3">
                        <p className="text-amber-400 text-xs mb-1">الأسباب المحتملة:</p>
                        {selectedDevice.aiAnalysis.rootCauses.map((c, i) => (
                          <p key={i} className="text-slate-400 text-xs">• {c}</p>
                        ))}
                      </div>
                    )}
                    
                    {selectedDevice.aiAnalysis.maintenancePlan?.length > 0 && (
                      <div className="p-2 bg-green-500/10 rounded">
                        <p className="text-green-400 text-xs mb-1">خطة الصيانة:</p>
                        {selectedDevice.aiAnalysis.maintenancePlan.map((s, i) => (
                          <p key={i} className="text-slate-300 text-xs">{i + 1}. {s}</p>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Sensor Charts */}
      <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
        <CardHeader className="pb-2">
          <CardTitle className="text-white text-sm">قراءات الحساسات (مكيف المبنى أ)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="h-32">
              <p className="text-slate-400 text-xs mb-1">الحرارة (°C)</p>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={sensorData.temperature}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="time" stroke="#94a3b8" fontSize={8} />
                  <YAxis stroke="#94a3b8" fontSize={8} />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none' }} />
                  <ReferenceLine y={30} stroke="#ef4444" strokeDasharray="3 3" />
                  <Area type="monotone" dataKey="value" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="h-32">
              <p className="text-slate-400 text-xs mb-1">الاهتزاز (mm/s)</p>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={sensorData.vibration}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="time" stroke="#94a3b8" fontSize={8} />
                  <YAxis stroke="#94a3b8" fontSize={8} />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none' }} />
                  <ReferenceLine y={2} stroke="#ef4444" strokeDasharray="3 3" />
                  <Area type="monotone" dataKey="value" stroke="#ef4444" fill="#ef4444" fillOpacity={0.3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="h-32">
              <p className="text-slate-400 text-xs mb-1">استهلاك الطاقة (kW)</p>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={sensorData.powerConsumption}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="time" stroke="#94a3b8" fontSize={8} />
                  <YAxis stroke="#94a3b8" fontSize={8} />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none' }} />
                  <Area type="monotone" dataKey="value" stroke="#22d3ee" fill="#22d3ee" fillOpacity={0.3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}