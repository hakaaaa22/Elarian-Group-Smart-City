import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Zap, Sun, Moon, Lock, Home, Clock, Thermometer, Lightbulb,
  Shield, Car, Bell, Play, Copy, Check, Star, Users, Camera,
  Coffee, Tv, Music, Bed, Baby, Dog, Briefcase, Plane
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import { toast } from 'sonner';

const templateCategories = [
  { id: 'daily', name: 'روتين يومي', icon: Clock },
  { id: 'security', name: 'الأمان', icon: Shield },
  { id: 'comfort', name: 'الراحة', icon: Home },
  { id: 'energy', name: 'توفير الطاقة', icon: Zap },
  { id: 'entertainment', name: 'الترفيه', icon: Tv },
];

const templates = [
  {
    id: 't1',
    name: 'صباح الخير',
    description: 'استيقظ بلطف مع الإضاءة التدريجية والموسيقى',
    category: 'daily',
    icon: Sun,
    color: 'amber',
    popularity: 95,
    triggers: [{ type: 'time', value: '06:30' }],
    actions: [
      { device: 'إضاءة غرفة النوم', action: 'تشغيل تدريجي 50%' },
      { device: 'الستائر', action: 'فتح' },
      { device: 'ماكينة القهوة', action: 'تشغيل' },
    ]
  },
  {
    id: 't2',
    name: 'مغادرة المنزل',
    description: 'أطفئ كل شيء واقفل الأبواب عند المغادرة',
    category: 'security',
    icon: Car,
    color: 'blue',
    popularity: 88,
    triggers: [{ type: 'location', value: 'مغادرة المنزل' }],
    actions: [
      { device: 'جميع الأضواء', action: 'إطفاء' },
      { device: 'المكيف', action: 'إيقاف' },
      { device: 'الأبواب', action: 'قفل' },
      { device: 'الكاميرات', action: 'تفعيل التسجيل' },
    ]
  },
  {
    id: 't3',
    name: 'وقت النوم',
    description: 'تهيئة المنزل للنوم المريح',
    category: 'daily',
    icon: Moon,
    color: 'indigo',
    popularity: 92,
    triggers: [{ type: 'time', value: '23:00' }],
    actions: [
      { device: 'الإضاءة', action: 'خافتة 10%' },
      { device: 'المكيف', action: '22°C' },
      { device: 'الأبواب', action: 'قفل' },
    ]
  },
  {
    id: 't4',
    name: 'وضع السينما',
    description: 'تجربة سينمائية في منزلك',
    category: 'entertainment',
    icon: Tv,
    color: 'purple',
    popularity: 75,
    triggers: [{ type: 'voice', value: 'وقت السينما' }],
    actions: [
      { device: 'الإضاءة', action: 'إطفاء' },
      { device: 'الستائر', action: 'إغلاق' },
      { device: 'التلفاز', action: 'تشغيل' },
      { device: 'السماعات', action: 'وضع السينما' },
    ]
  },
  {
    id: 't5',
    name: 'العودة للمنزل',
    description: 'رحب بنفسك عند الوصول',
    category: 'comfort',
    icon: Home,
    color: 'green',
    popularity: 85,
    triggers: [{ type: 'location', value: 'الوصول للمنزل' }],
    actions: [
      { device: 'الإضاءة', action: 'تشغيل' },
      { device: 'المكيف', action: 'تشغيل' },
      { device: 'الباب', action: 'فتح' },
    ]
  },
  {
    id: 't6',
    name: 'توفير الطاقة',
    description: 'تقليل الاستهلاك في ساعات الذروة',
    category: 'energy',
    icon: Zap,
    color: 'emerald',
    popularity: 70,
    triggers: [{ type: 'time', value: '16:00-20:00' }],
    actions: [
      { device: 'المكيف', action: 'رفع 2°C' },
      { device: 'السخان', action: 'إيقاف' },
      { device: 'الإضاءة', action: 'خفض 30%' },
    ]
  },
  {
    id: 't7',
    name: 'تنبيه الحركة الليلي',
    description: 'إشعار عند اكتشاف حركة ليلاً',
    category: 'security',
    icon: Bell,
    color: 'red',
    popularity: 80,
    triggers: [{ type: 'sensor', value: 'حركة + بعد 12 ليلاً' }],
    actions: [
      { device: 'الإشعارات', action: 'إرسال تنبيه' },
      { device: 'الكاميرات', action: 'تسجيل 30 ثانية' },
      { device: 'الإضاءة الخارجية', action: 'تشغيل' },
    ]
  },
  {
    id: 't8',
    name: 'استقبال الضيوف',
    description: 'تهيئة المنزل للضيوف',
    category: 'comfort',
    icon: Users,
    color: 'pink',
    popularity: 65,
    triggers: [{ type: 'manual', value: 'زر الضيوف' }],
    actions: [
      { device: 'الإضاءة', action: 'تشغيل 100%' },
      { device: 'المكيف', action: '24°C' },
      { device: 'الموسيقى', action: 'قائمة الاستقبال' },
    ]
  },
];

export default function AutomationTemplates({ onApplyTemplate }) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const filteredTemplates = templates.filter(t => {
    const matchesCategory = selectedCategory === 'all' || t.category === selectedCategory;
    const matchesSearch = t.name.includes(searchQuery) || t.description.includes(searchQuery);
    return matchesCategory && matchesSearch;
  });

  const applyTemplate = (template) => {
    if (onApplyTemplate) {
      onApplyTemplate(template);
    }
    toast.success(`تم إضافة "${template.name}" إلى الأتمتة`);
    setShowDetailDialog(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-white font-bold text-lg flex items-center gap-2">
          <Zap className="w-5 h-5 text-amber-400" />
          قوالب الأتمتة الجاهزة
        </h3>
        <p className="text-slate-400 text-sm">ابدأ بسرعة مع قوالب معدة مسبقاً</p>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-wrap gap-3">
        <Input
          placeholder="بحث في القوالب..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 min-w-[200px] bg-slate-800/50 border-slate-700 text-white"
        />
        <div className="flex gap-2 overflow-x-auto">
          <Button
            size="sm"
            variant={selectedCategory === 'all' ? 'default' : 'outline'}
            className={selectedCategory === 'all' ? 'bg-cyan-600' : 'border-slate-600'}
            onClick={() => setSelectedCategory('all')}
          >
            الكل
          </Button>
          {templateCategories.map(cat => (
            <Button
              key={cat.id}
              size="sm"
              variant={selectedCategory === cat.id ? 'default' : 'outline'}
              className={selectedCategory === cat.id ? 'bg-cyan-600' : 'border-slate-600'}
              onClick={() => setSelectedCategory(cat.id)}
            >
              <cat.icon className="w-3 h-3 ml-1" />
              {cat.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTemplates.map((template, i) => {
          const Icon = template.icon;
          return (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card 
                className="glass-card border-indigo-500/20 bg-[#0f1629]/80 cursor-pointer hover:border-cyan-500/50 transition-all"
                onClick={() => { setSelectedTemplate(template); setShowDetailDialog(true); }}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className={`p-3 rounded-xl bg-${template.color}-500/20`}>
                      <Icon className={`w-6 h-6 text-${template.color}-400`} />
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                      <span className="text-slate-400 text-xs">{template.popularity}%</span>
                    </div>
                  </div>
                  <h4 className="text-white font-medium mb-1">{template.name}</h4>
                  <p className="text-slate-400 text-xs mb-3">{template.description}</p>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="border-slate-600 text-slate-400 text-xs">
                      {template.actions.length} إجراءات
                    </Badge>
                    <Button size="sm" className="h-7 bg-cyan-600 hover:bg-cyan-700">
                      <Play className="w-3 h-3 ml-1" />
                      استخدام
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">تفاصيل القالب</DialogTitle>
          </DialogHeader>
          {selectedTemplate && (
            <div className="space-y-4 mt-4">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-xl bg-${selectedTemplate.color}-500/20`}>
                  <selectedTemplate.icon className={`w-6 h-6 text-${selectedTemplate.color}-400`} />
                </div>
                <div>
                  <h4 className="text-white font-bold">{selectedTemplate.name}</h4>
                  <p className="text-slate-400 text-sm">{selectedTemplate.description}</p>
                </div>
              </div>

              <div>
                <p className="text-slate-300 text-sm mb-2">المشغلات</p>
                <div className="flex flex-wrap gap-2">
                  {selectedTemplate.triggers.map((t, i) => (
                    <Badge key={i} variant="outline" className="border-amber-500/50 text-amber-400">
                      {t.type === 'time' ? `⏰ ${t.value}` : 
                       t.type === 'location' ? `📍 ${t.value}` :
                       t.type === 'voice' ? `🎤 ${t.value}` :
                       t.type === 'sensor' ? `📡 ${t.value}` : t.value}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-slate-300 text-sm mb-2">الإجراءات</p>
                <div className="space-y-2">
                  {selectedTemplate.actions.map((a, i) => (
                    <div key={i} className="flex items-center justify-between p-2 bg-slate-800/50 rounded-lg">
                      <span className="text-white text-sm">{a.device}</span>
                      <Badge className="bg-cyan-500/20 text-cyan-400 text-xs">{a.action}</Badge>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button className="flex-1 bg-cyan-600 hover:bg-cyan-700" onClick={() => applyTemplate(selectedTemplate)}>
                  <Play className="w-4 h-4 ml-2" />
                  تطبيق القالب
                </Button>
                <Button variant="outline" className="border-slate-600">
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}