import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Users, Plus, Star, FileText, Calendar, AlertTriangle, Check, X,
  Edit, Eye, Phone, Mail, Building, Award, TrendingUp, TrendingDown,
  Clock, DollarSign, Wrench, Package, Search, Filter, Bell
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import AdvancedSearch from '@/components/common/AdvancedSearch';
import Pagination from '@/components/common/Pagination';
import { toast } from 'sonner';

const mockContractors = [
  { id: 1, name: 'شركة الصيانة المتقدمة', type: 'company', specialty: 'تكييف وتبريد', contact_person: 'أحمد محمد', email: 'info@advanced-maint.com', phone: '+966 5XX XXX XXX', rating: 4.5, total_projects: 25, completed_projects: 23, performance_scores: { quality: 4.5, timeliness: 4.2, communication: 4.8, cost_adherence: 4.3 }, status: 'active' },
  { id: 2, name: 'مؤسسة الأمان للحراسة', type: 'company', specialty: 'أنظمة أمنية', contact_person: 'خالد العلي', email: 'security@alaman.com', phone: '+966 5XX XXX XXX', rating: 4.8, total_projects: 40, completed_projects: 40, performance_scores: { quality: 4.9, timeliness: 4.7, communication: 4.8, cost_adherence: 4.6 }, status: 'active' },
  { id: 3, name: 'فهد السعيد', type: 'individual', specialty: 'أقفال ذكية', contact_person: 'فهد السعيد', email: 'fahad@email.com', phone: '+966 5XX XXX XXX', rating: 3.8, total_projects: 12, completed_projects: 10, performance_scores: { quality: 3.5, timeliness: 4.0, communication: 4.2, cost_adherence: 3.5 }, status: 'active' },
];

const mockContracts = [
  { id: 1, contract_number: 'CNT-2024-001', contractor_id: '1', contractor_name: 'شركة الصيانة المتقدمة', title: 'عقد صيانة سنوي للتكييف', type: 'maintenance', start_date: '2024-01-01', end_date: '2024-12-31', value: 120000, status: 'active', alert_days_before: 30, paid_amount: 90000, inventory_items: [{ name: 'فلتر مكيف', quantity: 50 }] },
  { id: 2, contract_number: 'CNT-2024-002', contractor_id: '2', contractor_name: 'مؤسسة الأمان للحراسة', title: 'عقد خدمات أمنية', type: 'service', start_date: '2024-06-01', end_date: '2024-12-15', value: 85000, status: 'active', alert_days_before: 30, paid_amount: 42500, inventory_items: [] },
  { id: 3, contract_number: 'CNT-2023-015', contractor_id: '3', contractor_name: 'فهد السعيد', title: 'عقد صيانة أقفال', type: 'maintenance', start_date: '2023-06-01', end_date: '2024-06-01', value: 25000, status: 'expired', alert_days_before: 30, paid_amount: 25000, inventory_items: [{ name: 'مفتاح ذكي', quantity: 10 }] },
];

const mockInvoices = [
  { id: 1, invoice_number: 'INV-2024-001', contract_id: '1', contractor_name: 'شركة الصيانة المتقدمة', amount: 30000, date: '2024-03-01', due_date: '2024-03-15', status: 'paid', payment_date: '2024-03-10' },
  { id: 2, invoice_number: 'INV-2024-002', contract_id: '1', contractor_name: 'شركة الصيانة المتقدمة', amount: 30000, date: '2024-06-01', due_date: '2024-06-15', status: 'paid', payment_date: '2024-06-12' },
  { id: 3, invoice_number: 'INV-2024-003', contract_id: '1', contractor_name: 'شركة الصيانة المتقدمة', amount: 30000, date: '2024-09-01', due_date: '2024-09-15', status: 'paid', payment_date: '2024-09-14' },
  { id: 4, invoice_number: 'INV-2024-004', contract_id: '1', contractor_name: 'شركة الصيانة المتقدمة', amount: 30000, date: '2024-12-01', due_date: '2024-12-15', status: 'pending' },
  { id: 5, invoice_number: 'INV-2024-005', contract_id: '2', contractor_name: 'مؤسسة الأمان للحراسة', amount: 42500, date: '2024-06-01', due_date: '2024-06-15', status: 'paid', payment_date: '2024-06-14' },
];

const statusColors = {
  active: 'bg-green-500/20 text-green-400',
  inactive: 'bg-slate-500/20 text-slate-400',
  blacklisted: 'bg-red-500/20 text-red-400',
  pending_approval: 'bg-amber-500/20 text-amber-400',
};

const contractStatusColors = {
  draft: 'bg-slate-500/20 text-slate-400',
  active: 'bg-green-500/20 text-green-400',
  expired: 'bg-red-500/20 text-red-400',
  terminated: 'bg-red-500/20 text-red-400',
  renewed: 'bg-blue-500/20 text-blue-400',
};

export default function ContractorManagement() {
  const [activeTab, setActiveTab] = useState('contractors');
  const [contractors, setContractors] = useState(mockContractors);
  const [contracts, setContracts] = useState(mockContracts);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showContractorDialog, setShowContractorDialog] = useState(false);
  const [showContractDialog, setShowContractDialog] = useState(false);
  const [showRatingDialog, setShowRatingDialog] = useState(false);
  const [showInvoiceDialog, setShowInvoiceDialog] = useState(false);
  const [showContractDetailDialog, setShowContractDetailDialog] = useState(false);
  const [selectedContractor, setSelectedContractor] = useState(null);
  const [selectedContract, setSelectedContract] = useState(null);
  const [invoices, setInvoices] = useState(mockInvoices);
  const [newRating, setNewRating] = useState({ quality: 0, timeliness: 0, communication: 0, cost_adherence: 0 });
  const [newInvoice, setNewInvoice] = useState({ contract_id: '', contractor_name: '', amount: 0, date: '', due_date: '', items: [] });

  const [newContractor, setNewContractor] = useState({
    name: '', type: 'company', specialty: '', contact_person: '', email: '', phone: '', status: 'pending_approval'
  });

  const [newContract, setNewContract] = useState({
    contractor_id: '', contractor_name: '', title: '', type: 'service', start_date: '', end_date: '', value: 0, alert_days_before: 30
  });

  // Calculate expiring contracts
  const expiringContracts = contracts.filter(c => {
    if (c.status !== 'active') return false;
    const endDate = new Date(c.end_date);
    const today = new Date();
    const daysUntilExpiry = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= c.alert_days_before && daysUntilExpiry > 0;
  });

  const contractorFilters = [
    { id: 'status', label: 'الحالة', type: 'select', options: [
      { value: 'active', label: 'نشط' },
      { value: 'inactive', label: 'غير نشط' },
      { value: 'blacklisted', label: 'محظور' },
    ]},
    { id: 'type', label: 'النوع', type: 'select', options: [
      { value: 'company', label: 'شركة' },
      { value: 'individual', label: 'فرد' },
    ]},
    { id: 'minRating', label: 'الحد الأدنى للتقييم', type: 'select', options: [
      { value: '4', label: '4 نجوم فأكثر' },
      { value: '3', label: '3 نجوم فأكثر' },
    ]},
  ];

  const filteredContractors = useMemo(() => {
    return contractors.filter(c => {
      const matchesSearch = c.name.includes(searchQuery) || c.specialty.includes(searchQuery);
      const matchesStatus = !activeFilters.status || activeFilters.status === 'all' || c.status === activeFilters.status;
      const matchesType = !activeFilters.type || activeFilters.type === 'all' || c.type === activeFilters.type;
      const matchesRating = !activeFilters.minRating || activeFilters.minRating === 'all' || c.rating >= Number(activeFilters.minRating);
      return matchesSearch && matchesStatus && matchesType && matchesRating;
    });
  }, [contractors, searchQuery, activeFilters]);

  const paginatedContractors = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredContractors.slice(start, start + pageSize);
  }, [filteredContractors, currentPage, pageSize]);

  const handleFilterChange = (id, value) => {
    setActiveFilters(prev => ({ ...prev, [id]: value }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setActiveFilters({});
    setSearchQuery('');
  };

  const createContractor = () => {
    if (!newContractor.name) {
      toast.error('يرجى إدخال اسم المتعاقد');
      return;
    }
    const contractor = {
      ...newContractor,
      id: Date.now(),
      rating: 0,
      total_projects: 0,
      completed_projects: 0,
      performance_scores: { quality: 0, timeliness: 0, communication: 0, cost_adherence: 0 }
    };
    setContractors([contractor, ...contractors]);
    setShowContractorDialog(false);
    setNewContractor({ name: '', type: 'company', specialty: '', contact_person: '', email: '', phone: '', status: 'pending_approval' });
    toast.success('تم إضافة المتعاقد');
  };

  const createContract = () => {
    if (!newContract.title || !newContract.contractor_name) {
      toast.error('يرجى ملء جميع الحقول المطلوبة');
      return;
    }
    const contract = {
      ...newContract,
      id: Date.now(),
      contract_number: `CNT-${new Date().getFullYear()}-${String(contracts.length + 1).padStart(3, '0')}`,
      status: 'active'
    };
    setContracts([contract, ...contracts]);
    setShowContractDialog(false);
    setNewContract({ contractor_id: '', contractor_name: '', title: '', type: 'service', start_date: '', end_date: '', value: 0, alert_days_before: 30 });
    toast.success('تم إنشاء العقد');
  };

  const submitRating = () => {
    if (!selectedContractor) return;
    const avgRating = (newRating.quality + newRating.timeliness + newRating.communication + newRating.cost_adherence) / 4;
    setContractors(contractors.map(c => 
      c.id === selectedContractor.id 
        ? { ...c, rating: avgRating, performance_scores: newRating, completed_projects: c.completed_projects + 1 }
        : c
    ));
    setShowRatingDialog(false);
    setNewRating({ quality: 0, timeliness: 0, communication: 0, cost_adherence: 0 });
    toast.success('تم حفظ التقييم');
  };

  const renewContract = (contractId) => {
    setContracts(contracts.map(c => {
      if (c.id === contractId) {
        const newEndDate = new Date(c.end_date);
        newEndDate.setFullYear(newEndDate.getFullYear() + 1);
        return { ...c, status: 'renewed', end_date: newEndDate.toISOString().split('T')[0] };
      }
      return c;
    }));
    toast.success('تم تجديد العقد');
  };

  const renderStars = (rating, interactive = false, onChange = null) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(star => (
          <Star
            key={star}
            className={`w-4 h-4 ${star <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-600'} ${interactive ? 'cursor-pointer hover:text-amber-300' : ''}`}
            onClick={interactive && onChange ? () => onChange(star) : undefined}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen p-4 lg:p-6 space-y-6" dir="rtl">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white flex items-center gap-3">
              <Users className="w-8 h-8 text-purple-400" />
              إدارة المتعاقدين والعقود
            </h1>
            <p className="text-slate-400 mt-1">إدارة المتعاقدين وتقييمهم ومتابعة عقودهم</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="border-slate-600" onClick={() => setShowContractDialog(true)}>
              <FileText className="w-4 h-4 ml-2" />
              عقد جديد
            </Button>
            <Button className="bg-purple-600 hover:bg-purple-700" onClick={() => setShowContractorDialog(true)}>
              <Plus className="w-4 h-4 ml-2" />
              إضافة متعاقد
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Expiring Contracts Alert */}
      {expiringContracts.length > 0 && (
        <Card className="glass-card border-amber-500/30 bg-amber-500/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <Bell className="w-5 h-5 text-amber-400" />
              <span className="text-amber-300 font-medium">عقود قاربت على الانتهاء ({expiringContracts.length})</span>
            </div>
            <div className="space-y-2">
              {expiringContracts.map(contract => {
                const daysLeft = Math.ceil((new Date(contract.end_date) - new Date()) / (1000 * 60 * 60 * 24));
                return (
                  <div key={contract.id} className="flex items-center justify-between p-2 bg-slate-800/50 rounded-lg">
                    <div>
                      <p className="text-white text-sm">{contract.title}</p>
                      <p className="text-slate-400 text-xs">{contract.contractor_name}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-amber-500/20 text-amber-400">{daysLeft} يوم متبقي</Badge>
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={() => renewContract(contract.id)}>
                        تجديد
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'إجمالي المتعاقدين', value: contractors.length, icon: Users, color: 'purple' },
          { label: 'العقود النشطة', value: contracts.filter(c => c.status === 'active').length, icon: FileText, color: 'green' },
          { label: 'متوسط التقييم', value: (contractors.reduce((s, c) => s + c.rating, 0) / contractors.length).toFixed(1), icon: Star, color: 'amber' },
          { label: 'قيمة العقود', value: `${(contracts.filter(c => c.status === 'active').reduce((s, c) => s + c.value, 0) / 1000).toFixed(0)}K`, icon: DollarSign, color: 'cyan' },
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
          <TabsTrigger value="contractors" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400">
            <Users className="w-4 h-4 ml-2" />
            المتعاقدون
          </TabsTrigger>
          <TabsTrigger value="contracts" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
            <FileText className="w-4 h-4 ml-2" />
            العقود
          </TabsTrigger>
          <TabsTrigger value="invoices" className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400">
            <DollarSign className="w-4 h-4 ml-2" />
            الفواتير ({invoices.filter(i => i.status === 'pending').length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="contractors" className="space-y-4 mt-4">
          <AdvancedSearch
            searchQuery={searchQuery}
            onSearchChange={(v) => { setSearchQuery(v); setCurrentPage(1); }}
            filters={contractorFilters}
            activeFilters={activeFilters}
            onFilterChange={handleFilterChange}
            onClearFilters={clearFilters}
            placeholder="بحث بالاسم أو التخصص..."
          />

          <div className="space-y-3">
            {paginatedContractors.map((contractor, i) => (
              <motion.div key={contractor.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between flex-wrap gap-4">
                      <div className="flex items-start gap-4">
                        <Avatar className="h-14 w-14">
                          <AvatarFallback className="bg-purple-500/20 text-purple-400 text-lg">
                            {contractor.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-white font-bold text-lg">{contractor.name}</h3>
                            <Badge className={statusColors[contractor.status]}>
                              {contractor.status === 'active' ? 'نشط' : contractor.status === 'inactive' ? 'غير نشط' : contractor.status === 'blacklisted' ? 'محظور' : 'قيد الاعتماد'}
                            </Badge>
                            <Badge variant="outline" className="border-slate-600 text-slate-400">
                              {contractor.type === 'company' ? 'شركة' : 'فرد'}
                            </Badge>
                          </div>
                          <p className="text-cyan-400 text-sm mb-2">{contractor.specialty}</p>
                          <div className="flex flex-wrap gap-4 text-xs text-slate-500">
                            <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{contractor.phone}</span>
                            <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{contractor.email}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <div className="flex items-center gap-2">
                          {renderStars(contractor.rating)}
                          <span className="text-white font-bold">{contractor.rating.toFixed(1)}</span>
                        </div>
                        <p className="text-slate-400 text-xs">
                          {contractor.completed_projects}/{contractor.total_projects} مشروع مكتمل
                        </p>
                        <div className="flex gap-1">
                          <Button size="sm" variant="outline" className="border-amber-500/50 text-amber-400" onClick={() => { setSelectedContractor(contractor); setShowRatingDialog(true); }}>
                            <Star className="w-3 h-3 ml-1" />
                            تقييم
                          </Button>
                          <Button size="sm" variant="ghost"><Eye className="w-4 h-4 text-slate-400" /></Button>
                        </div>
                      </div>
                    </div>

                    {/* Performance Breakdown */}
                    <div className="grid grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-700/50">
                      {[
                        { label: 'الجودة', value: contractor.performance_scores.quality },
                        { label: 'الالتزام بالوقت', value: contractor.performance_scores.timeliness },
                        { label: 'التواصل', value: contractor.performance_scores.communication },
                        { label: 'الالتزام بالتكلفة', value: contractor.performance_scores.cost_adherence },
                      ].map(score => (
                        <div key={score.label} className="text-center">
                          <p className="text-slate-400 text-xs mb-1">{score.label}</p>
                          <Progress value={(score.value / 5) * 100} className="h-1.5 mb-1" />
                          <p className="text-white text-sm font-bold">{score.value.toFixed(1)}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={Math.ceil(filteredContractors.length / pageSize)}
            totalItems={filteredContractors.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={(s) => { setPageSize(s); setCurrentPage(1); }}
          />
        </TabsContent>

        <TabsContent value="contracts" className="space-y-4 mt-4">
          <div className="space-y-3">
            {contracts.map((contract, i) => {
              const daysLeft = Math.ceil((new Date(contract.end_date) - new Date()) / (1000 * 60 * 60 * 24));
              const isExpiring = daysLeft <= contract.alert_days_before && daysLeft > 0;
              return (
                <motion.div key={contract.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <Card className={`glass-card ${isExpiring ? 'border-amber-500/30' : 'border-indigo-500/20'} bg-[#0f1629]/80`}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between flex-wrap gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-white font-bold">{contract.title}</h3>
                            <Badge className={contractStatusColors[contract.status]}>
                              {contract.status === 'active' ? 'نشط' : contract.status === 'expired' ? 'منتهي' : contract.status === 'renewed' ? 'مجدد' : contract.status}
                            </Badge>
                            {isExpiring && <Badge className="bg-amber-500/20 text-amber-400 animate-pulse">{daysLeft} يوم</Badge>}
                          </div>
                          <p className="text-slate-400 text-sm">{contract.contractor_name} • {contract.contract_number}</p>
                          <div className="flex gap-4 mt-2 text-xs text-slate-500">
                            <span><Calendar className="w-3 h-3 inline" /> {contract.start_date} - {contract.end_date}</span>
                            <span><DollarSign className="w-3 h-3 inline" /> {contract.value.toLocaleString()} ر.س</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {contract.status === 'active' && isExpiring && (
                            <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={() => renewContract(contract.id)}>
                              تجديد
                            </Button>
                          )}
                          <Button size="sm" variant="outline" className="border-green-500/50 text-green-400" onClick={() => { setSelectedContract(contract); setShowInvoiceDialog(true); }}>
                            <DollarSign className="w-3 h-3 ml-1" />
                            فاتورة
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => { setSelectedContract(contract); setShowContractDetailDialog(true); }}>
                            <Eye className="w-4 h-4 text-slate-400" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="invoices" className="space-y-4 mt-4">
          <div className="space-y-3">
            {invoices.map((invoice, i) => (
              <motion.div key={invoice.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className={`glass-card ${invoice.status === 'pending' ? 'border-amber-500/30' : 'border-indigo-500/20'} bg-[#0f1629]/80`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-white font-bold">{invoice.invoice_number}</h3>
                          <Badge className={invoice.status === 'paid' ? 'bg-green-500/20 text-green-400' : invoice.status === 'overdue' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'}>
                            {invoice.status === 'paid' ? 'مدفوعة' : invoice.status === 'overdue' ? 'متأخرة' : 'قيد الانتظار'}
                          </Badge>
                        </div>
                        <p className="text-slate-400 text-sm">{invoice.contractor_name}</p>
                        <div className="flex gap-4 mt-2 text-xs text-slate-500">
                          <span><Calendar className="w-3 h-3 inline" /> {invoice.date}</span>
                          <span>الاستحقاق: {invoice.due_date}</span>
                          {invoice.payment_date && <span className="text-green-400">دُفعت: {invoice.payment_date}</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-left">
                          <p className="text-xl font-bold text-white">{invoice.amount.toLocaleString()}</p>
                          <p className="text-slate-500 text-xs">ر.س</p>
                        </div>
                        {invoice.status === 'pending' && (
                          <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => {
                            setInvoices(invoices.map(inv => inv.id === invoice.id ? { ...inv, status: 'paid', payment_date: new Date().toISOString().split('T')[0] } : inv));
                            toast.success('تم تسجيل الدفع');
                          }}>
                            <Check className="w-3 h-3 ml-1" />
                            دفع
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
      </Tabs>

      {/* Invoice Dialog */}
      <Dialog open={showInvoiceDialog} onOpenChange={setShowInvoiceDialog}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-400" />
              إنشاء فاتورة
            </DialogTitle>
          </DialogHeader>
          {selectedContract && (
            <div className="space-y-4 mt-4">
              <div className="p-3 bg-slate-800/50 rounded-lg">
                <p className="text-white font-medium">{selectedContract.title}</p>
                <p className="text-slate-400 text-sm">{selectedContract.contractor_name}</p>
                <div className="flex justify-between mt-2 text-xs">
                  <span className="text-slate-500">قيمة العقد: {selectedContract.value.toLocaleString()} ر.س</span>
                  <span className="text-green-400">المدفوع: {(selectedContract.paid_amount || 0).toLocaleString()} ر.س</span>
                </div>
              </div>
              <div>
                <Label className="text-slate-300">المبلغ</Label>
                <Input type="number" value={newInvoice.amount} onChange={(e) => setNewInvoice({ ...newInvoice, amount: Number(e.target.value) })} className="bg-slate-800/50 border-slate-700 text-white mt-1" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-slate-300">تاريخ الفاتورة</Label>
                  <Input type="date" value={newInvoice.date} onChange={(e) => setNewInvoice({ ...newInvoice, date: e.target.value })} className="bg-slate-800/50 border-slate-700 text-white mt-1" />
                </div>
                <div>
                  <Label className="text-slate-300">تاريخ الاستحقاق</Label>
                  <Input type="date" value={newInvoice.due_date} onChange={(e) => setNewInvoice({ ...newInvoice, due_date: e.target.value })} className="bg-slate-800/50 border-slate-700 text-white mt-1" />
                </div>
              </div>
              <Button className="w-full bg-green-600 hover:bg-green-700" onClick={() => {
                if (!newInvoice.amount) { toast.error('يرجى إدخال المبلغ'); return; }
                const invoice = {
                  id: Date.now(),
                  invoice_number: `INV-${new Date().getFullYear()}-${String(invoices.length + 1).padStart(3, '0')}`,
                  contract_id: String(selectedContract.id),
                  contractor_name: selectedContract.contractor_name,
                  amount: newInvoice.amount,
                  date: newInvoice.date || new Date().toISOString().split('T')[0],
                  due_date: newInvoice.due_date,
                  status: 'pending'
                };
                setInvoices([invoice, ...invoices]);
                setShowInvoiceDialog(false);
                setNewInvoice({ contract_id: '', contractor_name: '', amount: 0, date: '', due_date: '', items: [] });
                toast.success('تم إنشاء الفاتورة');
              }}>
                <FileText className="w-4 h-4 ml-2" />
                إنشاء الفاتورة
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Contract Detail Dialog */}
      <Dialog open={showContractDetailDialog} onOpenChange={setShowContractDetailDialog}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white">تفاصيل العقد</DialogTitle>
          </DialogHeader>
          {selectedContract && (
            <div className="space-y-4 mt-4">
              <div className="p-4 bg-slate-800/50 rounded-lg">
                <h3 className="text-white font-bold text-lg">{selectedContract.title}</h3>
                <p className="text-slate-400">{selectedContract.contractor_name}</p>
                <p className="text-slate-500 text-sm font-mono">{selectedContract.contract_number}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-800/30 rounded-lg">
                  <p className="text-slate-400 text-xs">قيمة العقد</p>
                  <p className="text-white font-bold">{selectedContract.value.toLocaleString()} ر.س</p>
                </div>
                <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                  <p className="text-slate-400 text-xs">المدفوع</p>
                  <p className="text-green-400 font-bold">{(selectedContract.paid_amount || 0).toLocaleString()} ر.س</p>
                </div>
                <div className="p-3 bg-slate-800/30 rounded-lg">
                  <p className="text-slate-400 text-xs">البداية</p>
                  <p className="text-white">{selectedContract.start_date}</p>
                </div>
                <div className="p-3 bg-slate-800/30 rounded-lg">
                  <p className="text-slate-400 text-xs">النهاية</p>
                  <p className="text-white">{selectedContract.end_date}</p>
                </div>
              </div>
              {selectedContract.inventory_items?.length > 0 && (
                <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                  <p className="text-purple-300 font-medium mb-2 flex items-center gap-2">
                    <Package className="w-4 h-4" />
                    قطع الغيار المرتبطة
                  </p>
                  {selectedContract.inventory_items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span className="text-white">{item.name}</span>
                      <span className="text-slate-400">× {item.quantity}</span>
                    </div>
                  ))}
                </div>
              )}
              <div>
                <p className="text-slate-400 text-xs mb-2">فواتير العقد</p>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {invoices.filter(inv => inv.contract_id === String(selectedContract.id)).map(inv => (
                    <div key={inv.id} className="flex items-center justify-between p-2 bg-slate-800/30 rounded text-sm">
                      <span className="text-white">{inv.invoice_number}</span>
                      <span className="text-slate-400">{inv.amount.toLocaleString()} ر.س</span>
                      <Badge className={inv.status === 'paid' ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'}>
                        {inv.status === 'paid' ? 'مدفوعة' : 'قيد الانتظار'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Contractor Dialog */}
      <Dialog open={showContractorDialog} onOpenChange={setShowContractorDialog}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-400" />
              إضافة متعاقد جديد
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-slate-300">الاسم *</Label>
                <Input value={newContractor.name} onChange={(e) => setNewContractor({ ...newContractor, name: e.target.value })} className="bg-slate-800/50 border-slate-700 text-white mt-1" />
              </div>
              <div>
                <Label className="text-slate-300">النوع</Label>
                <Select value={newContractor.type} onValueChange={(v) => setNewContractor({ ...newContractor, type: v })}>
                  <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="company">شركة</SelectItem>
                    <SelectItem value="individual">فرد</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label className="text-slate-300">التخصص *</Label>
              <Input value={newContractor.specialty} onChange={(e) => setNewContractor({ ...newContractor, specialty: e.target.value })} className="bg-slate-800/50 border-slate-700 text-white mt-1" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-slate-300">جهة الاتصال</Label>
                <Input value={newContractor.contact_person} onChange={(e) => setNewContractor({ ...newContractor, contact_person: e.target.value })} className="bg-slate-800/50 border-slate-700 text-white mt-1" />
              </div>
              <div>
                <Label className="text-slate-300">الهاتف</Label>
                <Input value={newContractor.phone} onChange={(e) => setNewContractor({ ...newContractor, phone: e.target.value })} className="bg-slate-800/50 border-slate-700 text-white mt-1" />
              </div>
            </div>
            <div>
              <Label className="text-slate-300">البريد الإلكتروني</Label>
              <Input type="email" value={newContractor.email} onChange={(e) => setNewContractor({ ...newContractor, email: e.target.value })} className="bg-slate-800/50 border-slate-700 text-white mt-1" />
            </div>
            <Button className="w-full bg-purple-600 hover:bg-purple-700" onClick={createContractor}>
              <Plus className="w-4 h-4 ml-2" />
              إضافة المتعاقد
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Contract Dialog */}
      <Dialog open={showContractDialog} onOpenChange={setShowContractDialog}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-cyan-400" />
              إنشاء عقد جديد
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label className="text-slate-300">المتعاقد *</Label>
              <Select value={newContract.contractor_id} onValueChange={(v) => {
                const c = contractors.find(x => x.id === Number(v));
                setNewContract({ ...newContract, contractor_id: v, contractor_name: c?.name || '' });
              }}>
                <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white mt-1"><SelectValue placeholder="اختر المتعاقد" /></SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  {contractors.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-slate-300">عنوان العقد *</Label>
              <Input value={newContract.title} onChange={(e) => setNewContract({ ...newContract, title: e.target.value })} className="bg-slate-800/50 border-slate-700 text-white mt-1" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-slate-300">نوع العقد</Label>
                <Select value={newContract.type} onValueChange={(v) => setNewContract({ ...newContract, type: v })}>
                  <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="maintenance">صيانة</SelectItem>
                    <SelectItem value="service">خدمات</SelectItem>
                    <SelectItem value="supply">توريد</SelectItem>
                    <SelectItem value="project">مشروع</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-slate-300">قيمة العقد</Label>
                <Input type="number" value={newContract.value} onChange={(e) => setNewContract({ ...newContract, value: Number(e.target.value) })} className="bg-slate-800/50 border-slate-700 text-white mt-1" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-slate-300">تاريخ البدء *</Label>
                <Input type="date" value={newContract.start_date} onChange={(e) => setNewContract({ ...newContract, start_date: e.target.value })} className="bg-slate-800/50 border-slate-700 text-white mt-1" />
              </div>
              <div>
                <Label className="text-slate-300">تاريخ الانتهاء *</Label>
                <Input type="date" value={newContract.end_date} onChange={(e) => setNewContract({ ...newContract, end_date: e.target.value })} className="bg-slate-800/50 border-slate-700 text-white mt-1" />
              </div>
            </div>
            <div>
              <Label className="text-slate-300">التنبيه قبل (أيام)</Label>
              <Input type="number" value={newContract.alert_days_before} onChange={(e) => setNewContract({ ...newContract, alert_days_before: Number(e.target.value) })} className="bg-slate-800/50 border-slate-700 text-white mt-1" />
            </div>
            <Button className="w-full bg-cyan-600 hover:bg-cyan-700" onClick={createContract}>
              <FileText className="w-4 h-4 ml-2" />
              إنشاء العقد
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Rating Dialog */}
      <Dialog open={showRatingDialog} onOpenChange={setShowRatingDialog}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-400" />
              تقييم المتعاقد
            </DialogTitle>
          </DialogHeader>
          {selectedContractor && (
            <div className="space-y-4 mt-4">
              <div className="p-3 bg-slate-800/50 rounded-lg text-center">
                <p className="text-white font-bold">{selectedContractor.name}</p>
                <p className="text-slate-400 text-sm">{selectedContractor.specialty}</p>
              </div>
              {[
                { key: 'quality', label: 'جودة العمل' },
                { key: 'timeliness', label: 'الالتزام بالوقت' },
                { key: 'communication', label: 'التواصل' },
                { key: 'cost_adherence', label: 'الالتزام بالتكلفة' },
              ].map(item => (
                <div key={item.key} className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg">
                  <span className="text-white text-sm">{item.label}</span>
                  {renderStars(newRating[item.key], true, (v) => setNewRating({ ...newRating, [item.key]: v }))}
                </div>
              ))}
              <Button className="w-full bg-amber-600 hover:bg-amber-700" onClick={submitRating}>
                <Check className="w-4 h-4 ml-2" />
                حفظ التقييم
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}