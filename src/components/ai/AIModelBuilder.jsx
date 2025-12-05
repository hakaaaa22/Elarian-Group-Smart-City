import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  Brain, Plus, Upload, Database, Settings, Play, Pause, RefreshCw,
  CheckCircle, AlertTriangle, Layers, Code, Zap, Target, TrendingUp,
  FileText, Download, Eye, Trash2, Edit, Copy, ExternalLink, Cpu,
  Sparkles, MessageSquare, Lightbulb
} from 'lucide-react';
import ProactiveInsightsAssistant from './ProactiveInsightsAssistant';
import UserBehaviorAnalytics from './UserBehaviorAnalytics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

// نماذج AI الموجودة
const existingModels = [
  { id: 'waste-detection', name: 'كشف أنواع النفايات', type: 'classification', accuracy: 94.5, status: 'active', lastTrained: '2024-12-01', dataPoints: 15420 },
  { id: 'traffic-analysis', name: 'تحليل حركة المرور', type: 'prediction', accuracy: 91.8, status: 'active', lastTrained: '2024-11-28', dataPoints: 28300 },
  { id: 'anomaly-detection', name: 'كشف الشذوذ', type: 'anomaly', accuracy: 89.2, status: 'training', lastTrained: '2024-12-03', dataPoints: 8920 },
  { id: 'predictive-maintenance', name: 'الصيانة التنبؤية', type: 'prediction', accuracy: 87.5, status: 'active', lastTrained: '2024-11-25', dataPoints: 12450 },
];

// قوالب النماذج
const modelTemplates = [
  { id: 'classification', name: 'تصنيف', icon: Layers, desc: 'تصنيف البيانات إلى فئات محددة', color: 'cyan' },
  { id: 'prediction', name: 'تنبؤ', icon: TrendingUp, desc: 'التنبؤ بالقيم المستقبلية', color: 'purple' },
  { id: 'anomaly', name: 'كشف شذوذ', icon: AlertTriangle, desc: 'اكتشاف الأنماط غير الطبيعية', color: 'amber' },
  { id: 'clustering', name: 'تجميع', icon: Target, desc: 'تجميع البيانات المتشابهة', color: 'green' },
];

// APIs خارجية
const externalAPIs = [
  { id: 'openai', name: 'OpenAI GPT-4', type: 'LLM', status: 'connected', usage: 78 },
  { id: 'azure-cv', name: 'Azure Computer Vision', type: 'Vision', status: 'connected', usage: 45 },
  { id: 'google-ml', name: 'Google ML Kit', type: 'ML', status: 'disconnected', usage: 0 },
  { id: 'aws-rekognition', name: 'AWS Rekognition', type: 'Vision', status: 'connected', usage: 32 },
];

export default function AIModelBuilder() {
  const [activeTab, setActiveTab] = useState('models');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showTrainDialog, setShowTrainDialog] = useState(false);
  const [selectedModel, setSelectedModel] = useState(null);
  const [newModel, setNewModel] = useState({
    name: '',
    type: 'classification',
    description: '',
    dataSource: '',
    autoRetrain: false,
    retrainInterval: 'weekly'
  });
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [isTraining, setIsTraining] = useState(false);

  // إنشاء نموذج جديد
  const createModel = useMutation({
    mutationFn: async (modelData) => {
      return await base44.integrations.Core.InvokeLLM({
        prompt: `كخبير في بناء نماذج الذكاء الاصطناعي، قم بتحليل متطلبات النموذج التالي وتقديم خطة تنفيذ:

اسم النموذج: ${modelData.name}
النوع: ${modelData.type}
الوصف: ${modelData.description}
مصدر البيانات: ${modelData.dataSource}
إعادة التدريب التلقائي: ${modelData.autoRetrain ? 'نعم' : 'لا'}

قدم:
1. هيكل النموذج المقترح
2. خطوات التدريب
3. مقاييس التقييم
4. التحسينات الموصى بها
5. متطلبات البيانات`,
        response_json_schema: {
          type: "object",
          properties: {
            modelArchitecture: { type: "string" },
            trainingSteps: { type: "array", items: { type: "string" } },
            evaluationMetrics: { type: "array", items: { type: "string" } },
            recommendations: { type: "array", items: { type: "string" } },
            dataRequirements: { type: "object", properties: { minSamples: { type: "number" }, features: { type: "array", items: { type: "string" } } } },
            estimatedAccuracy: { type: "number" },
            trainingTime: { type: "string" }
          }
        }
      });
    },
    onSuccess: (data) => {
      toast.success('تم إنشاء خطة النموذج بنجاح');
      setShowCreateDialog(false);
    }
  });

  // تدريب نموذج
  const trainModel = useMutation({
    mutationFn: async (modelId) => {
      setIsTraining(true);
      // محاكاة التدريب
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(r => setTimeout(r, 500));
        setTrainingProgress(i);
      }
      setIsTraining(false);
      return { success: true, accuracy: 92.5 };
    },
    onSuccess: () => {
      toast.success('تم تدريب النموذج بنجاح');
      setShowTrainDialog(false);
      setTrainingProgress(0);
    }
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'green';
      case 'training': return 'amber';
      case 'inactive': return 'slate';
      default: return 'slate';
    }
  };

  return (
    <div className="space-y-4" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-400" />
          مركز بناء نماذج AI
        </h3>
        <Button className="bg-purple-600 hover:bg-purple-700" onClick={() => setShowCreateDialog(true)}>
          <Plus className="w-4 h-4 ml-2" />
          نموذج جديد
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-slate-800/50 border border-slate-700">
          <TabsTrigger value="models" className="data-[state=active]:bg-purple-500/20">
            <Layers className="w-4 h-4 ml-1" />
            النماذج
          </TabsTrigger>
          <TabsTrigger value="training" className="data-[state=active]:bg-cyan-500/20">
            <RefreshCw className="w-4 h-4 ml-1" />
            التدريب
          </TabsTrigger>
          <TabsTrigger value="external" className="data-[state=active]:bg-amber-500/20">
            <ExternalLink className="w-4 h-4 ml-1" />
            APIs خارجية
          </TabsTrigger>
          <TabsTrigger value="proactive" className="data-[state=active]:bg-pink-500/20">
            <Sparkles className="w-4 h-4 ml-1" />
            الرؤى الاستباقية
          </TabsTrigger>
          <TabsTrigger value="user-behavior" className="data-[state=active]:bg-cyan-500/20">
            <Lightbulb className="w-4 h-4 ml-1" />
            سلوك المستخدمين
          </TabsTrigger>
        </TabsList>

        {/* Models Tab */}
        <TabsContent value="models" className="mt-4">
          <div className="grid md:grid-cols-2 gap-4">
            {existingModels.map(model => (
              <motion.div key={model.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="text-white font-medium">{model.name}</h4>
                        <p className="text-slate-400 text-xs">{model.type}</p>
                      </div>
                      <Badge className={`bg-${getStatusColor(model.status)}-500/20 text-${getStatusColor(model.status)}-400`}>
                        {model.status === 'active' ? 'نشط' : model.status === 'training' ? 'تدريب' : 'غير نشط'}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2 mb-3 text-center">
                      <div className="p-2 bg-slate-800/50 rounded">
                        <p className="text-lg font-bold text-green-400">{model.accuracy}%</p>
                        <p className="text-slate-500 text-xs">الدقة</p>
                      </div>
                      <div className="p-2 bg-slate-800/50 rounded">
                        <p className="text-lg font-bold text-cyan-400">{(model.dataPoints / 1000).toFixed(1)}K</p>
                        <p className="text-slate-500 text-xs">البيانات</p>
                      </div>
                      <div className="p-2 bg-slate-800/50 rounded">
                        <p className="text-sm font-bold text-purple-400">{model.lastTrained}</p>
                        <p className="text-slate-500 text-xs">آخر تدريب</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1 border-cyan-500 text-cyan-400" onClick={() => { setSelectedModel(model); setShowTrainDialog(true); }}>
                        <RefreshCw className="w-3 h-3 ml-1" />
                        تدريب
                      </Button>
                      <Button size="sm" variant="ghost" className="text-slate-400">
                        <Settings className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost" className="text-slate-400">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Model Templates */}
          <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80 mt-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm">قوالب النماذج</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {modelTemplates.map(template => (
                  <div key={template.id} className={`p-4 bg-${template.color}-500/10 border border-${template.color}-500/30 rounded-lg cursor-pointer hover:bg-${template.color}-500/20 transition-colors`} onClick={() => { setNewModel({ ...newModel, type: template.id }); setShowCreateDialog(true); }}>
                    <template.icon className={`w-8 h-8 text-${template.color}-400 mx-auto mb-2`} />
                    <p className="text-white text-center font-medium">{template.name}</p>
                    <p className="text-slate-400 text-center text-xs">{template.desc}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Training Tab */}
        <TabsContent value="training" className="mt-4">
          <div className="grid lg:grid-cols-2 gap-4">
            <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm">جدول التدريب التلقائي</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {existingModels.filter(m => m.status === 'active').map(model => (
                    <div key={model.id} className="p-3 bg-slate-800/50 rounded-lg flex items-center justify-between">
                      <div>
                        <p className="text-white font-medium">{model.name}</p>
                        <p className="text-slate-400 text-xs">آخر تدريب: {model.lastTrained}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Select defaultValue="weekly">
                          <SelectTrigger className="w-24 h-8 bg-slate-900 border-slate-700 text-white text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="daily">يومي</SelectItem>
                            <SelectItem value="weekly">أسبوعي</SelectItem>
                            <SelectItem value="monthly">شهري</SelectItem>
                          </SelectContent>
                        </Select>
                        <Switch defaultChecked />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm">سجل التدريب</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[200px]">
                  <div className="space-y-2">
                    {[
                      { model: 'كشف الشذوذ', date: '2024-12-03 14:30', status: 'success', accuracy: '+2.1%' },
                      { model: 'تحليل المرور', date: '2024-12-02 09:00', status: 'success', accuracy: '+0.8%' },
                      { model: 'كشف النفايات', date: '2024-12-01 16:45', status: 'success', accuracy: '+1.5%' },
                      { model: 'الصيانة التنبؤية', date: '2024-11-30 11:20', status: 'failed', accuracy: '-' },
                    ].map((log, i) => (
                      <div key={i} className="p-2 bg-slate-900/50 rounded flex items-center justify-between">
                        <div>
                          <p className="text-white text-sm">{log.model}</p>
                          <p className="text-slate-500 text-xs">{log.date}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {log.status === 'success' ? (
                            <>
                              <Badge className="bg-green-500/20 text-green-400">{log.accuracy}</Badge>
                              <CheckCircle className="w-4 h-4 text-green-400" />
                            </>
                          ) : (
                            <AlertTriangle className="w-4 h-4 text-red-400" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* External APIs Tab */}
        <TabsContent value="external" className="mt-4">
          <div className="grid md:grid-cols-2 gap-4">
            {externalAPIs.map(api => (
              <Card key={api.id} className={`glass-card border-${api.status === 'connected' ? 'green' : 'slate'}-500/30 bg-[#0f1629]/80`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${api.status === 'connected' ? 'bg-green-500/20' : 'bg-slate-500/20'}`}>
                        <Cpu className={`w-5 h-5 ${api.status === 'connected' ? 'text-green-400' : 'text-slate-400'}`} />
                      </div>
                      <div>
                        <p className="text-white font-medium">{api.name}</p>
                        <p className="text-slate-400 text-xs">{api.type}</p>
                      </div>
                    </div>
                    <Badge className={api.status === 'connected' ? 'bg-green-500/20 text-green-400' : 'bg-slate-600 text-slate-400'}>
                      {api.status === 'connected' ? 'متصل' : 'غير متصل'}
                    </Badge>
                  </div>
                  
                  {api.status === 'connected' && (
                    <div className="mb-3">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-400">الاستخدام</span>
                        <span className="text-cyan-400">{api.usage}%</span>
                      </div>
                      <Progress value={api.usage} className="h-2" />
                    </div>
                  )}

                  <Button size="sm" variant={api.status === 'connected' ? 'outline' : 'default'} className={api.status === 'connected' ? 'w-full border-slate-600 text-slate-400' : 'w-full bg-green-600 hover:bg-green-700'}>
                    {api.status === 'connected' ? 'إعدادات' : 'اتصال'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="glass-card border-cyan-500/30 bg-cyan-500/5 mt-4">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <Code className="w-5 h-5 text-cyan-400" />
                <p className="text-white font-medium">إضافة API مخصص</p>
              </div>
              <div className="grid md:grid-cols-3 gap-3">
                <Input placeholder="اسم الخدمة" className="bg-slate-800/50 border-slate-700 text-white" />
                <Input placeholder="Endpoint URL" className="bg-slate-800/50 border-slate-700 text-white" />
                <Button className="bg-cyan-600 hover:bg-cyan-700">
                  <Plus className="w-4 h-4 ml-2" />
                  إضافة
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Proactive Insights Tab */}
        <TabsContent value="proactive" className="mt-4">
          <ProactiveInsightsAssistant />
        </TabsContent>

        {/* User Behavior Tab */}
        <TabsContent value="user-behavior" className="mt-4">
          <UserBehaviorAnalytics />
        </TabsContent>
      </Tabs>

      {/* Create Model Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-400" />
              إنشاء نموذج AI جديد
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label className="text-slate-400">اسم النموذج</Label>
              <Input value={newModel.name} onChange={(e) => setNewModel({ ...newModel, name: e.target.value })} className="bg-slate-800/50 border-slate-700 text-white mt-1" placeholder="مثال: كشف تلوث النفايات" />
            </div>
            <div>
              <Label className="text-slate-400">نوع النموذج</Label>
              <Select value={newModel.type} onValueChange={(v) => setNewModel({ ...newModel, type: v })}>
                <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {modelTemplates.map(t => (
                    <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-slate-400">الوصف</Label>
              <Textarea value={newModel.description} onChange={(e) => setNewModel({ ...newModel, description: e.target.value })} className="bg-slate-800/50 border-slate-700 text-white mt-1" placeholder="وصف وظيفة النموذج..." />
            </div>
            <div>
              <Label className="text-slate-400">مصدر البيانات</Label>
              <Select value={newModel.dataSource} onValueChange={(v) => setNewModel({ ...newModel, dataSource: v })}>
                <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white mt-1">
                  <SelectValue placeholder="اختر مصدر البيانات" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="waste">بيانات النفايات</SelectItem>
                  <SelectItem value="traffic">بيانات المرور</SelectItem>
                  <SelectItem value="devices">بيانات الأجهزة</SelectItem>
                  <SelectItem value="custom">ملف مخصص</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
              <Label className="text-slate-400">إعادة التدريب التلقائي</Label>
              <Switch checked={newModel.autoRetrain} onCheckedChange={(v) => setNewModel({ ...newModel, autoRetrain: v })} />
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" className="border-slate-600 text-slate-400" onClick={() => setShowCreateDialog(false)}>إلغاء</Button>
            <Button className="bg-purple-600 hover:bg-purple-700" onClick={() => createModel.mutate(newModel)} disabled={createModel.isPending}>
              {createModel.isPending ? <RefreshCw className="w-4 h-4 ml-2 animate-spin" /> : <Zap className="w-4 h-4 ml-2" />}
              إنشاء
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Train Model Dialog */}
      <Dialog open={showTrainDialog} onOpenChange={setShowTrainDialog}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-cyan-400" />
              تدريب النموذج
            </DialogTitle>
          </DialogHeader>
          {selectedModel && (
            <div className="space-y-4 mt-4">
              <div className="p-3 bg-slate-800/50 rounded-lg">
                <p className="text-white font-medium">{selectedModel.name}</p>
                <p className="text-slate-400 text-xs">الدقة الحالية: {selectedModel.accuracy}%</p>
              </div>
              
              {isTraining && (
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-400">تقدم التدريب</span>
                    <span className="text-cyan-400">{trainingProgress}%</span>
                  </div>
                  <Progress value={trainingProgress} className="h-3" />
                </div>
              )}

              <Button className="w-full bg-cyan-600 hover:bg-cyan-700" onClick={() => trainModel.mutate(selectedModel.id)} disabled={isTraining}>
                {isTraining ? (
                  <>
                    <RefreshCw className="w-4 h-4 ml-2 animate-spin" />
                    جاري التدريب...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 ml-2" />
                    بدء التدريب
                  </>
                )}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}