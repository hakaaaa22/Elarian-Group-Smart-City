import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import {
  X, ChevronRight, ChevronLeft, Check, Sparkles, Eye, Building2, Heart,
  Recycle, Shield, Camera, Brain, Lightbulb, Play, SkipForward, Rocket,
  Target, Zap, Info, HelpCircle, BookOpen, Video, Award
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

const onboardingSteps = [
  {
    id: 'welcome',
    title: 'مرحباً بك في منصة المدينة الذكية',
    description: 'منصة متكاملة لإدارة جميع عمليات المدينة باستخدام الذكاء الاصطناعي',
    icon: Rocket,
    color: 'cyan',
    features: ['200+ نموذج AI', 'مراقبة فورية', 'تحليلات متقدمة']
  },
  {
    id: 'ai-vision',
    title: 'مركز AI Vision',
    description: 'تحليلات بصرية متقدمة تشمل التعرف على الوجوه، كشف التهديدات، وتحليل السلوك',
    icon: Eye,
    color: 'purple',
    features: ['كشف الأسلحة المخفية', 'تحليل لغة الجسد', 'كشف النوايا'],
    page: 'AIVisionHub'
  },
  {
    id: 'municipality',
    title: 'عمليات البلدية الذكية',
    description: 'إدارة النفايات، الإنارة، والبنية التحتية بالذكاء الاصطناعي',
    icon: Building2,
    color: 'amber',
    features: ['تحسين مسارات الجمع', 'التحكم بالإنارة', 'صيانة البنية التحتية'],
    page: 'WasteManagement'
  },
  {
    id: 'hospital',
    title: 'المستشفى الذكي',
    description: 'مركز قيادة متكامل لإدارة المستشفى والرعاية الصحية',
    icon: Heart,
    color: 'pink',
    features: ['مراقبة ICU', 'إدارة الصيدلية', 'تتبع المرضى'],
    page: 'HospitalCommandCenter'
  },
  {
    id: 'notifications',
    title: 'نظام الإشعارات الذكي',
    description: 'تنبيهات مخصصة وإشعارات فورية لجميع الأحداث الهامة',
    icon: Zap,
    color: 'green',
    features: ['قواعد تنبيه مخصصة', 'إشعارات Push', 'تصفية حسب الأولوية']
  },
  {
    id: 'complete',
    title: 'أنت جاهز للانطلاق!',
    description: 'استكشف المنصة واستفد من جميع الميزات المتقدمة',
    icon: Award,
    color: 'cyan',
    features: []
  }
];

const featureTours = {
  'AIVisionHub': [
    { target: '.ai-models-grid', title: 'نماذج AI', description: 'اختر من بين 200+ نموذج للتحليلات البصرية' },
    { target: '.category-filter', title: 'التصنيفات', description: 'فلتر حسب نوع التحليل المطلوب' },
    { target: '.search-bar', title: 'البحث', description: 'ابحث عن نموذج محدد' },
  ],
  'WasteManagement': [
    { target: '.smart-bins', title: 'الحاويات الذكية', description: 'مراقبة حالة جميع الحاويات' },
    { target: '.route-optimizer', title: 'تحسين المسارات', description: 'تحسين مسارات الجمع بالذكاء الاصطناعي' },
  ],
  'HospitalCommandCenter': [
    { target: '.bed-status', title: 'حالة الأسرة', description: 'مراقبة إشغال الأسرة' },
    { target: '.alerts-panel', title: 'التنبيهات', description: 'تنبيهات طبية عاجلة' },
  ]
};

export default function OnboardingSystem({ onComplete, currentPage }) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [showTooltip, setShowTooltip] = useState(null);

  useEffect(() => {
    const completed = localStorage.getItem('onboarding_completed');
    if (!completed) {
      setTimeout(() => setIsOpen(true), 1000);
    } else {
      setHasCompletedOnboarding(true);
    }
  }, []);

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeOnboarding();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const completeOnboarding = () => {
    localStorage.setItem('onboarding_completed', 'true');
    setHasCompletedOnboarding(true);
    setIsOpen(false);
    onComplete?.();
  };

  const skipOnboarding = () => {
    localStorage.setItem('onboarding_completed', 'true');
    setIsOpen(false);
  };

  const restartOnboarding = () => {
    setCurrentStep(0);
    setIsOpen(true);
  };

  const step = onboardingSteps[currentStep];
  const progress = ((currentStep + 1) / onboardingSteps.length) * 100;

  return (
    <>
      {/* Onboarding Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-2xl mx-4"
            >
              <Card className="bg-[#0f1629] border-indigo-500/30 overflow-hidden">
                {/* Progress Bar */}
                <div className="h-1 bg-slate-800">
                  <motion.div
                    className="h-full bg-gradient-to-r from-cyan-500 to-purple-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>

                <CardContent className="p-8">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-6">
                    <Badge className="bg-cyan-500/20 text-cyan-400">
                      {currentStep + 1} / {onboardingSteps.length}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={skipOnboarding}
                      className="text-slate-400 hover:text-white"
                    >
                      <SkipForward className="w-4 h-4 ml-1" />
                      تخطي
                    </Button>
                  </div>

                  {/* Content */}
                  <motion.div
                    key={step.id}
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -20, opacity: 0 }}
                    className="text-center"
                  >
                    <div className={`w-20 h-20 mx-auto mb-6 rounded-2xl bg-${step.color}-500/20 flex items-center justify-center`}>
                      <step.icon className={`w-10 h-10 text-${step.color}-400`} />
                    </div>

                    <h2 className="text-2xl font-bold text-white mb-3">{step.title}</h2>
                    <p className="text-slate-400 mb-6 max-w-md mx-auto">{step.description}</p>

                    {step.features.length > 0 && (
                      <div className="flex flex-wrap justify-center gap-2 mb-6">
                        {step.features.map((feature, i) => (
                          <motion.div
                            key={feature}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                          >
                            <Badge className={`bg-${step.color}-500/10 text-${step.color}-400 border border-${step.color}-500/30`}>
                              <Check className="w-3 h-3 ml-1" />
                              {feature}
                            </Badge>
                          </motion.div>
                        ))}
                      </div>
                    )}

                    {step.id === 'complete' && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-24 h-24 mx-auto mb-6 rounded-full bg-green-500/20 flex items-center justify-center"
                      >
                        <Check className="w-12 h-12 text-green-400" />
                      </motion.div>
                    )}
                  </motion.div>

                  {/* Navigation */}
                  <div className="flex items-center justify-between mt-8">
                    <Button
                      variant="outline"
                      onClick={handlePrev}
                      disabled={currentStep === 0}
                      className="border-slate-600 text-slate-400"
                    >
                      <ChevronRight className="w-4 h-4 ml-1" />
                      السابق
                    </Button>

                    <div className="flex gap-1">
                      {onboardingSteps.map((_, i) => (
                        <div
                          key={i}
                          className={`w-2 h-2 rounded-full transition-colors ${
                            i === currentStep ? 'bg-cyan-400' : i < currentStep ? 'bg-cyan-400/50' : 'bg-slate-600'
                          }`}
                        />
                      ))}
                    </div>

                    <Button
                      onClick={handleNext}
                      className={`bg-${step.color}-600 hover:bg-${step.color}-700`}
                    >
                      {currentStep === onboardingSteps.length - 1 ? 'ابدأ الآن' : 'التالي'}
                      <ChevronLeft className="w-4 h-4 mr-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Help Button */}
      {hasCompletedOnboarding && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          onClick={restartOnboarding}
          className="fixed bottom-24 left-6 z-50 p-3 rounded-full bg-purple-600 hover:bg-purple-700 text-white shadow-lg"
        >
          <HelpCircle className="w-5 h-5" />
        </motion.button>
      )}
    </>
  );
}

// Tooltip Component for Feature Tours
export function FeatureTooltip({ title, description, position = 'bottom', onClose, onNext }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className={`absolute z-50 w-72 p-4 bg-[#0f1629] border border-cyan-500/30 rounded-xl shadow-xl ${
        position === 'bottom' ? 'top-full mt-2' : 'bottom-full mb-2'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-cyan-500/20">
          <Lightbulb className="w-4 h-4 text-cyan-400" />
        </div>
        <div className="flex-1">
          <h4 className="text-white font-medium mb-1">{title}</h4>
          <p className="text-slate-400 text-sm">{description}</p>
        </div>
        <button onClick={onClose} className="text-slate-500 hover:text-white">
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="flex justify-end gap-2 mt-3">
        <Button size="sm" variant="ghost" onClick={onClose} className="text-slate-400">
          تخطي
        </Button>
        <Button size="sm" onClick={onNext} className="bg-cyan-600 hover:bg-cyan-700">
          التالي
        </Button>
      </div>
      {/* Arrow */}
      <div className={`absolute left-1/2 -translate-x-1/2 w-3 h-3 bg-[#0f1629] border-cyan-500/30 rotate-45 ${
        position === 'bottom' ? '-top-1.5 border-t border-l' : '-bottom-1.5 border-b border-r'
      }`} />
    </motion.div>
  );
}