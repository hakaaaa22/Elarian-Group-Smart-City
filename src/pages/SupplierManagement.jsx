import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Building2, Star, TrendingUp, TrendingDown, Clock, DollarSign,
  Package, CheckCircle, AlertTriangle, Mail, Phone, FileText,
  Search, Filter, BarChart3, Zap, Send, RefreshCw, Award,
  Plus, Eye, Edit, Trash2, ShoppingCart, Calendar, Truck
} from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import SupplierKPIDashboard from '@/components/suppliers/SupplierKPIDashboard';
import SupplierOrderTracker from '@/components/suppliers/SupplierOrderTracker';
import RFQManager from '@/components/suppliers/RFQManager';

// بيانات الموردين
const mockSuppliers = [
  {
    id: 1,
    name: 'شركة المستلزمات الصناعية',
    category: 'قطع غيار',
    email: 'orders@industrial-supplies.sa',
    phone: '+966 11 XXX XXXX',
    rating: 4.8,
    deliveryScore: 95,
    qualityScore: 92,
    priceScore: 85,
    totalOrders: 156,
    onTimeDelivery: 148,
    avgDeliveryDays: 3,
    avgResponseTime: '4 ساعات',
    lastOrder: '2024-12-01',
    status: 'preferred',
    totalSpend: 125000,
    products: ['فلاتر', 'محركات', 'حساسات']
  },
  {
    id: 2,
    name: 'مؤسسة التقنية المتقدمة',
    category: 'إلكترونيات',
    email: 'sales@advtech.sa',
    phone: '+966 12 XXX XXXX',
    rating: 4.5,
    deliveryScore: 88,
    qualityScore: 94,
    priceScore: 78,
    totalOrders: 89,
    onTimeDelivery: 78,
    avgDeliveryDays: 5,
    avgResponseTime: '8 ساعات',
    lastOrder: '2024-11-28',
    status: 'active',
    totalSpend: 89000,
    products: ['كاميرات', 'أجهزة استشعار', 'لوحات تحكم']
  },
  {
    id: 3,
    name: 'مصنع قطع الغيار الوطني',
    category: 'قطع غيار',
    email: 'info@national-parts.sa',
    phone: '+966 13 XXX XXXX',
    rating: 4.2,
    deliveryScore: 82,
    qualityScore: 88,
    priceScore: 92,
    totalOrders: 67,
    onTimeDelivery: 55,
    avgDeliveryDays: 7,
    avgResponseTime: '24 ساعة',
    lastOrder: '2024-11-15',
    status: 'active',
    totalSpend: 45000,
    products: ['بطاريات', 'كابلات', 'موصلات']
  }
];

// طلبات الشراء
const mockOrders = [
  { id: 1, orderNumber: 'PO-2024-001', supplier: 'شركة المستلزمات الصناعية', items: 5, total: 4500, status: 'delivered', date: '2024-12-01', deliveryDate: '2024-12-03' },
  { id: 2, orderNumber: 'PO-2024-002', supplier: 'مؤسسة التقنية المتقدمة', items: 3, total: 8200, status: 'shipped', date: '2024-12-02', expectedDate: '2024-12-06' },
  { id: 3, orderNumber: 'PO-2024-003', supplier: 'مصنع قطع الغيار الوطني', items: 8, total: 2100, status: 'pending', date: '2024-12-04', expectedDate: '2024-12-11' },
];

// طلبات عروض الأسعار
const mockRFQs = [
  { id: 1, rfqNumber: 'RFQ-2024-001', title: 'قطع غيار مكيفات', suppliers: 3, responses: 2, deadline: '2024-12-10', status: 'open' },
  { id: 2, rfqNumber: 'RFQ-2024-002', title: 'بطاريات كاميرات أمنية', suppliers: 2, responses: 2, deadline: '2024-12-05', status: 'closed' },
];

const COLORS = ['#22d3ee', '#a855f7', '#f59e0b', '#22c55e'];

export default function SupplierManagement() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [suppliers, setSuppliers] = useState(mockSuppliers);
  const [orders, setOrders] = useState(mockOrders);
  const [rfqs, setRFQs] = useState(mockRFQs);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [showSupplierDialog, setShowSupplierDialog] = useState(false);
  const [showRFQDialog, setShowRFQDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [newRFQ, setNewRFQ] = useState({
    title: '',
    description: '',
    items: '',
    deadline: '',
    selectedSuppliers: []
  });

  // إحصائيات
  const stats = useMemo(() => ({
    totalSuppliers: suppliers.length,
    preferredSuppliers: suppliers.filter(s => s.status === 'preferred').length,
    avgRating: (suppliers.reduce((sum, s) => sum + s.rating, 0) / suppliers.length).toFixed(1),
    totalSpend: suppliers.reduce((sum, s) => sum + s.totalSpend, 0),
    pendingOrders: orders.filter(o => o.status === 'pending' || o.status === 'shipped').length
  }), [suppliers, orders]);

  // بيانات الرسم البياني
  const performanceData = suppliers.map(s => ({
    name: s.name.split(' ').slice(0, 2).join(' '),
    delivery: s.deliveryScore,
    quality: s.qualityScore,
    price: s.priceScore
  }));

  const spendByCategory = [
    { name: 'قطع غيار', value: 170000 },
    { name: 'إلكترونيات', value: 89000 },
    { name: 'مستهلكات', value: 35000 },
  ];

  const statusColors = {
    preferred: 'bg-green-500/20 text-green-400',
    active: 'bg-blue-500/20 text-blue-400',
    under_review: 'bg-amber-500/20 text-amber-400',
    inactive: 'bg-slate-500/20 text-slate-400'
  };

  const orderStatusColors = {
    pending: 'bg-slate-500/20 text-slate-400',
    confirmed: 'bg-blue-500/20 text-blue-400',
    shipped: 'bg-cyan-500/20 text-cyan-400',
    delivered: 'bg-green-500/20 text-green-400',
    cancelled: 'bg-red-500/20 text-red-400'
  };

  const sendRFQ = () => {
    if (!newRFQ.title || !newRFQ.items) {
      toast.error('يرجى إدخال البيانات المطلوبة');
      return;
    }
    const rfq = {
      id: Date.now(),
      rfqNumber: `RFQ-2024-${String(rfqs.length + 1).padStart(3, '0')}`,
      title: newRFQ.title,
      suppliers: newRFQ.selectedSuppliers.length || 3,
      responses: 0,
      deadline: newRFQ.deadline,
      status: 'open'
    };
    setRFQs([rfq, ...rfqs]);
    setShowRFQDialog(false);
    setNewRFQ({ title: '', description: '', items: '', deadline: '', selectedSuppliers: [] });
    toast.success('تم إرسال طلب عرض السعر');
  };

  const filteredSuppliers = suppliers.filter(s => 
    s.name.includes(searchQuery) || s.category.includes(searchQuery)
  );

  return (
    <div className="min-h-screen p-4 lg:p-6 space-y-6" dir="rtl">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white flex items-center gap-3">
              <Building2 className="w-8 h-8 text-purple-400" />
              إدارة الموردين
            </h1>
            <p className="text-slate-400 mt-1">تتبع الأداء وإدارة الطلبات وعروض الأسعار</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="border-purple-500/50 text-purple-400" onClick={() => setShowRFQDialog(true)}>
              <Send className="w-4 h-4 ml-2" />
              طلب عرض سعر
            </Button>
            <Button className="bg-purple-600 hover:bg-purple-700">
              <Plus className="w-4 h-4 ml-2" />
              إضافة مورد
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'إجمالي الموردين', value: stats.totalSuppliers, icon: Building2, color: 'purple' },
          { label: 'موردون مفضلون', value: stats.preferredSuppliers, icon: Star, color: 'amber' },
          { label: 'متوسط التقييم', value: stats.avgRating, icon: Award, color: 'green' },
          { label: 'إجمالي الإنفاق', value: `${(stats.totalSpend / 1000).toFixed(0)}K`, icon: DollarSign, color: 'cyan' },
          { label: 'طلبات معلقة', value: stats.pendingOrders, icon: Clock, color: 'red' },
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
          <TabsTrigger value="dashboard" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400">
            <BarChart3 className="w-4 h-4 ml-2" />
            لوحة التحكم
          </TabsTrigger>
          <TabsTrigger value="suppliers" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
            <Building2 className="w-4 h-4 ml-2" />
            الموردون
          </TabsTrigger>
          <TabsTrigger value="orders" className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400">
            <ShoppingCart className="w-4 h-4 ml-2" />
            الطلبات
          </TabsTrigger>
          <TabsTrigger value="rfq" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400">
            <Send className="w-4 h-4 ml-2" />
            عروض الأسعار
          </TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-4 mt-4">
          <SupplierKPIDashboard suppliers={suppliers} />
        </TabsContent>

        {/* Old Dashboard Tab Content */}
        <TabsContent value="dashboard-old" className="space-y-4 mt-4 hidden">
          <div className="grid lg:grid-cols-2 gap-4">
            {/* Performance Chart */}
            <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm">مقارنة أداء الموردين</CardTitle>
              </CardHeader>
              <CardContent className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} />
                    <YAxis stroke="#94a3b8" fontSize={10} />
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none' }} />
                    <Legend />
                    <Bar dataKey="delivery" name="التسليم" fill="#22d3ee" />
                    <Bar dataKey="quality" name="الجودة" fill="#22c55e" />
                    <Bar dataKey="price" name="السعر" fill="#f59e0b" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Spend by Category */}
            <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm">الإنفاق حسب الفئة</CardTitle>
              </CardHeader>
              <CardContent className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={spendByCategory}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {spendByCategory.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none' }} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Top Suppliers */}
          <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm">أفضل الموردين</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {suppliers.slice(0, 3).map((supplier, idx) => (
                  <div key={supplier.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                        idx === 0 ? 'bg-amber-500/20 text-amber-400' :
                        idx === 1 ? 'bg-slate-500/20 text-slate-400' :
                        'bg-orange-500/20 text-orange-400'
                      }`}>
                        {idx + 1}
                      </span>
                      <div>
                        <p className="text-white font-medium">{supplier.name}</p>
                        <p className="text-slate-400 text-xs">{supplier.category}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                          <span className="text-white font-bold">{supplier.rating}</span>
                        </div>
                      </div>
                      <Badge className={statusColors[supplier.status]}>
                        {supplier.status === 'preferred' ? 'مفضل' : 'نشط'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Suppliers Tab */}
        <TabsContent value="suppliers" className="space-y-4 mt-4">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="بحث عن مورد..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10 bg-slate-800/50 border-slate-700 text-white"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {filteredSuppliers.map((supplier) => (
              <motion.div key={supplier.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-white font-bold">{supplier.name}</h3>
                          <Badge className={statusColors[supplier.status]}>
                            {supplier.status === 'preferred' ? 'مفضل' : 'نشط'}
                          </Badge>
                        </div>
                        <p className="text-slate-400 text-sm">{supplier.category}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                        <span className="text-white font-bold">{supplier.rating}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 mb-3">
                      <div className="p-2 bg-slate-800/50 rounded text-center">
                        <p className="text-cyan-400 font-bold text-sm">{supplier.deliveryScore}%</p>
                        <p className="text-slate-500 text-[10px]">التسليم</p>
                      </div>
                      <div className="p-2 bg-slate-800/50 rounded text-center">
                        <p className="text-green-400 font-bold text-sm">{supplier.qualityScore}%</p>
                        <p className="text-slate-500 text-[10px]">الجودة</p>
                      </div>
                      <div className="p-2 bg-slate-800/50 rounded text-center">
                        <p className="text-amber-400 font-bold text-sm">{supplier.priceScore}%</p>
                        <p className="text-slate-500 text-[10px]">السعر</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-slate-400 mb-3">
                      <span>{supplier.totalOrders} طلب</span>
                      <span>{supplier.avgDeliveryDays} أيام تسليم</span>
                      <span>{(supplier.totalSpend / 1000).toFixed(0)}K إنفاق</span>
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" className="flex-1 bg-purple-600 hover:bg-purple-700" onClick={() => { setSelectedSupplier(supplier); setShowSupplierDialog(true); }}>
                        <Eye className="w-3 h-3 ml-1" />
                        التفاصيل
                      </Button>
                      <Button size="sm" variant="outline" className="border-cyan-500/50 text-cyan-400">
                        <Send className="w-3 h-3 ml-1" />
                        طلب سعر
                      </Button>
                      <Button size="sm" variant="outline" className="border-slate-600">
                        <Phone className="w-3 h-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* Orders Tab */}
        <TabsContent value="orders" className="space-y-4 mt-4">
          <SupplierOrderTracker />
        </TabsContent>

        {/* RFQ Tab */}
        <TabsContent value="rfq" className="space-y-4 mt-4">
          <RFQManager />
        </TabsContent>
      </Tabs>

      {/* Supplier Detail Dialog */}
      <Dialog open={showSupplierDialog} onOpenChange={setShowSupplierDialog}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white">تفاصيل المورد</DialogTitle>
          </DialogHeader>
          {selectedSupplier && (
            <div className="space-y-4 mt-4">
              <div className="p-4 bg-slate-800/50 rounded-lg">
                <h3 className="text-white font-bold text-lg">{selectedSupplier.name}</h3>
                <p className="text-slate-400">{selectedSupplier.category}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <span className="text-cyan-400 text-sm">{selectedSupplier.email}</span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <Phone className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-300 text-sm">{selectedSupplier.phone}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-cyan-500/10 rounded-lg text-center">
                  <p className="text-2xl font-bold text-cyan-400">{selectedSupplier.totalOrders}</p>
                  <p className="text-slate-400 text-xs">إجمالي الطلبات</p>
                </div>
                <div className="p-3 bg-green-500/10 rounded-lg text-center">
                  <p className="text-2xl font-bold text-green-400">{selectedSupplier.onTimeDelivery}</p>
                  <p className="text-slate-400 text-xs">تسليم في الوقت</p>
                </div>
              </div>

              <div>
                <h4 className="text-slate-300 text-sm mb-2">المنتجات</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedSupplier.products.map((p, i) => (
                    <Badge key={i} variant="outline" className="border-slate-600">{p}</Badge>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* RFQ Dialog */}
      <Dialog open={showRFQDialog} onOpenChange={setShowRFQDialog}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Send className="w-5 h-5 text-amber-400" />
              طلب عرض سعر جديد
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label className="text-slate-300">العنوان *</Label>
              <Input
                value={newRFQ.title}
                onChange={(e) => setNewRFQ({...newRFQ, title: e.target.value})}
                className="bg-slate-800/50 border-slate-700 text-white mt-1"
                placeholder="مثال: قطع غيار مكيفات"
              />
            </div>
            <div>
              <Label className="text-slate-300">الوصف</Label>
              <Textarea
                value={newRFQ.description}
                onChange={(e) => setNewRFQ({...newRFQ, description: e.target.value})}
                className="bg-slate-800/50 border-slate-700 text-white mt-1"
                rows={2}
              />
            </div>
            <div>
              <Label className="text-slate-300">الأصناف المطلوبة *</Label>
              <Textarea
                value={newRFQ.items}
                onChange={(e) => setNewRFQ({...newRFQ, items: e.target.value})}
                className="bg-slate-800/50 border-slate-700 text-white mt-1"
                placeholder="اسم الصنف - الكمية&#10;فلتر مكيف - 50&#10;بطارية - 30"
                rows={3}
              />
            </div>
            <div>
              <Label className="text-slate-300">تاريخ الانتهاء</Label>
              <Input
                type="date"
                value={newRFQ.deadline}
                onChange={(e) => setNewRFQ({...newRFQ, deadline: e.target.value})}
                className="bg-slate-800/50 border-slate-700 text-white mt-1"
              />
            </div>
            <Button className="w-full bg-amber-600 hover:bg-amber-700" onClick={sendRFQ}>
              <Send className="w-4 h-4 ml-2" />
              إرسال للموردين
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}