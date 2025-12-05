import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import {
  Wand2, Plus, Loader2, Sparkles, Shield, Car, ShoppingBag, AlertTriangle,
  Play, Pause, Trash2, Settings, Zap, Eye, Bell, Mail
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger
} from '@/components/ui/dialog';
import { toast } from 'sonner';

const categories = [
  { value: 'security', label: 'أمني', icon: Shield, color: 'red' },
  { value: 'safety', label: 'سلامة', icon: AlertTriangle, color: 'amber' },
  { value: 'traffic', label: 'مروري', icon: Car, color: 'blue' },
  { value: 'retail', label: 'تجاري', icon: ShoppingBag, color: 'purple' },
  { value: 'custom', label: 'مخصص', icon: Wand2, color: 'cyan' },
];

const actionTypes = [
  { value: 'alert', label: 'تنبيه', icon: Bell },
  { value: 'email', label: 'بريد إلكتروني', icon: Mail },
  { value: 'record', label: 'تسجيل', icon: Eye },
  { value: 'trigger', label: 'تفعيل إجراء', icon: Zap },
];

export default function AnalyticsBuilder() {
  const [showBuilder, setShowBuilder] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedAnalytics, setGeneratedAnalytics] = useState(null);
  const queryClient = useQueryClient();

  const { data: analytics = [], isLoading } = useQuery({
    queryKey: ['customAnalytics'],
    queryFn: () => base44.entities.CustomAnalytics.list('-created_date'),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.CustomAnalytics.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customAnalytics'] });
      toast.success('تم إنشاء التحليل بنجاح');
      setShowBuilder(false);
      setPrompt('');
      setGeneratedAnalytics(null);
    },
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, status }) => base44.entities.CustomAnalytics.update(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customAnalytics'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.CustomAnalytics.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customAnalytics'] });
      toast.success('تم الحذف');
    },
  });

  const generateFromPrompt = async () => {
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    try {
      // Get existing analytics for pattern learning
      const existingPatterns = analytics.slice(0, 10).map(a => ({
        name: a.name,
        category: a.category,
        conditions: a.trigger_conditions
      }));

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `أنت خبير متقدم في إنشاء قواعد تحليل الفيديو الذكي ورؤية الحاسوب.

وصف المستخدم:
"${prompt}"

التحليلات الموجودة للتعلم منها:
${JSON.stringify(existingPatterns, null, 2)}

المطلوب إنشاء قاعدة تحليل متقدمة تتضمن:

1. اسم القاعدة ووصف تفصيلي
2. الفئة المناسبة (security/safety/traffic/retail/custom)
3. شروط تفعيل معقدة ومتعددة:
   - نوع الكشف (وجوه، أجسام، سيارات، سلوك، إلخ)
   - العتبات والحدود
   - المناطق المحددة
   - شروط زمنية
   - شروط مركبة (AND/OR)
   - مدة الحدث
   - تكرار الحدث
4. إجراءات متعددة مع أولويات:
   - تنبيهات فورية
   - إرسال بريد
   - تسجيل فيديو
   - تفعيل أجهزة
   - إشعارات مخصصة
5. استثناءات وحالات خاصة
6. مؤشرات الأداء المقترحة`,
        response_json_schema: {
          type: "object",
          properties: {
            name: { type: "string" },
            description: { type: "string" },
            category: { type: "string", enum: ["security", "safety", "traffic", "retail", "custom"] },
            trigger_conditions: {
              type: "object",
              properties: {
                detection_type: { type: "string" },
                threshold: { type: "number" },
                zone: { type: "string" },
                time_conditions: { type: "string" },
                compound_logic: { type: "string" },
                duration_seconds: { type: "number" },
                occurrence_count: { type: "number" },
                sensitivity: { type: "string" },
                object_size_min: { type: "number" },
                object_size_max: { type: "number" },
                speed_threshold: { type: "number" },
                direction: { type: "string" }
              }
            },
            actions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  type: { type: "string" },
                  priority: { type: "string" },
                  delay_seconds: { type: "number" },
                  recipients: { type: "array", items: { type: "string" } },
                  message_template: { type: "string" }
                }
              }
            },
            exceptions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  condition: { type: "string" },
                  action: { type: "string" }
                }
              }
            },
            kpis: {
              type: "array",
              items: { type: "string" }
            },
            similar_rules: {
              type: "array",
              items: { type: "string" }
            }
          }
        }
      });

      setGeneratedAnalytics({
        ...result,
        ai_generated: true,
        prompt_used: prompt,
        status: 'draft'
      });
    } catch (error) {
      toast.error('فشل في إنشاء التحليل');
    }
    setIsGenerating(false);
  };

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
              <Wand2 className="w-8 h-8 text-cyan-400" />
              منشئ التحليلات الذكي
            </h1>
            <p className="text-slate-400 mt-1">أنشئ قواعد تحليل مخصصة باستخدام الذكاء الاصطناعي</p>
          </div>
          <Dialog open={showBuilder} onOpenChange={setShowBuilder}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700">
                <Sparkles className="w-4 h-4 ml-2" />
                إنشاء تحليل جديد
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#0f1629] border-slate-700 max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-white flex items-center gap-2">
                  <Wand2 className="w-5 h-5 text-cyan-400" />
                  منشئ التحليلات بالذكاء الاصطناعي
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4 mt-4">
                <div>
                  <Label className="text-white">صف ما تريد تحليله</Label>
                  <Textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="مثال: أريد كشف أي شخص يدخل المنطقة المحظورة بعد الساعة 10 مساءً وإرسال تنبيه فوري..."
                    className="bg-slate-800/50 border-slate-700 text-white mt-2 h-32"
                  />
                </div>

                <Button 
                  onClick={generateFromPrompt} 
                  disabled={!prompt.trim() || isGenerating}
                  className="w-full bg-gradient-to-r from-cyan-600 to-purple-600"
                >
                  {isGenerating ? (
                    <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4 ml-2" />
                  )}
                  إنشاء بالذكاء الاصطناعي
                </Button>

                {generatedAnalytics && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-slate-800/50 rounded-lg border border-cyan-500/30"
                  >
                    <h3 className="text-white font-medium mb-3">{generatedAnalytics.name}</h3>
                    <p className="text-slate-400 text-sm mb-3">{generatedAnalytics.description}</p>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-cyan-500/20 text-cyan-400">
                          {categories.find(c => c.value === generatedAnalytics.category)?.label}
                        </Badge>
                      </div>
                      
                      {generatedAnalytics.trigger_conditions && (
                        <div className="p-2 bg-slate-900/50 rounded">
                          <p className="text-slate-400 text-xs mb-1">شروط التفعيل:</p>
                          <p className="text-white text-xs">
                            {generatedAnalytics.trigger_conditions.detection_type} - 
                            {generatedAnalytics.trigger_conditions.zone}
                          </p>
                        </div>
                      )}

                      {generatedAnalytics.actions?.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {generatedAnalytics.actions.map((action, i) => (
                            <Badge key={i} variant="outline" className="text-slate-400">
                              {actionTypes.find(a => a.value === action.type)?.label || action.type}
                              {action.priority && <span className="mr-1 text-xs">({action.priority})</span>}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {/* Advanced Conditions */}
                      {generatedAnalytics.trigger_conditions?.compound_logic && (
                        <div className="p-2 bg-slate-900/50 rounded mt-2">
                          <p className="text-slate-400 text-xs mb-1">المنطق المركب:</p>
                          <p className="text-cyan-400 text-xs font-mono">{generatedAnalytics.trigger_conditions.compound_logic}</p>
                        </div>
                      )}

                      {/* Exceptions */}
                      {generatedAnalytics.exceptions?.length > 0 && (
                        <div className="mt-2">
                          <p className="text-slate-400 text-xs mb-1">الاستثناءات:</p>
                          {generatedAnalytics.exceptions.map((exc, i) => (
                            <p key={i} className="text-slate-300 text-xs">• {exc.condition}</p>
                          ))}
                        </div>
                      )}

                      {/* KPIs */}
                      {generatedAnalytics.kpis?.length > 0 && (
                        <div className="mt-2">
                          <p className="text-slate-400 text-xs mb-1">مؤشرات الأداء:</p>
                          <div className="flex flex-wrap gap-1">
                            {generatedAnalytics.kpis.map((kpi, i) => (
                              <Badge key={i} className="bg-amber-500/20 text-amber-400 text-xs">{kpi}</Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Similar Rules Suggestion */}
                      {generatedAnalytics.similar_rules?.length > 0 && (
                        <div className="mt-2 p-2 bg-purple-500/10 rounded">
                          <p className="text-purple-400 text-xs mb-1">قواعد مشابهة مقترحة:</p>
                          {generatedAnalytics.similar_rules.map((rule, i) => (
                            <p key={i} className="text-slate-300 text-xs">• {rule}</p>
                          ))}
                        </div>
                      )}
                    </div>

                    <Button 
                      onClick={() => createMutation.mutate(generatedAnalytics)}
                      className="w-full mt-4 bg-green-600 hover:bg-green-700"
                    >
                      حفظ وتفعيل
                    </Button>
                  </motion.div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {categories.slice(0, 4).map((cat, i) => {
          const count = analytics.filter(a => a.category === cat.value).length;
          const Icon = cat.icon;
          return (
            <Card key={cat.value} className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-${cat.color}-500/20`}>
                    <Icon className={`w-5 h-5 text-${cat.color}-400`} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{count}</p>
                    <p className="text-xs text-slate-400">{cat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Analytics List */}
      <div className="grid md:grid-cols-2 gap-4">
        {analytics.map((item, i) => {
          const cat = categories.find(c => c.value === item.category);
          const Icon = cat?.icon || Wand2;
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-xl bg-${cat?.color || 'cyan'}-500/20`}>
                        <Icon className={`w-5 h-5 text-${cat?.color || 'cyan'}-400`} />
                      </div>
                      <div>
                        <h3 className="text-white font-medium">{item.name}</h3>
                        <p className="text-slate-400 text-sm">{item.description}</p>
                      </div>
                    </div>
                    <Switch
                      checked={item.status === 'active'}
                      onCheckedChange={(checked) => 
                        toggleMutation.mutate({ id: item.id, status: checked ? 'active' : 'inactive' })
                      }
                    />
                  </div>

                  <div className="mt-3 flex items-center gap-2 flex-wrap">
                    <Badge className={`bg-${cat?.color || 'cyan'}-500/20 text-${cat?.color || 'cyan'}-400`}>
                      {cat?.label}
                    </Badge>
                    {item.ai_generated && (
                      <Badge className="bg-purple-500/20 text-purple-400">
                        <Sparkles className="w-3 h-3 ml-1" />
                        AI
                      </Badge>
                    )}
                    <Badge className={item.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-slate-500/20 text-slate-400'}>
                      {item.status === 'active' ? 'نشط' : 'متوقف'}
                    </Badge>
                  </div>

                  {item.actions?.length > 0 && (
                    <div className="mt-3 flex gap-2">
                      {item.actions.map((action, ai) => {
                        const ActionIcon = actionTypes.find(a => a.value === action.type)?.icon || Zap;
                        return (
                          <div key={ai} className="p-2 bg-slate-800/50 rounded">
                            <ActionIcon className="w-4 h-4 text-slate-400" />
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div className="mt-3 flex justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-400 hover:bg-red-500/10"
                      onClick={() => deleteMutation.mutate(item.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {analytics.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <Wand2 className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400">لا توجد تحليلات مخصصة</p>
          <Button onClick={() => setShowBuilder(true)} className="mt-4 bg-gradient-to-r from-cyan-600 to-purple-600">
            إنشاء أول تحليل
          </Button>
        </div>
      )}
    </div>
  );
}