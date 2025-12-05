import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Brain, Users, Car, Shield, ShoppingBag, Cpu, Building2, Ship,
  Zap, HardHat, Banknote, GraduationCap, HeartPulse, Leaf, PartyPopper,
  Search, ChevronDown, ChevronUp, Sparkles, Eye, AlertTriangle, 
  Fingerprint, BarChart3, Cog, Factory, Truck, Layers, Lightbulb
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AIModelBuilder from '@/components/ai/AIModelBuilder';
import ProactiveInsightsAssistant from '@/components/ai/ProactiveInsightsAssistant';

const aiModules = [
  {
    id: 'people',
    title: 'People Analytics',
    titleAr: 'إدارة وتحليل الأفراد',
    icon: Users,
    color: 'cyan',
    description: 'تعزيز الأمن والكفاءة التشغيلية',
    features: [
      { name: 'كشف وتحليل الوجوه', desc: 'تحديد الهوية لحظياً ومطابقتها مع قواعد البيانات الهامة (VIP/Blacklist)' },
      { name: 'تحليل الخصائص الديموغرافية والسلوكية', desc: 'تحديد العمر، الجنس، وتحليل المشاعر (سعادة، غضب، قلق)، ورصد السلوكيات غير الاعتيادية والسقوط المفاجئ' },
      { name: 'تحسين تدفق الأفراد', desc: 'عد الأشخاص، وتتبع وخرائط حرارية، وكثافة الحشود، وإدارة الطوابير' },
    ]
  },
  {
    id: 'vehicle',
    title: 'Vehicle Analytics',
    titleAr: 'تحليلات وإدارة المركبات',
    icon: Car,
    color: 'blue',
    description: 'تحسين إدارة حركة المرور والعمليات اللوجستية',
    features: [
      { name: 'التعرف والتصنيف الدقيق', desc: 'تصنيف المركبات (سيارات، دراجات)، وقراءة لوحاتها (ANPR/LPR) وتحديد الحوادث (OCR)' },
      { name: 'كشف المخالفات المرورية', desc: 'قياس السرعة، رصد السير العكسي، تجاوز الإشارة الحمراء، والتوقف غير المصرح به' },
      { name: 'إدارة المواقف الذكية', desc: 'تحسين استخدام مواقف السيارات وتحديد المركبات المشبوهة، وحساب متوسط سرعة المركبات' },
    ]
  },
  {
    id: 'security',
    title: 'Security & Threat Analytics',
    titleAr: 'تحليلات الأمن والتهديدات',
    icon: Shield,
    color: 'red',
    description: 'توفير استجابة استباقية للتهديدات الأمنية',
    features: [
      { name: 'كشف الأسلحة والتهديدات', desc: 'تحديد الأسلحة النارية والأسلحة البيضاء' },
      { name: 'حماية المناطق الحساسة', desc: 'رصد الاختراق، سلق الأسوار، وكسر الزجاج باستخدام الذكاء الاصطناعي الصوتي' },
      { name: 'مراقبة المحيط الفعالة', desc: 'الكشف عن الأجسام المشبوهة وتطبيق دوريات الذكاء الاصطناعي على المحيط الأمني' },
    ]
  },
  {
    id: 'retail',
    title: 'Retail & Commercial Analytics',
    titleAr: 'تحليلات التجزئة والتجارة',
    icon: ShoppingBag,
    color: 'purple',
    description: 'توفير رؤى عميقة وزيادة المبيعات',
    features: [
      { name: 'إدارة المخزون الفعالة', desc: 'كشف الرفوف الفارغة، وتتبع حركة المنتجات، ورصد الأضرار المتزايدة أو التالفة' },
      { name: 'فهم سلوك العملاء', desc: 'إنشاء خرائط حرارية لحركة العملاء، وتحليل معدلات التحويل، وتتبع سلوك العملاء ومساراتهم داخلياً' },
      { name: 'تحسين كفاءة المتجر', desc: 'مراقبة معايير إعداد التقييم للحفاظ على بيئة نموذجية مثالية' },
    ]
  },
  {
    id: 'advanced',
    title: 'Advanced AI Features',
    titleAr: 'مزايا الذكاء الاصطناعي المتقدمة',
    icon: Sparkles,
    color: 'amber',
    description: 'ميزات متقدمة ودقيقة وتحقيق مرن',
    features: [
      { name: 'التحليل السلوكي والتنبؤ', desc: 'تحليل أنماط الحركة وتوقع المخاطر المحتملة، وتقدير وضعية الجسم' },
      { name: 'التحقق الجنائي المتقدم', desc: 'البحث الجنائي عن طريق الوجه، وتتبع السيارات، وإعادة تحديد الهوية (Re-ID)' },
      { name: 'الأدوات المتقدمة', desc: 'الجداول الزمنية الذكية، التلخيص التلقائي، وتصدير الأدلة بصيغة مثالية' },
    ]
  },
  {
    id: 'industrial',
    title: 'Industrial & Safety Analytics',
    titleAr: 'تحليلات السلامة الصناعية',
    icon: Factory,
    color: 'orange',
    description: 'ضمان بيئة عمل آمنة ومتوافقة مع المعايير',
    features: [
      { name: 'مراقبة معدات الحماية الشخصية (PPE)', desc: 'التأكد من ارتداء الخوذ، السترات، القفازات، الأحذية، والنظارات' },
      { name: 'كشف المخاطر التشغيلية', desc: 'رصد الانزلاقات الشوكية، وكشف ردهة العمال (التأرجح)، وتحديد حالات الحريق والدخان فوراً' },
      { name: 'تطبيق قيود الدخول', desc: 'كشف التجاوزات ومناطق الدخول المحظورة، والمناطق المقيدة، ومراقبة حالة تشغيل الآلات' },
    ]
  },
  {
    id: 'port',
    title: 'Port & Logistics AI',
    titleAr: 'الذكاء الاصطناعي في الموانئ واللوجستيات',
    icon: Ship,
    color: 'teal',
    description: 'تحسين الكفاءة التشغيلية والأمن في المرافق اللوجستية',
    features: [
      { name: 'تتبع الأصول والحاويات', desc: 'تتبع الحاويات، ومراقبة عمليات التحميل والتفريغ' },
      { name: 'تحسين الجدول الزمني', desc: 'تتبع مواعيد وصول السفن وتحسين عمليات الانتظار' },
      { name: 'كشف السلع الخطرة', desc: 'كشف الحاويات التالفة وتتبع أعمال الصيانة اللازمة' },
    ]
  },
  {
    id: 'energy',
    title: 'Energy & Utilities AI',
    titleAr: 'الذكاء الاصطناعي في الطاقة والمرافق',
    icon: Zap,
    color: 'yellow',
    description: 'ضمان موثوقية البنية التحتية وكفاءتها',
    features: [
      { name: 'حماية البنية التحتية', desc: 'كشف التسلل إلى المحطات الفرعية الحرجة' },
      { name: 'مراقبة المعدات', desc: 'رصد صحة المحولات، وفحص خطوط الطاقة باستخدام طائرات بدون طيار' },
      { name: 'إدارة المبيعات', desc: 'قراءة العدادات آلياً بتقنية OCR' },
    ]
  },
  {
    id: 'construction',
    title: 'Construction Site AI',
    titleAr: 'الذكاء الاصطناعي في مواقع البناء',
    icon: HardHat,
    color: 'orange',
    description: 'تعزيز السلامة وتتبع التقدم في مشاريع البناء',
    features: [
      { name: 'مراقبة المعدات الآلية', desc: 'كشف المعدات الثقيلة، وتقييم سلامة السقالات' },
      { name: 'حماية الأصول', desc: 'كشف سرقة المواد، وتتبع قرب العمال من مناطق الخطر' },
      { name: 'تتبع التقدم', desc: 'مراقبة تقدم العمال باستخدام تقنية Time-Lapse ومقارنتها بالخطط' },
    ]
  },
  {
    id: 'banking',
    title: 'Banking & Finance AI',
    titleAr: 'الذكاء الاصطناعي في المصارف والمالية',
    icon: Banknote,
    color: 'green',
    description: 'حماية الأصول وتحسين خدمة العملاء',
    features: [
      { name: 'مكافحة الاحتيال', desc: 'كشف عمليات الاحتيال على أجهزة الصراف الآلي (Skimming)، ورصد السلوك المشبوه' },
      { name: 'تحسين الكفاءة', desc: 'إدارة الطوابير بفاعلية، والتعرف على عملاء VIP، والتحقق من عد النقود' },
      { name: 'أمان الوصول', desc: 'مراقبة الوصول إلى الخزائن المصرفية' },
    ]
  },
  {
    id: 'education',
    title: 'Education AI',
    titleAr: 'الذكاء الاصطناعي في التعليم',
    icon: GraduationCap,
    color: 'indigo',
    description: 'تعزيز بيئة التعلم والسلامة في الحرم الجامعي',
    features: [
      { name: 'إدارة الحضور', desc: 'تتبع حضور الطلاب عبر التعرف على الوجه' },
      { name: 'سلامة الحرم الجامعي', desc: 'رصد الدخول غير الاستثنائي، ومشاركة الفصول الدراسية، ومراقبة سلامة الحرم الجامعي' },
      { name: 'تحسين استخدام المرافق', desc: 'مراقبة إشغال المكتبات والمرافق' },
    ]
  },
  {
    id: 'healthcare',
    title: 'Healthcare AI',
    titleAr: 'الذكاء الاصطناعي في الرعاية الصحية',
    icon: HeartPulse,
    color: 'pink',
    description: 'تحسين سلامة المرضى وكفاءة العمليات',
    features: [
      { name: 'سلامة المرضى', desc: 'كشف سقوط المرضى، مراقبة الإشغال، والتحقق من الامتثال لنظافة اليدين' },
      { name: 'التحكم بالعدوى والمتابعة', desc: 'كشف ارتداء الأقنعة، مراقبة المتابعة الاجتماعي، والفحص الحراري لدرجة الحرارة' },
      { name: 'إدارة الفوارق', desc: 'تتبع الزوار والمعدات الطبية بكفاءة' },
    ]
  },
  {
    id: 'environmental',
    title: 'Environmental & Sustainability AI',
    titleAr: 'الذكاء الاصطناعي البيئي والاستدامة',
    icon: Leaf,
    color: 'emerald',
    description: 'دعم المبادرات البيئية وتحسين إدارة الموارد',
    features: [
      { name: 'إدارة الفوارق', desc: 'كشف تراكم المخلفات، وإدارة أنواع المخلفات المتنوعة' },
      { name: 'مراقبة البيئة المنطقة', desc: 'التنبؤ بمؤشر صحة الأراضي والنباتات' },
      { name: 'تتبع البيئة', desc: 'التنبؤ بمؤشرات جودة الهواء' },
    ]
  },
  {
    id: 'events',
    title: 'Event & Festival AI',
    titleAr: 'الذكاء الاصطناعي في الفعاليات والمهرجانات',
    icon: PartyPopper,
    color: 'fuchsia',
    description: 'ضمان سلامة ونجاح الفعاليات الكبرى',
    features: [
      { name: 'إدارة الحشود', desc: 'كشف الزيادة المفاجئة في الكثافة الكبرى' },
      { name: 'الأمن والتحكم', desc: 'تتبع الشخصيات الهامة (VIP)، كشف الأطفال المفقودين، ومنع الاحتيال في التذاكر' },
      { name: 'إدارة الدخول', desc: 'كشف الاعتماد على المسرح وإدارة نقاط الدخول' },
    ]
  },
  {
    id: 'nextgen',
    title: 'Ultra-Next-Gen AI',
    titleAr: 'الجيل القادم من حلول الذكاء الاصطناعي',
    icon: Cpu,
    color: 'violet',
    description: 'التحول الرقمي الشامل والأمن المتعدد',
    features: [
      { name: 'التحليلات السلوكية والتنبؤية', desc: 'توقع السلوك الجماعي وتحديد المخاطر المحتملة، والتطبيقات الحرارية المتقدمة (Thermal AI)' },
      { name: 'نظم المراقبة المتقدمة', desc: 'التتبع التلقائي متعدد الكاميرات، تكامل الذكاء الاصطناعي مع الطائرات المسيرة (Drone Fusion AI)' },
      { name: 'المدن الذكية والقرار الفوري', desc: 'إنشاء توأم رقمي للمدينة، التحليلات الصوتية المدمجة (Acoustic AI)، وتحديد القرار الآلي (AI Auto Decision)' },
      { name: 'التحقق الجنائي والأمن السيبراني', desc: 'محرك الارتباط بالبحث، ودمج كاميرات الجسد، والتنبؤ بالكوارث' },
    ]
  },
];

const colorClasses = {
  cyan: { bg: 'bg-cyan-500/20', text: 'text-cyan-400', border: 'border-cyan-500/30', hover: 'hover:bg-cyan-500/30' },
  blue: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30', hover: 'hover:bg-blue-500/30' },
  red: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30', hover: 'hover:bg-red-500/30' },
  purple: { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/30', hover: 'hover:bg-purple-500/30' },
  amber: { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/30', hover: 'hover:bg-amber-500/30' },
  orange: { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/30', hover: 'hover:bg-orange-500/30' },
  teal: { bg: 'bg-teal-500/20', text: 'text-teal-400', border: 'border-teal-500/30', hover: 'hover:bg-teal-500/30' },
  yellow: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/30', hover: 'hover:bg-yellow-500/30' },
  green: { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/30', hover: 'hover:bg-green-500/30' },
  indigo: { bg: 'bg-indigo-500/20', text: 'text-indigo-400', border: 'border-indigo-500/30', hover: 'hover:bg-indigo-500/30' },
  pink: { bg: 'bg-pink-500/20', text: 'text-pink-400', border: 'border-pink-500/30', hover: 'hover:bg-pink-500/30' },
  emerald: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/30', hover: 'hover:bg-emerald-500/30' },
  fuchsia: { bg: 'bg-fuchsia-500/20', text: 'text-fuchsia-400', border: 'border-fuchsia-500/30', hover: 'hover:bg-fuchsia-500/30' },
  violet: { bg: 'bg-violet-500/20', text: 'text-violet-400', border: 'border-violet-500/30', hover: 'hover:bg-violet-500/30' },
};

export default function AICapabilities() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedModules, setExpandedModules] = useState({});
  const [activeTab, setActiveTab] = useState('capabilities');

  const toggleModule = (id) => {
    setExpandedModules(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredModules = aiModules.filter(module =>
    module.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    module.titleAr.includes(searchQuery) ||
    module.features.some(f => f.name.includes(searchQuery) || f.desc.includes(searchQuery))
  );

  const totalFeatures = aiModules.reduce((acc, m) => acc + m.features.length, 0);

  return (
    <div className="min-h-screen p-4 lg:p-6" dir="rtl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <Brain className="w-10 h-10 text-purple-400" />
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                مركز قدرات الذكاء الاصطناعي
              </h1>
              <p className="text-slate-400 text-sm">بناء وتدريب النماذج، الرؤى الاستباقية، التكاملات المتقدمة</p>
            </div>
          </div>
        </div>
      </motion.div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="bg-slate-800/50 border border-slate-700">
          <TabsTrigger value="capabilities" className="data-[state=active]:bg-purple-500/20">
            <Sparkles className="w-4 h-4 ml-1" />
            القدرات
          </TabsTrigger>
          <TabsTrigger value="models" className="data-[state=active]:bg-cyan-500/20">
            <Layers className="w-4 h-4 ml-1" />
            بناء النماذج
          </TabsTrigger>
          <TabsTrigger value="insights" className="data-[state=active]:bg-amber-500/20">
            <Lightbulb className="w-4 h-4 ml-1" />
            المساعد الذكي
          </TabsTrigger>
        </TabsList>

        <TabsContent value="models" className="mt-4">
          <AIModelBuilder />
        </TabsContent>

        <TabsContent value="insights" className="mt-4">
          <ProactiveInsightsAssistant />
        </TabsContent>

        <TabsContent value="capabilities" className="mt-4">

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'الوحدات الذكية', value: aiModules.length, icon: Cpu, color: 'purple' },
          { label: 'الميزات الإجمالية', value: totalFeatures, icon: Sparkles, color: 'cyan' },
          { label: 'القطاعات المدعومة', value: '15+', icon: Building2, color: 'amber' },
          { label: 'دقة التحليل', value: '99.5%', icon: BarChart3, color: 'green' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
              <CardContent className="p-4 text-center">
                <stat.icon className={`w-8 h-8 text-${stat.color}-400 mx-auto mb-2`} />
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-xs text-slate-400">{stat.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-md mx-auto mb-8">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <Input
          placeholder="البحث في الميزات..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pr-10 bg-slate-800/50 border-slate-700 text-white text-right"
        />
      </div>

      {/* Modules Grid */}
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredModules.map((module, index) => {
          const colors = colorClasses[module.color];
          const isExpanded = expandedModules[module.id];
          const Icon = module.icon;

          return (
            <motion.div
              key={module.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className={`glass-card border-indigo-500/20 bg-[#0f1629]/80 overflow-hidden transition-all duration-300 ${isExpanded ? 'ring-2 ring-offset-2 ring-offset-[#0a0e1a]' : ''}`}
                style={{ '--tw-ring-color': `var(--${module.color}-500)` }}>
                <CardHeader 
                  className={`cursor-pointer ${colors.hover} transition-colors`}
                  onClick={() => toggleModule(module.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-xl ${colors.bg} ${colors.border} border`}>
                        <Icon className={`w-6 h-6 ${colors.text}`} />
                      </div>
                      <div>
                        <CardTitle className="text-white text-lg">{module.titleAr}</CardTitle>
                        <p className={`text-sm ${colors.text}`}>{module.title}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="text-slate-400">
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </Button>
                  </div>
                  <p className="text-slate-400 text-sm mt-2">{module.description}</p>
                  <Badge className={`mt-2 ${colors.bg} ${colors.text} ${colors.border} border`}>
                    {module.features.length} ميزات
                  </Badge>
                </CardHeader>

                <motion.div
                  initial={false}
                  animate={{ height: isExpanded ? 'auto' : 0, opacity: isExpanded ? 1 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <CardContent className="pt-0 pb-4">
                    <div className="space-y-3">
                      {module.features.map((feature, fi) => (
                        <motion.div
                          key={fi}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: fi * 0.1 }}
                          className="p-3 bg-slate-800/50 rounded-lg border border-slate-700/50"
                        >
                          <div className="flex items-start gap-2">
                            <div className={`w-2 h-2 rounded-full ${colors.bg.replace('/20', '')} mt-2 flex-shrink-0`} />
                            <div>
                              <p className="text-white font-medium text-sm">{feature.name}</p>
                              <p className="text-slate-400 text-xs mt-1">{feature.desc}</p>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </motion.div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredModules.length === 0 && (
        <div className="text-center py-12">
          <Search className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400">لم يتم العثور على نتائج للبحث</p>
        </div>
      )}
        </TabsContent>
      </Tabs>
    </div>
  );
}