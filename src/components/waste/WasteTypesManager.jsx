import React, { useState } from 'react';
import {
  Trash2, Recycle, Leaf, AlertTriangle, Battery, Factory, Building2,
  Pill, Cpu, Droplets, Sofa, Mountain, Waves, FlaskConical, TreePine,
  Info, Settings, BarChart3, TrendingUp
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from '@/components/ui/dialog';

const wasteCategories = [
  {
    id: 'general',
    name: 'النفايات المنزلية العامة',
    nameEn: 'General/Municipal Waste',
    icon: Trash2,
    color: 'slate',
    sources: ['المنازل', 'صناديق الشوارع', 'الحدائق والمراكز التجارية', 'المكاتب'],
    materials: ['بقايا الطعام', 'البلاستيك', 'الورق', 'الكرتون', 'الزجاج'],
    sensors: ['مستوى الامتلاء', 'الوزن', 'الحرارة'],
    isSmartBin: true,
    monthlyTons: 2450,
    recycleRate: 15,
  },
  {
    id: 'organic',
    name: 'النفايات العضوية',
    nameEn: 'Organic Waste',
    icon: Leaf,
    color: 'amber',
    sources: ['بقايا الطعام', 'المطاعم', 'الخضار والفواكه', 'الحدائق', 'محطات المعالجة'],
    materials: ['مخلفات غذائية', 'نفايات زراعية', 'حمأة'],
    sensors: ['مستوى الامتلاء', 'الحرارة', 'غاز الميثان', 'الرطوبة'],
    requirements: ['تحسين المسارات بسبب التحلل السريع'],
    monthlyTons: 890,
    recycleRate: 45,
  },
  {
    id: 'recyclable',
    name: 'النفايات القابلة للتدوير',
    nameEn: 'Recyclable Waste',
    icon: Recycle,
    color: 'green',
    sources: ['البلاستيك PET/HDPE', 'العلب المعدنية', 'الألمنيوم', 'الورق', 'الكرتون', 'الزجاج'],
    materials: ['بلاستيك', 'معادن', 'ورق', 'زجاج'],
    sensors: ['الفرز الذكي', 'مستشعر الوزن', 'مستوى الامتلاء'],
    requirements: ['تحسين المسارات', 'الفرز الآلي'],
    monthlyTons: 1200,
    recycleRate: 78,
  },
  {
    id: 'hazardous',
    name: 'النفايات الخطرة',
    nameEn: 'Hazardous Waste',
    icon: AlertTriangle,
    color: 'red',
    sources: ['المواد الكيميائية', 'البطاريات', 'الأدوية', 'الدهانات', 'الإلكترونيات', 'الزيوت', 'المذيبات'],
    materials: ['كيماويات', 'نفايات طبية', 'مواد سامة'],
    sensors: ['RFID/QR للتتبع', 'مراقبة السلسلة', 'مسارات محددة جغرافياً', 'الحرارة والغازات'],
    requirements: ['تتبع صارم', 'سلسلة الحفظ', 'امتثال السلامة'],
    monthlyTons: 120,
    recycleRate: 5,
    isHighRisk: true,
  },
  {
    id: 'industrial',
    name: 'النفايات الصناعية',
    nameEn: 'Industrial Waste',
    icon: Factory,
    color: 'gray',
    sources: ['الخردة', 'نفايات المعادن', 'مخلفات التصنيع', 'المواد السامة', 'كيماويات البناء'],
    materials: ['خردة', 'معادن', 'مواد كيميائية صناعية'],
    sensors: ['مستشعرات الحاويات الثقيلة', 'GPS', 'مراقبة الوزن', 'سجل الامتثال'],
    monthlyTons: 650,
    recycleRate: 35,
  },
  {
    id: 'construction',
    name: 'نفايات البناء والهدم',
    nameEn: 'Construction & Demolition',
    icon: Building2,
    color: 'yellow',
    sources: ['الأسمنت', 'الطوب', 'البلوك', 'الخشب', 'المعادن', 'الرمل والحصى'],
    materials: ['مواد بناء', 'أنقاض', 'خردة معدنية'],
    sensors: ['RFID للحاويات', 'مراقبة حمولة الشاحنات', 'تنبيهات الوزن الزائد', 'مستوى الغبار'],
    monthlyTons: 1800,
    recycleRate: 42,
  },
  {
    id: 'medical',
    name: 'النفايات الطبية والصحية',
    nameEn: 'Medical & Healthcare Waste',
    icon: Pill,
    color: 'pink',
    sources: ['نفايات العدوى', 'الأدوات الحادة', 'أكياس الدم', 'نفايات المختبرات', 'الأدوية'],
    materials: ['نفايات معدية', 'أدوات حادة', 'مواد صيدلانية'],
    sensors: ['مراقبة الحرارة', 'تتبع التعقيم', 'حاويات آمنة'],
    requirements: ['امتثال عالي المستوى', 'تتبع مشدد'],
    monthlyTons: 85,
    recycleRate: 2,
    isHighRisk: true,
  },
  {
    id: 'ewaste',
    name: 'النفايات الإلكترونية',
    nameEn: 'E-Waste',
    icon: Cpu,
    color: 'purple',
    sources: ['الحواسيب', 'الهواتف', 'الشرائح', 'أجهزة الشبكات', 'البطاريات', 'الشاشات'],
    materials: ['إلكترونيات', 'معادن ثمينة', 'بطاريات'],
    sensors: ['وسم الأصول', 'جمع آمن', 'توجيه لمرافق التدوير'],
    monthlyTons: 45,
    recycleRate: 55,
  },
  {
    id: 'liquid',
    name: 'النفايات السائلة',
    nameEn: 'Liquid Waste',
    icon: Droplets,
    color: 'blue',
    sources: ['المياه الرمادية', 'نفايات الوقود', 'الزيوت', 'السوائل الكيميائية', 'مياه الصرف'],
    materials: ['سوائل ملوثة', 'زيوت', 'كيماويات'],
    sensors: ['مستوى الخزان', 'السمية', 'معدل التدفق', 'GPS للصهاريج'],
    monthlyTons: 320,
    recycleRate: 25,
  },
  {
    id: 'bulk',
    name: 'النفايات الضخمة',
    nameEn: 'Bulk Waste',
    icon: Sofa,
    color: 'orange',
    sources: ['الأثاث', 'الأشجار', 'السجاد', 'المراتب', 'الأجهزة الكبيرة'],
    materials: ['أثاث', 'أجهزة منزلية', 'مواد كبيرة'],
    sensors: ['نظام الجمع عند الطلب', 'أوامر العمل', 'جدولة الاستلام'],
    monthlyTons: 180,
    recycleRate: 30,
  },
  {
    id: 'sludge',
    name: 'نفايات الحمأة والمكبات',
    nameEn: 'Sludge & Landfill Waste',
    icon: Mountain,
    color: 'brown',
    sources: ['نفايات الصرف الصحي', 'غازات المكبات', 'الميثان', 'السوائل المتسربة'],
    materials: ['حمأة', 'غازات', 'رشاحة'],
    sensors: ['مستشعرات الغاز', 'الحرارة', 'رطوبة التربة', 'تحليلات الضغط'],
    monthlyTons: 450,
    recycleRate: 10,
  },
  {
    id: 'wastewater',
    name: 'مياه الصرف والنفايات المائية',
    nameEn: 'Wastewater & Sewage',
    icon: Waves,
    color: 'cyan',
    sources: ['نفايات الصرف', 'مخلفات محطات المعالجة'],
    materials: ['مياه ملوثة', 'حمأة'],
    sensors: ['العكورة', 'الحموضة pH', 'السمية', 'معدل التدفق'],
    monthlyTons: 2800,
    recycleRate: 65,
  },
  {
    id: 'chemical',
    name: 'النفايات الكيميائية',
    nameEn: 'Chemical Waste',
    icon: FlaskConical,
    color: 'red',
    sources: ['كيماويات المختبرات', 'المذيبات الصناعية', 'المنظفات', 'المطهرات'],
    materials: ['كيماويات خطرة', 'مذيبات', 'أحماض'],
    sensors: ['تتبع سلسلة الحفظ', 'مراقبة مشددة'],
    requirements: ['خطورة عالية - تتبع سلسلة الحفظ الإلزامي'],
    monthlyTons: 35,
    recycleRate: 8,
    isHighRisk: true,
  },
  {
    id: 'agro',
    name: 'النفايات الزراعية',
    nameEn: 'Agricultural Waste',
    icon: TreePine,
    color: 'lime',
    sources: ['نفايات الحيوانات', 'مزارع الأغنام والأبقار', 'مخلفات المحاصيل'],
    materials: ['سماد', 'مخلفات نباتية', 'روث'],
    sensors: ['مراقبة الميثان', 'الرطوبة', 'مسارات جمع ذكية'],
    monthlyTons: 720,
    recycleRate: 60,
  },
];

export default function WasteTypesManager() {
  const [selectedType, setSelectedType] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  const totalMonthlyTons = wasteCategories.reduce((s, c) => s + c.monthlyTons, 0);
  const avgRecycleRate = Math.round(wasteCategories.reduce((s, c) => s + c.recycleRate, 0) / wasteCategories.length);

  const getColorClass = (color) => {
    const colors = {
      slate: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
      amber: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      green: 'bg-green-500/20 text-green-400 border-green-500/30',
      red: 'bg-red-500/20 text-red-400 border-red-500/30',
      gray: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
      yellow: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      pink: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
      purple: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      blue: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      orange: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      brown: 'bg-amber-700/20 text-amber-600 border-amber-700/30',
      cyan: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
      lime: 'bg-lime-500/20 text-lime-400 border-lime-500/30',
    };
    return colors[color] || colors.slate;
  };

  return (
    <div className="space-y-4" dir="rtl">
      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="bg-cyan-500/10 border-cyan-500/30">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-white">{wasteCategories.length}</p>
            <p className="text-cyan-400 text-xs">نوع نفايات</p>
          </CardContent>
        </Card>
        <Card className="bg-green-500/10 border-green-500/30">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-white">{totalMonthlyTons.toLocaleString()}</p>
            <p className="text-green-400 text-xs">طن/شهر</p>
          </CardContent>
        </Card>
        <Card className="bg-purple-500/10 border-purple-500/30">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-white">{avgRecycleRate}%</p>
            <p className="text-purple-400 text-xs">معدل التدوير</p>
          </CardContent>
        </Card>
        <Card className="bg-red-500/10 border-red-500/30">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-white">{wasteCategories.filter(c => c.isHighRisk).length}</p>
            <p className="text-red-400 text-xs">أنواع خطرة</p>
          </CardContent>
        </Card>
      </div>

      {/* Categories Grid */}
      <ScrollArea className="h-[500px]">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
          {wasteCategories.map(cat => {
            const Icon = cat.icon;
            return (
              <Card 
                key={cat.id} 
                className={`cursor-pointer transition-all hover:scale-[1.02] ${getColorClass(cat.color)} border`}
                onClick={() => { setSelectedType(cat); setShowDetails(true); }}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Icon className="w-6 h-6" />
                      <div>
                        <p className="text-white font-medium text-sm">{cat.name}</p>
                        <p className="text-slate-500 text-xs">{cat.nameEn}</p>
                      </div>
                    </div>
                    {cat.isHighRisk && <Badge className="bg-red-500 text-white text-xs">خطر</Badge>}
                    {cat.isSmartBin && <Badge className="bg-cyan-500/20 text-cyan-400 text-xs">Smart Bins</Badge>}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div className="p-2 bg-slate-800/50 rounded">
                      <p className="text-white font-bold text-sm">{cat.monthlyTons}</p>
                      <p className="text-slate-500 text-xs">طن/شهر</p>
                    </div>
                    <div className="p-2 bg-slate-800/50 rounded">
                      <p className="text-green-400 font-bold text-sm">{cat.recycleRate}%</p>
                      <p className="text-slate-500 text-xs">تدوير</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </ScrollArea>

      {/* Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              {selectedType && <selectedType.icon className="w-5 h-5" />}
              {selectedType?.name}
            </DialogTitle>
          </DialogHeader>
          {selectedType && (
            <div className="space-y-4 mt-4">
              <div className="p-3 bg-slate-800/50 rounded-lg">
                <p className="text-slate-400 text-xs mb-2">المصادر</p>
                <div className="flex flex-wrap gap-1">
                  {selectedType.sources.map((s, i) => (
                    <Badge key={i} className="bg-slate-700 text-slate-300 text-xs">{s}</Badge>
                  ))}
                </div>
              </div>
              <div className="p-3 bg-slate-800/50 rounded-lg">
                <p className="text-slate-400 text-xs mb-2">المواد</p>
                <div className="flex flex-wrap gap-1">
                  {selectedType.materials.map((m, i) => (
                    <Badge key={i} className="bg-cyan-500/20 text-cyan-400 text-xs">{m}</Badge>
                  ))}
                </div>
              </div>
              <div className="p-3 bg-slate-800/50 rounded-lg">
                <p className="text-slate-400 text-xs mb-2">المستشعرات المطلوبة</p>
                <div className="flex flex-wrap gap-1">
                  {selectedType.sensors.map((s, i) => (
                    <Badge key={i} className="bg-green-500/20 text-green-400 text-xs">{s}</Badge>
                  ))}
                </div>
              </div>
              {selectedType.requirements && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                  <p className="text-amber-400 text-xs mb-1">متطلبات خاصة</p>
                  {selectedType.requirements.map((r, i) => (
                    <p key={i} className="text-white text-sm">• {r}</p>
                  ))}
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-800/30 rounded text-center">
                  <p className="text-2xl font-bold text-white">{selectedType.monthlyTons}</p>
                  <p className="text-slate-500 text-xs">طن/شهر</p>
                </div>
                <div className="p-3 bg-slate-800/30 rounded text-center">
                  <p className="text-2xl font-bold text-green-400">{selectedType.recycleRate}%</p>
                  <p className="text-slate-500 text-xs">معدل التدوير</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}