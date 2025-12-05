import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Wand2, Clock, Thermometer, Sun, Moon, Home, Lock, Zap, Bell,
  ChevronRight, Plus, Check, X, Play, Lightbulb, AlertTriangle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import { toast } from 'sonner';

const triggerTemplates = [
  { id: 'time', name: 'وقت محدد', icon: Clock, color: 'cyan', description: 'عند وقت معين' },
  { id: 'sunrise', name: 'شروق الشمس', icon: Sun, color: 'amber', description: 'عند شروق الشمس' },
  { id: 'sunset', name: 'غروب الشمس', icon: Moon, color: 'purple', description: 'عند غروب الشمس' },
  { id: 'temp', name: 'درجة حرارة', icon: Thermometer, color: 'red', description: 'عند درجة حرارة معينة' },
  { id: 'leave', name: 'مغادرة المنزل', icon: Home, color: 'green', description: 'عند مغادرة الجميع' },
  { id: 'arrive', name: 'الوصول للمنزل', icon: Home, color: 'blue', description: 'عند وصول شخص' },
];

const actionTemplates = [
  { id: 'light_on', name: 'تشغيل الإضاءة', icon: Lightbulb, color: 'amber' },
  { id: 'light_off', name: 'إطفاء الإضاءة', icon: Lightbulb, color: 'slate' },
  { id: 'ac_on', name: 'تشغيل المكيف', icon: Thermometer, color: 'cyan' },
  { id: 'ac_off', name: 'إطفاء المكيف', icon: Thermometer, color: 'slate' },
  { id: 'lock', name: 'قفل الأبواب', icon: Lock, color: 'red' },
  { id: 'notify', name: 'إرسال إشعار', icon: Bell, color: 'purple' },
];

const quickAutomations = [
  { id: 'q1', name: 'صباح الخير', trigger: 'شروق الشمس', actions: ['فتح الستائر', 'إضاءة 50%'], icon: Sun },
  { id: 'q2', name: 'مساء الخير', trigger: 'غروب الشمس', actions: ['إضاءة دافئة', 'إغلاق الستائر'], icon: Moon },
  { id: 'q3', name: 'مغادرة المنزل', trigger: 'مغادرة الجميع', actions: ['إطفاء الأجهزة', 'قفل الأبواب'], icon: Home },
  { id: 'q4', name: 'توفير الطاقة', trigger: 'حرارة > 35°', actions: ['تشغيل المكيف مسبقاً'], icon: Zap },
];

export default function SimplifiedAutomationBuilder({ devices = [], onSave }) {
  const [step, setStep] = useState(1);
  const [showBuilder, setShowBuilder] = useState(false);
  const [automation, setAutomation] = useState({
    name: '',
    trigger: null,
    triggerValue: '',
    actions: [],
  });

  const addAction = (action) => {
    if (!automation.actions.find(a => a.id === action.id)) {
      setAutomation({ ...automation, actions: [...automation.actions, action] });
    }
  };

  const removeAction = (actionId) => {
    setAutomation({ ...automation, actions: automation.actions.filter(a => a.id !== actionId) });
  };

  const saveAutomation = () => {
    if (!automation.name || !automation.trigger || automation.actions.length === 0) {
      toast.error('يرجى إكمال جميع الخطوات');
      return;
    }
    toast.success(`تم إنشاء أتمتة "${automation.name}"`);
    setShowBuilder(false);
    setAutomation({ name: '', trigger: null, triggerValue: '', actions: [] });
    setStep(1);
    onSave?.(automation);
  };

  const applyQuickAutomation = (quick) => {
    toast.success(`جاري تطبيق "${quick.name}"...`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h3 className="text-white font-bold text-lg flex items-center gap-2">
            <Wand2 className="w-5 h-5 text-purple-400" />
            إنشاء أتمتة بسيطة
          </h3>
          <p className="text-slate-400 text-sm">أنشئ قواعد أتمتة في 3 خطوات بسيطة</p>
        </div>
        <Button className="bg-purple-600 hover:bg-purple-700" onClick={() => setShowBuilder(true)}>
          <Plus className="w-4 h-4 ml-2" />
          أتمتة جديدة
        </Button>
      </div>

      {/* Quick Automations */}
      <div>
        <h4 className="text-slate-300 text-sm font-medium mb-3">أتمتة سريعة بنقرة واحدة</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {quickAutomations.map((quick, i) => (
            <motion.div
              key={quick.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card 
                className="glass-card border-indigo-500/20 bg-[#0f1629]/80 cursor-pointer hover:border-purple-500/50 transition-all"
                onClick={() => applyQuickAutomation(quick)}
              >
                <CardContent className="p-4 text-center">
                  <quick.icon className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                  <h4 className="text-white font-medium mb-1">{quick.name}</h4>
                  <p className="text-slate-400 text-xs mb-2">{quick.trigger}</p>
                  <div className="flex flex-wrap gap-1 justify-center">
                    {quick.actions.map((action, ai) => (
                      <Badge key={ai} variant="outline" className="border-slate-600 text-slate-400 text-xs">
                        {action}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Builder Dialog */}
      <Dialog open={showBuilder} onOpenChange={setShowBuilder}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Wand2 className="w-5 h-5 text-purple-400" />
              إنشاء أتمتة جديدة
            </DialogTitle>
          </DialogHeader>

          {/* Progress Steps */}
          <div className="flex items-center justify-center gap-2 my-4">
            {[1, 2, 3].map(s => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  step >= s ? 'bg-purple-500 text-white' : 'bg-slate-700 text-slate-400'
                }`}>
                  {step > s ? <Check className="w-4 h-4" /> : s}
                </div>
                {s < 3 && <div className={`w-8 h-0.5 ${step > s ? 'bg-purple-500' : 'bg-slate-700'}`} />}
              </div>
            ))}
          </div>

          <div className="space-y-4">
            {/* Step 1: Trigger */}
            {step === 1 && (
              <div>
                <h4 className="text-white font-medium mb-3">متى تريد تشغيل الأتمتة؟</h4>
                <div className="grid grid-cols-2 gap-2">
                  {triggerTemplates.map(trigger => (
                    <div
                      key={trigger.id}
                      className={`p-3 rounded-lg cursor-pointer transition-all ${
                        automation.trigger?.id === trigger.id
                          ? `bg-${trigger.color}-500/20 border-2 border-${trigger.color}-500`
                          : 'bg-slate-800/50 border border-slate-700 hover:border-slate-600'
                      }`}
                      onClick={() => setAutomation({ ...automation, trigger })}
                    >
                      <trigger.icon className={`w-5 h-5 text-${trigger.color}-400 mb-1`} />
                      <p className="text-white text-sm font-medium">{trigger.name}</p>
                      <p className="text-slate-400 text-xs">{trigger.description}</p>
                    </div>
                  ))}
                </div>
                {automation.trigger && (automation.trigger.id === 'time' || automation.trigger.id === 'temp') && (
                  <Input
                    type={automation.trigger.id === 'time' ? 'time' : 'number'}
                    value={automation.triggerValue}
                    onChange={(e) => setAutomation({ ...automation, triggerValue: e.target.value })}
                    className="bg-slate-800/50 border-slate-700 text-white mt-3"
                    placeholder={automation.trigger.id === 'time' ? 'اختر الوقت' : 'درجة الحرارة'}
                  />
                )}
              </div>
            )}

            {/* Step 2: Actions */}
            {step === 2 && (
              <div>
                <h4 className="text-white font-medium mb-3">ماذا تريد أن يحدث؟</h4>
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {actionTemplates.map(action => (
                    <div
                      key={action.id}
                      className={`p-3 rounded-lg cursor-pointer transition-all ${
                        automation.actions.find(a => a.id === action.id)
                          ? `bg-${action.color}-500/20 border-2 border-${action.color}-500`
                          : 'bg-slate-800/50 border border-slate-700 hover:border-slate-600'
                      }`}
                      onClick={() => automation.actions.find(a => a.id === action.id) 
                        ? removeAction(action.id) 
                        : addAction(action)
                      }
                    >
                      <action.icon className={`w-5 h-5 text-${action.color}-400 mb-1`} />
                      <p className="text-white text-sm">{action.name}</p>
                    </div>
                  ))}
                </div>
                {automation.actions.length > 0 && (
                  <div className="p-3 bg-slate-800/50 rounded-lg">
                    <p className="text-slate-400 text-xs mb-2">الإجراءات المختارة:</p>
                    <div className="flex flex-wrap gap-1">
                      {automation.actions.map(action => (
                        <Badge key={action.id} className={`bg-${action.color}-500/20 text-${action.color}-400`}>
                          {action.name}
                          <X className="w-3 h-3 mr-1 cursor-pointer" onClick={() => removeAction(action.id)} />
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Name & Save */}
            {step === 3 && (
              <div>
                <h4 className="text-white font-medium mb-3">سمِّ الأتمتة الخاصة بك</h4>
                <Input
                  value={automation.name}
                  onChange={(e) => setAutomation({ ...automation, name: e.target.value })}
                  className="bg-slate-800/50 border-slate-700 text-white mb-4"
                  placeholder="مثال: روتين الصباح"
                />
                <Card className="glass-card border-purple-500/30 bg-purple-500/5">
                  <CardContent className="p-4">
                    <h5 className="text-white font-medium mb-2">ملخص الأتمتة</h5>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-cyan-500/20 text-cyan-400">المشغّل</Badge>
                        <span className="text-white text-sm">{automation.trigger?.name}</span>
                        {automation.triggerValue && <span className="text-slate-400 text-sm">({automation.triggerValue})</span>}
                      </div>
                      <div className="flex items-start gap-2">
                        <Badge className="bg-purple-500/20 text-purple-400">الإجراءات</Badge>
                        <div className="flex flex-wrap gap-1">
                          {automation.actions.map(a => (
                            <span key={a.id} className="text-white text-sm">{a.name}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Navigation */}
            <div className="flex gap-2">
              {step > 1 && (
                <Button variant="outline" className="flex-1 border-slate-600" onClick={() => setStep(step - 1)}>
                  السابق
                </Button>
              )}
              {step < 3 ? (
                <Button 
                  className="flex-1 bg-purple-600 hover:bg-purple-700"
                  onClick={() => setStep(step + 1)}
                  disabled={step === 1 && !automation.trigger || step === 2 && automation.actions.length === 0}
                >
                  التالي
                  <ChevronRight className="w-4 h-4 mr-1" />
                </Button>
              ) : (
                <Button 
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  onClick={saveAutomation}
                  disabled={!automation.name}
                >
                  <Check className="w-4 h-4 ml-2" />
                  حفظ الأتمتة
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}