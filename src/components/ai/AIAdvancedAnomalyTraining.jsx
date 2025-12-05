import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  Brain, Activity, Target, TrendingUp, TrendingDown, Zap, Clock,
  AlertTriangle, CheckCircle, Loader2, RefreshCw, Play, Pause,
  Settings, Database, BarChart3, LineChart as LineChartIcon, Cpu,
  Sparkles, ArrowRight, XCircle, Info, Download, Upload, Layers
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, ScatterChart, Scatter, ReferenceLine
} from 'recharts';
import { toast } from 'sonner';

// Advanced ML Algorithms for Anomaly Detection
const mlAlgorithms = [
  { id: 'isolation_forest', name: 'Isolation Forest', accuracy: 94.5, speed: 'fast', type: 'unsupervised' },
  { id: 'autoencoder', name: 'Deep Autoencoder', accuracy: 96.2, speed: 'medium', type: 'deep_learning' },
  { id: 'lstm_anomaly', name: 'LSTM Anomaly Detector', accuracy: 97.1, speed: 'slow', type: 'deep_learning' },
  { id: 'one_class_svm', name: 'One-Class SVM', accuracy: 91.8, speed: 'fast', type: 'unsupervised' },
  { id: 'prophet', name: 'Prophet Forecasting', accuracy: 93.4, speed: 'medium', type: 'time_series' },
  { id: 'ensemble', name: 'Ensemble (All Models)', accuracy: 98.5, speed: 'slow', type: 'ensemble' },
];

// Simulated training metrics over epochs
const generateTrainingData = (epochs) => {
  return Array.from({ length: epochs }, (_, i) => ({
    epoch: i + 1,
    loss: Math.max(0.05, 0.8 - (i * 0.015) + (Math.random() * 0.05)),
    accuracy: Math.min(98, 75 + (i * 0.5) + (Math.random() * 2)),
    val_loss: Math.max(0.08, 0.85 - (i * 0.012) + (Math.random() * 0.08)),
    val_accuracy: Math.min(97, 72 + (i * 0.45) + (Math.random() * 3)),
    anomaly_precision: Math.min(96, 70 + (i * 0.6) + (Math.random() * 2)),
    anomaly_recall: Math.min(94, 68 + (i * 0.55) + (Math.random() * 3)),
  }));
};

// Anomaly patterns for detection
const anomalyPatterns = [
  { id: 'sudden_spike', name: 'ارتفاع مفاجئ', icon: TrendingUp, detected: 234, accuracy: 96.5 },
  { id: 'gradual_drift', name: 'انحراف تدريجي', icon: Activity, detected: 156, accuracy: 94.2 },
  { id: 'seasonal_anomaly', name: 'شذوذ موسمي', icon: Clock, detected: 89, accuracy: 92.8 },
  { id: 'level_shift', name: 'تحول المستوى', icon: BarChart3, detected: 67, accuracy: 95.1 },
  { id: 'variance_change', name: 'تغير التباين', icon: LineChartIcon, detected: 45, accuracy: 91.7 },
];

export default function AIAdvancedAnomalyTraining() {
  const [selectedAlgorithm, setSelectedAlgorithm] = useState('ensemble');
  const [isTraining, setIsTraining] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [trainingData, setTrainingData] = useState([]);
  const [modelMetrics, setModelMetrics] = useState(null);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [activeTab, setActiveTab] = useState('training');
  const [hyperParams, setHyperParams] = useState({
    learningRate: 0.001,
    batchSize: 32,
    epochs: 50,
    windowSize: 24,
    threshold: 0.95,
    sensitivity: 0.8
  });

  // Train anomaly detection model
  const trainModelMutation = useMutation({
    mutationFn: async () => {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `قم بتدريب نموذج متقدم للكشف عن الشذوذات باستخدام الخوارزمية: ${selectedAlgorithm}
        
المعلمات الفائقة:
- معدل التعلم: ${hyperParams.learningRate}
- حجم الدفعة: ${hyperParams.batchSize}
- عدد الحقب: ${hyperParams.epochs}
- حجم النافذة: ${hyperParams.windowSize}
- عتبة الكشف: ${hyperParams.threshold}
- الحساسية: ${hyperParams.sensitivity}

قدم:
1. مقاييس أداء النموذج المدرب
2. أنواع الشذوذات المكتشفة
3. تحليل الأخطاء والتحسينات
4. توصيات لتحسين الأداء
5. نتائج التحقق المتقاطع`,
        response_json_schema: {
          type: "object",
          properties: {
            model_performance: {
              type: "object",
              properties: {
                accuracy: { type: "number" },
                precision: { type: "number" },
                recall: { type: "number" },
                f1_score: { type: "number" },
                auc_roc: { type: "number" },
                false_positive_rate: { type: "number" },
                false_negative_rate: { type: "number" }
              }
            },
            anomaly_detection: {
              type: "object",
              properties: {
                total_anomalies_detected: { type: "number" },
                true_positives: { type: "number" },
                false_positives: { type: "number" },
                detection_latency_ms: { type: "number" },
                patterns_learned: { type: "array", items: { type: "string" } }
              }
            },
            feature_importance: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  feature: { type: "string" },
                  importance: { type: "number" },
                  correlation: { type: "number" }
                }
              }
            },
            cross_validation: {
              type: "object",
              properties: {
                mean_accuracy: { type: "number" },
                std_accuracy: { type: "number" },
                fold_scores: { type: "array", items: { type: "number" } }
              }
            },
            recommendations: {
              type: "array",
              items: { type: "string" }
            },
            training_summary: {
              type: "object",
              properties: {
                total_epochs: { type: "number" },
                best_epoch: { type: "number" },
                training_time_seconds: { type: "number" },
                convergence_status: { type: "string" }
              }
            }
          }
        }
      });
      return result;
    },
    onSuccess: (data) => {
      setModelMetrics(data);
      setIsTraining(false);
      setTrainingProgress(100);
      toast.success('تم تدريب النموذج بنجاح!');
    },
    onError: () => {
      setIsTraining(false);
      toast.error('فشل في تدريب النموذج');
    }
  });

  // Simulate training progress
  const startTraining = useCallback(() => {
    setIsTraining(true);
    setTrainingProgress(0);
    setTrainingData([]);

    let currentEpoch = 0;
    const totalEpochs = hyperParams.epochs;
    
    const interval = setInterval(() => {
      currentEpoch++;
      const progress = (currentEpoch / totalEpochs) * 100;
      setTrainingProgress(progress);
      
      // Add training data point
      setTrainingData(prev => [...prev, {
        epoch: currentEpoch,
        loss: Math.max(0.05, 0.8 - (currentEpoch * 0.015) + (Math.random() * 0.05)),
        accuracy: Math.min(98, 75 + (currentEpoch * 0.5) + (Math.random() * 2)),
        val_loss: Math.max(0.08, 0.85 - (currentEpoch * 0.012) + (Math.random() * 0.08)),
        val_accuracy: Math.min(97, 72 + (currentEpoch * 0.45) + (Math.random() * 3)),
      }]);

      if (currentEpoch >= totalEpochs) {
        clearInterval(interval);
        trainModelMutation.mutate();
      }
    }, 100);

    return () => clearInterval(interval);
  }, [hyperParams.epochs]);

  const stopTraining = () => {
    setIsTraining(false);
    toast.info('تم إيقاف التدريب');
  };

  const algorithm = mlAlgorithms.find(a => a.id === selectedAlgorithm);

  return (
    <div className="space-y-4" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <motion.div
            animate={isTraining ? { 
              rotate: [0, 360],
              scale: [1, 1.1, 1]
            } : {}}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="p-3 rounded-xl bg-gradient-to-br from-purple-500/30 to-cyan-500/30"
          >
            <Brain className="w-7 h-7 text-purple-400" />
          </motion.div>
          <div>
            <h4 className="text-white font-bold text-xl">تدريب نماذج الكشف عن الشذوذات</h4>
            <p className="text-slate-400 text-sm">خوارزميات متقدمة • تعلم عميق • تحليل تنبؤي</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="border-slate-600" onClick={() => setShowAdvancedSettings(true)}>
            <Settings className="w-4 h-4 ml-1" />
            إعدادات متقدمة
          </Button>
          {!isTraining ? (
            <Button className="bg-gradient-to-r from-purple-600 to-cyan-600" onClick={startTraining}>
              <Play className="w-4 h-4 ml-1" />
              بدء التدريب
            </Button>
          ) : (
            <Button variant="destructive" onClick={stopTraining}>
              <Pause className="w-4 h-4 ml-1" />
              إيقاف
            </Button>
          )}
        </div>
      </div>

      {/* Algorithm Selection */}
      <Card className="bg-slate-800/30 border-slate-700/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-white text-sm flex items-center gap-2">
            <Cpu className="w-4 h-4 text-cyan-400" />
            اختيار الخوارزمية
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
            {mlAlgorithms.map((algo) => (
              <motion.div
                key={algo.id}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card
                  className={`cursor-pointer transition-all ${
                    selectedAlgorithm === algo.id
                      ? 'bg-gradient-to-br from-purple-500/30 to-cyan-500/30 border-purple-500'
                      : 'bg-slate-900/50 border-slate-700/50 hover:border-slate-600'
                  }`}
                  onClick={() => setSelectedAlgorithm(algo.id)}
                >
                  <CardContent className="p-3 text-center">
                    <Brain className={`w-6 h-6 mx-auto mb-2 ${selectedAlgorithm === algo.id ? 'text-purple-400' : 'text-slate-400'}`} />
                    <p className="text-white text-xs font-medium mb-1">{algo.name}</p>
                    <div className="flex items-center justify-center gap-1">
                      <Badge className="bg-green-500/20 text-green-400 text-[9px]">{algo.accuracy}%</Badge>
                      <Badge variant="outline" className="text-[9px] border-slate-600">{algo.speed}</Badge>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Training Progress */}
      {(isTraining || trainingProgress > 0) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className={`border-2 ${isTraining ? 'border-purple-500/50 bg-purple-500/5' : 'border-green-500/50 bg-green-500/5'}`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  {isTraining ? (
                    <Loader2 className="w-5 h-5 text-purple-400 animate-spin" />
                  ) : (
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  )}
                  <span className="text-white font-medium">
                    {isTraining ? 'جاري التدريب...' : 'اكتمل التدريب'}
                  </span>
                </div>
                <span className="text-cyan-400 font-bold">{trainingProgress.toFixed(0)}%</span>
              </div>
              <Progress value={trainingProgress} className="h-3 mb-3" />
              <div className="grid grid-cols-4 gap-3 text-center">
                <div>
                  <p className="text-slate-400 text-xs">الحقبة</p>
                  <p className="text-white font-bold">{trainingData.length}/{hyperParams.epochs}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-xs">الخسارة</p>
                  <p className="text-amber-400 font-bold">{trainingData[trainingData.length - 1]?.loss?.toFixed(4) || '-'}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-xs">الدقة</p>
                  <p className="text-green-400 font-bold">{trainingData[trainingData.length - 1]?.accuracy?.toFixed(1) || '-'}%</p>
                </div>
                <div>
                  <p className="text-slate-400 text-xs">التحقق</p>
                  <p className="text-cyan-400 font-bold">{trainingData[trainingData.length - 1]?.val_accuracy?.toFixed(1) || '-'}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Training Chart */}
      {trainingData.length > 0 && (
        <Card className="bg-slate-800/30 border-slate-700/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm">منحنى التدريب</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trainingData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="epoch" stroke="#94a3b8" fontSize={10} />
                  <YAxis stroke="#94a3b8" fontSize={10} />
                  <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: 8 }} />
                  <Line type="monotone" dataKey="accuracy" stroke="#22c55e" strokeWidth={2} dot={false} name="دقة التدريب" />
                  <Line type="monotone" dataKey="val_accuracy" stroke="#22d3ee" strokeWidth={2} dot={false} name="دقة التحقق" />
                  <Line type="monotone" dataKey="loss" stroke="#f59e0b" strokeWidth={2} dot={false} name="الخسارة" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Model Metrics */}
      {modelMetrics && (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-slate-800/50 border border-slate-700 p-1">
            <TabsTrigger value="performance" className="data-[state=active]:bg-green-500/20">
              <Target className="w-3 h-3 ml-1" />
              الأداء
            </TabsTrigger>
            <TabsTrigger value="detection" className="data-[state=active]:bg-purple-500/20">
              <AlertTriangle className="w-3 h-3 ml-1" />
              الكشف
            </TabsTrigger>
            <TabsTrigger value="features" className="data-[state=active]:bg-cyan-500/20">
              <Layers className="w-3 h-3 ml-1" />
              الميزات
            </TabsTrigger>
            <TabsTrigger value="recommendations" className="data-[state=active]:bg-amber-500/20">
              <Sparkles className="w-3 h-3 ml-1" />
              التوصيات
            </TabsTrigger>
          </TabsList>

          <TabsContent value="performance" className="mt-4">
            <div className="grid md:grid-cols-4 gap-3">
              {[
                { label: 'الدقة', value: modelMetrics.model_performance?.accuracy, color: 'green' },
                { label: 'الضبط', value: modelMetrics.model_performance?.precision, color: 'blue' },
                { label: 'الاستدعاء', value: modelMetrics.model_performance?.recall, color: 'purple' },
                { label: 'F1 Score', value: modelMetrics.model_performance?.f1_score, color: 'cyan' },
              ].map((metric, i) => (
                <motion.div
                  key={metric.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card className={`bg-${metric.color}-500/10 border-${metric.color}-500/30`}>
                    <CardContent className="p-4 text-center">
                      <p className="text-slate-400 text-xs mb-1">{metric.label}</p>
                      <p className={`text-2xl font-bold text-${metric.color}-400`}>{metric.value?.toFixed(1)}%</p>
                      <Progress value={metric.value} className="h-1 mt-2" />
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
            
            <Card className="mt-4 bg-slate-800/30 border-slate-700/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm">التحقق المتقاطع</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <p className="text-slate-400 text-xs mb-1">متوسط الدقة</p>
                    <p className="text-green-400 font-bold text-xl">{modelMetrics.cross_validation?.mean_accuracy?.toFixed(2)}%</p>
                  </div>
                  <div className="flex-1">
                    <p className="text-slate-400 text-xs mb-1">الانحراف المعياري</p>
                    <p className="text-amber-400 font-bold text-xl">±{modelMetrics.cross_validation?.std_accuracy?.toFixed(2)}%</p>
                  </div>
                  <div className="flex-1">
                    <p className="text-slate-400 text-xs mb-1">نتائج الطيات</p>
                    <div className="flex gap-1">
                      {modelMetrics.cross_validation?.fold_scores?.map((score, i) => (
                        <Badge key={i} className="bg-slate-700 text-xs">{score?.toFixed(1)}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="detection" className="mt-4">
            <div className="grid md:grid-cols-2 gap-4">
              <Card className="bg-purple-500/10 border-purple-500/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-sm">إحصائيات الكشف</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-slate-400">إجمالي الشذوذات</span>
                      <span className="text-white font-bold">{modelMetrics.anomaly_detection?.total_anomalies_detected}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">إيجابيات حقيقية</span>
                      <span className="text-green-400 font-bold">{modelMetrics.anomaly_detection?.true_positives}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">إيجابيات كاذبة</span>
                      <span className="text-red-400 font-bold">{modelMetrics.anomaly_detection?.false_positives}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">زمن الكشف</span>
                      <span className="text-cyan-400 font-bold">{modelMetrics.anomaly_detection?.detection_latency_ms}ms</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/30 border-slate-700/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-sm">الأنماط المتعلمة</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {modelMetrics.anomaly_detection?.patterns_learned?.map((pattern, i) => (
                      <Badge key={i} className="bg-purple-500/20 text-purple-400">{pattern}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="features" className="mt-4">
            <Card className="bg-slate-800/30 border-slate-700/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm">أهمية الميزات</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {modelMetrics.feature_importance?.map((feature, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-white text-sm w-32 truncate">{feature.feature}</span>
                      <Progress value={feature.importance * 100} className="flex-1 h-2" />
                      <span className="text-cyan-400 text-xs w-12">{(feature.importance * 100).toFixed(0)}%</span>
                      <Badge variant="outline" className="text-xs border-slate-600">
                        r={feature.correlation?.toFixed(2)}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recommendations" className="mt-4">
            <Card className="bg-amber-500/10 border-amber-500/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  توصيات التحسين
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {modelMetrics.recommendations?.map((rec, i) => (
                    <li key={i} className="flex items-start gap-2 text-slate-300 text-sm">
                      <ArrowRight className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                      {rec}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* Anomaly Patterns */}
      <Card className="bg-slate-800/30 border-slate-700/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-white text-sm">أنماط الشذوذات المدعومة</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {anomalyPatterns.map((pattern) => (
              <div key={pattern.id} className="p-3 bg-slate-900/50 rounded-lg text-center">
                <pattern.icon className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                <p className="text-white text-xs font-medium mb-1">{pattern.name}</p>
                <div className="flex justify-center gap-1">
                  <Badge className="bg-green-500/20 text-green-400 text-[9px]">{pattern.accuracy}%</Badge>
                  <Badge variant="outline" className="text-[9px] border-slate-600">{pattern.detected}</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Advanced Settings Dialog */}
      <Dialog open={showAdvancedSettings} onOpenChange={setShowAdvancedSettings}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white">إعدادات التدريب المتقدمة</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label className="text-slate-300 text-sm">معدل التعلم</Label>
              <div className="flex items-center gap-4 mt-2">
                <Slider
                  value={[hyperParams.learningRate * 1000]}
                  onValueChange={([v]) => setHyperParams({...hyperParams, learningRate: v / 1000})}
                  max={10}
                  min={1}
                  step={1}
                />
                <Badge className="w-16 justify-center">{hyperParams.learningRate}</Badge>
              </div>
            </div>
            <div>
              <Label className="text-slate-300 text-sm">حجم الدفعة</Label>
              <div className="flex items-center gap-4 mt-2">
                <Slider
                  value={[hyperParams.batchSize]}
                  onValueChange={([v]) => setHyperParams({...hyperParams, batchSize: v})}
                  max={128}
                  min={8}
                  step={8}
                />
                <Badge className="w-16 justify-center">{hyperParams.batchSize}</Badge>
              </div>
            </div>
            <div>
              <Label className="text-slate-300 text-sm">عدد الحقب</Label>
              <div className="flex items-center gap-4 mt-2">
                <Slider
                  value={[hyperParams.epochs]}
                  onValueChange={([v]) => setHyperParams({...hyperParams, epochs: v})}
                  max={200}
                  min={10}
                  step={10}
                />
                <Badge className="w-16 justify-center">{hyperParams.epochs}</Badge>
              </div>
            </div>
            <div>
              <Label className="text-slate-300 text-sm">حجم النافذة الزمنية</Label>
              <div className="flex items-center gap-4 mt-2">
                <Slider
                  value={[hyperParams.windowSize]}
                  onValueChange={([v]) => setHyperParams({...hyperParams, windowSize: v})}
                  max={72}
                  min={6}
                  step={6}
                />
                <Badge className="w-16 justify-center">{hyperParams.windowSize}س</Badge>
              </div>
            </div>
            <div>
              <Label className="text-slate-300 text-sm">عتبة الكشف</Label>
              <div className="flex items-center gap-4 mt-2">
                <Slider
                  value={[hyperParams.threshold * 100]}
                  onValueChange={([v]) => setHyperParams({...hyperParams, threshold: v / 100})}
                  max={99}
                  min={80}
                />
                <Badge className="w-16 justify-center">{(hyperParams.threshold * 100).toFixed(0)}%</Badge>
              </div>
            </div>
            <div>
              <Label className="text-slate-300 text-sm">الحساسية</Label>
              <div className="flex items-center gap-4 mt-2">
                <Slider
                  value={[hyperParams.sensitivity * 100]}
                  onValueChange={([v]) => setHyperParams({...hyperParams, sensitivity: v / 100})}
                  max={100}
                  min={50}
                />
                <Badge className="w-16 justify-center">{(hyperParams.sensitivity * 100).toFixed(0)}%</Badge>
              </div>
            </div>
            <Button className="w-full bg-purple-600 hover:bg-purple-700" onClick={() => setShowAdvancedSettings(false)}>
              حفظ الإعدادات
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}