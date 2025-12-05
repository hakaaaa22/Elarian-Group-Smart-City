import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Wrench, Package, Search, Plus, AlertTriangle, TrendingUp, TrendingDown,
  Link2, Settings, Truck, Brain, BarChart3, Bell, RefreshCw, Zap,
  Check, X, Eye, Edit, ShoppingCart, Clock, DollarSign, Activity
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

const deviceTypes = [
  { id: 'hvac', name: 'تكييف', icon: '❄️' },
  { id: 'camera', name: 'كاميرات', icon: '📷' },
  { id: 'security', name: 'أنظمة أمان', icon: '🔒' },
  { id: 'elevator', name: 'مصاعد', icon: '🛗' },
  { id: 'electrical', name: 'كهربائيات', icon: '⚡' },
  { id: 'plumbing', name: 'سباكة', icon: '🚰' },
  { id: 'vehicle', name: 'مركبات', icon: '🚗' },
];

export default function SparePartsManagement({ 
  items = [], 
  maintenanceRecords = [],
  onCreateOrder,
  onUpdateItem,
  onLinkToDevice 
}) {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDeviceType, setSelectedDeviceType] = useState('all');
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [showAIDialog, setShowAIDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [aiRecommendations, setAiRecommendations] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // تحليل البيانات
  const sparePartsOnly = useMemo(() => 
    items.filter(i => i.category === 'spare_parts' || i.category === 'hvac' || i.category === 'security'),
    [items]
  );

  const lowStockParts = useMemo(() => 
    sparePartsOnly.filter(i => i.quantity <= i.min_quantity),
    [sparePartsOnly]
  );

  const partsUsageStats = useMemo(() => {
    const stats = {};
    maintenanceRecords.forEach(record => {
      record.parts_used?.forEach(part => {
        if (!stats[part.part_name]) {
          stats[part.part_name] = { name: part.part_name, totalUsed: 0, maintenanceCount: 0 };
        }
        stats[part.part_name].totalUsed += part.quantity || 1;
        stats[part.part_name].maintenanceCount++;
      });
    });
    return Object.values(stats).sort((a, b) => b.totalUsed - a.totalUsed);
  }, [maintenanceRecords]);

  // AI تحليل المخزون
  const aiAnalysisMutation = useMutation({
    mutationFn: async () => {
      const inventoryData = sparePartsOnly.map(i => ({
        name: i.name,
        quantity: i.quantity,
        min_quantity: i.min_quantity,
        avg_monthly_usage: i.avg_monthly_usage || 0,
        usage_trend: i.usage_trend,
        unit_cost: i.unit_cost,
        supplier: i.supplier
      }));

      return await base44.integrations.Core.InvokeLLM({
        prompt: `أنت محلل مخزون ذكي. حلل بيانات قطع الغيار التالية وقدم توصيات:

بيانات المخزون:
${JSON.stringify(inventoryData, null, 2)}

قدم توصيات تشمل:
1. قطع تحتاج إعادة طلب فوري
2. مستويات المخزون المثالية بناءً على أنماط الاستخدام
3. تحذيرات من نفاد محتمل
4. فرص توفير التكلفة
5. قطع مرتبطة بالصيانة الوقائية`,
        response_json_schema: {
          type: "object",
          properties: {
            urgentReorders: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  partName: { type: "string" },
                  currentQty: { type: "number" },
                  recommendedQty: { type: "number" },
                  reason: { type: "string" },
                  priority: { type: "string" }
                }
              }
            },
            optimalLevels: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  partName: { type: "string" },
                  currentMin: { type: "number" },
                  suggestedMin: { type: "number" },
                  reasoning: { type: "string" }
                }
              }
            },
            stockoutRisks: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  partName: { type: "string" },
                  daysUntilStockout: { type: "number" },
                  impact: { type: "string" }
                }
              }
            },
            costSavings: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  suggestion: { type: "string" },
                  estimatedSaving: { type: "string" }
                }
              }
            },
            preventiveMaintenanceParts: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  partName: { type: "string" },
                  recommendedAction: { type: "string" }
                }
              }
            }
          }
        }
      });
    },
    onSuccess: (data) => {
      setAiRecommendations(data);
      setShowAIDialog(true);
      setIsAnalyzing(false);
    },
    onError: () => {
      toast.error('حدث خطأ في التحليل');
      setIsAnalyzing(false);
    }
  });

  const runAIAnalysis = () => {
    setIsAnalyzing(true);
    aiAnalysisMutation.mutate();
  };

  const filteredParts = useMemo(() => {
    return sparePartsOnly.filter(item => {
      const matchesSearch = item.name.includes(searchQuery) || item.sku?.includes(searchQuery);
      const matchesDevice = selectedDeviceType === 'all' || 
        item.compatible_devices?.includes(selectedDeviceType) ||
        item.category === selectedDeviceType;
      return matchesSearch && matchesDevice;
    });
  }, [sparePartsOnly, searchQuery, selectedDeviceType]);

  const getStockStatus = (item) => {
    if (item.quantity === 0) return { label: 'نفذ', color: 'red', icon: X };
    if (item.quantity <= item.min_quantity) return { label: 'منخفض', color: 'amber', icon: AlertTriangle };
    return { label: 'متوفر', color: 'green', icon: Check };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h3 className="text-white font-bold text-lg flex items-center gap-2">
            <Wrench className="w-5 h-5 text-amber-400" />
            إدارة قطع الغيار للصيانة
          </h3>
          <p className="text-slate-400 text-sm">تتبع وإدارة قطع الغيار المرتبطة بعمليات الصيانة</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="border-purple-500/50 text-purple-400"
            onClick={runAIAnalysis}
            disabled={isAnalyzing}
          >
            {isAnalyzing ? <RefreshCw className="w-4 h-4 ml-2 animate-spin" /> : <Brain className="w-4 h-4 ml-2" />}
            تحليل AI للمخزون
          </Button>
        </div>
      </div>

      {/* Low Stock Alerts */}
      {lowStockParts.length > 0 && (
        <Card className="glass-card border-red-500/30 bg-red-500/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <Bell className="w-5 h-5 text-red-400 animate-pulse" />
              <span className="text-red-300 font-medium">تنبيه: {lowStockParts.length} قطعة تحتاج إعادة طلب</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {lowStockParts.slice(0, 5).map(item => (
                <Badge 
                  key={item.id} 
                  className="bg-red-500/20 text-red-400 cursor-pointer hover:bg-red-500/30"
                  onClick={() => onCreateOrder?.(item)}
                >
                  {item.name} ({item.quantity}/{item.min_quantity})
                  <ShoppingCart className="w-3 h-3 mr-1" />
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'إجمالي القطع', value: sparePartsOnly.length, icon: Package, color: 'cyan' },
          { label: 'مخزون منخفض', value: lowStockParts.length, icon: AlertTriangle, color: 'red' },
          { label: 'قيمة المخزون', value: `${sparePartsOnly.reduce((s, i) => s + (i.quantity * i.unit_cost), 0).toLocaleString()} ر.س`, icon: DollarSign, color: 'green' },
          { label: 'الأكثر استخداماً', value: partsUsageStats[0]?.name || '-', icon: TrendingUp, color: 'purple' },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
              <CardContent className="p-4 flex items-center gap-4">
                <div className={`p-3 rounded-xl bg-${stat.color}-500/20`}>
                  <stat.icon className={`w-6 h-6 text-${stat.color}-400`} />
                </div>
                <div>
                  <p className="text-xl font-bold text-white truncate">{stat.value}</p>
                  <p className="text-xs text-slate-400">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-slate-800/50 border border-slate-700 p-1">
          <TabsTrigger value="overview" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400">
            <Package className="w-4 h-4 ml-2" />
            القطع
          </TabsTrigger>
          <TabsTrigger value="by-device" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
            <Link2 className="w-4 h-4 ml-2" />
            حسب الجهاز
          </TabsTrigger>
          <TabsTrigger value="usage" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400">
            <BarChart3 className="w-4 h-4 ml-2" />
            إحصائيات الاستخدام
          </TabsTrigger>
          <TabsTrigger value="reorder" className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400">
            <RefreshCw className="w-4 h-4 ml-2" />
            نقاط إعادة الطلب
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 mt-4">
          {/* Search & Filter */}
          <div className="flex gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="بحث بالاسم أو SKU..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-9 bg-slate-800/50 border-slate-700 text-white"
              />
            </div>
            <Select value={selectedDeviceType} onValueChange={setSelectedDeviceType}>
              <SelectTrigger className="w-40 bg-slate-800/50 border-slate-700 text-white">
                <SelectValue placeholder="نوع الجهاز" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="all">جميع الأجهزة</SelectItem>
                {deviceTypes.map(dt => (
                  <SelectItem key={dt.id} value={dt.id}>{dt.icon} {dt.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Parts List */}
          <div className="space-y-3">
            {filteredParts.map((item, i) => {
              const status = getStockStatus(item);
              const StatusIcon = status.icon;
              const stockPercent = Math.min(100, (item.quantity / (item.min_quantity * 2)) * 100);
              
              return (
                <motion.div key={item.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                  <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-center gap-4">
                          <div className={`p-3 rounded-xl bg-${status.color}-500/20`}>
                            <Wrench className={`w-6 h-6 text-${status.color}-400`} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="text-white font-bold">{item.name}</h4>
                              <Badge className={`bg-${status.color}-500/20 text-${status.color}-400`}>
                                <StatusIcon className="w-3 h-3 ml-1" />
                                {status.label}
                              </Badge>
                            </div>
                            <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                              <span>{item.sku}</span>
                              {item.compatible_devices?.length > 0 && (
                                <>
                                  <span>•</span>
                                  <span className="text-cyan-400">
                                    <Link2 className="w-3 h-3 inline ml-1" />
                                    {item.compatible_devices.length} جهاز متوافق
                                  </span>
                                </>
                              )}
                              <span>•</span>
                              <span>{item.supplier}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-6">
                          <div className="text-center">
                            <p className={`text-xl font-bold ${item.quantity <= item.min_quantity ? 'text-red-400' : 'text-white'}`}>
                              {item.quantity}
                            </p>
                            <p className="text-xs text-slate-500">{item.unit}</p>
                          </div>
                          
                          <div className="w-24">
                            <Progress value={stockPercent} className="h-2" />
                            <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                              <span>0</span>
                              <span>{item.min_quantity * 2}</span>
                            </div>
                          </div>

                          <div className="text-center">
                            <p className="text-white font-bold">{item.unit_cost} ر.س</p>
                            <p className="text-xs text-slate-500">للوحدة</p>
                          </div>

                          <div className="flex gap-1">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="border-cyan-500/50 text-cyan-400"
                              onClick={() => { setSelectedItem(item); setShowLinkDialog(true); }}
                            >
                              <Link2 className="w-3 h-3" />
                            </Button>
                            {item.quantity <= item.min_quantity && (
                              <Button 
                                size="sm" 
                                className="bg-amber-600 hover:bg-amber-700"
                                onClick={() => onCreateOrder?.(item)}
                              >
                                <ShoppingCart className="w-3 h-3 ml-1" />
                                طلب
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="by-device" className="space-y-4 mt-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {deviceTypes.map(device => {
              const compatibleParts = sparePartsOnly.filter(p => 
                p.compatible_devices?.includes(device.id) || p.category === device.id
              );
              const lowStock = compatibleParts.filter(p => p.quantity <= p.min_quantity);
              
              return (
                <Card key={device.id} className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-2xl">{device.icon}</span>
                      <div>
                        <h4 className="text-white font-bold">{device.name}</h4>
                        <p className="text-slate-400 text-sm">{compatibleParts.length} قطعة</p>
                      </div>
                    </div>
                    
                    {lowStock.length > 0 && (
                      <div className="p-2 bg-red-500/10 border border-red-500/30 rounded-lg mb-3">
                        <p className="text-red-400 text-xs">
                          <AlertTriangle className="w-3 h-3 inline ml-1" />
                          {lowStock.length} قطعة منخفضة
                        </p>
                      </div>
                    )}

                    <div className="space-y-2">
                      {compatibleParts.slice(0, 3).map(part => (
                        <div key={part.id} className="flex items-center justify-between text-sm">
                          <span className="text-slate-300">{part.name}</span>
                          <Badge className={part.quantity <= part.min_quantity ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}>
                            {part.quantity}
                          </Badge>
                        </div>
                      ))}
                      {compatibleParts.length > 3 && (
                        <p className="text-slate-500 text-xs text-center">+{compatibleParts.length - 3} قطعة أخرى</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="usage" className="space-y-4 mt-4">
          <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
            <CardHeader>
              <CardTitle className="text-white text-sm">أكثر القطع استخداماً في الصيانة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {partsUsageStats.slice(0, 10).map((stat, i) => (
                  <div key={stat.name} className="flex items-center gap-4">
                    <span className="text-slate-500 w-6">{i + 1}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-white">{stat.name}</span>
                        <span className="text-cyan-400 font-bold">{stat.totalUsed} وحدة</span>
                      </div>
                      <Progress value={(stat.totalUsed / (partsUsageStats[0]?.totalUsed || 1)) * 100} className="h-2" />
                    </div>
                    <span className="text-slate-500 text-sm">{stat.maintenanceCount} عملية</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reorder" className="space-y-4 mt-4">
          <div className="grid md:grid-cols-2 gap-4">
            {sparePartsOnly.map(item => {
              const monthsUntilStockout = item.avg_monthly_usage > 0 
                ? Math.floor(item.quantity / item.avg_monthly_usage) 
                : Infinity;
              const needsReorder = monthsUntilStockout <= 2;
              
              return (
                <Card key={item.id} className={`glass-card ${needsReorder ? 'border-amber-500/30' : 'border-indigo-500/20'} bg-[#0f1629]/80`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-white font-bold">{item.name}</h4>
                      {needsReorder && (
                        <Badge className="bg-amber-500/20 text-amber-400">
                          <AlertTriangle className="w-3 h-3 ml-1" />
                          يحتاج طلب
                        </Badge>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2 text-center mb-3">
                      <div className="p-2 bg-slate-800/50 rounded">
                        <p className="text-white font-bold">{item.quantity}</p>
                        <p className="text-slate-500 text-xs">الحالي</p>
                      </div>
                      <div className="p-2 bg-slate-800/50 rounded">
                        <p className="text-cyan-400 font-bold">{item.min_quantity}</p>
                        <p className="text-slate-500 text-xs">الحد الأدنى</p>
                      </div>
                      <div className="p-2 bg-slate-800/50 rounded">
                        <p className="text-purple-400 font-bold">{item.avg_monthly_usage || 0}</p>
                        <p className="text-slate-500 text-xs">شهرياً</p>
                      </div>
                    </div>

                    {monthsUntilStockout !== Infinity && (
                      <div className={`p-2 rounded-lg text-center ${monthsUntilStockout <= 1 ? 'bg-red-500/10' : monthsUntilStockout <= 2 ? 'bg-amber-500/10' : 'bg-green-500/10'}`}>
                        <p className={`text-sm ${monthsUntilStockout <= 1 ? 'text-red-400' : monthsUntilStockout <= 2 ? 'text-amber-400' : 'text-green-400'}`}>
                          <Clock className="w-3 h-3 inline ml-1" />
                          {monthsUntilStockout <= 0 ? 'نفذ!' : `يكفي لـ ${monthsUntilStockout} شهر`}
                        </p>
                      </div>
                    )}

                    {needsReorder && (
                      <Button 
                        className="w-full mt-3 bg-amber-600 hover:bg-amber-700"
                        onClick={() => onCreateOrder?.(item)}
                      >
                        <ShoppingCart className="w-4 h-4 ml-2" />
                        طلب إعادة تعبئة
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* Link to Device Dialog */}
      <Dialog open={showLinkDialog} onOpenChange={setShowLinkDialog}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Link2 className="w-5 h-5 text-cyan-400" />
              ربط القطعة بجهاز
            </DialogTitle>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-4 mt-4">
              <div className="p-3 bg-slate-800/50 rounded-lg">
                <p className="text-white font-medium">{selectedItem.name}</p>
                <p className="text-slate-400 text-sm">{selectedItem.sku}</p>
              </div>
              
              <div>
                <Label className="text-slate-300">اختر الأجهزة المتوافقة</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {deviceTypes.map(device => (
                    <Button
                      key={device.id}
                      variant="outline"
                      className={`border-slate-600 justify-start ${
                        selectedItem.compatible_devices?.includes(device.id) ? 'bg-cyan-500/20 border-cyan-500/50' : ''
                      }`}
                      onClick={() => {
                        const devices = selectedItem.compatible_devices || [];
                        const updated = devices.includes(device.id)
                          ? devices.filter(d => d !== device.id)
                          : [...devices, device.id];
                        onLinkToDevice?.(selectedItem.id, updated);
                        setSelectedItem({ ...selectedItem, compatible_devices: updated });
                      }}
                    >
                      <span className="ml-2">{device.icon}</span>
                      {device.name}
                    </Button>
                  ))}
                </div>
              </div>

              <Button className="w-full bg-cyan-600 hover:bg-cyan-700" onClick={() => setShowLinkDialog(false)}>
                <Check className="w-4 h-4 ml-2" />
                حفظ
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* AI Recommendations Dialog */}
      <Dialog open={showAIDialog} onOpenChange={setShowAIDialog}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-400" />
              توصيات AI للمخزون
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 mt-4">
            {/* Urgent Reorders */}
            {aiRecommendations.urgentReorders?.length > 0 && (
              <div>
                <h4 className="text-red-400 font-medium mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  طلبات عاجلة
                </h4>
                <div className="space-y-2">
                  {aiRecommendations.urgentReorders.map((item, i) => (
                    <Card key={i} className="bg-red-500/10 border-red-500/30">
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-white font-medium">{item.partName}</p>
                            <p className="text-red-300 text-sm">{item.reason}</p>
                          </div>
                          <div className="text-left">
                            <p className="text-slate-400 text-xs">الحالي: {item.currentQty}</p>
                            <p className="text-green-400 text-sm">المطلوب: {item.recommendedQty}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Optimal Levels */}
            {aiRecommendations.optimalLevels?.length > 0 && (
              <div>
                <h4 className="text-cyan-400 font-medium mb-3 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  مستويات مثالية مقترحة
                </h4>
                <div className="space-y-2">
                  {aiRecommendations.optimalLevels.map((item, i) => (
                    <div key={i} className="p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-white">{item.partName}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-slate-400">{item.currentMin}</span>
                          <span className="text-slate-500">→</span>
                          <span className="text-cyan-400 font-bold">{item.suggestedMin}</span>
                        </div>
                      </div>
                      <p className="text-slate-400 text-xs">{item.reasoning}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Cost Savings */}
            {aiRecommendations.costSavings?.length > 0 && (
              <div>
                <h4 className="text-green-400 font-medium mb-3 flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  فرص التوفير
                </h4>
                <div className="space-y-2">
                  {aiRecommendations.costSavings.map((item, i) => (
                    <div key={i} className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg flex items-center justify-between">
                      <span className="text-white">{item.suggestion}</span>
                      <Badge className="bg-green-500/20 text-green-400">{item.estimatedSaving}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}