import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  Sparkles, ChevronRight, ChevronLeft, CheckCircle, Play, X,
  Eye, Brain, Settings, Users, Target, Zap, BookOpen, Lightbulb
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

const roles = [
  { id: 'developer', name: 'مطور AI', icon: Brain, color: 'purple' },
  { id: 'analyst', name: 'محلل بيانات', icon: Target, color: 'cyan' },
  { id: 'manager', name: 'مدير مشروع', icon: Users, color: 'green' },
  { id: 'security', name: 'أمن', icon: Eye, color: 'red' },
];

export default function AISmartOnboarding({ onComplete }) {
  const [step, setStep] = useState(0);
  const [selectedRole, setSelectedRole] = useState(null);
  const [tutorials, setTutorials] = useState(null);
  const [isVisible, setIsVisible] = useState(true);

  const generateTutorialsMutation = useMutation({
    mutationFn: async (role) => {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `أنشئ دليل تعليمي مخصص لدور: ${role} في منصة AI Vision Hub

قدم:
1. خطوات البدء السريع
2. الميزات الأساسية حسب الدور
3. اقتراحات المشاريع الأولية
4. نصائح متقدمة`,
        response_json_schema: {
          type: "object",
          properties: {
            quick_start: { type: "array", items: { type: "object", properties: { title: { type: "string" }, description: { type: "string" }, action: { type: "string" } } } },
            key_features: { type: "array", items: { type: "object", properties: { feature: { type: "string" }, relevance: { type: "string" } } } },
            project_suggestions: { type: "array", items: { type: "object", properties: { name: { type: "string" }, difficulty: { type: "string" }, estimated_time: { type: "string" } } } },
            pro_tips: { type: "array", items: { type: "string" } }
          }
        }
      });
      return result;
    },
    onSuccess: (data) => {
      setTutorials(data);
      setStep(2);
    }
  });

  const selectRole = (role) => {
    setSelectedRole(role);
    generateTutorialsMutation.mutate(role.name);
  };

  const completeOnboarding = () => {
    setIsVisible(false);
    toast.success('مرحباً بك في AI Vision Hub!');
    onComplete?.();
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border border-purple-500/30 w-full max-w-2xl overflow-hidden shadow-2xl"
        >
          {/* Header */}
          <div className="p-6 border-b border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                className="p-2 rounded-xl bg-gradient-to-br from-purple-500/30 to-cyan-500/30"
              >
                <Sparkles className="w-6 h-6 text-purple-400" />
              </motion.div>
              <div>
                <h3 className="text-white font-bold text-lg">مرحباً بك في AI Vision Hub</h3>
                <p className="text-slate-400 text-sm">دعنا نخصص تجربتك</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={completeOnboarding}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Progress */}
          <div className="px-6 py-3 bg-slate-800/50">
            <div className="flex items-center gap-2 mb-2">
              {[0, 1, 2].map((s) => (
                <div key={s} className={`flex-1 h-1 rounded-full ${step >= s ? 'bg-purple-500' : 'bg-slate-700'}`} />
              ))}
            </div>
            <p className="text-slate-400 text-xs">الخطوة {step + 1} من 3</p>
          </div>

          {/* Content */}
          <div className="p-6" dir="rtl">
            {step === 0 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                <h4 className="text-white font-bold mb-4">ما هو دورك الرئيسي؟</h4>
                <div className="grid grid-cols-2 gap-3">
                  {roles.map((role) => (
                    <motion.div key={role.id} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Card
                        className={`cursor-pointer transition-all ${
                          selectedRole?.id === role.id
                            ? `bg-${role.color}-500/20 border-${role.color}-500`
                            : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
                        }`}
                        onClick={() => selectRole(role)}
                      >
                        <CardContent className="p-4 flex items-center gap-3">
                          <div className={`p-2 rounded-lg bg-${role.color}-500/20`}>
                            <role.icon className={`w-5 h-5 text-${role.color}-400`} />
                          </div>
                          <span className="text-white font-medium">{role.name}</span>
                          {selectedRole?.id === role.id && <CheckCircle className="w-4 h-4 text-green-400 mr-auto" />}
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-8">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-16 h-16 mx-auto mb-4 rounded-full border-4 border-purple-500 border-t-transparent"
                />
                <p className="text-white">جاري إنشاء دليلك المخصص...</p>
              </motion.div>
            )}

            {step === 2 && tutorials && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                <div>
                  <h4 className="text-white font-bold mb-3 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-cyan-400" />
                    البدء السريع
                  </h4>
                  <div className="space-y-2">
                    {tutorials.quick_start?.slice(0, 3).map((item, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg">
                        <span className="w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 text-sm">{i + 1}</span>
                        <div className="flex-1">
                          <p className="text-white text-sm font-medium">{item.title}</p>
                          <p className="text-slate-400 text-xs">{item.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-white font-bold mb-3 flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-amber-400" />
                    مشاريع مقترحة
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {tutorials.project_suggestions?.slice(0, 2).map((project, i) => (
                      <Card key={i} className="bg-slate-800/50 border-slate-700">
                        <CardContent className="p-3">
                          <p className="text-white text-sm font-medium">{project.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">{project.difficulty}</Badge>
                            <span className="text-slate-400 text-xs">{project.estimated_time}</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-slate-700 flex justify-between">
            {step > 0 && step < 2 && (
              <Button variant="outline" onClick={() => setStep(step - 1)}>
                <ChevronRight className="w-4 h-4 ml-1" />
                السابق
              </Button>
            )}
            {step === 2 && (
              <Button className="w-full bg-gradient-to-r from-purple-600 to-cyan-600" onClick={completeOnboarding}>
                <Play className="w-4 h-4 ml-1" />
                ابدأ الآن
              </Button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}