import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  LayoutGrid, Search, BarChart3, PieChart, LineChart, Map, Gauge, Table,
  Activity, Thermometer, Droplets, Zap, Car, Camera, Shield, Users,
  Clock, Calendar, TrendingUp, Target, AlertTriangle, CheckCircle,
  Plus, X, GripVertical, Settings, Eye, Star, Filter
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Widget definitions
export const widgetCatalog = [
  // Charts
  { id: 'line-chart', name: 'رسم بياني خطي', icon: LineChart, category: 'charts', description: 'عرض البيانات عبر الزمن', defaultSize: { w: 2, h: 2 } },
  { id: 'bar-chart', name: 'رسم بياني شريطي', icon: BarChart3, category: 'charts', description: 'مقارنة القيم المختلفة', defaultSize: { w: 2, h: 2 } },
  { id: 'pie-chart', name: 'رسم دائري', icon: PieChart, category: 'charts', description: 'عرض النسب والتوزيعات', defaultSize: { w: 2, h: 2 } },
  { id: 'area-chart', name: 'رسم مساحي', icon: TrendingUp, category: 'charts', description: 'تصور اتجاهات البيانات', defaultSize: { w: 2, h: 2 } },
  
  // Gauges & Meters
  { id: 'gauge', name: 'مقياس', icon: Gauge, category: 'gauges', description: 'عرض قيمة واحدة بشكل دائري', defaultSize: { w: 1, h: 1 } },
  { id: 'progress-bar', name: 'شريط التقدم', icon: Activity, category: 'gauges', description: 'تتبع التقدم نحو الهدف', defaultSize: { w: 2, h: 1 } },
  { id: 'kpi-card', name: 'بطاقة KPI', icon: Target, category: 'gauges', description: 'عرض مؤشر أداء رئيسي', defaultSize: { w: 1, h: 1 } },
  { id: 'stat-card', name: 'بطاقة إحصائية', icon: TrendingUp, category: 'gauges', description: 'عرض إحصائية مع التغيير', defaultSize: { w: 1, h: 1 } },
  
  // Maps
  { id: 'live-map', name: 'خريطة تفاعلية', icon: Map, category: 'maps', description: 'خريطة مع علامات ومسارات', defaultSize: { w: 3, h: 2 } },
  { id: 'heatmap', name: 'خريطة حرارية', icon: Map, category: 'maps', description: 'تصور كثافة البيانات', defaultSize: { w: 2, h: 2 } },
  { id: 'fleet-map', name: 'خريطة الأسطول', icon: Car, category: 'maps', description: 'تتبع المركبات في الوقت الفعلي', defaultSize: { w: 3, h: 2 } },
  
  // Tables & Lists
  { id: 'data-table', name: 'جدول بيانات', icon: Table, category: 'tables', description: 'عرض البيانات في جدول', defaultSize: { w: 3, h: 2 } },
  { id: 'alert-list', name: 'قائمة التنبيهات', icon: AlertTriangle, category: 'tables', description: 'عرض التنبيهات النشطة', defaultSize: { w: 2, h: 2 } },
  { id: 'activity-feed', name: 'سجل الأنشطة', icon: Activity, category: 'tables', description: 'عرض آخر الأنشطة', defaultSize: { w: 2, h: 2 } },
  
  // Sensors & IoT
  { id: 'temperature', name: 'درجة الحرارة', icon: Thermometer, category: 'sensors', description: 'عرض قراءة الحرارة', defaultSize: { w: 1, h: 1 } },
  { id: 'humidity', name: 'الرطوبة', icon: Droplets, category: 'sensors', description: 'عرض مستوى الرطوبة', defaultSize: { w: 1, h: 1 } },
  { id: 'power-meter', name: 'مقياس الطاقة', icon: Zap, category: 'sensors', description: 'عرض استهلاك الطاقة', defaultSize: { w: 1, h: 1 } },
  
  // Surveillance
  { id: 'camera-feed', name: 'بث الكاميرا', icon: Camera, category: 'surveillance', description: 'عرض بث مباشر من كاميرا', defaultSize: { w: 2, h: 2 } },
  { id: 'camera-grid', name: 'شبكة الكاميرات', icon: Camera, category: 'surveillance', description: 'عرض عدة كاميرات', defaultSize: { w: 3, h: 2 } },
  
  // Status & Info
  { id: 'status-indicator', name: 'مؤشر الحالة', icon: CheckCircle, category: 'status', description: 'عرض حالة النظام', defaultSize: { w: 1, h: 1 } },
  { id: 'clock', name: 'ساعة', icon: Clock, category: 'status', description: 'عرض الوقت الحالي', defaultSize: { w: 1, h: 1 } },
  { id: 'calendar', name: 'تقويم', icon: Calendar, category: 'status', description: 'عرض الأحداث القادمة', defaultSize: { w: 2, h: 2 } },
];

const categories = [
  { id: 'all', name: 'الكل', icon: LayoutGrid },
  { id: 'charts', name: 'الرسوم البيانية', icon: BarChart3 },
  { id: 'gauges', name: 'المقاييس', icon: Gauge },
  { id: 'maps', name: 'الخرائط', icon: Map },
  { id: 'tables', name: 'الجداول', icon: Table },
  { id: 'sensors', name: 'المستشعرات', icon: Thermometer },
  { id: 'surveillance', name: 'المراقبة', icon: Camera },
  { id: 'status', name: 'الحالة', icon: CheckCircle },
];

export default function WidgetLibrary({ onAddWidget, onClose }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [favorites, setFavorites] = useState(['line-chart', 'kpi-card', 'live-map']);

  const filteredWidgets = widgetCatalog.filter(widget => {
    const matchesSearch = widget.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          widget.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || widget.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleFavorite = (widgetId) => {
    setFavorites(prev => 
      prev.includes(widgetId) ? prev.filter(id => id !== widgetId) : [...prev, widgetId]
    );
  };

  return (
    <div className="space-y-4" dir="rtl">
      {/* Search */}
      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          placeholder="بحث في الأدوات..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pr-9 bg-slate-800/50 border-slate-700 text-white"
        />
      </div>

      {/* Categories */}
      <div className="flex flex-wrap gap-2">
        {categories.map(cat => (
          <Button
            key={cat.id}
            size="sm"
            variant={selectedCategory === cat.id ? "default" : "outline"}
            className={selectedCategory === cat.id ? "bg-cyan-600" : "border-slate-600"}
            onClick={() => setSelectedCategory(cat.id)}
          >
            <cat.icon className="w-3 h-3 ml-1" />
            {cat.name}
          </Button>
        ))}
      </div>

      {/* Favorites Section */}
      {selectedCategory === 'all' && favorites.length > 0 && (
        <div className="mb-4">
          <p className="text-slate-400 text-sm mb-2 flex items-center gap-1">
            <Star className="w-4 h-4 text-amber-400" />
            المفضلة
          </p>
          <div className="grid grid-cols-3 gap-2">
            {widgetCatalog.filter(w => favorites.includes(w.id)).map(widget => (
              <WidgetCard 
                key={widget.id} 
                widget={widget} 
                onAdd={onAddWidget}
                isFavorite={true}
                onToggleFavorite={() => toggleFavorite(widget.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Widgets Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-[400px] overflow-y-auto">
        {filteredWidgets.map((widget, i) => (
          <motion.div
            key={widget.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
          >
            <WidgetCard 
              widget={widget} 
              onAdd={onAddWidget}
              isFavorite={favorites.includes(widget.id)}
              onToggleFavorite={() => toggleFavorite(widget.id)}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function WidgetCard({ widget, onAdd, isFavorite, onToggleFavorite }) {
  const IconComponent = widget.icon;
  
  return (
    <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80 hover:border-cyan-500/50 cursor-pointer transition-all group">
      <CardContent className="p-3">
        <div className="flex items-start justify-between mb-2">
          <div className="p-2 rounded-lg bg-cyan-500/20">
            <IconComponent className="w-5 h-5 text-cyan-400" />
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => { e.stopPropagation(); onToggleFavorite(); }}
          >
            <Star className={`w-3 h-3 ${isFavorite ? 'text-amber-400 fill-amber-400' : 'text-slate-400'}`} />
          </Button>
        </div>
        <h4 className="text-white text-sm font-medium mb-1">{widget.name}</h4>
        <p className="text-slate-500 text-xs mb-2 line-clamp-2">{widget.description}</p>
        <Button
          size="sm"
          className="w-full bg-cyan-600 hover:bg-cyan-700 h-7 text-xs"
          onClick={() => onAdd(widget)}
        >
          <Plus className="w-3 h-3 ml-1" />
          إضافة
        </Button>
      </CardContent>
    </Card>
  );
}