import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  Activity, AlertTriangle, TrendingDown, TrendingUp, Zap, Clock, Target,
  Eye, Bell, Settings, RefreshCw, Loader2, Search, Filter, ChevronDown,
  ChevronUp, AlertOctagon, CheckCircle, XCircle, Cpu, BarChart3,
  ArrowRight, Play, Pause, Volume2, VolumeX, ExternalLink, Layers
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, ReferenceLine, ReferenceArea
} from 'recharts';
import { toast } from 'sonner';

// Simulated real-time model metrics
const generateMetrics = () => ({
  timestamp: new Date().toISOString(),
  accuracy: 92 + Math.random() * 6 - (Math.random() > 0.9 ? 15 : 0),
  latency: 40 + Math.random() * 20 + (Math.random() > 0.95 ? 50 : 0),
  throughput: 100 + Math.random() * 50,
  errorRate: Math.random() * 3 + (Math.random() > 0.92 ? 8 : 0),
  detections: Math.floor(50 + Math.random() * 100),
  anomalyScore: Math.random() * 100
});

const models = [
  { id: 'face-recognition', name: 'التعرف على الوجوه', status: 'healthy' },
  { id: 'vehicle-detection', name: 'كشف المركبات', status: 'warning' },
  { id: 'anomaly-detection', name: 'كشف الشذوذات', status: 'healthy' },
  { id: 'crowd-analysis', name: 'تحليل الحشود', status: 'critical' },
  { id: 'threat-detection', name: 'كشف التهديدات', status: 'healthy' },
];

export default function AIRealTimeModelMonitor() {
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [metricsHistory, setMetricsHistory] = useState([]);
  const [anomalies, setAnomalies] = useState([]);
  const [selectedModel, setSelectedModel] = useState('all');
  const [showDrillDown, setShowDrillDown] = useState(false);
  const [selectedAnomaly, setSelectedAnomaly] = useState(null);
  const [thresholds, setThresholds] = useState({
    accuracyMin: 85,
    latencyMax: 100,
    errorRateMax: 5
  });
  const [showSettings, setShowSettings] = useState(false);

  // Generate and check metrics
  const checkForAnomalies = useCallback((metrics) => {
    const newAnomalies = [];
    
    if (metrics.accuracy < thresholds.accuracyMin) {
      newAnomalies.push({
        id: Date.now() + '_accuracy',
        type: 'accuracy_drop',
        severity: metrics.accuracy < 80 ? 'critical' : 'warning',
        metric: 'الدقة',
        value: metrics.accuracy.toFixed(1),
        threshold: thresholds.accuracyMin,
        message: `انخفاض حاد في الدقة: ${metrics.accuracy.toFixed(1)}%`,
        timestamp: new Date(),
        model: models[Math.floor(Math.random() * models.length)].name,
        details: {
          expected: thresholds.accuracyMin,
          actual: metrics.accuracy,
          deviation: ((thresholds.accuracyMin - metrics.accuracy) / thresholds.accuracyMin * 100).toFixed(1),
          possibleCauses: ['تغير في جودة البيانات', 'انحراف في التوزيع', 'تحديث النموذج'],
          affectedDetections: Math.floor(Math.random() * 50) + 10,
          timeline: Array.from({length: 10}, (_, i) => ({
            time: `${i}:00`,
            value: 90 + Math.random() * 5 - (i > 7 ? 10 : 0)
          }))
        }
      });
    }

    if (metrics.latency > thresholds.latencyMax) {
      newAnomalies.push({
        id: Date.now() + '_latency',
        type: 'latency_spike',
        severity: metrics.latency > 150 ? 'critical' : 'warning',
        metric: 'زمن الاستجابة',
        value: metrics.latency.toFixed(0),
        threshold: thresholds.latencyMax,
        message: `ارتفاع في زمن الاستجابة: ${metrics.latency.toFixed(0)}ms`,
        timestamp: new Date(),
        model: models[Math.floor(Math.random() * models.length)].name,
        details: {
          expected: thresholds.latencyMax,
          actual: metrics.latency,
          deviation: ((metrics.latency - thresholds.latencyMax) / thresholds.latencyMax * 100).toFixed(1),
          possibleCauses: ['حمل زائد على الخادم', 'مشكلة في الشبكة', 'استعلامات معقدة'],
          affectedRequests: Math.floor(Math.random() * 200) + 50,
          timeline: Array.from({length: 10}, (_, i) => ({
            time: `${i}:00`,
            value: 45 + Math.random() * 10 + (i > 6 ? 40 : 0)
          }))
        }
      });
    }

    if (metrics.errorRate > thresholds.errorRateMax) {
      newAnomalies.push({
        id: Date.now() + '_error',
        type: 'error_spike',
        severity: 'critical',
        metric: 'معدل الأخطاء',
        value: metrics.errorRate.toFixed(1),
        threshold: thresholds.errorRateMax,
        message: `ارتفاع في معدل الأخطاء: ${metrics.errorRate.toFixed(1)}%`,
        timestamp: new Date(),
        model: models[Math.floor(Math.random() * models.length)].name,
        details: {
          expected: thresholds.errorRateMax,
          actual: metrics.errorRate,
          deviation: ((metrics.errorRate - thresholds.errorRateMax) / thresholds.errorRateMax * 100).toFixed(1),
          possibleCauses: ['بيانات تالفة', 'خطأ في المعالجة', 'عدم توافق الإصدار'],
          affectedOperations: Math.floor(Math.random() * 100) + 20,
          errorTypes: [
            { type: 'Timeout', count: Math.floor(Math.random() * 30) },
            { type: 'Invalid Input', count: Math.floor(Math.random() * 20) },
            { type: 'Model Error', count: Math.floor(Math.random() * 15) },
          ],
          timeline: Array.from({length: 10}, (_, i) => ({
            time: `${i}:00`,
            value: 1 + Math.random() * 2 + (i > 5 ? 6 : 0)
          }))
        }
      });
    }

    return newAnomalies;
  }, [thresholds]);

  // Real-time monitoring loop
  useEffect(() => {
    if (!isMonitoring) return;

    const interval = setInterval(() => {
      const metrics = generateMetrics();
      setMetricsHistory(prev => [...prev.slice(-29), { ...metrics, time: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) }]);
      
      const newAnomalies = checkForAnomalies(metrics);
      if (newAnomalies.length > 0) {
        setAnomalies(prev => [...newAnomalies, ...prev].slice(0, 50));
        if (soundEnabled) {
          // Play alert sound
          const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2teleQcAVp7d1aFpBgAwn+DcqnQMABih3t2sgxIAFKLc2quMGAAVodjWqJcdABei09KjnSIAGqPOzJ6gJwAdosXGmaMtACKiv7+XpzEAJaG4uZWqNQApn7Gykas4ACydrqqQrTsALpylpI6vPgAwm5+ejrFAADKZl5iMs0IANJaQkouzRAA2lIiLirVGADeRgYWJt0gAOI56f4i4SgA5i3N5h7pMADqIbHOGu04AO4VlboW9UAA7gmBpg75SADx+Wl+CwFQAPHpUWoHBVgA9dlBVf8NYADxyS1B+xFoAPW5GS3zFXAA9akFGe8ddAD5mO0F5yF8APmI2PXjJYQA+XjE4dspjAD5aLTN1y2QAPlYoL3PMZgA+UiQrc81oAD5OHyZyzGkAPkobIm/MawA+RhcdcMtsAD5DEhluym0APUEPFG3KbwA9PgwQbMlwAD07CAxtynEAPTgFCGzIcgA9NAEEa8hzAD0w/v9ryXQAPSz8/GrJdQA9Kfn4acl2AD0l9vVpyXcAPSHz8mjJeAA9H/HwaMl5AD0b7u1oy3kAPhvs62jLegA+Gurs');
          audio.volume = 0.3;
          audio.play().catch(() => {});
        }
        toast.error(`تم اكتشاف ${newAnomalies.length} شذوذ جديد!`, { duration: 3000 });
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [isMonitoring, soundEnabled, checkForAnomalies]);

  const currentMetrics = metricsHistory[metricsHistory.length - 1] || generateMetrics();

  const getStatusColor = (status) => {
    switch(status) {
      case 'critical': return 'red';
      case 'warning': return 'amber';
      case 'healthy': return 'green';
      default: return 'slate';
    }
  };

  const getSeverityIcon = (severity) => {
    switch(severity) {
      case 'critical': return <AlertOctagon className="w-4 h-4 text-red-400" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      default: return <CheckCircle className="w-4 h-4 text-green-400" />;
    }
  };

  const openDrillDown = (anomaly) => {
    setSelectedAnomaly(anomaly);
    setShowDrillDown(true);
  };

  const acknowledgeAnomaly = (anomalyId) => {
    setAnomalies(prev => prev.filter(a => a.id !== anomalyId));
    toast.success('تم الإقرار بالشذوذ');
  };

  return (
    <div className="space-y-4" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <motion.div
            animate={isMonitoring ? { 
              boxShadow: ['0 0 10px rgba(34,197,94,0.3)', '0 0 25px rgba(34,197,94,0.6)', '0 0 10px rgba(34,197,94,0.3)']
            } : {}}
            transition={{ duration: 1.5, repeat: Infinity }}
            className={`p-2 rounded-lg ${isMonitoring ? 'bg-green-500/20' : 'bg-slate-500/20'}`}
          >
            <Activity className={`w-6 h-6 ${isMonitoring ? 'text-green-400' : 'text-slate-400'}`} />
          </motion.div>
          <div>
            <h4 className="text-white font-bold text-lg">المراقبة الفورية لنماذج AI</h4>
            <p className="text-slate-400 text-xs">كشف استباقي للشذوذات • تنبيهات فورية • تحليل معمق</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedModel} onValueChange={setSelectedModel}>
            <SelectTrigger className="w-40 bg-slate-800/50 border-slate-700">
              <SelectValue placeholder="النموذج" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              <SelectItem value="all">جميع النماذج</SelectItem>
              {models.map(m => (
                <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="icon"
            className={`border-slate-600 ${soundEnabled ? 'text-green-400' : 'text-slate-400'}`}
            onClick={() => setSoundEnabled(!soundEnabled)}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </Button>
          <Button variant="outline" className="border-slate-600" onClick={() => setShowSettings(true)}>
            <Settings className="w-4 h-4" />
          </Button>
          <Button
            className={isMonitoring ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}
            onClick={() => setIsMonitoring(!isMonitoring)}
          >
            {isMonitoring ? <Pause className="w-4 h-4 ml-1" /> : <Play className="w-4 h-4 ml-1" />}
            {isMonitoring ? 'إيقاف' : 'تشغيل'}
          </Button>
        </div>
      </div>

      {/* Live Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card className={`${currentMetrics.accuracy < thresholds.accuracyMin ? 'bg-red-500/10 border-red-500/30 animate-pulse' : 'bg-green-500/10 border-green-500/30'}`}>
          <CardContent className="p-3 text-center">
            <Target className={`w-5 h-5 mx-auto mb-1 ${currentMetrics.accuracy < thresholds.accuracyMin ? 'text-red-400' : 'text-green-400'}`} />
            <p className="text-xl font-bold text-white">{currentMetrics.accuracy?.toFixed(1)}%</p>
            <p className="text-slate-400 text-xs">الدقة</p>
            {currentMetrics.accuracy < thresholds.accuracyMin && (
              <Badge className="mt-1 bg-red-500/20 text-red-400 text-[10px]">
                <TrendingDown className="w-2 h-2 ml-1" />
                منخفض
              </Badge>
            )}
          </CardContent>
        </Card>
        <Card className={`${currentMetrics.latency > thresholds.latencyMax ? 'bg-amber-500/10 border-amber-500/30 animate-pulse' : 'bg-cyan-500/10 border-cyan-500/30'}`}>
          <CardContent className="p-3 text-center">
            <Clock className={`w-5 h-5 mx-auto mb-1 ${currentMetrics.latency > thresholds.latencyMax ? 'text-amber-400' : 'text-cyan-400'}`} />
            <p className="text-xl font-bold text-white">{currentMetrics.latency?.toFixed(0)}ms</p>
            <p className="text-slate-400 text-xs">التأخير</p>
            {currentMetrics.latency > thresholds.latencyMax && (
              <Badge className="mt-1 bg-amber-500/20 text-amber-400 text-[10px]">
                <TrendingUp className="w-2 h-2 ml-1" />
                مرتفع
              </Badge>
            )}
          </CardContent>
        </Card>
        <Card className="bg-purple-500/10 border-purple-500/30">
          <CardContent className="p-3 text-center">
            <Zap className="w-5 h-5 text-purple-400 mx-auto mb-1" />
            <p className="text-xl font-bold text-white">{currentMetrics.throughput?.toFixed(0)}</p>
            <p className="text-slate-400 text-xs">الإنتاجية/ث</p>
          </CardContent>
        </Card>
        <Card className={`${currentMetrics.errorRate > thresholds.errorRateMax ? 'bg-red-500/10 border-red-500/30 animate-pulse' : 'bg-blue-500/10 border-blue-500/30'}`}>
          <CardContent className="p-3 text-center">
            <AlertTriangle className={`w-5 h-5 mx-auto mb-1 ${currentMetrics.errorRate > thresholds.errorRateMax ? 'text-red-400' : 'text-blue-400'}`} />
            <p className="text-xl font-bold text-white">{currentMetrics.errorRate?.toFixed(1)}%</p>
            <p className="text-slate-400 text-xs">الأخطاء</p>
          </CardContent>
        </Card>
        <Card className="bg-emerald-500/10 border-emerald-500/30">
          <CardContent className="p-3 text-center">
            <Eye className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
            <p className="text-xl font-bold text-white">{currentMetrics.detections}</p>
            <p className="text-slate-400 text-xs">الكشوفات</p>
          </CardContent>
        </Card>
      </div>

      {/* Real-time Chart */}
      <Card className="bg-slate-800/30 border-slate-700/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-white text-sm flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-cyan-400" />
            المقاييس الفورية
            {isMonitoring && (
              <Badge className="bg-green-500/20 text-green-400 animate-pulse text-xs">مباشر</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={metricsHistory}>
                <defs>
                  <linearGradient id="accuracyGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="latencyGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="time" stroke="#94a3b8" fontSize={10} />
                <YAxis stroke="#94a3b8" fontSize={10} domain={[0, 100]} />
                <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: 8 }} />
                <ReferenceLine y={thresholds.accuracyMin} stroke="#ef4444" strokeDasharray="3 3" label={{ value: 'حد الدقة', fill: '#ef4444', fontSize: 10 }} />
                <Area type="monotone" dataKey="accuracy" stroke="#22c55e" fill="url(#accuracyGrad)" strokeWidth={2} name="الدقة %" />
                <Line type="monotone" dataKey="latency" stroke="#f59e0b" strokeWidth={2} dot={false} name="التأخير ms" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Anomalies List */}
      <Card className="bg-slate-800/30 border-slate-700/50">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <AlertOctagon className="w-4 h-4 text-red-400" />
              الشذوذات المكتشفة
              {anomalies.length > 0 && (
                <Badge className="bg-red-500/20 text-red-400">{anomalies.length}</Badge>
              )}
            </CardTitle>
            {anomalies.length > 0 && (
              <Button size="sm" variant="outline" className="border-slate-600 text-xs" onClick={() => setAnomalies([])}>
                مسح الكل
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[250px]">
            {anomalies.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="w-10 h-10 text-green-400 mx-auto mb-2" />
                <p className="text-slate-400">لا توجد شذوذات مكتشفة حالياً</p>
                <p className="text-slate-500 text-xs mt-1">النظام يعمل بشكل طبيعي</p>
              </div>
            ) : (
              <div className="space-y-2">
                <AnimatePresence>
                  {anomalies.map((anomaly) => (
                    <motion.div
                      key={anomaly.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className={`p-3 rounded-lg border ${
                        anomaly.severity === 'critical' ? 'bg-red-500/10 border-red-500/30' :
                        'bg-amber-500/10 border-amber-500/30'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-2">
                          {getSeverityIcon(anomaly.severity)}
                          <div>
                            <p className="text-white font-medium text-sm">{anomaly.message}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-[10px] border-slate-600">{anomaly.model}</Badge>
                              <span className="text-slate-500 text-[10px]">
                                {anomaly.timestamp.toLocaleTimeString('ar-SA')}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 text-xs text-cyan-400 hover:text-cyan-300"
                            onClick={() => openDrillDown(anomaly)}
                          >
                            <ExternalLink className="w-3 h-3 ml-1" />
                            تفاصيل
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 text-xs text-green-400 hover:text-green-300"
                            onClick={() => acknowledgeAnomaly(anomaly.id)}
                          >
                            <CheckCircle className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Model Status Grid */}
      <Card className="bg-slate-800/30 border-slate-700/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-white text-sm flex items-center gap-2">
            <Layers className="w-4 h-4 text-purple-400" />
            حالة النماذج
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {models.map((model) => (
              <div
                key={model.id}
                className={`p-3 rounded-lg border ${
                  model.status === 'critical' ? 'bg-red-500/10 border-red-500/30' :
                  model.status === 'warning' ? 'bg-amber-500/10 border-amber-500/30' :
                  'bg-green-500/10 border-green-500/30'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <Cpu className={`w-4 h-4 text-${getStatusColor(model.status)}-400`} />
                  <div className={`w-2 h-2 rounded-full bg-${getStatusColor(model.status)}-400 ${model.status !== 'healthy' ? 'animate-pulse' : ''}`} />
                </div>
                <p className="text-white text-xs font-medium truncate">{model.name}</p>
                <Badge className={`mt-1 text-[10px] bg-${getStatusColor(model.status)}-500/20 text-${getStatusColor(model.status)}-400`}>
                  {model.status === 'healthy' ? 'سليم' : model.status === 'warning' ? 'تحذير' : 'حرج'}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">إعدادات المراقبة</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label className="text-slate-300 text-sm">حد الدقة الأدنى (%)</Label>
              <div className="flex items-center gap-4 mt-2">
                <Slider value={[thresholds.accuracyMin]} onValueChange={([v]) => setThresholds({...thresholds, accuracyMin: v})} max={100} min={50} />
                <Badge className="w-12 justify-center">{thresholds.accuracyMin}%</Badge>
              </div>
            </div>
            <div>
              <Label className="text-slate-300 text-sm">حد التأخير الأقصى (ms)</Label>
              <div className="flex items-center gap-4 mt-2">
                <Slider value={[thresholds.latencyMax]} onValueChange={([v]) => setThresholds({...thresholds, latencyMax: v})} max={200} min={20} />
                <Badge className="w-12 justify-center">{thresholds.latencyMax}</Badge>
              </div>
            </div>
            <div>
              <Label className="text-slate-300 text-sm">حد الأخطاء الأقصى (%)</Label>
              <div className="flex items-center gap-4 mt-2">
                <Slider value={[thresholds.errorRateMax]} onValueChange={([v]) => setThresholds({...thresholds, errorRateMax: v})} max={20} min={1} />
                <Badge className="w-12 justify-center">{thresholds.errorRateMax}%</Badge>
              </div>
            </div>
            <Button className="w-full bg-cyan-600 hover:bg-cyan-700" onClick={() => setShowSettings(false)}>
              حفظ الإعدادات
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Drill-Down Dialog */}
      <Dialog open={showDrillDown} onOpenChange={setShowDrillDown}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              {getSeverityIcon(selectedAnomaly?.severity)}
              تحليل معمق للشذوذ
            </DialogTitle>
          </DialogHeader>
          {selectedAnomaly && (
            <div className="space-y-4 mt-4">
              {/* Summary */}
              <div className="p-4 bg-slate-800/50 rounded-lg">
                <h5 className="text-white font-medium mb-2">{selectedAnomaly.message}</h5>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-slate-400 text-xs">القيمة المتوقعة</p>
                    <p className="text-green-400 font-bold">{selectedAnomaly.details.expected}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs">القيمة الفعلية</p>
                    <p className="text-red-400 font-bold">{selectedAnomaly.details.actual?.toFixed(1)}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs">الانحراف</p>
                    <p className="text-amber-400 font-bold">{selectedAnomaly.details.deviation}%</p>
                  </div>
                </div>
              </div>

              {/* Timeline Chart */}
              <Card className="bg-slate-800/30 border-slate-700/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-sm">الجدول الزمني</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[150px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={selectedAnomaly.details.timeline}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis dataKey="time" stroke="#94a3b8" fontSize={10} />
                        <YAxis stroke="#94a3b8" fontSize={10} />
                        <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: 8 }} />
                        <ReferenceLine y={selectedAnomaly.threshold} stroke="#ef4444" strokeDasharray="3 3" />
                        <Line type="monotone" dataKey="value" stroke="#22d3ee" strokeWidth={2} dot={{ fill: '#22d3ee' }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Possible Causes */}
              <div className="p-4 bg-amber-500/10 rounded-lg border border-amber-500/30">
                <h5 className="text-amber-400 font-medium mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  الأسباب المحتملة
                </h5>
                <ul className="space-y-1">
                  {selectedAnomaly.details.possibleCauses.map((cause, i) => (
                    <li key={i} className="text-slate-300 text-sm flex items-center gap-2">
                      <ArrowRight className="w-3 h-3 text-amber-400" />
                      {cause}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Impact */}
              <div className="p-4 bg-red-500/10 rounded-lg border border-red-500/30">
                <h5 className="text-red-400 font-medium mb-2">التأثير</h5>
                <p className="text-slate-300 text-sm">
                  تأثر {selectedAnomaly.details.affectedDetections || selectedAnomaly.details.affectedRequests || selectedAnomaly.details.affectedOperations} عملية/كشف
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button className="flex-1 bg-cyan-600 hover:bg-cyan-700">
                  <RefreshCw className="w-4 h-4 ml-1" />
                  إعادة تشغيل النموذج
                </Button>
                <Button variant="outline" className="flex-1 border-slate-600">
                  <Bell className="w-4 h-4 ml-1" />
                  إرسال تنبيه
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}