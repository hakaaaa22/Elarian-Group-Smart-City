import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, MapPin, Shield, Calendar, Clock, Building2, Phone, Mail,
  CheckCircle, ChevronRight, ChevronLeft, Globe, Accessibility,
  Car, Coffee, Languages, Sparkles, FileText, AlertTriangle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';

const steps = [
  { id: 'welcome', title: 'مرحباً بك', icon: User },
  { id: 'host', title: 'معلومات المضيف', icon: Building2 },
  { id: 'map', title: 'خريطة المنشأة', icon: MapPin },
  { id: 'security', title: 'بروتوكولات الأمان', icon: Shield },
  { id: 'preferences', title: 'تفضيلاتك', icon: Languages },
  { id: 'confirmation', title: 'التأكيد', icon: CheckCircle }
];

const languageOptions = [
  { value: 'ar', label: 'العربية', flag: '🇸🇦' },
  { value: 'en', label: 'English', flag: '🇬🇧' },
  { value: 'fr', label: 'Français', flag: '🇫🇷' }
];

export default function VisitorOnboardingPortal() {
  const [currentStep, setCurrentStep] = useState(0);
  const [acknowledgedProtocols, setAcknowledgedProtocols] = useState([]);
  const [preferences, setPreferences] = useState({
    language: 'ar',
    accessibility_needs: '',
    dietary_restrictions: '',
    parking_required: false
  });
  const queryClient = useQueryClient();

  // Get visitor token from URL
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');
  const isDemo = !token;

  // Demo data for testing without token
  const demoOnboarding = {
    id: 'demo',
    visitor_name: 'زائر تجريبي',
    purpose_of_visit: 'اجتماع عمل',
    visit_date: new Date().toISOString().split('T')[0],
    onboarding_status: 'pending',
    host_info: {
      name: 'أحمد محمد',
      title: 'مدير المشاريع',
      department: 'تقنية المعلومات',
      phone: '+966 55 123 4567',
      email: 'ahmed@company.com'
    },
    meeting_details: {
      room: 'قاعة الاجتماعات A',
      floor: 'الطابق الثالث',
      building: 'المبنى الرئيسي'
    },
    assigned_zones: ['الاستقبال', 'قاعات الاجتماعات', 'الكافتيريا'],
    assigned_gates: ['البوابة الرئيسية', 'بوابة الزوار'],
    security_protocols: [
      { title: 'بطاقة الزائر', description: 'يجب ارتداء بطاقة الزائر في مكان ظاهر طوال فترة الزيارة' },
      { title: 'المرافقة', description: 'قد يُطلب منك أن يرافقك موظف في بعض المناطق' },
      { title: 'التصوير', description: 'التصوير غير مسموح به إلا بإذن مسبق' },
      { title: 'الطوارئ', description: 'في حالة الطوارئ، اتبع تعليمات فريق الأمن' }
    ],
    steps_completed: [],
    completion_percentage: 0
  };

  const { data: fetchedOnboarding, isLoading, error } = useQuery({
    queryKey: ['visitor-onboarding', token],
    queryFn: async () => {
      if (!token) return null;
      const results = await base44.entities.VisitorOnboarding.filter({ onboarding_token: token });
      return results[0] || null;
    },
    enabled: !!token
  });

  const onboarding = isDemo ? demoOnboarding : fetchedOnboarding;

  const generateContentMutation = useMutation({
    mutationFn: async () => {
      if (!onboarding) return null;
      const content = await base44.integrations.Core.InvokeLLM({
        prompt: `أنت مساعد ذكي لتجربة الزوار. قم بإنشاء محتوى ترحيبي مخصص للزائر التالي:
        
الاسم: ${onboarding.visitor_name}
غرض الزيارة: ${onboarding.purpose_of_visit}
المضيف: ${onboarding.host_info?.name || 'غير محدد'}
القسم: ${onboarding.host_info?.department || 'غير محدد'}
تاريخ الزيارة: ${onboarding.visit_date}

قم بإنشاء:
1. رسالة ترحيب شخصية (2-3 جمل)
2. ملخص موجز لما يمكن توقعه خلال الزيارة
3. نصائح مفيدة بناءً على غرض الزيارة

اكتب المحتوى بتنسيق Markdown وباللغة العربية.`,
        response_json_schema: {
          type: "object",
          properties: {
            welcome_message: { type: "string" },
            visit_summary: { type: "string" },
            tips: { type: "array", items: { type: "string" } }
          }
        }
      });
      return content;
    }
  });

  const updateOnboardingMutation = useMutation({
    mutationFn: async (data) => {
      if (isDemo) return data; // Skip update in demo mode
      return await base44.entities.VisitorOnboarding.update(onboarding.id, data);
    },
    onSuccess: () => {
      if (!isDemo) {
        queryClient.invalidateQueries({ queryKey: ['visitor-onboarding', token] });
      }
    }
  });

  useEffect(() => {
    if (onboarding && (onboarding.onboarding_status === 'pending' || isDemo)) {
      if (!isDemo) {
        updateOnboardingMutation.mutate({ onboarding_status: 'viewed' });
      }
      generateContentMutation.mutate();
    }
  }, [onboarding?.id, isDemo]);

  const handleNextStep = () => {
    if (currentStep < steps.length - 1) {
      const stepId = steps[currentStep].id;
      const completedSteps = [...(onboarding?.steps_completed || []), stepId];
      updateOnboardingMutation.mutate({
        steps_completed: completedSteps,
        completion_percentage: Math.round((completedSteps.length / steps.length) * 100),
        onboarding_status: 'in_progress'
      });
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    updateOnboardingMutation.mutate({
      onboarding_status: 'completed',
      completion_percentage: 100,
      preferences,
      security_protocols: onboarding.security_protocols?.map((p, i) => ({
        ...p,
        acknowledged: acknowledgedProtocols.includes(i)
      }))
    });
    toast.success('تم إكمال عملية الإعداد بنجاح!');
  };

  const handleAcknowledgeProtocol = (index) => {
    if (acknowledgedProtocols.includes(index)) {
      setAcknowledgedProtocols(acknowledgedProtocols.filter(i => i !== index));
    } else {
      setAcknowledgedProtocols([...acknowledgedProtocols, index]);
    }
  };

  // Removed token check - now supports demo mode

  if (isLoading && !isDemo) {
    return (
      <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!onboarding && !isDemo) {
    return (
      <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center p-4" dir="rtl">
        <Card className="bg-slate-800/50 border-slate-700 max-w-md w-full">
          <CardContent className="p-8 text-center">
            <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">لم يتم العثور على الزيارة</h2>
            <p className="text-slate-400">قد يكون الرابط منتهي الصلاحية أو غير صحيح.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentStepData = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0e1a] via-[#0f1629] to-[#0a0e1a] p-4 lg:p-8" dir="rtl">
      <div className="max-w-4xl mx-auto">
        {/* Demo Badge */}
        {isDemo && (
          <div className="mb-4 p-3 bg-amber-500/10 rounded-lg border border-amber-500/30 text-center">
            <p className="text-amber-400 text-sm flex items-center justify-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              وضع العرض التجريبي - للاستخدام الفعلي، استخدم الرابط المرسل عبر البريد الإلكتروني
            </p>
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center"
          >
            <Sparkles className="w-10 h-10 text-white" />
          </motion.div>
          <h1 className="text-3xl font-bold text-white mb-2">مرحباً {onboarding.visitor_name}</h1>
          <p className="text-slate-400">نحن سعداء باستقبالك في منشأتنا</p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-400 text-sm">تقدم الإعداد</span>
            <span className="text-cyan-400 text-sm">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between mt-4">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isCompleted = index < currentStep;
              const isCurrent = index === currentStep;
              return (
                <div key={step.id} className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    isCompleted ? 'bg-green-500' : isCurrent ? 'bg-cyan-500' : 'bg-slate-700'
                  }`}>
                    {isCompleted ? (
                      <CheckCircle className="w-5 h-5 text-white" />
                    ) : (
                      <Icon className="w-5 h-5 text-white" />
                    )}
                  </div>
                  <span className={`text-xs mt-1 hidden sm:block ${isCurrent ? 'text-cyan-400' : 'text-slate-500'}`}>
                    {step.title}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <currentStepData.icon className="w-5 h-5 text-cyan-400" />
                  {currentStepData.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Welcome Step */}
                {currentStep === 0 && (
                  <div className="space-y-4">
                    <div className="p-6 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 rounded-xl border border-cyan-500/20">
                      {generateContentMutation.data ? (
                        <div className="space-y-4">
                          <p className="text-white text-lg">{generateContentMutation.data.welcome_message}</p>
                          <p className="text-slate-300">{generateContentMutation.data.visit_summary}</p>
                          {generateContentMutation.data.tips?.length > 0 && (
                            <div className="mt-4">
                              <h4 className="text-cyan-400 font-medium mb-2">نصائح مفيدة:</h4>
                              <ul className="space-y-2">
                                {generateContentMutation.data.tips.map((tip, i) => (
                                  <li key={i} className="text-slate-300 flex items-start gap-2">
                                    <CheckCircle className="w-4 h-4 text-green-400 mt-1 flex-shrink-0" />
                                    {tip}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-white text-lg">مرحباً بك في زيارتك لمنشأتنا!</p>
                      )}
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="p-4 bg-slate-900/50 rounded-lg">
                        <div className="flex items-center gap-2 text-slate-400 mb-1">
                          <Calendar className="w-4 h-4" />
                          <span className="text-sm">تاريخ الزيارة</span>
                        </div>
                        <p className="text-white font-medium">{onboarding.visit_date}</p>
                      </div>
                      <div className="p-4 bg-slate-900/50 rounded-lg">
                        <div className="flex items-center gap-2 text-slate-400 mb-1">
                          <FileText className="w-4 h-4" />
                          <span className="text-sm">غرض الزيارة</span>
                        </div>
                        <p className="text-white font-medium">{onboarding.purpose_of_visit}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Host Info Step */}
                {currentStep === 1 && onboarding.host_info && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-6 p-6 bg-slate-900/50 rounded-xl">
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold">
                        {onboarding.host_info.name?.charAt(0) || 'م'}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">{onboarding.host_info.name}</h3>
                        <p className="text-slate-400">{onboarding.host_info.title}</p>
                        <Badge className="bg-cyan-500/20 text-cyan-400 mt-2">{onboarding.host_info.department}</Badge>
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      {onboarding.host_info.phone && (
                        <div className="p-4 bg-slate-900/50 rounded-lg flex items-center gap-3">
                          <Phone className="w-5 h-5 text-green-400" />
                          <div>
                            <p className="text-slate-400 text-sm">الهاتف</p>
                            <p className="text-white">{onboarding.host_info.phone}</p>
                          </div>
                        </div>
                      )}
                      {onboarding.host_info.email && (
                        <div className="p-4 bg-slate-900/50 rounded-lg flex items-center gap-3">
                          <Mail className="w-5 h-5 text-blue-400" />
                          <div>
                            <p className="text-slate-400 text-sm">البريد الإلكتروني</p>
                            <p className="text-white">{onboarding.host_info.email}</p>
                          </div>
                        </div>
                      )}
                    </div>
                    {onboarding.meeting_details && (
                      <div className="p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
                        <h4 className="text-purple-400 font-medium mb-2">تفاصيل الاجتماع</h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <p className="text-slate-400">الغرفة: <span className="text-white">{onboarding.meeting_details.room}</span></p>
                          <p className="text-slate-400">الطابق: <span className="text-white">{onboarding.meeting_details.floor}</span></p>
                          {onboarding.meeting_details.building && (
                            <p className="text-slate-400">المبنى: <span className="text-white">{onboarding.meeting_details.building}</span></p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Map Step */}
                {currentStep === 2 && (
                  <div className="space-y-4">
                    <div className="h-64 bg-slate-900/50 rounded-xl border border-slate-700 flex items-center justify-center">
                      <div className="text-center">
                        <MapPin className="w-12 h-12 text-cyan-400 mx-auto mb-2" />
                        <p className="text-slate-400">خريطة المنشأة التفاعلية</p>
                      </div>
                    </div>
                    {onboarding.assigned_zones?.length > 0 && (
                      <div>
                        <h4 className="text-white font-medium mb-3">المناطق المسموح لك بزيارتها:</h4>
                        <div className="flex flex-wrap gap-2">
                          {onboarding.assigned_zones.map((zone, i) => (
                            <Badge key={i} className="bg-green-500/20 text-green-400">
                              <MapPin className="w-3 h-3 ml-1" />
                              {zone}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {onboarding.assigned_gates?.length > 0 && (
                      <div>
                        <h4 className="text-white font-medium mb-3">البوابات المخصصة:</h4>
                        <div className="flex flex-wrap gap-2">
                          {onboarding.assigned_gates.map((gate, i) => (
                            <Badge key={i} variant="outline" className="border-cyan-500/50 text-cyan-400">
                              {gate}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Security Step */}
                {currentStep === 3 && (
                  <div className="space-y-4">
                    <div className="p-4 bg-amber-500/10 rounded-lg border border-amber-500/20">
                      <p className="text-amber-400 text-sm flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        يرجى قراءة والموافقة على جميع بروتوكولات الأمان التالية
                      </p>
                    </div>
                    {(onboarding.security_protocols || [
                      { title: 'بطاقة الزائر', description: 'يجب ارتداء بطاقة الزائر في مكان ظاهر طوال فترة الزيارة' },
                      { title: 'المرافقة', description: 'قد يُطلب منك أن يرافقك موظف في بعض المناطق' },
                      { title: 'التصوير', description: 'التصوير غير مسموح به إلا بإذن مسبق' },
                      { title: 'الطوارئ', description: 'في حالة الطوارئ، اتبع تعليمات فريق الأمن' }
                    ]).map((protocol, index) => (
                      <div key={index} className="p-4 bg-slate-900/50 rounded-lg flex items-start gap-3">
                        <Checkbox
                          checked={acknowledgedProtocols.includes(index)}
                          onCheckedChange={() => handleAcknowledgeProtocol(index)}
                          className="mt-1"
                        />
                        <div>
                          <h4 className="text-white font-medium">{protocol.title}</h4>
                          <p className="text-slate-400 text-sm">{protocol.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Preferences Step */}
                {currentStep === 4 && (
                  <div className="space-y-4">
                    <div>
                      <Label className="text-slate-300 mb-2 block">اللغة المفضلة</Label>
                      <div className="grid grid-cols-3 gap-3">
                        {languageOptions.map(lang => (
                          <button
                            key={lang.value}
                            onClick={() => setPreferences({ ...preferences, language: lang.value })}
                            className={`p-4 rounded-lg border transition-all ${
                              preferences.language === lang.value
                                ? 'bg-cyan-500/20 border-cyan-500'
                                : 'bg-slate-900/50 border-slate-700 hover:border-slate-600'
                            }`}
                          >
                            <span className="text-2xl mb-1 block">{lang.flag}</span>
                            <span className={preferences.language === lang.value ? 'text-cyan-400' : 'text-white'}>
                              {lang.label}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <Label className="text-slate-300 mb-2 block">احتياجات خاصة (اختياري)</Label>
                      <Textarea
                        value={preferences.accessibility_needs}
                        onChange={(e) => setPreferences({ ...preferences, accessibility_needs: e.target.value })}
                        placeholder="مثال: كرسي متحرك، مترجم إشارة..."
                        className="bg-slate-900/50 border-slate-700 text-white"
                      />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Car className="w-5 h-5 text-slate-400" />
                        <span className="text-white">هل تحتاج موقف سيارة؟</span>
                      </div>
                      <Checkbox
                        checked={preferences.parking_required}
                        onCheckedChange={(checked) => setPreferences({ ...preferences, parking_required: checked })}
                      />
                    </div>
                  </div>
                )}

                {/* Confirmation Step */}
                {currentStep === 5 && (
                  <div className="space-y-4 text-center">
                    <div className="w-20 h-20 mx-auto rounded-full bg-green-500/20 flex items-center justify-center">
                      <CheckCircle className="w-10 h-10 text-green-400" />
                    </div>
                    <h3 className="text-xl font-bold text-white">أنت جاهز لزيارتك!</h3>
                    <p className="text-slate-400">تم حفظ جميع معلوماتك وتفضيلاتك. نتطلع لاستقبالك.</p>
                    <div className="p-4 bg-slate-900/50 rounded-lg text-right">
                      <h4 className="text-white font-medium mb-3">ملخص الزيارة:</h4>
                      <div className="space-y-2 text-sm">
                        <p className="text-slate-400">التاريخ: <span className="text-white">{onboarding.visit_date}</span></p>
                        <p className="text-slate-400">الغرض: <span className="text-white">{onboarding.purpose_of_visit}</span></p>
                        <p className="text-slate-400">المضيف: <span className="text-white">{onboarding.host_info?.name}</span></p>
                        <p className="text-slate-400">اللغة: <span className="text-white">{languageOptions.find(l => l.value === preferences.language)?.label}</span></p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between mt-6">
          <Button
            variant="outline"
            className="border-slate-600"
            onClick={handlePrevStep}
            disabled={currentStep === 0}
          >
            <ChevronRight className="w-4 h-4 ml-2" />
            السابق
          </Button>
          {currentStep < steps.length - 1 ? (
            <Button className="bg-cyan-600 hover:bg-cyan-700" onClick={handleNextStep}>
              التالي
              <ChevronLeft className="w-4 h-4 mr-2" />
            </Button>
          ) : (
            <Button className="bg-green-600 hover:bg-green-700" onClick={handleComplete}>
              <CheckCircle className="w-4 h-4 ml-2" />
              إكمال التسجيل
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}