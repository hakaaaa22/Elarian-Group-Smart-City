import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain, Upload, Plus, Loader2, Image, Video, Tag, Sparkles,
  CheckCircle, XCircle, Clock, Trash2, Play, BarChart, Wand2,
  Copy, Users, Building2, Layers, RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';

const modelTypes = [
  { value: 'object_detection', label: 'كشف الأجسام', icon: '🎯' },
  { value: 'face_recognition', label: 'التعرف على الوجوه', icon: '👤' },
  { value: 'behavior_analysis', label: 'تحليل السلوك', icon: '🏃' },
  { value: 'anomaly_detection', label: 'كشف الشذوذ', icon: '⚠️' },
  { value: 'custom', label: 'مخصص', icon: '🔧' },
];

const statusConfig = {
  pending: { color: 'bg-amber-500/20 text-amber-400', icon: Clock, label: 'في الانتظار' },
  processing: { color: 'bg-blue-500/20 text-blue-400', icon: Loader2, label: 'جاري التدريب' },
  completed: { color: 'bg-green-500/20 text-green-400', icon: CheckCircle, label: 'مكتمل' },
  failed: { color: 'bg-red-500/20 text-red-400', icon: XCircle, label: 'فشل' },
};

export default function AITraining() {
  const [showNewJob, setShowNewJob] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isAutoLabeling, setIsAutoLabeling] = useState(false);
  const [autoLabelResults, setAutoLabelResults] = useState(null);
  const [selectedClient, setSelectedClient] = useState('');
  const [augmentationSettings, setAugmentationSettings] = useState({
    enabled: false,
    flip: true,
    rotate: true,
    brightness: true,
    noise: false,
    multiplier: 3
  });
  const [newJob, setNewJob] = useState({
    name: '',
    model_type: 'object_detection',
    description: '',
    labels: [],
    client_id: ''
  });
  const [labelInput, setLabelInput] = useState('');
  const queryClient = useQueryClient();

  const { data: clients = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: () => base44.entities.Client.list(),
  });

  const { data: jobs = [], isLoading } = useQuery({
    queryKey: ['aiTrainingJobs'],
    queryFn: () => base44.entities.AITrainingJob.list('-created_date'),
  });

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const augmentedData = augmentationSettings.enabled 
        ? uploadedFiles.flatMap(f => Array(augmentationSettings.multiplier).fill(f))
        : uploadedFiles;
        
      const job = await base44.entities.AITrainingJob.create({
        ...data,
        training_data: augmentedData,
        status: 'pending',
        progress: 0,
        client_id: selectedClient || undefined,
        augmentation: augmentationSettings.enabled ? augmentationSettings : undefined
      });
      
      // Simulate AI training process
      simulateTraining(job.id);
      return job;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['aiTrainingJobs'] });
      toast.success('تم بدء عملية التدريب');
      setShowNewJob(false);
      resetForm();
    },
  });

  const simulateTraining = async (jobId) => {
    // Simulate training progress
    for (let i = 10; i <= 100; i += 10) {
      await new Promise(r => setTimeout(r, 2000));
      await base44.entities.AITrainingJob.update(jobId, {
        status: i < 100 ? 'processing' : 'completed',
        progress: i,
        accuracy: i === 100 ? 95 + Math.random() * 4 : undefined,
      });
      queryClient.invalidateQueries({ queryKey: ['aiTrainingJobs'] });
    }
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    setIsUploading(true);
    
    const urls = [];
    for (const file of files) {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      urls.push(file_url);
    }
    
    setUploadedFiles([...uploadedFiles, ...urls]);
    setIsUploading(false);
    toast.success(`تم رفع ${files.length} ملف`);
  };

  const autoLabelData = async () => {
    if (uploadedFiles.length === 0) {
      toast.error('يرجى رفع ملفات أولاً');
      return;
    }

    setIsAutoLabeling(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `أنت نظام ذكاء اصطناعي متخصص في تصنيف وتسمية البيانات المرئية.

قم بتحليل الصور/الفيديوهات المرفقة واقترح:
1. التصنيفات (Labels) المناسبة للكشف عنها
2. عدد العناصر المكتشفة من كل نوع
3. مستوى الثقة في كل تصنيف
4. اقتراحات لتصنيفات إضافية قد تكون مفيدة

نوع النموذج المطلوب: ${modelTypes.find(m => m.value === newJob.model_type)?.label}
${newJob.description ? `الوصف: ${newJob.description}` : ''}`,
        file_urls: uploadedFiles.slice(0, 5),
        response_json_schema: {
          type: "object",
          properties: {
            detected_labels: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  label: { type: "string" },
                  count: { type: "number" },
                  confidence: { type: "number" },
                  description: { type: "string" }
                }
              }
            },
            suggested_labels: {
              type: "array",
              items: { type: "string" }
            },
            data_quality: {
              type: "object",
              properties: {
                score: { type: "number" },
                issues: { type: "array", items: { type: "string" } },
                recommendations: { type: "array", items: { type: "string" } }
              }
            }
          }
        }
      });

      setAutoLabelResults(result);
      
      // Auto-add detected labels
      if (result.detected_labels?.length > 0) {
        const newLabels = result.detected_labels
          .filter(l => l.confidence > 70)
          .map(l => l.label)
          .filter(l => !newJob.labels.includes(l));
        setNewJob({ ...newJob, labels: [...newJob.labels, ...newLabels] });
      }
      
      toast.success('تم التصنيف التلقائي بنجاح');
    } catch (error) {
      toast.error('فشل في التصنيف التلقائي');
    }
    setIsAutoLabeling(false);
  };

  const applyAugmentation = () => {
    const originalCount = uploadedFiles.length;
    const augmentedCount = originalCount * augmentationSettings.multiplier;
    toast.success(`سيتم إنشاء ${augmentedCount} عينة من ${originalCount} ملف أصلي`);
  };

  const addLabel = () => {
    if (labelInput.trim() && !newJob.labels.includes(labelInput.trim())) {
      setNewJob({ ...newJob, labels: [...newJob.labels, labelInput.trim()] });
      setLabelInput('');
    }
  };

  const removeLabel = (label) => {
    setNewJob({ ...newJob, labels: newJob.labels.filter(l => l !== label) });
  };

  const resetForm = () => {
    setNewJob({ name: '', model_type: 'object_detection', description: '', labels: [] });
    setUploadedFiles([]);
    setLabelInput('');
  };

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.AITrainingJob.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['aiTrainingJobs'] });
      toast.success('تم حذف المهمة');
    },
  });

  return (
    <div className="min-h-screen p-4 lg:p-6" dir="rtl">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white flex items-center gap-3">
              <Brain className="w-8 h-8 text-purple-400" />
              تدريب الذكاء الاصطناعي
            </h1>
            <p className="text-slate-400 mt-1">تدريب نماذج AI مخصصة من الصور والفيديو</p>
          </div>
          <Dialog open={showNewJob} onOpenChange={setShowNewJob}>
            <DialogTrigger asChild>
              <Button className="bg-purple-600 hover:bg-purple-700">
                <Plus className="w-4 h-4 ml-2" />
                مهمة تدريب جديدة
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#0f1629] border-slate-700 max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-white">إنشاء مهمة تدريب جديدة</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <Label className="text-white">اسم المهمة</Label>
                  <Input
                    value={newJob.name}
                    onChange={(e) => setNewJob({ ...newJob, name: e.target.value })}
                    placeholder="مثال: كشف السيارات المشبوهة"
                    className="bg-slate-800/50 border-slate-700 text-white mt-1"
                  />
                </div>
                
                <div>
                  <Label className="text-white">نوع النموذج</Label>
                  <Select value={newJob.model_type} onValueChange={(v) => setNewJob({ ...newJob, model_type: v })}>
                    <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      {modelTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          <span className="flex items-center gap-2">
                            <span>{type.icon}</span>
                            <span>{type.label}</span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-white">الوصف</Label>
                  <Textarea
                    value={newJob.description}
                    onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
                    placeholder="وصف ما تريد أن يتعلمه النموذج..."
                    className="bg-slate-800/50 border-slate-700 text-white mt-1"
                  />
                </div>

                {/* Client Selection */}
                <div>
                  <Label className="text-white flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    ربط بعميل (اختياري)
                  </Label>
                  <Select value={selectedClient} onValueChange={setSelectedClient}>
                    <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white mt-1">
                      <SelectValue placeholder="اختر عميل..." />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value={null}>بدون ربط</SelectItem>
                      {clients.map(client => (
                        <SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-white">التصنيفات (Labels)</Label>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={autoLabelData}
                      disabled={isAutoLabeling || uploadedFiles.length === 0}
                      className="text-cyan-400 hover:text-cyan-300"
                    >
                      {isAutoLabeling ? (
                        <Loader2 className="w-4 h-4 ml-1 animate-spin" />
                      ) : (
                        <Wand2 className="w-4 h-4 ml-1" />
                      )}
                      تصنيف تلقائي
                    </Button>
                  </div>
                  <div className="flex gap-2 mt-1">
                    <Input
                      value={labelInput}
                      onChange={(e) => setLabelInput(e.target.value)}
                      placeholder="أضف تصنيف..."
                      className="bg-slate-800/50 border-slate-700 text-white"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addLabel())}
                    />
                    <Button onClick={addLabel} variant="outline" className="border-slate-600">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {newJob.labels.map(label => (
                      <Badge key={label} className="bg-purple-500/20 text-purple-400">
                        {label}
                        <button onClick={() => removeLabel(label)} className="mr-1 hover:text-red-400">×</button>
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Auto Label Results */}
                <AnimatePresence>
                  {autoLabelResults && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-lg"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="w-4 h-4 text-cyan-400" />
                        <span className="text-cyan-400 text-sm font-medium">نتائج التصنيف التلقائي</span>
                      </div>
                      {autoLabelResults.detected_labels?.map((item, i) => (
                        <div key={i} className="flex items-center justify-between text-sm py-1">
                          <span className="text-white">{item.label}</span>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-slate-400">{item.count} عنصر</Badge>
                            <Badge className={`${item.confidence > 80 ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'}`}>
                              {item.confidence}%
                            </Badge>
                          </div>
                        </div>
                      ))}
                      {autoLabelResults.data_quality && (
                        <div className="mt-2 pt-2 border-t border-cyan-500/20">
                          <span className="text-slate-400 text-xs">جودة البيانات: {autoLabelResults.data_quality.score}%</span>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Data Augmentation */}
                <div className="p-3 bg-slate-800/30 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Layers className="w-4 h-4 text-purple-400" />
                      <span className="text-white text-sm font-medium">تكثير البيانات (Augmentation)</span>
                    </div>
                    <Switch
                      checked={augmentationSettings.enabled}
                      onCheckedChange={(checked) => setAugmentationSettings({ ...augmentationSettings, enabled: checked })}
                    />
                  </div>
                  {augmentationSettings.enabled && (
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { key: 'flip', label: 'قلب الصور' },
                          { key: 'rotate', label: 'تدوير' },
                          { key: 'brightness', label: 'سطوع' },
                          { key: 'noise', label: 'تشويش' },
                        ].map(opt => (
                          <div key={opt.key} className="flex items-center gap-2">
                            <Checkbox
                              checked={augmentationSettings[opt.key]}
                              onCheckedChange={(checked) => setAugmentationSettings({ ...augmentationSettings, [opt.key]: checked })}
                              className="border-slate-600"
                            />
                            <span className="text-slate-300 text-sm">{opt.label}</span>
                          </div>
                        ))}
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-slate-400 text-sm">المضاعف:</span>
                        <Input
                          type="number"
                          min={2}
                          max={10}
                          value={augmentationSettings.multiplier}
                          onChange={(e) => setAugmentationSettings({ ...augmentationSettings, multiplier: parseInt(e.target.value) })}
                          className="w-20 bg-slate-800 border-slate-700 text-white"
                        />
                        <span className="text-slate-500 text-xs">({uploadedFiles.length * augmentationSettings.multiplier} عينة)</span>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <Label className="text-white">بيانات التدريب (صور/فيديو)</Label>
                  <label className="mt-2 flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-600 rounded-lg cursor-pointer hover:border-purple-500 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      {isUploading ? (
                        <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
                      ) : (
                        <>
                          <Upload className="w-8 h-8 text-slate-400 mb-2" />
                          <p className="text-sm text-slate-400">اسحب وأفلت أو انقر للرفع</p>
                          <p className="text-xs text-slate-500">صور أو فيديو</p>
                        </>
                      )}
                    </div>
                    <input type="file" className="hidden" multiple accept="image/*,video/*" onChange={handleFileUpload} />
                  </label>
                  {uploadedFiles.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {uploadedFiles.map((url, i) => (
                        <Badge key={i} variant="outline" className="text-slate-400">
                          <Image className="w-3 h-3 ml-1" />
                          ملف {i + 1}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <Button 
                  onClick={() => createMutation.mutate(newJob)} 
                  disabled={!newJob.name || uploadedFiles.length === 0}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  <Sparkles className="w-4 h-4 ml-2" />
                  بدء التدريب
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'إجمالي المهام', value: jobs.length, color: 'purple' },
          { label: 'قيد التنفيذ', value: jobs.filter(j => j.status === 'processing').length, color: 'blue' },
          { label: 'مكتملة', value: jobs.filter(j => j.status === 'completed').length, color: 'green' },
          { label: 'متوسط الدقة', value: `${(jobs.filter(j => j.accuracy).reduce((a, j) => a + j.accuracy, 0) / Math.max(jobs.filter(j => j.accuracy).length, 1)).toFixed(1)}%`, color: 'amber' },
        ].map((stat, i) => (
          <Card key={i} className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
            <CardContent className="p-4 text-center">
              <p className={`text-2xl font-bold text-${stat.color}-400`}>{stat.value}</p>
              <p className="text-xs text-slate-400">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Jobs List */}
      <div className="space-y-4">
        {jobs.map((job, i) => {
          const status = statusConfig[job.status];
          const StatusIcon = status.icon;
          return (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-xl bg-purple-500/20">
                        <Brain className="w-6 h-6 text-purple-400" />
                      </div>
                      <div>
                        <h3 className="text-white font-medium">{job.name}</h3>
                        <p className="text-slate-400 text-sm">
                          {modelTypes.find(m => m.value === job.model_type)?.label}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <Badge className={status.color}>
                        <StatusIcon className={`w-3 h-3 ml-1 ${job.status === 'processing' ? 'animate-spin' : ''}`} />
                        {status.label}
                      </Badge>
                      
                      {job.accuracy && (
                        <Badge className="bg-green-500/20 text-green-400">
                          <BarChart className="w-3 h-3 ml-1" />
                          {job.accuracy.toFixed(1)}% دقة
                        </Badge>
                      )}

                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="text-red-400 hover:bg-red-500/10"
                        onClick={() => deleteMutation.mutate(job.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {job.status === 'processing' && (
                    <div className="mt-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-400">التقدم</span>
                        <span className="text-white">{job.progress}%</span>
                      </div>
                      <Progress value={job.progress} className="h-2" />
                    </div>
                  )}

                  {job.labels?.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {job.labels.map(label => (
                        <Badge key={label} variant="outline" className="text-slate-400 border-slate-600">
                          <Tag className="w-3 h-3 ml-1" />
                          {label}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {jobs.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <Brain className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400">لا توجد مهام تدريب</p>
          <Button onClick={() => setShowNewJob(true)} className="mt-4 bg-purple-600">
            إنشاء أول مهمة تدريب
          </Button>
        </div>
      )}
    </div>
  );
}