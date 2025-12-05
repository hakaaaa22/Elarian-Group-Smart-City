import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  LayoutGrid, Search, Plus, RefreshCw, Download, Edit, Trash2, Eye,
  ChevronDown, Filter, MoreVertical, Gauge, BarChart3, PieChart,
  LineChart, Map, Table, Image, Clock, Thermometer, Activity
} from 'lucide-react';
import WidgetsLibrary from '@/components/resources/WidgetsLibrary';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { toast } from 'sonner';

const widgetBundles = [
  { id: 'charts', name: 'الرسوم البيانية', count: 45, icon: BarChart3 },
  { id: 'gauges', name: 'المقاييس', count: 23, icon: Gauge },
  { id: 'maps', name: 'الخرائط', count: 12, icon: Map },
  { id: 'tables', name: 'الجداول', count: 18, icon: Table },
  { id: 'cards', name: 'البطاقات', count: 34, icon: LayoutGrid },
  { id: 'inputs', name: 'المدخلات', count: 28, icon: Edit },
];

const mockWidgets = [
  { id: 'w1', title: 'Action button', bundle: 'Buttons', type: 'Latest values', system: true, deprecated: false, createdTime: '2025-11-05 10:59:24' },
  { id: 'w2', title: 'Air quality index card', bundle: 'Air quality', type: 'Latest values', system: true, deprecated: false, createdTime: '2025-11-05 10:59:24' },
  { id: 'w3', title: 'Air quality index card with background', bundle: 'Air quality', type: 'Latest values', system: true, deprecated: false, createdTime: '2025-11-05 10:59:25' },
  { id: 'w4', title: 'Analog gauge', bundle: 'Gauges', type: 'Latest values', system: true, deprecated: false, createdTime: '2025-11-05 10:59:24' },
  { id: 'w5', title: 'Bar chart', bundle: 'Charts', type: 'Time series', system: true, deprecated: false, createdTime: '2025-11-05 10:59:24' },
  { id: 'w6', title: 'Digital gauge', bundle: 'Gauges', type: 'Latest values', system: true, deprecated: false, createdTime: '2025-11-05 10:59:24' },
  { id: 'w7', title: 'Doughnut chart', bundle: 'Charts', type: 'Latest values', system: true, deprecated: false, createdTime: '2025-11-05 10:59:24' },
  { id: 'w8', title: 'Entity table', bundle: 'Tables', type: 'Entity', system: true, deprecated: false, createdTime: '2025-11-05 10:59:24' },
  { id: 'w9', title: 'Image map', bundle: 'Maps', type: 'Static', system: true, deprecated: false, createdTime: '2025-11-05 10:59:24' },
  { id: 'w10', title: 'Line chart', bundle: 'Charts', type: 'Time series', system: true, deprecated: false, createdTime: '2025-11-05 10:59:24' },
];

export default function WidgetsLibraryPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBundle, setSelectedBundle] = useState('all');
  const [activeTab, setActiveTab] = useState('widgets');
  const [selectedWidgets, setSelectedWidgets] = useState([]);

  const filteredWidgets = mockWidgets.filter(w => {
    const matchesSearch = w.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesBundle = selectedBundle === 'all' || w.bundle.toLowerCase() === selectedBundle;
    return matchesSearch && matchesBundle;
  });

  const toggleWidgetSelection = (id) => {
    setSelectedWidgets(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen p-4 lg:p-6" dir="rtl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white flex items-center gap-3">
              <LayoutGrid className="w-8 h-8 text-cyan-400" />
              مكتبة الأدوات
            </h1>
            <p className="text-slate-400 mt-1">أدوات قابلة للتخصيص لبناء لوحات التحكم</p>
          </div>
        </div>
      </motion.div>

      {/* New Widgets Library Component */}
      <WidgetsLibrary />

      {/* Legacy Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 mt-6">
        <TabsList className="bg-slate-800/50 border border-slate-700 p-1">
          <TabsTrigger value="widgets" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
            الويدجت
          </TabsTrigger>
          <TabsTrigger value="bundles" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400">
            الحزم
          </TabsTrigger>
        </TabsList>

        <TabsContent value="widgets">
          {/* Filters */}
          <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80 mb-4">
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-4">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="بحث..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pr-9 bg-slate-800/50 border-slate-700 text-white"
                  />
                </div>
                <Select value={selectedBundle} onValueChange={setSelectedBundle}>
                  <SelectTrigger className="w-40 bg-slate-800/50 border-slate-700 text-white">
                    <SelectValue placeholder="الحزمة" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="all">جميع الحزم</SelectItem>
                    {widgetBundles.map(b => (
                      <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button variant="ghost" size="icon" className="text-slate-400">
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Widgets Table */}
          <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-700/50">
                      <th className="p-4 text-right">
                        <Checkbox className="border-slate-600" />
                      </th>
                      <th className="p-4 text-right text-slate-400 text-sm font-medium">وقت الإنشاء</th>
                      <th className="p-4 text-right text-slate-400 text-sm font-medium">العنوان</th>
                      <th className="p-4 text-right text-slate-400 text-sm font-medium">الحزمة</th>
                      <th className="p-4 text-right text-slate-400 text-sm font-medium">النوع</th>
                      <th className="p-4 text-right text-slate-400 text-sm font-medium">نظام</th>
                      <th className="p-4 text-right text-slate-400 text-sm font-medium">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredWidgets.map((widget, i) => (
                      <motion.tr
                        key={widget.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.03 }}
                        className="border-b border-slate-700/30 hover:bg-slate-800/30"
                      >
                        <td className="p-4">
                          <Checkbox 
                            checked={selectedWidgets.includes(widget.id)}
                            onCheckedChange={() => toggleWidgetSelection(widget.id)}
                            className="border-slate-600"
                          />
                        </td>
                        <td className="p-4 text-slate-400 text-sm">{widget.createdTime}</td>
                        <td className="p-4 text-white">{widget.title}</td>
                        <td className="p-4">
                          <Badge className="bg-cyan-500/20 text-cyan-400">{widget.bundle}</Badge>
                        </td>
                        <td className="p-4 text-slate-400 text-sm">{widget.type}</td>
                        <td className="p-4">
                          <Checkbox checked={widget.system} disabled className="border-slate-600" />
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400">
                              <Download className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="p-4 border-t border-slate-700/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 text-sm">عناصر لكل صفحة:</span>
                  <Select defaultValue="10">
                    <SelectTrigger className="w-16 bg-slate-800/50 border-slate-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="25">25</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <span className="text-slate-400 text-sm">1 - 10 من 687</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bundles">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {widgetBundles.map((bundle, i) => (
              <motion.div
                key={bundle.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80 hover:border-cyan-500/50 cursor-pointer transition-all">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="p-4 rounded-xl bg-cyan-500/20">
                        <bundle.icon className="w-8 h-8 text-cyan-400" />
                      </div>
                      <div>
                        <h3 className="text-white font-bold text-lg">{bundle.name}</h3>
                        <p className="text-slate-400">{bundle.count} ويدجت</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}