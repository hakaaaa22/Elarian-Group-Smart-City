import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Package, Plus, Search, Filter, Download, AlertTriangle, Check,
  X, Edit, Trash2, Eye, ShoppingCart, TrendingDown, TrendingUp,
  Boxes, Wrench, Zap, Shield, Thermometer, BarChart3, Bell,
  Truck, Clock, DollarSign, RefreshCw, MapPin, Activity, History,
  Car, FileText
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
import AdvancedSearch from '@/components/common/AdvancedSearch';
import Pagination from '@/components/common/Pagination';
import InventoryIntegrationWidget from '@/components/inventory/InventoryIntegrationWidget';
import InventoryReportsAdvanced from '@/components/inventory/InventoryReportsAdvanced';
import AIInventoryForecasting from '@/components/inventory/AIInventoryForecasting';
import AIPartsLifecycle from '@/components/inventory/AIPartsLifecycle';
import AISupplierManagement from '@/components/suppliers/AISupplierManagement';
import AIStockPrediction from '@/components/inventory/AIStockPrediction';
import SparePartsManagement from '@/components/inventory/SparePartsManagement';
import { toast } from 'sonner';

const categories = [
  { id: 'spare_parts', name: 'قطع غيار', icon: Wrench, color: 'amber' },
  { id: 'consumables', name: 'مستهلكات', icon: Boxes, color: 'green' },
  { id: 'tools', name: 'أدوات', icon: Wrench, color: 'blue' },
  { id: 'electronics', name: 'إلكترونيات', icon: Zap, color: 'purple' },
  { id: 'hvac', name: 'تكييف', icon: Thermometer, color: 'cyan' },
  { id: 'security', name: 'أمان', icon: Shield, color: 'red' },
];

const mockItems = [
  { id: 1, name: 'فلتر مكيف سبليت', sku: 'AC-FLT-001', category: 'hvac', quantity: 25, min_quantity: 10, unit: 'قطعة', unit_cost: 50, supplier: 'شركة التبريد', location: 'مستودع أ - رف A3', status: 'in_stock', avg_monthly_usage: 8, last_used: '2024-12-01', usage_trend: 'stable' },
  { id: 2, name: 'بطارية كاميرا', sku: 'CAM-BAT-001', category: 'security', quantity: 8, min_quantity: 15, unit: 'قطعة', unit_cost: 120, supplier: 'شركة الأمان', location: 'مستودع ب - رف B1', status: 'low_stock', avg_monthly_usage: 5, last_used: '2024-12-03', usage_trend: 'increasing' },
  { id: 3, name: 'حساس حركة', sku: 'SEC-MOT-001', category: 'security', quantity: 0, min_quantity: 5, unit: 'قطعة', unit_cost: 85, supplier: 'شركة الأمان', location: 'مستودع ب - رف B2', status: 'out_of_stock', avg_monthly_usage: 3, last_used: '2024-11-28', usage_trend: 'stable' },
  { id: 4, name: 'كابل شبكة Cat6', sku: 'NET-CAB-001', category: 'electronics', quantity: 500, min_quantity: 100, unit: 'متر', unit_cost: 2, supplier: 'شركة الشبكات', location: 'مستودع أ - رف A1', status: 'in_stock', avg_monthly_usage: 50, last_used: '2024-12-02', usage_trend: 'stable' },
  { id: 5, name: 'مفتاح ذكي', sku: 'SMT-KEY-001', category: 'electronics', quantity: 12, min_quantity: 10, unit: 'قطعة', unit_cost: 150, supplier: 'شركة الأتمتة', location: 'مستودع ج - رف C1', status: 'in_stock', avg_monthly_usage: 2, last_used: '2024-11-20', usage_trend: 'decreasing' },
  { id: 6, name: 'زيت محرك', sku: 'VEH-OIL-001', category: 'consumables', quantity: 3, min_quantity: 10, unit: 'لتر', unit_cost: 45, supplier: 'شركة الزيوت', location: 'مستودع د - رف D1', status: 'low_stock', avg_monthly_usage: 12, last_used: '2024-12-04', usage_trend: 'increasing' },
];

const mockUsageLog = [
  { id: 1, item_name: 'فلتر مكيف سبليت', quantity_used: 2, usage_type: 'maintenance', reference_name: 'صيانة مكيف غرفة المعيشة', date: '2024-12-01', used_by: 'محمد أحمد' },
  { id: 2, item_name: 'زيت محرك', quantity_used: 5, usage_type: 'vehicle', reference_name: 'سيارة النقل #3', date: '2024-12-04', used_by: 'عبدالله محمد' },
  { id: 3, item_name: 'بطارية كاميرا', quantity_used: 1, usage_type: 'maintenance', reference_name: 'كاميرا الحديقة', date: '2024-12-03', used_by: 'خالد العلي' },
];

const mockOrders = [
  { id: 1, order_number: 'ORD-2024-001', items: [{ item_name: 'بطارية كاميرا', quantity: 20 }], status: 'ordered', priority: 'high', total_cost: 2400, expected_delivery: '2024-12-10' },
  { id: 2, order_number: 'ORD-2024-002', items: [{ item_name: 'حساس حركة', quantity: 15 }], status: 'pending', priority: 'urgent', total_cost: 1275, expected_delivery: '2024-12-08' },
  { id: 3, order_number: 'ORD-2024-003', items: [{ item_name: 'زيت محرك', quantity: 20 }], status: 'delivered', priority: 'medium', total_cost: 900, actual_delivery: '2024-12-01' },
];

const statusColors = {
  in_stock: 'bg-green-500/20 text-green-400',
  low_stock: 'bg-amber-500/20 text-amber-400',
  out_of_stock: 'bg-red-500/20 text-red-400',
  ordered: 'bg-blue-500/20 text-blue-400',
};

const orderStatusColors = {
  pending: 'bg-slate-500/20 text-slate-400',
  approved: 'bg-blue-500/20 text-blue-400',
  ordered: 'bg-purple-500/20 text-purple-400',
  shipped: 'bg-cyan-500/20 text-cyan-400',
  delivered: 'bg-green-500/20 text-green-400',
  cancelled: 'bg-red-500/20 text-red-400',
};

export default function InventoryManagement() {
  const [activeTab, setActiveTab] = useState('items');
  const [items, setItems] = useState(mockItems);
  const [orders, setOrders] = useState(mockOrders);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showItemDialog, setShowItemDialog] = useState(false);
  const [showOrderDialog, setShowOrderDialog] = useState(false);
  const [showUsageDialog, setShowUsageDialog] = useState(false);
  const [showItemDetailDialog, setShowItemDetailDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [usageLog, setUsageLog] = useState(mockUsageLog);
  const [newUsage, setNewUsage] = useState({
    item_id: '', item_name: '', quantity_used: 1, usage_type: 'maintenance', reference_name: '', used_by: ''
  });

  const [newItem, setNewItem] = useState({
    name: '', sku: '', category: 'spare_parts', quantity: 0,
    min_quantity: 5, unit: 'قطعة', unit_cost: 0, supplier: '', location: ''
  });

  const itemFilters = [
    { id: 'category', label: 'الفئة', type: 'select', options: categories.map(c => ({ value: c.id, label: c.name })) },
    { id: 'status', label: 'الحالة', type: 'select', options: [
      { value: 'in_stock', label: 'متوفر' },
      { value: 'low_stock', label: 'منخفض' },
      { value: 'out_of_stock', label: 'نفذ' },
    ]},
    { id: 'supplier', label: 'المورد', type: 'text', placeholder: 'اسم المورد' },
    { id: 'location', label: 'الموقع', type: 'text', placeholder: 'موقع التخزين' },
  ];

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesSearch = item.name.includes(searchQuery) || item.sku.includes(searchQuery);
      const matchesCategory = !activeFilters.category || activeFilters.category === 'all' || item.category === activeFilters.category;
      const matchesStatus = !activeFilters.status || activeFilters.status === 'all' || item.status === activeFilters.status;
      const matchesSupplier = !activeFilters.supplier || item.supplier?.includes(activeFilters.supplier);
      const matchesLocation = !activeFilters.location || item.location?.includes(activeFilters.location);
      return matchesSearch && matchesCategory && matchesStatus && matchesSupplier && matchesLocation;
    });
  }, [items, searchQuery, activeFilters]);

  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredItems.slice(start, start + pageSize);
  }, [filteredItems, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredItems.length / pageSize);

  const stats = {
    total: items.length,
    lowStock: items.filter(i => i.status === 'low_stock').length,
    outOfStock: items.filter(i => i.status === 'out_of_stock').length,
    totalValue: items.reduce((sum, i) => sum + (i.quantity * i.unit_cost), 0),
  };

  const lowStockAlerts = items.filter(i => i.quantity <= i.min_quantity);

  const handleFilterChange = (filterId, value) => {
    setActiveFilters(prev => ({ ...prev, [filterId]: value }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setActiveFilters({});
    setSearchQuery('');
    setCurrentPage(1);
  };

  const createItem = () => {
    if (!newItem.name) {
      toast.error('يرجى إدخال اسم القطعة');
      return;
    }
    const item = {
      ...newItem,
      id: Date.now(),
      sku: `SKU-${Date.now()}`,
      status: newItem.quantity > newItem.min_quantity ? 'in_stock' : newItem.quantity > 0 ? 'low_stock' : 'out_of_stock'
    };
    setItems([item, ...items]);
    setShowItemDialog(false);
    setNewItem({ name: '', sku: '', category: 'spare_parts', quantity: 0, min_quantity: 5, unit: 'قطعة', unit_cost: 0, supplier: '', location: '' });
    toast.success('تم إضافة القطعة');
  };

  const createOrder = (item) => {
    const order = {
      id: Date.now(),
      order_number: `ORD-2024-${String(orders.length + 1).padStart(3, '0')}`,
      items: [{ item_id: item.id, item_name: item.name, quantity: item.min_quantity * 2, unit_cost: item.unit_cost }],
      status: 'pending',
      priority: item.status === 'out_of_stock' ? 'urgent' : 'high',
      total_cost: item.min_quantity * 2 * item.unit_cost,
      supplier: item.supplier
    };
    setOrders([order, ...orders]);
    toast.success('تم إنشاء طلب الشراء');
  };

  const updateOrderStatus = (orderId, status) => {
    setOrders(orders.map(o => o.id === orderId ? { ...o, status } : o));
    toast.success('تم تحديث حالة الطلب');
  };

  const getCategoryConfig = (catId) => categories.find(c => c.id === catId) || categories[0];

  return (
    <div className="min-h-screen p-4 lg:p-6 space-y-6" dir="rtl">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white flex items-center gap-3">
              <Package className="w-8 h-8 text-cyan-400" />
              إدارة المخزون
            </h1>
            <p className="text-slate-400 mt-1">تتبع قطع الغيار والمواد اللازمة للصيانة</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="border-slate-600">
              <Download className="w-4 h-4 ml-2" />
              تصدير
            </Button>
            <Button className="bg-cyan-600 hover:bg-cyan-700" onClick={() => setShowItemDialog(true)}>
              <Plus className="w-4 h-4 ml-2" />
              إضافة قطعة
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Low Stock Alerts */}
      {lowStockAlerts.length > 0 && (
        <Card className="glass-card border-amber-500/30 bg-amber-500/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <Bell className="w-5 h-5 text-amber-400" />
              <span className="text-amber-300 font-medium">تنبيهات انخفاض المخزون ({lowStockAlerts.length})</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {lowStockAlerts.slice(0, 5).map(item => (
                <Badge key={item.id} className="bg-amber-500/20 text-amber-400 cursor-pointer" onClick={() => createOrder(item)}>
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
          { label: 'إجمالي الأصناف', value: stats.total, icon: Package, color: 'cyan' },
          { label: 'مخزون منخفض', value: stats.lowStock, icon: TrendingDown, color: 'amber' },
          { label: 'نفذ المخزون', value: stats.outOfStock, icon: AlertTriangle, color: 'red' },
          { label: 'قيمة المخزون', value: `${stats.totalValue.toLocaleString()} ر.س`, icon: DollarSign, color: 'green' },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
              <CardContent className="p-4 flex items-center gap-4">
                <div className={`p-3 rounded-xl bg-${stat.color}-500/20`}>
                  <stat.icon className={`w-6 h-6 text-${stat.color}-400`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                  <p className="text-xs text-slate-400">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-slate-800/50 border border-slate-700 p-1">
          <TabsTrigger value="items" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
            <Boxes className="w-4 h-4 ml-2" />
            المخزون
          </TabsTrigger>
          <TabsTrigger value="orders" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400">
            <ShoppingCart className="w-4 h-4 ml-2" />
            الطلبات ({orders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled').length})
          </TabsTrigger>
          <TabsTrigger value="usage" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400">
            <History className="w-4 h-4 ml-2" />
            سجل الاستخدام
          </TabsTrigger>
          <TabsTrigger value="integration" className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400">
            <Wrench className="w-4 h-4 ml-2" />
            التكامل الذكي
          </TabsTrigger>
          <TabsTrigger value="reports" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400">
            <BarChart3 className="w-4 h-4 ml-2" />
            التقارير
          </TabsTrigger>
          <TabsTrigger value="ai-forecast" className="data-[state=active]:bg-pink-500/20 data-[state=active]:text-pink-400">
            <TrendingUp className="w-4 h-4 ml-2" />
            التنبؤ الذكي
          </TabsTrigger>
          <TabsTrigger value="lifecycle" className="data-[state=active]:bg-orange-500/20 data-[state=active]:text-orange-400">
            <Activity className="w-4 h-4 ml-2" />
            دورة الحياة
          </TabsTrigger>
          <TabsTrigger value="suppliers" className="data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-400">
            <Truck className="w-4 h-4 ml-2" />
            الموردين
          </TabsTrigger>
          <TabsTrigger value="stock-prediction" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400">
            <AlertTriangle className="w-4 h-4 ml-2" />
            تنبؤ النقص
          </TabsTrigger>
          <TabsTrigger value="spare-parts" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400">
            <Wrench className="w-4 h-4 ml-2" />
            قطع الصيانة
          </TabsTrigger>
        </TabsList>

        <TabsContent value="items" className="space-y-4 mt-4">
          <AdvancedSearch
            searchQuery={searchQuery}
            onSearchChange={(v) => { setSearchQuery(v); setCurrentPage(1); }}
            filters={itemFilters}
            activeFilters={activeFilters}
            onFilterChange={handleFilterChange}
            onClearFilters={clearFilters}
            placeholder="بحث بالاسم أو رقم المخزون..."
          />

          <div className="space-y-3">
            {paginatedItems.map((item, i) => {
              const cat = getCategoryConfig(item.category);
              const CatIcon = cat.icon;
              const stockPercent = Math.min(100, (item.quantity / (item.min_quantity * 2)) * 100);
              return (
                <motion.div key={item.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                  <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-center gap-4">
                          <div className={`p-3 rounded-xl bg-${cat.color}-500/20`}>
                            <CatIcon className={`w-6 h-6 text-${cat.color}-400`} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-white font-bold">{item.name}</h3>
                              <Badge className={statusColors[item.status]}>
                                {item.status === 'in_stock' ? 'متوفر' : item.status === 'low_stock' ? 'منخفض' : 'نفذ'}
                              </Badge>
                            </div>
                            <div className="flex flex-wrap gap-3 text-xs text-slate-500">
                              <span>{item.sku}</span>
                              <span>•</span>
                              <span>{cat.name}</span>
                              <span>•</span>
                              <span>{item.location}</span>
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
                            <p className="text-xs text-slate-500 mt-1">الحد الأدنى: {item.min_quantity}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-white font-bold">{item.unit_cost} ر.س</p>
                            <p className="text-xs text-slate-500">للوحدة</p>
                          </div>
                          <div className="flex gap-1">
                            {item.quantity <= item.min_quantity && (
                              <Button size="sm" className="bg-amber-600 hover:bg-amber-700" onClick={() => createOrder(item)}>
                                <ShoppingCart className="w-3 h-3 ml-1" />
                                طلب
                              </Button>
                            )}
                            <Button size="sm" variant="ghost" onClick={() => { setSelectedItem(item); setShowItemDetailDialog(true); }}>
                              <Eye className="w-4 h-4 text-slate-400" />
                            </Button>
                            <Button size="sm" variant="ghost"><Edit className="w-4 h-4 text-slate-400" /></Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredItems.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={(size) => { setPageSize(size); setCurrentPage(1); }}
          />
        </TabsContent>

        <TabsContent value="orders" className="space-y-4 mt-4">
          <div className="space-y-3">
            {orders.map((order, i) => (
              <motion.div key={order.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-white font-bold">{order.order_number}</h3>
                          <Badge className={orderStatusColors[order.status]}>
                            {order.status === 'pending' ? 'قيد الانتظار' : order.status === 'ordered' ? 'تم الطلب' : order.status === 'shipped' ? 'قيد الشحن' : order.status === 'delivered' ? 'تم التسليم' : order.status}
                          </Badge>
                          <Badge className={`${order.priority === 'urgent' ? 'bg-red-500/20 text-red-400' : order.priority === 'high' ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-500/20 text-slate-400'}`}>
                            {order.priority === 'urgent' ? 'عاجل' : order.priority === 'high' ? 'عالي' : 'عادي'}
                          </Badge>
                        </div>
                        <p className="text-slate-400 text-sm">{order.items.map(i => `${i.item_name} (${i.quantity})`).join(', ')}</p>
                        <div className="flex gap-4 mt-2 text-xs text-slate-500">
                          <span><DollarSign className="w-3 h-3 inline" /> {order.total_cost} ر.س</span>
                          {order.expected_delivery && <span><Truck className="w-3 h-3 inline" /> متوقع: {order.expected_delivery}</span>}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {order.status === 'pending' && (
                          <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={() => updateOrderStatus(order.id, 'ordered')}>
                            <Check className="w-3 h-3 ml-1" />اعتماد
                          </Button>
                        )}
                        {order.status === 'ordered' && (
                          <Button size="sm" className="bg-cyan-600 hover:bg-cyan-700" onClick={() => updateOrderStatus(order.id, 'shipped')}>
                            <Truck className="w-3 h-3 ml-1" />شُحن
                          </Button>
                        )}
                        {order.status === 'shipped' && (
                          <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => updateOrderStatus(order.id, 'delivered')}>
                            <Check className="w-3 h-3 ml-1" />تم التسليم
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="usage" className="space-y-4 mt-4">
          <div className="flex justify-between items-center">
            <h3 className="text-white font-medium">سجل استخدام المخزون</h3>
            <Button className="bg-amber-600 hover:bg-amber-700" onClick={() => setShowUsageDialog(true)}>
              <Plus className="w-4 h-4 ml-2" />
              تسجيل استخدام
            </Button>
          </div>
          <div className="space-y-3">
            {usageLog.map((log, i) => {
              const typeConfig = {
                maintenance: { label: 'صيانة', color: 'amber', icon: Wrench },
                vehicle: { label: 'مركبة', color: 'cyan', icon: Car },
                contract: { label: 'عقد', color: 'purple', icon: FileText },
              }[log.usage_type] || { label: 'أخرى', color: 'slate', icon: Package };
              const TypeIcon = typeConfig.icon;
              return (
                <motion.div key={log.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                  <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`p-3 rounded-xl bg-${typeConfig.color}-500/20`}>
                            <TypeIcon className={`w-5 h-5 text-${typeConfig.color}-400`} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-white font-bold">{log.item_name}</h3>
                              <Badge className={`bg-${typeConfig.color}-500/20 text-${typeConfig.color}-400`}>
                                {typeConfig.label}
                              </Badge>
                            </div>
                            <p className="text-slate-400 text-sm">مرتبط بـ: {log.reference_name}</p>
                            <div className="flex gap-4 mt-1 text-xs text-slate-500">
                              <span><Clock className="w-3 h-3 inline" /> {log.date}</span>
                              <span>بواسطة: {log.used_by}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-left">
                          <p className="text-xl font-bold text-red-400">-{log.quantity_used}</p>
                          <p className="text-slate-500 text-xs">وحدة مستخدمة</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="integration" className="space-y-4 mt-4">
          <InventoryIntegrationWidget 
            items={items}
            onOrderPart={(order) => {
              const newOrder = {
                id: Date.now(),
                order_number: `ORD-2024-${String(orders.length + 1).padStart(3, '0')}`,
                items: [order],
                status: 'pending',
                priority: order.priority,
                total_cost: order.quantity * order.unit_cost
              };
              setOrders([newOrder, ...orders]);
            }}
            onLinkToMaintenance={(link) => {
              const log = {
                id: Date.now(),
                item_name: link.item_name,
                quantity_used: link.quantity,
                usage_type: 'maintenance',
                reference_name: link.reference,
                date: new Date().toISOString().split('T')[0],
                used_by: 'النظام'
              };
              setUsageLog([log, ...usageLog]);
              setItems(items.map(i => i.id === Number(link.item_id) ? {
                ...i,
                quantity: i.quantity - link.quantity,
                status: i.quantity - link.quantity <= i.min_quantity ? 
                  (i.quantity - link.quantity <= 0 ? 'out_of_stock' : 'low_stock') : 'in_stock'
              } : i));
            }}
            onLinkToVehicle={(link) => {
              const log = {
                id: Date.now(),
                item_name: link.item_name,
                quantity_used: link.quantity,
                usage_type: 'vehicle',
                reference_name: link.reference,
                date: new Date().toISOString().split('T')[0],
                used_by: 'النظام'
              };
              setUsageLog([log, ...usageLog]);
              setItems(items.map(i => i.id === Number(link.item_id) ? {
                ...i,
                quantity: i.quantity - link.quantity,
                status: i.quantity - link.quantity <= i.min_quantity ? 
                  (i.quantity - link.quantity <= 0 ? 'out_of_stock' : 'low_stock') : 'in_stock'
              } : i));
            }}
            maintenanceRecords={[]}
            vehicleExpenses={[]}
          />
        </TabsContent>

        <TabsContent value="reports" className="mt-4">
          <InventoryReportsAdvanced items={items} usageLog={usageLog} />
        </TabsContent>

        <TabsContent value="ai-forecast" className="mt-4">
          <AIInventoryForecasting items={items} />
        </TabsContent>

        <TabsContent value="lifecycle" className="mt-4">
          <AIPartsLifecycle 
            inventoryItems={items}
            onScheduleMaintenance={(pred) => toast.success(`تم جدولة صيانة: ${pred.device}`)}
            onOrderParts={(pred) => {
              const order = {
                id: Date.now(),
                order_number: `ORD-2024-${String(orders.length + 1).padStart(3, '0')}`,
                items: [{ item_name: pred.part, quantity: 1, unit_cost: pred.estimatedCost }],
                status: 'pending',
                priority: pred.impact === 'critical' ? 'urgent' : 'high',
                total_cost: pred.estimatedCost
              };
              setOrders([order, ...orders]);
              toast.success('تم إنشاء طلب شراء');
            }}
          />
        </TabsContent>

        <TabsContent value="suppliers" className="mt-4">
          <AISupplierManagement inventoryItems={items} />
        </TabsContent>

        <TabsContent value="stock-prediction" className="mt-4">
          <AIStockPrediction 
            items={items}
            onCreateOrder={(pred) => {
              const order = {
                id: Date.now(),
                order_number: `ORD-2024-${String(orders.length + 1).padStart(3, '0')}`,
                items: [{ item_name: pred.name, quantity: pred.avgMonthlyUsage * 2 }],
                status: 'pending',
                priority: pred.riskLevel === 'critical' ? 'urgent' : 'high',
                total_cost: 0
              };
              setOrders([order, ...orders]);
              toast.success('تم إنشاء طلب شراء');
            }}
            onScheduleMaintenance={(corr) => {
              toast.success(`تم جدولة صيانة استباقية لـ ${corr.device}`);
            }}
          />
        </TabsContent>

        <TabsContent value="spare-parts" className="mt-4">
          <SparePartsManagement 
            items={items}
            maintenanceRecords={[]}
            onCreateOrder={(item) => {
              const order = {
                id: Date.now(),
                order_number: `ORD-2024-${String(orders.length + 1).padStart(3, '0')}`,
                items: [{ item_id: item.id, item_name: item.name, quantity: item.min_quantity * 2, unit_cost: item.unit_cost }],
                status: 'pending',
                priority: item.status === 'out_of_stock' ? 'urgent' : 'high',
                total_cost: item.min_quantity * 2 * item.unit_cost,
                supplier: item.supplier
              };
              setOrders([order, ...orders]);
              toast.success('تم إنشاء طلب الشراء');
            }}
            onUpdateItem={(id, data) => {
              setItems(items.map(i => i.id === id ? { ...i, ...data } : i));
            }}
            onLinkToDevice={(itemId, devices) => {
              setItems(items.map(i => i.id === itemId ? { ...i, compatible_devices: devices } : i));
              toast.success('تم ربط القطعة بالأجهزة');
            }}
          />
        </TabsContent>
      </Tabs>

      {/* Usage Dialog */}
      <Dialog open={showUsageDialog} onOpenChange={setShowUsageDialog}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-amber-400" />
              تسجيل استخدام
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label className="text-slate-300">القطعة *</Label>
              <Select value={newUsage.item_id} onValueChange={(v) => {
                const item = items.find(i => i.id === Number(v));
                setNewUsage({ ...newUsage, item_id: v, item_name: item?.name || '' });
              }}>
                <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white mt-1"><SelectValue placeholder="اختر" /></SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  {items.filter(i => i.quantity > 0).map(i => <SelectItem key={i.id} value={String(i.id)}>{i.name} ({i.quantity})</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-slate-300">الكمية</Label>
                <Input type="number" min="1" value={newUsage.quantity_used} onChange={(e) => setNewUsage({ ...newUsage, quantity_used: Number(e.target.value) })} className="bg-slate-800/50 border-slate-700 text-white mt-1" />
              </div>
              <div>
                <Label className="text-slate-300">نوع الاستخدام</Label>
                <Select value={newUsage.usage_type} onValueChange={(v) => setNewUsage({ ...newUsage, usage_type: v })}>
                  <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="maintenance">صيانة</SelectItem>
                    <SelectItem value="vehicle">مركبة</SelectItem>
                    <SelectItem value="contract">عقد</SelectItem>
                    <SelectItem value="other">أخرى</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label className="text-slate-300">مرتبط بـ</Label>
              <Input value={newUsage.reference_name} onChange={(e) => setNewUsage({ ...newUsage, reference_name: e.target.value })} placeholder="اسم الجهاز/المركبة/العقد" className="bg-slate-800/50 border-slate-700 text-white mt-1" />
            </div>
            <div>
              <Label className="text-slate-300">المستخدم</Label>
              <Input value={newUsage.used_by} onChange={(e) => setNewUsage({ ...newUsage, used_by: e.target.value })} className="bg-slate-800/50 border-slate-700 text-white mt-1" />
            </div>
            <Button className="w-full bg-amber-600 hover:bg-amber-700" onClick={() => {
              if (!newUsage.item_name) { toast.error('يرجى اختيار القطعة'); return; }
              const log = { ...newUsage, id: Date.now(), date: new Date().toISOString().split('T')[0] };
              setUsageLog([log, ...usageLog]);
              setItems(items.map(i => i.id === Number(newUsage.item_id) ? { ...i, quantity: i.quantity - newUsage.quantity_used, status: i.quantity - newUsage.quantity_used <= i.min_quantity ? (i.quantity - newUsage.quantity_used <= 0 ? 'out_of_stock' : 'low_stock') : 'in_stock' } : i));
              setShowUsageDialog(false);
              setNewUsage({ item_id: '', item_name: '', quantity_used: 1, usage_type: 'maintenance', reference_name: '', used_by: '' });
              toast.success('تم تسجيل الاستخدام');
            }}>
              <Check className="w-4 h-4 ml-2" />
              تسجيل
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Item Detail Dialog */}
      <Dialog open={showItemDetailDialog} onOpenChange={setShowItemDetailDialog}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Package className="w-5 h-5 text-cyan-400" />
              تفاصيل القطعة
            </DialogTitle>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-4 mt-4">
              <div className="p-4 bg-slate-800/50 rounded-lg">
                <h3 className="text-white font-bold text-lg mb-2">{selectedItem.name}</h3>
                <p className="text-slate-400 text-sm font-mono">{selectedItem.sku}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-800/30 rounded-lg">
                  <p className="text-slate-400 text-xs">الموقع</p>
                  <p className="text-white flex items-center gap-1"><MapPin className="w-3 h-3" />{selectedItem.location}</p>
                </div>
                <div className="p-3 bg-slate-800/30 rounded-lg">
                  <p className="text-slate-400 text-xs">المورد</p>
                  <p className="text-white">{selectedItem.supplier}</p>
                </div>
                <div className="p-3 bg-slate-800/30 rounded-lg">
                  <p className="text-slate-400 text-xs">متوسط الاستخدام الشهري</p>
                  <p className="text-cyan-400 font-bold">{selectedItem.avg_monthly_usage} {selectedItem.unit}</p>
                </div>
                <div className="p-3 bg-slate-800/30 rounded-lg">
                  <p className="text-slate-400 text-xs">اتجاه الاستخدام</p>
                  <p className={`flex items-center gap-1 ${selectedItem.usage_trend === 'increasing' ? 'text-red-400' : selectedItem.usage_trend === 'decreasing' ? 'text-green-400' : 'text-slate-400'}`}>
                    {selectedItem.usage_trend === 'increasing' ? <TrendingUp className="w-3 h-3" /> : selectedItem.usage_trend === 'decreasing' ? <TrendingDown className="w-3 h-3" /> : <Activity className="w-3 h-3" />}
                    {selectedItem.usage_trend === 'increasing' ? 'متزايد' : selectedItem.usage_trend === 'decreasing' ? 'متناقص' : 'مستقر'}
                  </p>
                </div>
              </div>
              {selectedItem.avg_monthly_usage > 0 && (
                <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                  <p className="text-amber-300 text-sm font-medium mb-1">توقع نفاد المخزون</p>
                  <p className="text-white">
                    خلال {Math.floor(selectedItem.quantity / selectedItem.avg_monthly_usage)} شهر تقريباً
                    {selectedItem.quantity / selectedItem.avg_monthly_usage < 2 && <span className="text-red-400 mr-2">(قريباً!)</span>}
                  </p>
                </div>
              )}
              <div>
                <p className="text-slate-400 text-xs mb-2">آخر استخدامات</p>
                <div className="space-y-2">
                  {usageLog.filter(l => l.item_name === selectedItem.name).slice(0, 3).map(log => (
                    <div key={log.id} className="flex items-center justify-between p-2 bg-slate-800/30 rounded text-sm">
                      <span className="text-white">{log.reference_name}</span>
                      <span className="text-slate-400">{log.date}</span>
                      <span className="text-red-400">-{log.quantity_used}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Item Dialog */}
      <Dialog open={showItemDialog} onOpenChange={setShowItemDialog}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Package className="w-5 h-5 text-cyan-400" />
              إضافة قطعة جديدة
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-slate-300">اسم القطعة *</Label>
                <Input value={newItem.name} onChange={(e) => setNewItem({ ...newItem, name: e.target.value })} className="bg-slate-800/50 border-slate-700 text-white mt-1" />
              </div>
              <div>
                <Label className="text-slate-300">الفئة</Label>
                <Select value={newItem.category} onValueChange={(v) => setNewItem({ ...newItem, category: v })}>
                  <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label className="text-slate-300">الكمية</Label>
                <Input type="number" value={newItem.quantity} onChange={(e) => setNewItem({ ...newItem, quantity: Number(e.target.value) })} className="bg-slate-800/50 border-slate-700 text-white mt-1" />
              </div>
              <div>
                <Label className="text-slate-300">الحد الأدنى</Label>
                <Input type="number" value={newItem.min_quantity} onChange={(e) => setNewItem({ ...newItem, min_quantity: Number(e.target.value) })} className="bg-slate-800/50 border-slate-700 text-white mt-1" />
              </div>
              <div>
                <Label className="text-slate-300">سعر الوحدة</Label>
                <Input type="number" value={newItem.unit_cost} onChange={(e) => setNewItem({ ...newItem, unit_cost: Number(e.target.value) })} className="bg-slate-800/50 border-slate-700 text-white mt-1" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-slate-300">المورد</Label>
                <Input value={newItem.supplier} onChange={(e) => setNewItem({ ...newItem, supplier: e.target.value })} className="bg-slate-800/50 border-slate-700 text-white mt-1" />
              </div>
              <div>
                <Label className="text-slate-300">موقع التخزين</Label>
                <Input value={newItem.location} onChange={(e) => setNewItem({ ...newItem, location: e.target.value })} className="bg-slate-800/50 border-slate-700 text-white mt-1" />
              </div>
            </div>
            <Button className="w-full bg-cyan-600 hover:bg-cyan-700" onClick={createItem}>
              <Plus className="w-4 h-4 ml-2" />
              إضافة القطعة
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}