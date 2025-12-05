import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Car, Plus, User, Fuel, Wrench, AlertTriangle, Clock, DollarSign,
  TrendingUp, TrendingDown, Activity, Eye, Edit, MapPin, Gauge,
  Calendar, FileText, Package, Search, BarChart3, Shield, Zap
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import AdvancedSearch from '@/components/common/AdvancedSearch';
import Pagination from '@/components/common/Pagination';
import { toast } from 'sonner';

const mockVehicles = [
  { id: 1, plate_number: 'أ ب ج 1234', vehicle_type: 'patrol_car', status: 'moving', driver_name: 'محمد أحمد', current_zone: 'المنطقة أ', speed: 45, fuel_level: 75, mileage: 45000, last_maintenance: '2024-11-15', next_maintenance: '2024-12-15' },
  { id: 2, plate_number: 'د هـ و 5678', vehicle_type: 'suv', status: 'parked', driver_name: 'خالد العلي', current_zone: 'المقر الرئيسي', speed: 0, fuel_level: 30, mileage: 62000, last_maintenance: '2024-10-01', next_maintenance: '2024-12-01' },
  { id: 3, plate_number: 'ز ح ط 9012', vehicle_type: 'van', status: 'maintenance', driver_name: 'فهد السعيد', current_zone: 'مركز الصيانة', speed: 0, fuel_level: 50, mileage: 85000, last_maintenance: '2024-12-01', next_maintenance: '2025-02-01' },
];

const mockDrivers = [
  { id: 1, name: 'محمد أحمد', employee_id: 'EMP-001', license_number: 'DL-12345', license_type: 'heavy', license_expiry: '2025-06-15', phone: '+966 5XX XXX XXX', assigned_vehicle_plate: 'أ ب ج 1234', behavior_score: 92, behavior_stats: { harsh_braking_count: 3, harsh_acceleration_count: 2, speeding_count: 1, idle_time_hours: 5, total_distance_km: 2500, fuel_efficiency: 12.5 }, status: 'active' },
  { id: 2, name: 'خالد العلي', employee_id: 'EMP-002', license_number: 'DL-67890', license_type: 'light', license_expiry: '2024-12-20', phone: '+966 5XX XXX XXX', assigned_vehicle_plate: 'د هـ و 5678', behavior_score: 78, behavior_stats: { harsh_braking_count: 12, harsh_acceleration_count: 8, speeding_count: 5, idle_time_hours: 15, total_distance_km: 3200, fuel_efficiency: 10.2 }, status: 'active' },
  { id: 3, name: 'فهد السعيد', employee_id: 'EMP-003', license_number: 'DL-11223', license_type: 'heavy', license_expiry: '2025-03-10', phone: '+966 5XX XXX XXX', assigned_vehicle_plate: 'ز ح ط 9012', behavior_score: 85, behavior_stats: { harsh_braking_count: 5, harsh_acceleration_count: 4, speeding_count: 2, idle_time_hours: 8, total_distance_km: 4100, fuel_efficiency: 11.8 }, status: 'active' },
];

const mockExpenses = [
  { id: 1, vehicle_plate: 'أ ب ج 1234', expense_type: 'fuel', amount: 250, date: '2024-12-03', fuel_liters: 50, odometer: 45100, station: 'محطة الراجحي' },
  { id: 2, vehicle_plate: 'أ ب ج 1234', expense_type: 'maintenance', amount: 1500, date: '2024-11-15', odometer: 44500, invoice_number: 'INV-001', notes: 'تغيير زيت وفلتر' },
  { id: 3, vehicle_plate: 'د هـ و 5678', expense_type: 'fuel', amount: 180, date: '2024-12-02', fuel_liters: 36, odometer: 62050, station: 'محطة الدوسري' },
  { id: 4, vehicle_plate: 'ز ح ط 9012', expense_type: 'maintenance', amount: 3500, date: '2024-12-01', odometer: 85000, invoice_number: 'INV-002', notes: 'إصلاح الفرامل' },
];

const monthlyExpenseData = [
  { month: 'يوليو', fuel: 4500, maintenance: 2000 },
  { month: 'أغسطس', fuel: 5200, maintenance: 1500 },
  { month: 'سبتمبر', fuel: 4800, maintenance: 3500 },
  { month: 'أكتوبر', fuel: 5100, maintenance: 2200 },
  { month: 'نوفمبر', fuel: 4900, maintenance: 4000 },
  { month: 'ديسمبر', fuel: 3200, maintenance: 5000 },
];

const statusColors = {
  moving: 'bg-green-500/20 text-green-400',
  parked: 'bg-blue-500/20 text-blue-400',
  idle: 'bg-amber-500/20 text-amber-400',
  maintenance: 'bg-purple-500/20 text-purple-400',
  offline: 'bg-red-500/20 text-red-400',
};

const expenseTypeLabels = {
  fuel: { label: 'وقود', color: 'amber', icon: Fuel },
  maintenance: { label: 'صيانة', color: 'purple', icon: Wrench },
  insurance: { label: 'تأمين', color: 'blue', icon: Shield },
  fine: { label: 'مخالفة', color: 'red', icon: AlertTriangle },
  other: { label: 'أخرى', color: 'slate', icon: FileText },
};

export default function VehicleManagement() {
  const [activeTab, setActiveTab] = useState('vehicles');
  const [vehicles, setVehicles] = useState(mockVehicles);
  const [drivers, setDrivers] = useState(mockDrivers);
  const [expenses, setExpenses] = useState(mockExpenses);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showExpenseDialog, setShowExpenseDialog] = useState(false);
  const [showDriverDetailDialog, setShowDriverDetailDialog] = useState(false);
  const [showVehicleDetailDialog, setShowVehicleDetailDialog] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  const [newExpense, setNewExpense] = useState({
    vehicle_plate: '', expense_type: 'fuel', amount: 0, date: '', fuel_liters: 0, odometer: 0, station: '', invoice_number: '', notes: ''
  });

  const stats = {
    totalVehicles: vehicles.length,
    activeVehicles: vehicles.filter(v => v.status === 'moving' || v.status === 'parked').length,
    totalExpenses: expenses.reduce((s, e) => s + e.amount, 0),
    avgBehaviorScore: Math.round(drivers.reduce((s, d) => s + d.behavior_score, 0) / drivers.length),
  };

  const vehicleFilters = [
    { id: 'status', label: 'الحالة', type: 'select', options: [
      { value: 'moving', label: 'متحركة' },
      { value: 'parked', label: 'متوقفة' },
      { value: 'maintenance', label: 'صيانة' },
    ]},
    { id: 'vehicle_type', label: 'النوع', type: 'select', options: [
      { value: 'patrol_car', label: 'دورية' },
      { value: 'suv', label: 'SUV' },
      { value: 'van', label: 'فان' },
    ]},
  ];

  const filteredVehicles = useMemo(() => {
    return vehicles.filter(v => {
      const matchesSearch = v.plate_number.includes(searchQuery) || v.driver_name?.includes(searchQuery);
      const matchesStatus = !activeFilters.status || activeFilters.status === 'all' || v.status === activeFilters.status;
      const matchesType = !activeFilters.vehicle_type || activeFilters.vehicle_type === 'all' || v.vehicle_type === activeFilters.vehicle_type;
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [vehicles, searchQuery, activeFilters]);

  const handleFilterChange = (id, value) => {
    setActiveFilters(prev => ({ ...prev, [id]: value }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setActiveFilters({});
    setSearchQuery('');
  };

  const createExpense = () => {
    if (!newExpense.vehicle_plate || !newExpense.amount) {
      toast.error('يرجى ملء الحقول المطلوبة');
      return;
    }
    const expense = { ...newExpense, id: Date.now() };
    setExpenses([expense, ...expenses]);
    setShowExpenseDialog(false);
    setNewExpense({ vehicle_plate: '', expense_type: 'fuel', amount: 0, date: '', fuel_liters: 0, odometer: 0, station: '', invoice_number: '', notes: '' });
    toast.success('تم تسجيل المصروف');
  };

  const getVehicleExpenses = (plate) => expenses.filter(e => e.vehicle_plate === plate);
  const getDriverViolations = (driver) => driver.behavior_stats;

  const getBehaviorColor = (score) => {
    if (score >= 90) return 'green';
    if (score >= 75) return 'amber';
    return 'red';
  };

  return (
    <div className="min-h-screen p-4 lg:p-6 space-y-6" dir="rtl">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white flex items-center gap-3">
              <Car className="w-8 h-8 text-cyan-400" />
              إدارة المركبات والأسطول
            </h1>
            <p className="text-slate-400 mt-1">تتبع المركبات والسائقين والمصروفات</p>
          </div>
          <Button className="bg-cyan-600 hover:bg-cyan-700" onClick={() => setShowExpenseDialog(true)}>
            <Plus className="w-4 h-4 ml-2" />
            تسجيل مصروف
          </Button>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'إجمالي المركبات', value: stats.totalVehicles, icon: Car, color: 'cyan' },
          { label: 'المركبات النشطة', value: stats.activeVehicles, icon: Activity, color: 'green' },
          { label: 'إجمالي المصروفات', value: `${(stats.totalExpenses / 1000).toFixed(1)}K`, icon: DollarSign, color: 'amber' },
          { label: 'متوسط سلوك السائقين', value: `${stats.avgBehaviorScore}%`, icon: User, color: 'purple' },
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
          <TabsTrigger value="vehicles" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
            <Car className="w-4 h-4 ml-2" />
            المركبات
          </TabsTrigger>
          <TabsTrigger value="drivers" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400">
            <User className="w-4 h-4 ml-2" />
            السائقون
          </TabsTrigger>
          <TabsTrigger value="expenses" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400">
            <DollarSign className="w-4 h-4 ml-2" />
            المصروفات
          </TabsTrigger>
          <TabsTrigger value="analytics" className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400">
            <BarChart3 className="w-4 h-4 ml-2" />
            التحليلات
          </TabsTrigger>
        </TabsList>

        <TabsContent value="vehicles" className="space-y-4 mt-4">
          <AdvancedSearch
            searchQuery={searchQuery}
            onSearchChange={(v) => { setSearchQuery(v); setCurrentPage(1); }}
            filters={vehicleFilters}
            activeFilters={activeFilters}
            onFilterChange={handleFilterChange}
            onClearFilters={clearFilters}
            placeholder="بحث برقم اللوحة أو السائق..."
          />

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredVehicles.map((vehicle, i) => (
              <motion.div key={vehicle.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80 cursor-pointer hover:border-cyan-500/50 transition-all" onClick={() => { setSelectedVehicle(vehicle); setShowVehicleDetailDialog(true); }}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-cyan-500/20">
                          <Car className="w-6 h-6 text-cyan-400" />
                        </div>
                        <div>
                          <h3 className="text-white font-bold">{vehicle.plate_number}</h3>
                          <p className="text-slate-400 text-xs">{vehicle.vehicle_type}</p>
                        </div>
                      </div>
                      <Badge className={statusColors[vehicle.status]}>
                        {vehicle.status === 'moving' ? 'متحركة' : vehicle.status === 'parked' ? 'متوقفة' : vehicle.status === 'maintenance' ? 'صيانة' : vehicle.status}
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-400">السائق</span>
                        <span className="text-white">{vehicle.driver_name}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-400">الموقع</span>
                        <span className="text-white">{vehicle.current_zone}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-400">الوقود</span>
                        <div className="flex items-center gap-2">
                          <Progress value={vehicle.fuel_level} className="w-16 h-2" />
                          <span className={`${vehicle.fuel_level < 30 ? 'text-red-400' : 'text-white'}`}>{vehicle.fuel_level}%</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-400">العداد</span>
                        <span className="text-white">{vehicle.mileage.toLocaleString()} كم</span>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-700/50 flex justify-between text-xs">
                      <span className="text-slate-500">آخر صيانة: {vehicle.last_maintenance}</span>
                      <span className={`${new Date(vehicle.next_maintenance) < new Date() ? 'text-red-400' : 'text-green-400'}`}>
                        القادمة: {vehicle.next_maintenance}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="drivers" className="space-y-4 mt-4">
          <div className="space-y-3">
            {drivers.map((driver, i) => {
              const behaviorColor = getBehaviorColor(driver.behavior_score);
              return (
                <motion.div key={driver.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80 cursor-pointer hover:border-purple-500/50 transition-all" onClick={() => { setSelectedDriver(driver); setShowDriverDetailDialog(true); }}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-14 w-14">
                            <AvatarFallback className={`bg-${behaviorColor}-500/20 text-${behaviorColor}-400 text-lg`}>
                              {driver.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-white font-bold">{driver.name}</h3>
                              <Badge className={`bg-${behaviorColor}-500/20 text-${behaviorColor}-400`}>
                                {driver.behavior_score}%
                              </Badge>
                            </div>
                            <p className="text-slate-400 text-sm">{driver.employee_id} • {driver.assigned_vehicle_plate}</p>
                            <p className="text-slate-500 text-xs">رخصة: {driver.license_number}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-center">
                          <div className="p-2 bg-red-500/10 rounded-lg">
                            <p className="text-red-400 font-bold">{driver.behavior_stats.harsh_braking_count}</p>
                            <p className="text-slate-500 text-xs">فرملة مفاجئة</p>
                          </div>
                          <div className="p-2 bg-amber-500/10 rounded-lg">
                            <p className="text-amber-400 font-bold">{driver.behavior_stats.speeding_count}</p>
                            <p className="text-slate-500 text-xs">تجاوز سرعة</p>
                          </div>
                          <div className="p-2 bg-cyan-500/10 rounded-lg">
                            <p className="text-cyan-400 font-bold">{driver.behavior_stats.fuel_efficiency}</p>
                            <p className="text-slate-500 text-xs">كم/لتر</p>
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

        <TabsContent value="expenses" className="space-y-4 mt-4">
          <div className="space-y-3">
            {expenses.map((expense, i) => {
              const typeConfig = expenseTypeLabels[expense.expense_type] || expenseTypeLabels.other;
              const TypeIcon = typeConfig.icon;
              return (
                <motion.div key={expense.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                  <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`p-3 rounded-xl bg-${typeConfig.color}-500/20`}>
                            <TypeIcon className={`w-6 h-6 text-${typeConfig.color}-400`} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-white font-bold">{expense.vehicle_plate}</h3>
                              <Badge className={`bg-${typeConfig.color}-500/20 text-${typeConfig.color}-400`}>
                                {typeConfig.label}
                              </Badge>
                            </div>
                            <div className="flex gap-4 text-xs text-slate-500">
                              <span><Calendar className="w-3 h-3 inline" /> {expense.date}</span>
                              {expense.odometer && <span><Gauge className="w-3 h-3 inline" /> {expense.odometer} كم</span>}
                              {expense.fuel_liters && <span><Fuel className="w-3 h-3 inline" /> {expense.fuel_liters} لتر</span>}
                            </div>
                            {expense.notes && <p className="text-slate-400 text-xs mt-1">{expense.notes}</p>}
                          </div>
                        </div>
                        <div className="text-left">
                          <p className="text-2xl font-bold text-white">{expense.amount}</p>
                          <p className="text-slate-500 text-xs">ر.س</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4 mt-4">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
              <CardHeader>
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-amber-400" />
                  المصروفات الشهرية
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyExpenseData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                      <YAxis stroke="#94a3b8" fontSize={12} />
                      <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                      <Bar dataKey="fuel" fill="#f59e0b" name="وقود" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="maintenance" fill="#a855f7" name="صيانة" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
              <CardHeader>
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <Activity className="w-4 h-4 text-purple-400" />
                  سلوك السائقين
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {drivers.map(driver => {
                    const color = getBehaviorColor(driver.behavior_score);
                    return (
                      <div key={driver.id} className="flex items-center gap-4">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className={`bg-${color}-500/20 text-${color}-400`}>
                            {driver.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-white text-sm">{driver.name}</span>
                            <span className={`text-${color}-400 font-bold`}>{driver.behavior_score}%</span>
                          </div>
                          <Progress value={driver.behavior_score} className="h-2" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Expense Dialog */}
      <Dialog open={showExpenseDialog} onOpenChange={setShowExpenseDialog}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-amber-400" />
              تسجيل مصروف جديد
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-slate-300">المركبة *</Label>
                <Select value={newExpense.vehicle_plate} onValueChange={(v) => setNewExpense({ ...newExpense, vehicle_plate: v })}>
                  <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white mt-1"><SelectValue placeholder="اختر" /></SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    {vehicles.map(v => <SelectItem key={v.id} value={v.plate_number}>{v.plate_number}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-slate-300">نوع المصروف</Label>
                <Select value={newExpense.expense_type} onValueChange={(v) => setNewExpense({ ...newExpense, expense_type: v })}>
                  <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="fuel">وقود</SelectItem>
                    <SelectItem value="maintenance">صيانة</SelectItem>
                    <SelectItem value="insurance">تأمين</SelectItem>
                    <SelectItem value="fine">مخالفة</SelectItem>
                    <SelectItem value="other">أخرى</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-slate-300">المبلغ (ر.س) *</Label>
                <Input type="number" value={newExpense.amount} onChange={(e) => setNewExpense({ ...newExpense, amount: Number(e.target.value) })} className="bg-slate-800/50 border-slate-700 text-white mt-1" />
              </div>
              <div>
                <Label className="text-slate-300">التاريخ</Label>
                <Input type="date" value={newExpense.date} onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })} className="bg-slate-800/50 border-slate-700 text-white mt-1" />
              </div>
            </div>
            {newExpense.expense_type === 'fuel' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-slate-300">اللترات</Label>
                  <Input type="number" value={newExpense.fuel_liters} onChange={(e) => setNewExpense({ ...newExpense, fuel_liters: Number(e.target.value) })} className="bg-slate-800/50 border-slate-700 text-white mt-1" />
                </div>
                <div>
                  <Label className="text-slate-300">المحطة</Label>
                  <Input value={newExpense.station} onChange={(e) => setNewExpense({ ...newExpense, station: e.target.value })} className="bg-slate-800/50 border-slate-700 text-white mt-1" />
                </div>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-slate-300">قراءة العداد</Label>
                <Input type="number" value={newExpense.odometer} onChange={(e) => setNewExpense({ ...newExpense, odometer: Number(e.target.value) })} className="bg-slate-800/50 border-slate-700 text-white mt-1" />
              </div>
              <div>
                <Label className="text-slate-300">رقم الفاتورة</Label>
                <Input value={newExpense.invoice_number} onChange={(e) => setNewExpense({ ...newExpense, invoice_number: e.target.value })} className="bg-slate-800/50 border-slate-700 text-white mt-1" />
              </div>
            </div>
            <div>
              <Label className="text-slate-300">ملاحظات</Label>
              <Input value={newExpense.notes} onChange={(e) => setNewExpense({ ...newExpense, notes: e.target.value })} className="bg-slate-800/50 border-slate-700 text-white mt-1" />
            </div>
            <Button className="w-full bg-amber-600 hover:bg-amber-700" onClick={createExpense}>
              <Plus className="w-4 h-4 ml-2" />
              تسجيل المصروف
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Driver Detail Dialog */}
      <Dialog open={showDriverDetailDialog} onOpenChange={setShowDriverDetailDialog}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <User className="w-5 h-5 text-purple-400" />
              تفاصيل السائق
            </DialogTitle>
          </DialogHeader>
          {selectedDriver && (
            <div className="space-y-4 mt-4">
              <div className="flex items-center gap-4 p-4 bg-slate-800/50 rounded-lg">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className={`bg-${getBehaviorColor(selectedDriver.behavior_score)}-500/20 text-${getBehaviorColor(selectedDriver.behavior_score)}-400 text-xl`}>
                    {selectedDriver.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-white font-bold text-lg">{selectedDriver.name}</h3>
                  <p className="text-slate-400">{selectedDriver.employee_id}</p>
                  <p className="text-cyan-400 text-sm">{selectedDriver.assigned_vehicle_plate}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-center">
                  <p className="text-red-400 font-bold text-xl">{selectedDriver.behavior_stats.harsh_braking_count}</p>
                  <p className="text-slate-400 text-xs">فرملة مفاجئة</p>
                </div>
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-center">
                  <p className="text-amber-400 font-bold text-xl">{selectedDriver.behavior_stats.harsh_acceleration_count}</p>
                  <p className="text-slate-400 text-xs">تسارع مفاجئ</p>
                </div>
                <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg text-center">
                  <p className="text-purple-400 font-bold text-xl">{selectedDriver.behavior_stats.speeding_count}</p>
                  <p className="text-slate-400 text-xs">تجاوز سرعة</p>
                </div>
                <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-lg text-center">
                  <p className="text-cyan-400 font-bold text-xl">{selectedDriver.behavior_stats.total_distance_km}</p>
                  <p className="text-slate-400 text-xs">كم مقطوعة</p>
                </div>
              </div>

              <div className="p-4 bg-slate-800/50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white">درجة السلوك العام</span>
                  <span className={`text-${getBehaviorColor(selectedDriver.behavior_score)}-400 font-bold text-xl`}>
                    {selectedDriver.behavior_score}%
                  </span>
                </div>
                <Progress value={selectedDriver.behavior_score} className="h-3" />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Vehicle Detail Dialog */}
      <Dialog open={showVehicleDetailDialog} onOpenChange={setShowVehicleDetailDialog}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Car className="w-5 h-5 text-cyan-400" />
              تفاصيل المركبة
            </DialogTitle>
          </DialogHeader>
          {selectedVehicle && (
            <div className="space-y-4 mt-4">
              <div className="p-4 bg-slate-800/50 rounded-lg">
                <h3 className="text-white font-bold text-xl mb-2">{selectedVehicle.plate_number}</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="text-slate-400">السائق:</span> <span className="text-white">{selectedVehicle.driver_name}</span></div>
                  <div><span className="text-slate-400">الحالة:</span> <Badge className={statusColors[selectedVehicle.status]}>{selectedVehicle.status}</Badge></div>
                  <div><span className="text-slate-400">العداد:</span> <span className="text-white">{selectedVehicle.mileage.toLocaleString()} كم</span></div>
                  <div><span className="text-slate-400">الوقود:</span> <span className="text-white">{selectedVehicle.fuel_level}%</span></div>
                </div>
              </div>

              <div>
                <h4 className="text-white font-medium mb-2">آخر المصروفات</h4>
                <div className="space-y-2">
                  {getVehicleExpenses(selectedVehicle.plate_number).slice(0, 3).map(exp => {
                    const typeConfig = expenseTypeLabels[exp.expense_type] || expenseTypeLabels.other;
                    return (
                      <div key={exp.id} className="flex items-center justify-between p-2 bg-slate-800/30 rounded">
                        <div className="flex items-center gap-2">
                          <Badge className={`bg-${typeConfig.color}-500/20 text-${typeConfig.color}-400`}>{typeConfig.label}</Badge>
                          <span className="text-slate-400 text-xs">{exp.date}</span>
                        </div>
                        <span className="text-white font-bold">{exp.amount} ر.س</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}