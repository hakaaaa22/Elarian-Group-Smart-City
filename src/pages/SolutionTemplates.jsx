import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  Grid3X3, Search, Filter, ChevronLeft, ChevronRight, Info, Download, Check,
  Thermometer, Car, Droplets, Wind, Zap, Building2, Truck, Gauge, Star,
  Wifi, MapPin, Factory, Leaf, Eye, Play, Copy, Settings, Layers, Shield,
  Camera, Brain, Heart, ShoppingCart, Plane, Package, RefreshCw, Clock, Users
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from '@/components/ui/dialog';
import { toast } from 'sonner';

const solutionTemplates = [
  {
    id: 'temp-humidity',
    name: 'مراقبة درجة الحرارة والرطوبة',
    description: 'مراقبة شاملة لدرجات الحرارة والرطوبة مع تنبيهات ذكية وتحليلات متقدمة',
    category: 'sensors',
    tier: 'MAKER',
    icon: Thermometer,
    color: 'cyan',
    rating: 4.8,
    installs: 1250,
    features: ['مراقبة في الوقت الفعلي', 'تنبيهات قابلة للتخصيص', 'تقارير تاريخية', 'تكامل API'],
    widgets: ['لوحة تحكم رئيسية', 'مخططات بيانية', 'جدول التنبيهات', 'خريطة المستشعرات'],
    requirements: ['3 مستشعرات كحد أدنى', 'اتصال WiFi أو LoRa'],
    demoUrl: 'https://demo.example.com/temp'
  },
  {
    id: 'fleet-tracking',
    name: 'تتبع الأسطول المتقدم',
    description: 'نظام متكامل لتتبع المركبات وإدارة الأسطول مع AI لتحسين المسارات',
    category: 'fleet',
    tier: 'ENTERPRISE',
    icon: Car,
    color: 'green',
    rating: 4.9,
    installs: 890,
    features: ['تتبع GPS في الوقت الفعلي', 'تحليل سلوك القيادة', 'إدارة الصيانة التنبؤية', 'تحسين المسارات بالذكاء الاصطناعي'],
    widgets: ['خريطة تفاعلية', 'لوحة أداء السائقين', 'تقارير الوقود', 'جدول الصيانة'],
    requirements: ['أجهزة GPS متوافقة', 'خادم بيانات'],
    demoUrl: 'https://demo.example.com/fleet'
  },
  {
    id: 'fuel-monitoring',
    name: 'مراقبة مستوى الوقود',
    description: 'مراقبة استهلاك الوقود وكشف التسريب مع تقارير تفصيلية',
    category: 'fleet',
    tier: 'MAKER',
    icon: Gauge,
    color: 'amber',
    rating: 4.6,
    installs: 567,
    features: ['مراقبة المستوى الفوري', 'كشف التسريب الذكي', 'تقارير الاستهلاك', 'تنبيهات إعادة التعبئة'],
    widgets: ['مقياس المستوى', 'رسم بياني الاستهلاك', 'سجل التعبئة'],
    requirements: ['مستشعر مستوى الوقود'],
    demoUrl: 'https://demo.example.com/fuel'
  },
  {
    id: 'swimming-pool',
    name: 'نظام SCADA لحمامات السباحة',
    description: 'نظام تحكم ومراقبة شامل لجودة المياه والأنظمة الميكانيكية',
    category: 'scada',
    tier: 'ENTERPRISE',
    icon: Droplets,
    color: 'blue',
    rating: 4.7,
    installs: 234,
    features: ['مراقبة جودة المياه', 'التحكم التلقائي بالمضخات', 'جدولة الصيانة', 'تقارير الامتثال'],
    widgets: ['لوحة جودة المياه', 'التحكم بالمعدات', 'جدول الفحص'],
    requirements: ['مستشعرات pH و ORP', 'نظام تحكم PLC'],
    demoUrl: 'https://demo.example.com/pool'
  },
  {
    id: 'smart-office',
    name: 'المكتب الذكي',
    description: 'إدارة ذكية للطاقة والبيئة في المكاتب مع تحسين راحة الموظفين',
    category: 'building',
    tier: 'PROTOTYPE',
    icon: Building2,
    color: 'purple',
    rating: 4.5,
    installs: 445,
    features: ['إدارة الطاقة', 'التحكم بالإضاءة والتكييف', 'مراقبة جودة الهواء', 'حجز الغرف'],
    widgets: ['خريطة المبنى', 'استهلاك الطاقة', 'جدول الحجوزات'],
    requirements: ['مستشعرات بيئية', 'نظام BMS'],
    demoUrl: 'https://demo.example.com/office'
  },
  {
    id: 'water-metering',
    name: 'قياس المياه الذكي',
    description: 'نظام قياس ومراقبة استهلاك المياه مع كشف التسريب والفوترة الآلية',
    category: 'utilities',
    tier: 'PROTOTYPE',
    icon: Droplets,
    color: 'cyan',
    rating: 4.4,
    installs: 678,
    features: ['قراءة العدادات عن بعد', 'كشف التسريب الفوري', 'الفوترة الذكية', 'تنبيهات الاستهلاك'],
    widgets: ['لوحة العدادات', 'رسم استهلاك', 'تقارير الفوترة'],
    requirements: ['عدادات ذكية', 'بوابة LoRaWAN'],
    demoUrl: 'https://demo.example.com/water'
  },
  {
    id: 'smart-retail',
    name: 'التجزئة الذكية',
    description: 'حلول IoT للمتاجر والمستودعات مع تحليل سلوك الزوار',
    category: 'retail',
    tier: 'PROTOTYPE',
    icon: ShoppingCart,
    color: 'pink',
    rating: 4.3,
    installs: 312,
    features: ['تتبع المخزون الآلي', 'تحليل حركة الزوار', 'التحكم بالمناخ', 'إدارة الطاقة'],
    widgets: ['خريطة الحرارة', 'مستويات المخزون', 'إحصائيات الزوار'],
    requirements: ['كاميرات تحليل', 'RFID للمخزون'],
    demoUrl: 'https://demo.example.com/retail'
  },
  {
    id: 'waste-management',
    name: 'إدارة النفايات الذكية',
    description: 'نظام ذكي لإدارة ومراقبة حاويات النفايات مع تحسين مسارات الجمع',
    category: 'city',
    tier: 'ENTERPRISE',
    icon: Truck,
    color: 'green',
    rating: 4.8,
    installs: 567,
    features: ['مراقبة مستوى الامتلاء', 'تحسين مسارات الجمع بالـ AI', 'جدولة الجمع الذكية', 'تقارير الاستدامة'],
    widgets: ['خريطة الحاويات', 'جدول الجمع', 'تقارير الأداء'],
    requirements: ['مستشعرات الامتلاء', 'GPS للشاحنات'],
    demoUrl: 'https://demo.example.com/waste'
  },
  {
    id: 'energy-monitoring',
    name: 'مراقبة الطاقة',
    description: 'مراقبة وتحليل استهلاك الطاقة الكهربائية مع توصيات التوفير',
    category: 'energy',
    tier: 'MAKER',
    icon: Zap,
    color: 'yellow',
    rating: 4.7,
    installs: 890,
    features: ['مراقبة الاستهلاك الفوري', 'تحليل ساعات الذروة', 'توصيات التوفير', 'تقارير الكربون'],
    widgets: ['مقياس الطاقة', 'رسم الاستهلاك', 'تكاليف الطاقة'],
    requirements: ['عدادات طاقة ذكية'],
    demoUrl: 'https://demo.example.com/energy'
  },
  {
    id: 'agriculture',
    name: 'الزراعة الذكية',
    description: 'حلول IoT للزراعة الحديثة والري الذكي مع تنبؤات المحاصيل',
    category: 'agriculture',
    tier: 'PROTOTYPE',
    icon: Leaf,
    color: 'green',
    rating: 4.6,
    installs: 423,
    features: ['مراقبة رطوبة التربة', 'الري الآلي الذكي', 'مراقبة الطقس', 'تنبؤات المحاصيل'],
    widgets: ['خريطة الحقول', 'جدول الري', 'تقارير المحاصيل'],
    requirements: ['مستشعرات تربة', 'محطة طقس'],
    demoUrl: 'https://demo.example.com/agri'
  },
  {
    id: 'security-surveillance',
    name: 'المراقبة الأمنية',
    description: 'نظام مراقبة أمنية متكامل مع تحليل الفيديو بالذكاء الاصطناعي',
    category: 'security',
    tier: 'ENTERPRISE',
    icon: Camera,
    color: 'red',
    rating: 4.9,
    installs: 1120,
    features: ['تحليل الفيديو AI', 'كشف الوجوه والسلوك', 'تنبيهات فورية', 'تسجيل سحابي'],
    widgets: ['شاشة الكاميرات', 'سجل الأحداث', 'لوحة التنبيهات'],
    requirements: ['كاميرات IP', 'خادم معالجة'],
    demoUrl: 'https://demo.example.com/security'
  },
  {
    id: 'healthcare-iot',
    name: 'الرعاية الصحية IoT',
    description: 'مراقبة المرضى والأصول الطبية مع تتبع المعدات',
    category: 'healthcare',
    tier: 'ENTERPRISE',
    icon: Heart,
    color: 'red',
    rating: 4.8,
    installs: 234,
    features: ['مراقبة المرضى عن بعد', 'تتبع الأصول الطبية', 'إدارة الأدوية', 'تنبيهات الطوارئ'],
    widgets: ['لوحة المرضى', 'خريطة الأصول', 'جدول الأدوية'],
    requirements: ['أجهزة مراقبة طبية', 'بوابات BLE'],
    demoUrl: 'https://demo.example.com/health'
  },
];

const categories = [
  { id: 'all', name: 'الكل', icon: Grid3X3 },
  { id: 'sensors', name: 'المستشعرات', icon: Thermometer },
  { id: 'fleet', name: 'الأسطول', icon: Car },
  { id: 'building', name: 'المباني', icon: Building2 },
  { id: 'scada', name: 'SCADA', icon: Settings },
  { id: 'utilities', name: 'المرافق', icon: Droplets },
  { id: 'energy', name: 'الطاقة', icon: Zap },
  { id: 'city', name: 'المدينة الذكية', icon: MapPin },
  { id: 'security', name: 'الأمن', icon: Shield },
  { id: 'healthcare', name: 'الصحة', icon: Heart },
  { id: 'retail', name: 'التجزئة', icon: ShoppingCart },
  { id: 'agriculture', name: 'الزراعة', icon: Leaf },
];

const tierConfig = {
  MAKER: { label: 'مبتدئ', color: 'cyan', price: 'مجاني' },
  PROTOTYPE: { label: 'متقدم', color: 'amber', price: '99 $/شهر' },
  ENTERPRISE: { label: 'مؤسسي', color: 'purple', price: 'اتصل بنا' },
};

export default function SolutionTemplates() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTier, setSelectedTier] = useState('all');
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [installProgress, setInstallProgress] = useState(0);
  const [isInstalling, setIsInstalling] = useState(false);
  const [installedTemplates, setInstalledTemplates] = useState([]);
  const [viewMode, setViewMode] = useState('grid');

  const filteredTemplates = solutionTemplates.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || t.category === selectedCategory;
    const matchesTier = selectedTier === 'all' || t.tier === selectedTier;
    return matchesSearch && matchesCategory && matchesTier;
  });

  const handleInstall = async (template) => {
    setIsInstalling(true);
    setInstallProgress(0);
    
    // محاكاة عملية التثبيت
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(r => setTimeout(r, 200));
      setInstallProgress(i);
    }
    
    setInstalledTemplates(prev => [...prev, template.id]);
    setIsInstalling(false);
    setInstallProgress(0);
    toast.success(`تم تثبيت "${template.name}" بنجاح!`);
    setSelectedTemplate(null);
  };

  const handlePreview = (template) => {
    if (template.demoUrl) {
      window.open(template.demoUrl, '_blank');
    } else {
      toast.info('المعاينة غير متاحة حالياً');
    }
  };

  return (
    <div className="min-h-screen p-4 lg:p-6" dir="rtl">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white flex items-center gap-3">
              <Grid3X3 className="w-8 h-8 text-cyan-400" />
              قوالب الحلول
            </h1>
            <p className="text-slate-400 mt-1">اختر قالب جاهز لبدء مشروعك بسرعة - {solutionTemplates.length} قالب متاح</p>
          </div>
          <div className="flex gap-2">
            <Badge className="bg-green-500/20 text-green-400 px-3 py-1">
              <Check className="w-3 h-3 ml-1" />
              {installedTemplates.length} مثبت
            </Badge>
          </div>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-cyan-500/10 border-cyan-500/30">
          <CardContent className="p-4 text-center">
            <Layers className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{solutionTemplates.length}</p>
            <p className="text-slate-400 text-sm">قالب متاح</p>
          </CardContent>
        </Card>
        <Card className="bg-purple-500/10 border-purple-500/30">
          <CardContent className="p-4 text-center">
            <Download className="w-6 h-6 text-purple-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{solutionTemplates.reduce((s, t) => s + t.installs, 0).toLocaleString()}</p>
            <p className="text-slate-400 text-sm">عملية تثبيت</p>
          </CardContent>
        </Card>
        <Card className="bg-amber-500/10 border-amber-500/30">
          <CardContent className="p-4 text-center">
            <Star className="w-6 h-6 text-amber-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">4.7</p>
            <p className="text-slate-400 text-sm">متوسط التقييم</p>
          </CardContent>
        </Card>
        <Card className="bg-green-500/10 border-green-500/30">
          <CardContent className="p-4 text-center">
            <Users className="w-6 h-6 text-green-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{categories.length - 1}</p>
            <p className="text-slate-400 text-sm">فئة</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80 mb-6">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="بحث في القوالب..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-9 bg-slate-800/50 border-slate-700 text-white"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-36 bg-slate-800/50 border-slate-700 text-white">
                <SelectValue placeholder="الفئة" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                {categories.map(cat => (
                  <SelectItem key={cat.id} value={cat.id}>
                    <span className="flex items-center gap-2">
                      <cat.icon className="w-4 h-4" />
                      {cat.name}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedTier} onValueChange={setSelectedTier}>
              <SelectTrigger className="w-32 bg-slate-800/50 border-slate-700 text-white">
                <SelectValue placeholder="المستوى" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="all">الكل</SelectItem>
                {Object.entries(tierConfig).map(([tier, config]) => (
                  <SelectItem key={tier} value={tier}>{config.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex gap-1 bg-slate-800/50 rounded-lg p-1">
              <Button size="sm" variant={viewMode === 'grid' ? 'default' : 'ghost'} className={viewMode === 'grid' ? 'bg-cyan-600' : ''} onClick={() => setViewMode('grid')}>
                <Grid3X3 className="w-4 h-4" />
              </Button>
              <Button size="sm" variant={viewMode === 'list' ? 'default' : 'ghost'} className={viewMode === 'list' ? 'bg-cyan-600' : ''} onClick={() => setViewMode('list')}>
                <Layers className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Quick Filter */}
      <ScrollArea className="mb-6">
        <div className="flex gap-2 pb-2">
          {categories.map(cat => (
            <Button
              key={cat.id}
              size="sm"
              variant={selectedCategory === cat.id ? 'default' : 'outline'}
              className={selectedCategory === cat.id ? 'bg-cyan-600' : 'border-slate-700'}
              onClick={() => setSelectedCategory(cat.id)}
            >
              <cat.icon className="w-4 h-4 ml-1" />
              {cat.name}
            </Button>
          ))}
        </div>
      </ScrollArea>

      {/* Templates Grid */}
      <div className={viewMode === 'grid' ? 'grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4' : 'space-y-4'}>
        <AnimatePresence>
          {filteredTemplates.map((template, i) => {
            const IconComponent = template.icon;
            const tier = tierConfig[template.tier];
            const isInstalled = installedTemplates.includes(template.id);
            
            return (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: i * 0.03 }}
                layout
              >
                <Card className={`glass-card border-${template.color}-500/30 bg-[#0f1629]/80 overflow-hidden hover:border-${template.color}-500/60 transition-all h-full ${viewMode === 'list' ? 'flex flex-row' : ''}`}>
                  <div className={`${viewMode === 'list' ? 'w-48 flex-shrink-0' : 'aspect-video'} bg-gradient-to-br from-slate-800 to-slate-900 relative`}>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <IconComponent className={`${viewMode === 'list' ? 'w-12 h-12' : 'w-16 h-16'} text-${template.color}-400/50`} />
                    </div>
                    <Badge className={`absolute top-2 left-2 bg-${tier.color}-500/20 text-${tier.color}-400`}>
                      {tier.label}
                    </Badge>
                    {isInstalled && (
                      <Badge className="absolute top-2 right-2 bg-green-500/20 text-green-400">
                        <Check className="w-3 h-3 ml-1" />
                        مثبت
                      </Badge>
                    )}
                  </div>
                  <CardContent className={`p-4 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-white font-bold">{template.name}</h3>
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                        <span className="text-amber-400 text-xs">{template.rating}</span>
                      </div>
                    </div>
                    <p className="text-slate-400 text-sm mb-3 line-clamp-2">{template.description}</p>
                    
                    <div className="flex flex-wrap gap-1 mb-3">
                      {template.features.slice(0, 3).map((feature, fi) => (
                        <Badge key={fi} className="bg-slate-700 text-slate-300 text-xs">{feature}</Badge>
                      ))}
                      {template.features.length > 3 && (
                        <Badge className="bg-slate-700 text-slate-400 text-xs">+{template.features.length - 3}</Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
                      <span className="flex items-center gap-1">
                        <Download className="w-3 h-3" />
                        {template.installs.toLocaleString()} تثبيت
                      </span>
                      <span className={`text-${tier.color}-400 font-medium`}>{tier.price}</span>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 border-slate-600"
                        onClick={() => setSelectedTemplate(template)}
                      >
                        <Info className="w-3 h-3 ml-1" />
                        التفاصيل
                      </Button>
                      <Button
                        size="sm"
                        className={`flex-1 ${isInstalled ? 'bg-green-600 hover:bg-green-700' : `bg-${template.color}-600 hover:bg-${template.color}-700`}`}
                        onClick={() => isInstalled ? null : handleInstall(template)}
                        disabled={isInstalled}
                      >
                        {isInstalled ? <Check className="w-3 h-3 ml-1" /> : <Download className="w-3 h-3 ml-1" />}
                        {isInstalled ? 'مثبت' : 'تثبيت'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <Grid3X3 className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400">لا توجد قوالب تطابق البحث</p>
        </div>
      )}

      {/* Details Dialog */}
      <Dialog open={!!selectedTemplate} onOpenChange={() => setSelectedTemplate(null)}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-3">
              {selectedTemplate && <selectedTemplate.icon className={`w-6 h-6 text-${selectedTemplate.color}-400`} />}
              {selectedTemplate?.name}
            </DialogTitle>
          </DialogHeader>
          {selectedTemplate && (
            <div className="space-y-6 mt-4">
              <p className="text-slate-300">{selectedTemplate.description}</p>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span className="text-white font-medium">{selectedTemplate.rating}</span>
                </div>
                <div className="flex items-center gap-1 text-slate-400">
                  <Download className="w-4 h-4" />
                  {selectedTemplate.installs.toLocaleString()} تثبيت
                </div>
                <Badge className={`bg-${tierConfig[selectedTemplate.tier].color}-500/20 text-${tierConfig[selectedTemplate.tier].color}-400`}>
                  {tierConfig[selectedTemplate.tier].label}
                </Badge>
              </div>

              <Tabs defaultValue="features">
                <TabsList className="bg-slate-800/50">
                  <TabsTrigger value="features">المميزات</TabsTrigger>
                  <TabsTrigger value="widgets">العناصر</TabsTrigger>
                  <TabsTrigger value="requirements">المتطلبات</TabsTrigger>
                </TabsList>
                
                <TabsContent value="features" className="mt-4">
                  <ul className="space-y-2">
                    {selectedTemplate.features.map((feature, i) => (
                      <li key={i} className="text-white text-sm flex items-center gap-2">
                        <Check className={`w-4 h-4 text-${selectedTemplate.color}-400`} />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </TabsContent>
                
                <TabsContent value="widgets" className="mt-4">
                  <div className="grid grid-cols-2 gap-2">
                    {selectedTemplate.widgets.map((widget, i) => (
                      <div key={i} className="p-3 bg-slate-800/50 rounded-lg text-white text-sm flex items-center gap-2">
                        <Layers className="w-4 h-4 text-slate-400" />
                        {widget}
                      </div>
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="requirements" className="mt-4">
                  <ul className="space-y-2">
                    {selectedTemplate.requirements.map((req, i) => (
                      <li key={i} className="text-slate-300 text-sm flex items-center gap-2">
                        <Settings className="w-4 h-4 text-amber-400" />
                        {req}
                      </li>
                    ))}
                  </ul>
                </TabsContent>
              </Tabs>

              {isInstalling && (
                <div className="p-4 bg-slate-800/50 rounded-lg">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-400">جاري التثبيت...</span>
                    <span className="text-cyan-400">{installProgress}%</span>
                  </div>
                  <Progress value={installProgress} className="h-2" />
                </div>
              )}
            </div>
          )}
          <DialogFooter className="mt-4 gap-2">
            <Button variant="outline" className="border-slate-600" onClick={() => handlePreview(selectedTemplate)}>
              <Eye className="w-4 h-4 ml-2" />
              معاينة
            </Button>
            <Button
              className={`bg-${selectedTemplate?.color}-600 hover:bg-${selectedTemplate?.color}-700`}
              onClick={() => handleInstall(selectedTemplate)}
              disabled={isInstalling || installedTemplates.includes(selectedTemplate?.id)}
            >
              {isInstalling ? (
                <>
                  <RefreshCw className="w-4 h-4 ml-2 animate-spin" />
                  جاري التثبيت...
                </>
              ) : installedTemplates.includes(selectedTemplate?.id) ? (
                <>
                  <Check className="w-4 h-4 ml-2" />
                  مثبت
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 ml-2" />
                  تثبيت القالب
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}