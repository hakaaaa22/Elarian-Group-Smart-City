import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  LayoutGrid, Plus, Search, Filter, Eye, Settings, Copy, Trash2,
  BarChart3, LineChart, PieChart, Activity, Users, Car, Camera,
  Thermometer, Droplets, Zap, Shield, Package, Clock, Map, Gauge
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';

const WIDGET_CATEGORIES = [
  { id: 'all', name: 'الكل' },
  { id: 'charts', name: 'الرسوم البيانية' },
  { id: 'stats', name: 'الإحصائيات' },
  { id: 'maps', name: 'الخرائط' },
  { id: 'monitoring', name: 'المراقبة' },
  { id: 'alerts', name: 'التنبيهات' },
];

const mockWidgets = [
  {
    id: 1,
    name: 'مخطط خطي',
    category: 'charts',
    icon: LineChart,
    color: '#8B5CF6',
    description: 'عرض البيانات على شكل مخطط خطي تفاعلي',
    config: { dataSource: 'auto', refreshInterval: 30 },
    usage: 45,
    size: { w: 2, h: 2 }
  },
  {
    id: 2,
    name: 'مخطط دائري',
    category: 'charts',
    icon: PieChart,
    color: '#06B6D4',
    description: 'توزيع النسب المئوية',
    config: { dataSource: 'auto', refreshInterval: 60 },
    usage: 38,
    size: { w: 1, h: 2 }
  },
  {
    id: 3,
    name: 'بطاقة إحصائية',
    category: 'stats',
    icon: Activity,
    color: '#22C55E',
    description: 'عرض رقم واحد مع الاتجاه',
    config: { showTrend: true },
    usage: 67,
    size: { w: 1, h: 1 }
  },
  {
    id: 4,
    name: 'خريطة حية',
    category: 'maps',
    icon: Map,
    color: '#EF4444',
    description: 'خريطة تفاعلية مع طبقات متعددة',
    config: { layers: ['vehicles', 'cameras'] },
    usage: 23,
    size: { w: 3, h: 2 }
  },
  {
    id: 5,
    name: 'مقياس',
    category: 'monitoring',
    icon: Gauge,
    color: '#F59E0B',
    description: 'عرض قيمة ضمن نطاق',
    config: { min: 0, max: 100 },
    usage: 34,
    size: { w: 1, h: 1 }
  },
  {
    id: 6,
    name: 'جدول بيانات',
    category: 'stats',
    icon: LayoutGrid,
    color: '#EC4899',
    description: 'عرض بيانات في جدول قابل للفرز',
    config: { pagination: true },
    usage: 56,
    size: { w: 2, h: 2 }
  },
  {
    id: 7,
    name: 'مراقب الكاميرات',
    category: 'monitoring',
    icon: Camera,
    color: '#8B5CF6',
    description: 'عرض بث الكاميرات مباشرة',
    config: { grid: '2x2' },
    usage: 29,
    size: { w: 2, h: 2 }
  },
  {
    id: 8,
    name: 'تتبع المركبات',
    category: 'maps',
    icon: Car,
    color: '#22C55E',
    description: 'تتبع مركبات الأسطول',
    config: { showRoute: true },
    usage: 41,
    size: { w: 2, h: 2 }
  },
  {
    id: 9,
    name: 'مستشعر الحرارة',
    category: 'monitoring',
    icon: Thermometer,
    color: '#EF4444',
    description: 'عرض قراءات درجة الحرارة',
    config: { unit: 'celsius' },
    usage: 18,
    size: { w: 1, h: 1 }
  },
  {
    id: 10,
    name: 'مراقب المياه',
    category: 'monitoring',
    icon: Droplets,
    color: '#06B6D4',
    description: 'مراقبة استهلاك المياه',
    config: { showHistory: true },
    usage: 22,
    size: { w: 1, h: 2 }
  },
];

export default function WidgetsLibrary({ onAddWidget }) {
  const [widgets, setWidgets] = useState(mockWidgets);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedWidget, setSelectedWidget] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  const filteredWidgets = widgets.filter(w => {
    const matchesSearch = w.name.includes(searchQuery) || w.description.includes(searchQuery);
    const matchesCategory = selectedCategory === 'all' || w.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const addToDashboard = (widget) => {
    if (onAddWidget) {
      onAddWidget(widget);
    }
    toast.success(`تم إضافة "${widget.name}" للوحة التحكم`);
  };

  const duplicateWidget = (widget) => {
    const newWidget = { ...widget, id: Date.now(), name: `${widget.name} (نسخة)` };
    setWidgets([...widgets, newWidget]);
    toast.success('تم نسخ الأداة');
  };

  return (
    <div className="space-y-4" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20">
            <LayoutGrid className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">مكتبة الأدوات</h3>
            <p className="text-slate-400 text-xs">أدوات جاهزة لبناء لوحات التحكم</p>
          </div>
        </div>
        <Button className="bg-cyan-600 hover:bg-cyan-700">
          <Plus className="w-4 h-4 ml-2" />
          أداة مخصصة
        </Button>
      </div>

      {/* Filters */}
      <Card className="bg-slate-800/30 border-slate-700/50">
        <CardContent className="p-3">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="بحث في الأدوات..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-9 bg-slate-800/50 border-slate-700 text-white"
              />
            </div>
            <div className="flex gap-2">
              {WIDGET_CATEGORIES.map(cat => (
                <Button
                  key={cat.id}
                  size="sm"
                  variant={selectedCategory === cat.id ? 'default' : 'outline'}
                  className={selectedCategory === cat.id ? 'bg-cyan-600' : 'border-slate-700'}
                  onClick={() => setSelectedCategory(cat.id)}
                >
                  {cat.name}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Widgets Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredWidgets.map((widget, i) => {
          const WidgetIcon = widget.icon;
          return (
            <motion.div
              key={widget.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -5 }}
            >
              <Card className="bg-slate-800/30 border-slate-700/50 hover:border-cyan-500/50 transition-all cursor-pointer group">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="p-3 rounded-xl" style={{ background: `${widget.color}20` }}>
                      <WidgetIcon className="w-6 h-6" style={{ color: widget.color }} />
                    </div>
                    <Badge className="bg-slate-700 text-slate-300 text-xs">
                      {widget.size.w}x{widget.size.h}
                    </Badge>
                  </div>
                  <h4 className="text-white font-medium mb-1">{widget.name}</h4>
                  <p className="text-slate-400 text-xs mb-3">{widget.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 text-xs">استخدام: {widget.usage}</span>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => { setSelectedWidget(widget); setShowPreview(true); }}>
                        <Eye className="w-4 h-4 text-slate-400" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => addToDashboard(widget)}>
                        <Plus className="w-4 h-4 text-cyan-400" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white">معاينة الأداة</DialogTitle>
          </DialogHeader>
          {selectedWidget && (
            <div className="space-y-4 mt-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl" style={{ background: `${selectedWidget.color}20` }}>
                  {React.createElement(selectedWidget.icon, { className: 'w-8 h-8', style: { color: selectedWidget.color } })}
                </div>
                <div>
                  <h4 className="text-white font-bold">{selectedWidget.name}</h4>
                  <p className="text-slate-400 text-sm">{selectedWidget.description}</p>
                </div>
              </div>

              {/* Preview Area */}
              <div className="h-48 bg-slate-800/50 rounded-lg flex items-center justify-center border border-slate-700">
                {React.createElement(selectedWidget.icon, { className: 'w-16 h-16 text-slate-600' })}
              </div>

              {/* Config */}
              <div className="p-3 bg-slate-800/50 rounded-lg">
                <p className="text-slate-400 text-xs mb-2">الإعدادات الافتراضية:</p>
                <pre className="text-slate-300 text-xs">{JSON.stringify(selectedWidget.config, null, 2)}</pre>
              </div>

              <div className="flex gap-2">
                <Button className="flex-1 bg-cyan-600 hover:bg-cyan-700" onClick={() => { addToDashboard(selectedWidget); setShowPreview(false); }}>
                  <Plus className="w-4 h-4 ml-2" />
                  إضافة للوحة
                </Button>
                <Button variant="outline" className="border-slate-600" onClick={() => setShowPreview(false)}>
                  إغلاق
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}