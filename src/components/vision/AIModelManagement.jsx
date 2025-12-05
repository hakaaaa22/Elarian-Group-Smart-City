import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  Cpu, Upload, Settings, TrendingUp, TrendingDown, GitBranch, RefreshCw,
  Play, Pause, Trash2, Eye, Download, Plus, CheckCircle, AlertTriangle,
  Clock, BarChart3, Loader2, Sparkles, Layers, FileCode, FlaskConical,
  Sliders, Target, Zap, Scale, Activity, TestTube2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar
} from 'recharts';
import { toast } from 'sonner';

const sampleModels = [
  { id: 1, name: 'كشف الأسلحة v2.1', category: 'security', accuracy: 96.5, status: 'active', version: '2.1.0', lastTrained: '2024-12-01', detections: 89, trend: 'up', format: 'onnx' },
  { id: 2, name: 'التعرف على الوجوه v3.0', category: 'people', accuracy: 98.2, status: 'active', version: '3.0.2', lastTrained: '2024-11-28', detections: 15420, trend: 'up', format: 'pb' },
  { id: 3, name: 'كشف التسلل v1.8', category: 'security', accuracy: 94.1, status: 'training', version: '1.8.0', lastTrained: '2024-11-15', detections: 456, trend: 'down', format: 'onnx' },
  { id: 4, name: 'تحليل الحشود v2.0', category: 'crowd', accuracy: 93.5, status: 'inactive', version: '2.0.1', lastTrained: '2024-10-20', detections: 8900, trend: 'stable', format: 'h5' },
];

const performanceHistory = [
  { week: 'الأسبوع 1', accuracy: 92.1, precision: 91.2, recall: 93.0 },
  { week: 'الأسبوع 2', accuracy: 93.4, precision: 92.8, recall: 94.1 },
  { week: 'الأسبوع 3', accuracy: 94.2, precision: 93.5, recall: 94.9 },
  { week: 'الأسبوع 4', accuracy: 95.8, precision: 95.1, recall: 96.5 },
  { week: 'الأسبوع 5', accuracy: 96.5, precision: 96.0, recall: 97.1 },
];

const supportedFormats = [
  { value: 'onnx', label: 'ONNX (.onnx)', icon: '🔷' },
  { value: 'pb', label: 'TensorFlow (.pb)', icon: '🟠' },
  { value: 'h5', label: 'Keras (.h5)', icon: '🔴' },
  { value: 'pt', label: 'PyTorch (.pt)', icon: '🟣' },
  { value: 'tflite', label: 'TFLite (.tflite)', icon: '🟢' },
];

export default function AIModelManagement() {
  const [models, setModels] = useState(sampleModels);
  const [selectedModel, setSelectedModel] = useState(null);
  const [showUpload, setShowUpload] = useState(false);
  const [showFineTune, setShowFineTune] = useState(false);
  const [showHyperparams, setShowHyperparams] = useState(false);
  const [showABTest, setShowABTest] = useState(false);
  const [activeTab, setActiveTab] = useState('models');
  const [abTests, setAbTests] = useState([]);
  const [retrainSettings, setRetrainSettings] = useState({
    autoRetrain: true,
    accuracyThreshold: 90,
    checkInterval: 'weekly'
  });

  const [uploadConfig, setUploadConfig] = useState({
    name: '',
    category: 'security',
    description: '',
    file: null,
    format: 'onnx'
  });

  const [fineTuneConfig, setFineTuneConfig] = useState({
    modelId: null,
    dataset: '',
    epochs: 10,
    learningRate: 0.001
  });

  const [hyperparamsConfig, setHyperparamsConfig] = useState({
    modelId: null,
    learningRate: 0.001,
    batchSize: 32,
    epochs: 50,
    optimizer: 'adam',
    dropout: 0.2,
    momentum: 0.9,
    weightDecay: 0.0001,
    augmentation: true,
    earlyStoppingPatience: 5
  });

  const [abTestConfig, setAbTestConfig] = useState({
    name: '',
    modelA: null,
    modelB: null,
    trafficSplit: 50,
    duration: 7,
    metric: 'accuracy'
  });

  // Upload model
  const uploadModelMutation = useMutation({
    mutationFn: async (config) => {
      await new Promise(resolve => setTimeout(resolve, 2000));
      return { success: true, modelId: Date.now() };
    },
    onSuccess: () => {
      const newModel = {
        id: Date.now(),
        name: uploadConfig.name,
        category: uploadConfig.category,
        accuracy: 85 + Math.random() * 10,
        status: 'inactive',
        version: '1.0.0',
        lastTrained: new Date().toISOString().split('T')[0],
        detections: 0,
        trend: 'stable',
        format: uploadConfig.format
      };
      setModels(prev => [...prev, newModel]);
      setShowUpload(false);
      setUploadConfig({ name: '', category: 'security', description: '', file: null, format: 'onnx' });
      toast.success('تم رفع النموذج بنجاح');
    }
  });

  // Fine-tune model
  const fineTuneMutation = useMutation({
    mutationFn: async (config) => {
      await new Promise(resolve => setTimeout(resolve, 3000));
      return { success: true, newAccuracy: 97.2 };
    },
    onSuccess: (data) => {
      setModels(prev => prev.map(m =>
        m.id === fineTuneConfig.modelId
          ? { ...m, accuracy: data.newAccuracy, version: incrementVersion(m.version), lastTrained: new Date().toISOString().split('T')[0] }
          : m
      ));
      setShowFineTune(false);
      toast.success('تم تحسين النموذج بنجاح');
    }
  });

  // Hyperparameter tuning
  const hyperparamTuneMutation = useMutation({
    mutationFn: async (config) => {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `قم بتحليل المعلمات الفائقة التالية واقتراح أفضل تكوين:
        
معدل التعلم: ${config.learningRate}
حجم الدفعة: ${config.batchSize}
عدد الدورات: ${config.epochs}
المحسن: ${config.optimizer}
معدل الإسقاط: ${config.dropout}

اقترح تحسينات محددة لتحسين أداء النموذج.`,
        response_json_schema: {
          type: "object",
          properties: {
            recommended_learning_rate: { type: "number" },
            recommended_batch_size: { type: "number" },
            recommended_epochs: { type: "number" },
            estimated_accuracy_improvement: { type: "number" },
            tips: { type: "array", items: { type: "string" } }
          }
        }
      });
      return result;
    },
    onSuccess: (data) => {
      toast.success(`تم تحليل المعلمات - تحسين متوقع: ${data.estimated_accuracy_improvement}%`);
      setHyperparamsConfig(prev => ({
        ...prev,
        learningRate: data.recommended_learning_rate || prev.learningRate,
        batchSize: data.recommended_batch_size || prev.batchSize,
        epochs: data.recommended_epochs || prev.epochs
      }));
    }
  });

  // Create A/B Test
  const createABTestMutation = useMutation({
    mutationFn: async (config) => {
      await new Promise(resolve => setTimeout(resolve, 1500));
      return { success: true, testId: Date.now() };
    },
    onSuccess: () => {
      const newTest = {
        id: Date.now(),
        name: abTestConfig.name,
        modelA: models.find(m => m.id === abTestConfig.modelA)?.name,
        modelB: models.find(m => m.id === abTestConfig.modelB)?.name,
        trafficSplit: abTestConfig.trafficSplit,
        duration: abTestConfig.duration,
        status: 'running',
        startDate: new Date().toISOString().split('T')[0],
        resultsA: { accuracy: 94.5, latency: 45, errors: 12 },
        resultsB: { accuracy: 96.2, latency: 52, errors: 8 }
      };
      setAbTests(prev => [...prev, newTest]);
      setShowABTest(false);
      setAbTestConfig({ name: '', modelA: null, modelB: null, trafficSplit: 50, duration: 7, metric: 'accuracy' });
      toast.success('تم إنشاء اختبار A/B بنجاح');
    }
  });

  const incrementVersion = (version) => {
    const parts = version.split('.');
    parts[2] = String(Number(parts[2]) + 1);
    return parts.join('.');
  };

  const toggleModelStatus = (id) => {
    setModels(prev => prev.map(m =>
      m.id === id ? { ...m, status: m.status === 'active' ? 'inactive' : 'active' } : m
    ));
  };

  const startRetraining = (id) => {
    setModels(prev => prev.map(m =>
      m.id === id ? { ...m, status: 'training' } : m
    ));
    toast.info('بدأ إعادة التدريب...');
    setTimeout(() => {
      setModels(prev => prev.map(m =>
        m.id === id ? { ...m, status: 'active', accuracy: m.accuracy + Math.random() * 2, lastTrained: new Date().toISOString().split('T')[0] } : m
      ));
      toast.success('اكتمل إعادة التدريب');
    }, 5000);
  };

  const stats = {
    total: models.length,
    active: models.filter(m => m.status === 'active').length,
    avgAccuracy: (models.reduce((s, m) => s + m.accuracy, 0) / models.length).toFixed(1),
    needsRetrain: models.filter(m => m.accuracy < retrainSettings.accuracyThreshold).length
  };

  return (
    <div className="space-y-4" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20">
            <Cpu className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h4 className="text-white font-bold">إدارة نماذج AI المتقدمة</h4>
            <p className="text-slate-400 text-xs">رفع • تحسين • معلمات فائقة • اختبار A/B</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-slate-600 h-8" onClick={() => setShowUpload(true)}>
            <Upload className="w-3 h-3 ml-1" />
            رفع نموذج
          </Button>
          <Button variant="outline" className="border-amber-500/50 h-8" onClick={() => setShowHyperparams(true)}>
            <Sliders className="w-3 h-3 ml-1" />
            المعلمات
          </Button>
          <Button variant="outline" className="border-cyan-500/50 h-8" onClick={() => setShowABTest(true)}>
            <FlaskConical className="w-3 h-3 ml-1" />
            اختبار A/B
          </Button>
          <Button className="bg-purple-600 hover:bg-purple-700 h-8" onClick={() => setShowFineTune(true)}>
            <Sparkles className="w-3 h-3 ml-1" />
            تحسين
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="bg-purple-500/10 border-purple-500/30">
          <CardContent className="p-3 text-center">
            <Layers className="w-5 h-5 text-purple-400 mx-auto mb-1" />
            <p className="text-xl font-bold text-white">{stats.total}</p>
            <p className="text-purple-400 text-xs">إجمالي النماذج</p>
          </CardContent>
        </Card>
        <Card className="bg-green-500/10 border-green-500/30">
          <CardContent className="p-3 text-center">
            <CheckCircle className="w-5 h-5 text-green-400 mx-auto mb-1" />
            <p className="text-xl font-bold text-white">{stats.active}</p>
            <p className="text-green-400 text-xs">نشط</p>
          </CardContent>
        </Card>
        <Card className="bg-cyan-500/10 border-cyan-500/30">
          <CardContent className="p-3 text-center">
            <BarChart3 className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
            <p className="text-xl font-bold text-white">{stats.avgAccuracy}%</p>
            <p className="text-cyan-400 text-xs">متوسط الدقة</p>
          </CardContent>
        </Card>
        <Card className="bg-amber-500/10 border-amber-500/30">
          <CardContent className="p-3 text-center">
            <TestTube2 className="w-5 h-5 text-amber-400 mx-auto mb-1" />
            <p className="text-xl font-bold text-white">{abTests.length}</p>
            <p className="text-amber-400 text-xs">اختبار A/B</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-slate-800/50 border border-slate-700 p-1">
          <TabsTrigger value="models" className="data-[state=active]:bg-purple-500/20">
            <Cpu className="w-3 h-3 ml-1" />
            النماذج
          </TabsTrigger>
          <TabsTrigger value="abtests" className="data-[state=active]:bg-cyan-500/20">
            <FlaskConical className="w-3 h-3 ml-1" />
            اختبارات A/B
          </TabsTrigger>
          <TabsTrigger value="performance" className="data-[state=active]:bg-green-500/20">
            <BarChart3 className="w-3 h-3 ml-1" />
            الأداء
          </TabsTrigger>
          <TabsTrigger value="settings" className="data-[state=active]:bg-amber-500/20">
            <Settings className="w-3 h-3 ml-1" />
            الإعدادات
          </TabsTrigger>
        </TabsList>

        {/* Models Tab */}
        <TabsContent value="models" className="mt-4">
          <ScrollArea className="h-[400px]">
            <div className="space-y-3">
              {models.map((model) => (
                <Card key={model.id} className="bg-slate-800/30 border-slate-700/50">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-white font-medium">{model.name}</span>
                          <Badge className="bg-slate-600 text-slate-300 text-[10px]">
                            <GitBranch className="w-3 h-3 ml-1" />
                            {model.version}
                          </Badge>
                          <Badge className={`text-[10px] ${
                            model.format === 'onnx' ? 'bg-blue-500/20 text-blue-400' :
                            model.format === 'pb' ? 'bg-orange-500/20 text-orange-400' :
                            model.format === 'h5' ? 'bg-red-500/20 text-red-400' :
                            'bg-purple-500/20 text-purple-400'
                          }`}>
                            <FileCode className="w-3 h-3 ml-1" />
                            {model.format?.toUpperCase()}
                          </Badge>
                          <Badge className={
                            model.status === 'active' ? 'bg-green-500/20 text-green-400' :
                            model.status === 'training' ? 'bg-amber-500/20 text-amber-400' :
                            'bg-slate-600 text-slate-400'
                          }>
                            {model.status === 'active' ? 'نشط' : model.status === 'training' ? 'يتدرب' : 'غير نشط'}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-1">
                            <span className="text-slate-400">الدقة:</span>
                            <span className={model.accuracy >= 95 ? 'text-green-400' : model.accuracy >= 90 ? 'text-amber-400' : 'text-red-400'}>
                              {model.accuracy.toFixed(1)}%
                            </span>
                            {model.trend === 'up' && <TrendingUp className="w-3 h-3 text-green-400" />}
                            {model.trend === 'down' && <TrendingDown className="w-3 h-3 text-red-400" />}
                          </div>
                          <div className="flex items-center gap-1 text-slate-400">
                            <Clock className="w-3 h-3" />
                            {model.lastTrained}
                          </div>
                          <span className="text-slate-400">{model.detections.toLocaleString()} كشف</span>
                        </div>
                        <Progress value={model.accuracy} className="h-1 mt-2" />
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={model.status === 'active'}
                          onCheckedChange={() => toggleModelStatus(model.id)}
                          disabled={model.status === 'training'}
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8"
                          onClick={() => startRetraining(model.id)}
                          disabled={model.status === 'training'}
                        >
                          {model.status === 'training' ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <RefreshCw className="w-4 h-4" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8"
                          onClick={() => { setHyperparamsConfig({ ...hyperparamsConfig, modelId: model.id }); setShowHyperparams(true); }}
                        >
                          <Sliders className="w-4 h-4 text-amber-400" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8"
                          onClick={() => { setFineTuneConfig({ ...fineTuneConfig, modelId: model.id }); setShowFineTune(true); }}
                        >
                          <Sparkles className="w-4 h-4 text-purple-400" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        {/* A/B Tests Tab */}
        <TabsContent value="abtests" className="mt-4">
          {abTests.length === 0 ? (
            <Card className="bg-slate-800/30 border-slate-700/50">
              <CardContent className="p-8 text-center">
                <FlaskConical className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                <p className="text-slate-400 mb-4">لا توجد اختبارات A/B حالياً</p>
                <Button className="bg-cyan-600 hover:bg-cyan-700" onClick={() => setShowABTest(true)}>
                  <Plus className="w-4 h-4 ml-1" />
                  إنشاء اختبار
                </Button>
              </CardContent>
            </Card>
          ) : (
            <ScrollArea className="h-[400px]">
              <div className="space-y-3">
                {abTests.map((test) => (
                  <Card key={test.id} className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border-cyan-500/30">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <FlaskConical className="w-5 h-5 text-cyan-400" />
                          <span className="text-white font-medium">{test.name}</span>
                          <Badge className={test.status === 'running' ? 'bg-green-500/20 text-green-400 animate-pulse' : 'bg-slate-600 text-slate-400'}>
                            {test.status === 'running' ? 'قيد التشغيل' : 'منتهي'}
                          </Badge>
                        </div>
                        <span className="text-slate-400 text-xs">بدأ: {test.startDate}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-cyan-500/10 rounded-lg border border-cyan-500/30">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-cyan-400 font-medium">النموذج A</span>
                            <Badge className="bg-cyan-500/20 text-cyan-400">{test.trafficSplit}%</Badge>
                          </div>
                          <p className="text-white text-sm mb-2">{test.modelA}</p>
                          <div className="grid grid-cols-3 gap-2 text-center">
                            <div>
                              <p className="text-white font-bold">{test.resultsA?.accuracy}%</p>
                              <p className="text-slate-400 text-[10px]">الدقة</p>
                            </div>
                            <div>
                              <p className="text-white font-bold">{test.resultsA?.latency}ms</p>
                              <p className="text-slate-400 text-[10px]">التأخير</p>
                            </div>
                            <div>
                              <p className="text-white font-bold">{test.resultsA?.errors}</p>
                              <p className="text-slate-400 text-[10px]">أخطاء</p>
                            </div>
                          </div>
                        </div>
                        <div className="p-3 bg-purple-500/10 rounded-lg border border-purple-500/30">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-purple-400 font-medium">النموذج B</span>
                            <Badge className="bg-purple-500/20 text-purple-400">{100 - test.trafficSplit}%</Badge>
                          </div>
                          <p className="text-white text-sm mb-2">{test.modelB}</p>
                          <div className="grid grid-cols-3 gap-2 text-center">
                            <div>
                              <p className="text-white font-bold">{test.resultsB?.accuracy}%</p>
                              <p className="text-slate-400 text-[10px]">الدقة</p>
                            </div>
                            <div>
                              <p className="text-white font-bold">{test.resultsB?.latency}ms</p>
                              <p className="text-slate-400 text-[10px]">التأخير</p>
                            </div>
                            <div>
                              <p className="text-white font-bold">{test.resultsB?.errors}</p>
                              <p className="text-slate-400 text-[10px]">أخطاء</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      {test.resultsB?.accuracy > test.resultsA?.accuracy && (
                        <div className="mt-3 p-2 bg-green-500/10 rounded border border-green-500/30 flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-400" />
                          <span className="text-green-400 text-sm">النموذج B يتفوق بفارق {(test.resultsB.accuracy - test.resultsA.accuracy).toFixed(1)}%</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          )}
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="mt-4">
          <Card className="bg-slate-800/30 border-slate-700/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm">تطور الأداء</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={performanceHistory}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="week" stroke="#94a3b8" fontSize={10} />
                    <YAxis domain={[90, 100]} stroke="#94a3b8" fontSize={10} />
                    <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: 8 }} />
                    <Line type="monotone" dataKey="accuracy" stroke="#a855f7" strokeWidth={2} name="الدقة" />
                    <Line type="monotone" dataKey="precision" stroke="#22d3ee" strokeWidth={2} name="الدقة الموجبة" />
                    <Line type="monotone" dataKey="recall" stroke="#22c55e" strokeWidth={2} name="الاستدعاء" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="mt-4">
          <Card className="bg-slate-800/30 border-slate-700/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm">إعدادات إعادة التدريب التلقائي</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg">
                <div>
                  <p className="text-white">إعادة تدريب تلقائي</p>
                  <p className="text-slate-400 text-xs">تفعيل إعادة التدريب عند انخفاض الأداء</p>
                </div>
                <Switch
                  checked={retrainSettings.autoRetrain}
                  onCheckedChange={(v) => setRetrainSettings({ ...retrainSettings, autoRetrain: v })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-slate-300 text-sm">حد الدقة المطلوب</Label>
                  <Input
                    type="number"
                    value={retrainSettings.accuracyThreshold}
                    onChange={(e) => setRetrainSettings({ ...retrainSettings, accuracyThreshold: Number(e.target.value) })}
                    className="bg-slate-900 border-slate-700 text-white mt-1"
                  />
                </div>
                <div>
                  <Label className="text-slate-300 text-sm">فترة الفحص</Label>
                  <Select
                    value={retrainSettings.checkInterval}
                    onValueChange={(v) => setRetrainSettings({ ...retrainSettings, checkInterval: v })}
                  >
                    <SelectTrigger className="bg-slate-900 border-slate-700 text-white mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="daily">يومي</SelectItem>
                      <SelectItem value="weekly">أسبوعي</SelectItem>
                      <SelectItem value="monthly">شهري</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button className="w-full bg-cyan-600 hover:bg-cyan-700" onClick={() => toast.success('تم حفظ الإعدادات')}>
                حفظ الإعدادات
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Upload Dialog */}
      <Dialog open={showUpload} onOpenChange={setShowUpload}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Upload className="w-5 h-5 text-purple-400" />
              رفع نموذج جديد
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label className="text-slate-300 text-sm">اسم النموذج</Label>
              <Input
                value={uploadConfig.name}
                onChange={(e) => setUploadConfig({ ...uploadConfig, name: e.target.value })}
                className="bg-slate-800 border-slate-700 text-white mt-1"
                placeholder="مثال: كشف الأسلحة v1.0"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-slate-300 text-sm">الفئة</Label>
                <Select value={uploadConfig.category} onValueChange={(v) => setUploadConfig({ ...uploadConfig, category: v })}>
                  <SelectTrigger className="bg-slate-800 border-slate-700 text-white mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="security">الأمن</SelectItem>
                    <SelectItem value="people">الأفراد</SelectItem>
                    <SelectItem value="vehicle">المركبات</SelectItem>
                    <SelectItem value="crowd">الحشود</SelectItem>
                    <SelectItem value="environment">البيئة</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-slate-300 text-sm">تنسيق الملف</Label>
                <Select value={uploadConfig.format} onValueChange={(v) => setUploadConfig({ ...uploadConfig, format: v })}>
                  <SelectTrigger className="bg-slate-800 border-slate-700 text-white mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    {supportedFormats.map(f => (
                      <SelectItem key={f.value} value={f.value}>
                        {f.icon} {f.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="p-6 border-2 border-dashed border-slate-700 rounded-lg text-center hover:border-purple-500/50 transition-colors cursor-pointer">
              <Upload className="w-8 h-8 text-slate-500 mx-auto mb-2" />
              <p className="text-slate-400 text-sm">اسحب الملف هنا أو انقر للرفع</p>
              <p className="text-slate-500 text-xs mt-1">
                التنسيقات المدعومة: {supportedFormats.map(f => f.value).join(', ')}
              </p>
            </div>
            <Button
              className="w-full bg-purple-600 hover:bg-purple-700"
              onClick={() => uploadModelMutation.mutate(uploadConfig)}
              disabled={uploadModelMutation.isPending || !uploadConfig.name}
            >
              {uploadModelMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'رفع النموذج'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Hyperparameters Dialog */}
      <Dialog open={showHyperparams} onOpenChange={setShowHyperparams}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Sliders className="w-5 h-5 text-amber-400" />
              ضبط المعلمات الفائقة (Hyperparameter Tuning)
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label className="text-slate-300 text-sm">اختر النموذج</Label>
              <Select
                value={String(hyperparamsConfig.modelId || '')}
                onValueChange={(v) => setHyperparamsConfig({ ...hyperparamsConfig, modelId: Number(v) })}
              >
                <SelectTrigger className="bg-slate-800 border-slate-700 text-white mt-1">
                  <SelectValue placeholder="اختر نموذج" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  {models.map(m => (
                    <SelectItem key={m.id} value={String(m.id)}>{m.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-slate-300 text-sm">معدل التعلم (Learning Rate)</Label>
                <Input
                  type="number"
                  step="0.0001"
                  value={hyperparamsConfig.learningRate}
                  onChange={(e) => setHyperparamsConfig({ ...hyperparamsConfig, learningRate: Number(e.target.value) })}
                  className="bg-slate-800 border-slate-700 text-white mt-1"
                />
              </div>
              <div>
                <Label className="text-slate-300 text-sm">حجم الدفعة (Batch Size)</Label>
                <Select
                  value={String(hyperparamsConfig.batchSize)}
                  onValueChange={(v) => setHyperparamsConfig({ ...hyperparamsConfig, batchSize: Number(v) })}
                >
                  <SelectTrigger className="bg-slate-800 border-slate-700 text-white mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    {[8, 16, 32, 64, 128, 256].map(s => (
                      <SelectItem key={s} value={String(s)}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-slate-300 text-sm">عدد الدورات (Epochs)</Label>
                <Input
                  type="number"
                  value={hyperparamsConfig.epochs}
                  onChange={(e) => setHyperparamsConfig({ ...hyperparamsConfig, epochs: Number(e.target.value) })}
                  className="bg-slate-800 border-slate-700 text-white mt-1"
                />
              </div>
              <div>
                <Label className="text-slate-300 text-sm">المحسن (Optimizer)</Label>
                <Select
                  value={hyperparamsConfig.optimizer}
                  onValueChange={(v) => setHyperparamsConfig({ ...hyperparamsConfig, optimizer: v })}
                >
                  <SelectTrigger className="bg-slate-800 border-slate-700 text-white mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="adam">Adam</SelectItem>
                    <SelectItem value="sgd">SGD</SelectItem>
                    <SelectItem value="rmsprop">RMSprop</SelectItem>
                    <SelectItem value="adamw">AdamW</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label className="text-slate-300 text-sm">معدل الإسقاط (Dropout): {hyperparamsConfig.dropout}</Label>
              <Slider
                value={[hyperparamsConfig.dropout * 100]}
                onValueChange={([v]) => setHyperparamsConfig({ ...hyperparamsConfig, dropout: v / 100 })}
                max={50}
                step={5}
                className="mt-2"
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg">
              <div>
                <p className="text-white text-sm">تعزيز البيانات (Data Augmentation)</p>
                <p className="text-slate-400 text-xs">تدوير، قلب، تغيير الإضاءة</p>
              </div>
              <Switch
                checked={hyperparamsConfig.augmentation}
                onCheckedChange={(v) => setHyperparamsConfig({ ...hyperparamsConfig, augmentation: v })}
              />
            </div>

            <div className="flex gap-2">
              <Button
                className="flex-1 bg-amber-600 hover:bg-amber-700"
                onClick={() => hyperparamTuneMutation.mutate(hyperparamsConfig)}
                disabled={hyperparamTuneMutation.isPending || !hyperparamsConfig.modelId}
              >
                {hyperparamTuneMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <><Zap className="w-4 h-4 ml-1" /> اقتراح أفضل إعدادات</>
                )}
              </Button>
              <Button variant="outline" className="border-slate-600">
                تطبيق
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* A/B Test Dialog */}
      <Dialog open={showABTest} onOpenChange={setShowABTest}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <FlaskConical className="w-5 h-5 text-cyan-400" />
              إنشاء اختبار A/B
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label className="text-slate-300 text-sm">اسم الاختبار</Label>
              <Input
                value={abTestConfig.name}
                onChange={(e) => setAbTestConfig({ ...abTestConfig, name: e.target.value })}
                className="bg-slate-800 border-slate-700 text-white mt-1"
                placeholder="مثال: اختبار دقة كشف الأسلحة"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-slate-300 text-sm">النموذج A (التحكم)</Label>
                <Select
                  value={String(abTestConfig.modelA || '')}
                  onValueChange={(v) => setAbTestConfig({ ...abTestConfig, modelA: Number(v) })}
                >
                  <SelectTrigger className="bg-slate-800 border-slate-700 text-white mt-1">
                    <SelectValue placeholder="اختر نموذج" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    {models.map(m => (
                      <SelectItem key={m.id} value={String(m.id)}>{m.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-slate-300 text-sm">النموذج B (المختبر)</Label>
                <Select
                  value={String(abTestConfig.modelB || '')}
                  onValueChange={(v) => setAbTestConfig({ ...abTestConfig, modelB: Number(v) })}
                >
                  <SelectTrigger className="bg-slate-800 border-slate-700 text-white mt-1">
                    <SelectValue placeholder="اختر نموذج" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    {models.filter(m => m.id !== abTestConfig.modelA).map(m => (
                      <SelectItem key={m.id} value={String(m.id)}>{m.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label className="text-slate-300 text-sm">توزيع الحركة: {abTestConfig.trafficSplit}% A / {100 - abTestConfig.trafficSplit}% B</Label>
              <Slider
                value={[abTestConfig.trafficSplit]}
                onValueChange={([v]) => setAbTestConfig({ ...abTestConfig, trafficSplit: v })}
                max={90}
                min={10}
                step={5}
                className="mt-2"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-slate-300 text-sm">مدة الاختبار (أيام)</Label>
                <Input
                  type="number"
                  value={abTestConfig.duration}
                  onChange={(e) => setAbTestConfig({ ...abTestConfig, duration: Number(e.target.value) })}
                  className="bg-slate-800 border-slate-700 text-white mt-1"
                />
              </div>
              <div>
                <Label className="text-slate-300 text-sm">مقياس النجاح</Label>
                <Select
                  value={abTestConfig.metric}
                  onValueChange={(v) => setAbTestConfig({ ...abTestConfig, metric: v })}
                >
                  <SelectTrigger className="bg-slate-800 border-slate-700 text-white mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="accuracy">الدقة</SelectItem>
                    <SelectItem value="latency">زمن الاستجابة</SelectItem>
                    <SelectItem value="error_rate">معدل الأخطاء</SelectItem>
                    <SelectItem value="f1_score">درجة F1</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button
              className="w-full bg-cyan-600 hover:bg-cyan-700"
              onClick={() => createABTestMutation.mutate(abTestConfig)}
              disabled={createABTestMutation.isPending || !abTestConfig.name || !abTestConfig.modelA || !abTestConfig.modelB}
            >
              {createABTestMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'بدء الاختبار'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Fine-tune Dialog */}
      <Dialog open={showFineTune} onOpenChange={setShowFineTune}>
        <DialogContent className="bg-[#0f1629] border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white">تحسين النموذج</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label className="text-slate-300 text-sm">اختر النموذج</Label>
              <Select
                value={String(fineTuneConfig.modelId || '')}
                onValueChange={(v) => setFineTuneConfig({ ...fineTuneConfig, modelId: Number(v) })}
              >
                <SelectTrigger className="bg-slate-800 border-slate-700 text-white mt-1">
                  <SelectValue placeholder="اختر نموذج" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  {models.map(m => (
                    <SelectItem key={m.id} value={String(m.id)}>{m.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-slate-300 text-sm">عدد الدورات</Label>
                <Input
                  type="number"
                  value={fineTuneConfig.epochs}
                  onChange={(e) => setFineTuneConfig({ ...fineTuneConfig, epochs: Number(e.target.value) })}
                  className="bg-slate-800 border-slate-700 text-white mt-1"
                />
              </div>
              <div>
                <Label className="text-slate-300 text-sm">معدل التعلم</Label>
                <Input
                  type="number"
                  step="0.0001"
                  value={fineTuneConfig.learningRate}
                  onChange={(e) => setFineTuneConfig({ ...fineTuneConfig, learningRate: Number(e.target.value) })}
                  className="bg-slate-800 border-slate-700 text-white mt-1"
                />
              </div>
            </div>
            <div className="p-4 border-2 border-dashed border-slate-700 rounded-lg text-center">
              <p className="text-slate-400 text-sm">رفع مجموعة بيانات للتحسين</p>
            </div>
            <Button
              className="w-full bg-purple-600 hover:bg-purple-700"
              onClick={() => fineTuneMutation.mutate(fineTuneConfig)}
              disabled={fineTuneMutation.isPending || !fineTuneConfig.modelId}
            >
              {fineTuneMutation.isPending ? <><Loader2 className="w-4 h-4 animate-spin ml-2" /> جاري التحسين...</> : 'بدء التحسين'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}