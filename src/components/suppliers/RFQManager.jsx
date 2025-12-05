import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Send, FileText, Building2, Calendar, Clock, CheckCircle,
  Eye, Plus, DollarSign, Package, AlertTriangle, Award,
  ChevronRight, Download, Trash2, Edit, X
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import { toast } from 'sonner';

const mockRFQs = [
  {
    id: 1,
    rfqNumber: 'RFQ-2024-001',
    title: 'قطع غيار مكيفات - الربع الأول 2025',
    description: 'طلب عرض أسعار للقطع المطلوبة للصيانة الدورية',
    items: [
      { name: 'فلتر مكيف سبليت', quantity: 100, unit: 'قطعة' },
      { name: 'غاز فريون R410', quantity: 50, unit: 'أسطوانة' },
      { name: 'حساس حرارة', quantity: 30, unit: 'قطعة' },
    ],
    suppliers: ['شركة المستلزمات الصناعية', 'مؤسسة التقنية المتقدمة', 'مصنع قطع الغيار الوطني'],
    deadline: '2024-12-15',
    status: 'open',
    createdAt: '2024-12-01',
    responses: [
      {
        supplier: 'شركة المستلزمات الصناعية',
        total: 8500,
        deliveryDays: 5,
        validity: '30 يوم',
        items: [
          { name: 'فلتر مكيف سبليت', unitPrice: 45, total: 4500 },
          { name: 'غاز فريون R410', unitPrice: 60, total: 3000 },
          { name: 'حساس حرارة', unitPrice: 33, total: 1000 },
        ],
        submittedAt: '2024-12-03',
        notes: 'يمكن توفير ضمان سنة على الحساسات'
      },
      {
        supplier: 'مصنع قطع الغيار الوطني',
        total: 7800,
        deliveryDays: 7,
        validity: '15 يوم',
        items: [
          { name: 'فلتر مكيف سبليت', unitPrice: 40, total: 4000 },
          { name: 'غاز فريون R410', unitPrice: 55, total: 2750 },
          { name: 'حساس حرارة', unitPrice: 35, total: 1050 },
        ],
        submittedAt: '2024-12-04',
        notes: 'الأسعار تشمل التوصيل'
      }
    ]
  },
  {
    id: 2,
    rfqNumber: 'RFQ-2024-002',
    title: 'كاميرات أمنية',
    description: 'كاميرات IP للمباني الجديدة',
    items: [
      { name: 'كاميرا IP 4MP', quantity: 20, unit: 'قطعة' },
    ],
    suppliers: ['مؤسسة التقنية المتقدمة'],
    deadline: '2024-12-10',
    status: 'closed',
    createdAt: '2024-11-28',
    responses: [
      {
        supplier: 'مؤسسة التقنية المتقدمة',
        total: 17000,
        deliveryDays: 10,
        validity: '45 يوم',
        items: [
          { name: 'كاميرا IP 4MP', unitPrice: 850, total: 17000 },
        ],
        submittedAt: '2024-12-02',
        notes: 'ضمان 3 سنوات + تركيب مجاني',
        selected: true
      }
    ]
  }
];

const availableSuppliers = [
  { id: 1, name: 'شركة المستلزمات الصناعية', category: 'قطع غيار' },
  { id: 2, name: 'مؤسسة التقنية المتقدمة', category: 'إلكترونيات' },
  { id: 3, name: 'مصنع قطع الغيار الوطني', category: 'قطع غيار' },
  { id: 4, name: 'شركة الأمان للأنظمة', category: 'أمن' },
];

export default function RFQManager() {
  const [rfqs, setRFQs] = useState(mockRFQs);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [selectedRFQ, setSelectedRFQ] = useState(null);
  const [showCompareDialog, setShowCompareDialog] = useState(false);

  const [newRFQ, setNewRFQ] = useState({
    title: '',
    description: '',
    items: [{ name: '', quantity: '', unit: 'قطعة' }],
    selectedSuppliers: [],
    deadline: ''
  });

  const addItem = () => {
    setNewRFQ({
      ...newRFQ,
      items: [...newRFQ.items, { name: '', quantity: '', unit: 'قطعة' }]
    });
  };

  const removeItem = (idx) => {
    setNewRFQ({
      ...newRFQ,
      items: newRFQ.items.filter((_, i) => i !== idx)
    });
  };

  const updateItem = (idx, field, value) => {
    setNewRFQ({
      ...newRFQ,
      items: newRFQ.items.map((item, i) => i === idx ? { ...item, [field]: value } : item)
    });
  };

  const toggleSupplier = (supplierName) => {
    setNewRFQ({
      ...newRFQ,
      selectedSuppliers: newRFQ.selectedSuppliers.includes(supplierName)
        ? newRFQ.selectedSuppliers.filter(s => s !== supplierName)
        : [...newRFQ.selectedSuppliers, supplierName]
    });
  };

  const createRFQ = () => {
    if (!newRFQ.title || newRFQ.items[0].name === '' || newRFQ.selectedSuppliers.length === 0) {
      toast.error('يرجى إكمال البيانات المطلوبة');
      return;
    }

    const rfq = {
      id: Date.now(),
      rfqNumber: `RFQ-2024-${String(rfqs.length + 1).padStart(3, '0')}`,
      title: newRFQ.title,
      description: newRFQ.description,
      items: newRFQ.items.filter(i => i.name),
      suppliers: newRFQ.selectedSuppliers,
      deadline: newRFQ.deadline,
      status: 'open',
      createdAt: new Date().toISOString().split('T')[0],
      responses: []
    };

    setRFQs([rfq, ...rfqs]);
    setShowCreateDialog(false);
    setNewRFQ({ title: '', description: '', items: [{ name: '', quantity: '', unit: 'قطعة' }], selectedSuppliers: [], deadline: '' });
    toast.success(`تم إرسال طلب عرض السعر إلى ${rfq.suppliers.length} موردين`);
  };

  const selectQuote = (rfqId, supplierName) => {
    setRFQs(rfqs.map(rfq => {
      if (rfq.id === rfqId) {
        return {
          ...rfq,
          status: 'closed',
          responses: rfq.responses.map(r => ({
            ...r,
            selected: r.supplier === supplierName
          }))
        };
      }
      return rfq;
    }));
    toast.success('تم اختيار العرض');
    setShowCompareDialog(false);
  };

  const statusColors = {
    open: 'bg-green-500/20 text-green-400',
    pending: 'bg-amber-500/20 text-amber-400',
    closed: 'bg-slate-500/20 text-slate-400',
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Send className="w-6 h-6 text-amber-400" />
            طلبات عروض الأسعار
          </h2>
          <p className="text-slate-400 text-sm">إنشاء وتتبع طلبات العروض</p>
        </div>
        <Button className="bg-amber-600 hover:bg-amber-700" onClick={() => setShowCreateDialog(true)}>
          <Plus className="w-4 h-4 ml-2" />
          طلب جديد
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="glass-card border-green-500/20 bg-green-500/5">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-400">{rfqs.filter(r => r.status === 'open').length}</p>
            <p className="text-slate-400 text-sm">طلبات مفتوحة</p>
          </CardContent>
        </Card>
        <Card className="glass-card border-cyan-500/20 bg-cyan-500/5">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-cyan-400">{rfqs.reduce((sum, r) => sum + r.responses.length, 0)}</p>
            <p className="text-slate-400 text-sm">عروض مستلمة</p>
          </CardContent>
        </Card>
        <Card className="glass-card border-purple-500/20 bg-purple-500/5">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-purple-400">{rfqs.filter(r => r.status === 'closed').length}</p>
            <p className="text-slate-400 text-sm">طلبات مغلقة</p>
          </CardContent>
        </Card>
      </div>

      {/* RFQ List */}
      <div className="space-y-3">
        {rfqs.map((rfq) => (
          <motion.div
            key={rfq.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-white font-bold">{rfq.rfqNumber}</h3>
                      <Badge className={statusColors[rfq.status]}>
                        {rfq.status === 'open' ? 'مفتوح' : rfq.status === 'pending' ? 'قيد الانتظار' : 'مغلق'}
                      </Badge>
                    </div>
                    <p className="text-slate-300">{rfq.title}</p>
                    <p className="text-slate-500 text-sm">{rfq.description}</p>
                  </div>
                  <div className="text-left">
                    <p className="text-cyan-400 font-bold">{rfq.responses.length}/{rfq.suppliers.length}</p>
                    <p className="text-slate-500 text-xs">ردود</p>
                  </div>
                </div>

                {/* Progress */}
                <div className="mb-3">
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>نسبة الردود</span>
                    <span>{Math.round((rfq.responses.length / rfq.suppliers.length) * 100)}%</span>
                  </div>
                  <Progress value={(rfq.responses.length / rfq.suppliers.length) * 100} className="h-1.5" />
                </div>

                {/* Info */}
                <div className="flex items-center gap-4 text-xs text-slate-400 mb-3">
                  <span><Package className="w-3 h-3 inline ml-1" />{rfq.items.length} أصناف</span>
                  <span><Building2 className="w-3 h-3 inline ml-1" />{rfq.suppliers.length} موردين</span>
                  <span><Calendar className="w-3 h-3 inline ml-1" />ينتهي: {rfq.deadline}</span>
                </div>

                {/* Best Quote */}
                {rfq.responses.length > 0 && (
                  <div className="p-2 bg-green-500/10 border border-green-500/30 rounded-lg mb-3">
                    <div className="flex items-center justify-between">
                      <span className="text-green-400 text-sm">
                        <Award className="w-4 h-4 inline ml-1" />
                        أفضل عرض: {rfq.responses.sort((a, b) => a.total - b.total)[0].supplier}
                      </span>
                      <span className="text-green-300 font-bold">
                        {rfq.responses.sort((a, b) => a.total - b.total)[0].total.toLocaleString()} ر.س
                      </span>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-slate-600"
                    onClick={() => { setSelectedRFQ(rfq); setShowDetailDialog(true); }}
                  >
                    <Eye className="w-3 h-3 ml-1" />
                    التفاصيل
                  </Button>
                  {rfq.responses.length > 1 && rfq.status === 'open' && (
                    <Button
                      size="sm"
                      className="bg-purple-600 hover:bg-purple-700"
                      onClick={() => { setSelectedRFQ(rfq); setShowCompareDialog(true); }}
                    >
                      <DollarSign className="w-3 h-3 ml-1" />
                      مقارنة العروض
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Create RFQ Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Send className="w-5 h-5 text-amber-400" />
              إنشاء طلب عرض سعر
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label className="text-slate-300">العنوان *</Label>
              <Input
                value={newRFQ.title}
                onChange={(e) => setNewRFQ({ ...newRFQ, title: e.target.value })}
                className="bg-slate-800/50 border-slate-700 text-white mt-1"
                placeholder="مثال: قطع غيار مكيفات"
              />
            </div>
            <div>
              <Label className="text-slate-300">الوصف</Label>
              <Textarea
                value={newRFQ.description}
                onChange={(e) => setNewRFQ({ ...newRFQ, description: e.target.value })}
                className="bg-slate-800/50 border-slate-700 text-white mt-1"
                rows={2}
              />
            </div>

            {/* Items */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-slate-300">الأصناف *</Label>
                <Button size="sm" variant="ghost" className="text-cyan-400" onClick={addItem}>
                  <Plus className="w-3 h-3 ml-1" />
                  إضافة
                </Button>
              </div>
              <div className="space-y-2">
                {newRFQ.items.map((item, idx) => (
                  <div key={idx} className="flex gap-2">
                    <Input
                      value={item.name}
                      onChange={(e) => updateItem(idx, 'name', e.target.value)}
                      className="flex-1 bg-slate-800/50 border-slate-700 text-white"
                      placeholder="اسم الصنف"
                    />
                    <Input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateItem(idx, 'quantity', e.target.value)}
                      className="w-20 bg-slate-800/50 border-slate-700 text-white"
                      placeholder="الكمية"
                    />
                    <Select value={item.unit} onValueChange={(v) => updateItem(idx, 'unit', v)}>
                      <SelectTrigger className="w-24 bg-slate-800/50 border-slate-700 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        <SelectItem value="قطعة">قطعة</SelectItem>
                        <SelectItem value="متر">متر</SelectItem>
                        <SelectItem value="كجم">كجم</SelectItem>
                        <SelectItem value="لتر">لتر</SelectItem>
                      </SelectContent>
                    </Select>
                    {newRFQ.items.length > 1 && (
                      <Button size="icon" variant="ghost" onClick={() => removeItem(idx)}>
                        <X className="w-4 h-4 text-red-400" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Suppliers */}
            <div>
              <Label className="text-slate-300 mb-2 block">الموردون *</Label>
              <div className="grid grid-cols-2 gap-2">
                {availableSuppliers.map(supplier => (
                  <div
                    key={supplier.id}
                    className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer border transition-colors ${
                      newRFQ.selectedSuppliers.includes(supplier.name)
                        ? 'bg-cyan-500/20 border-cyan-500/50'
                        : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
                    }`}
                    onClick={() => toggleSupplier(supplier.name)}
                  >
                    <Checkbox checked={newRFQ.selectedSuppliers.includes(supplier.name)} />
                    <div>
                      <p className="text-white text-sm">{supplier.name}</p>
                      <p className="text-slate-500 text-xs">{supplier.category}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-slate-300">تاريخ الانتهاء</Label>
              <Input
                type="date"
                value={newRFQ.deadline}
                onChange={(e) => setNewRFQ({ ...newRFQ, deadline: e.target.value })}
                className="bg-slate-800/50 border-slate-700 text-white mt-1"
              />
            </div>

            <Button className="w-full bg-amber-600 hover:bg-amber-700" onClick={createRFQ}>
              <Send className="w-4 h-4 ml-2" />
              إرسال للموردين
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Compare Quotes Dialog */}
      <Dialog open={showCompareDialog} onOpenChange={setShowCompareDialog}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white">مقارنة العروض</DialogTitle>
          </DialogHeader>
          {selectedRFQ && (
            <div className="space-y-4 mt-4">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-right text-slate-400 p-2">المورد</th>
                      <th className="text-center text-slate-400 p-2">الإجمالي</th>
                      <th className="text-center text-slate-400 p-2">التسليم</th>
                      <th className="text-center text-slate-400 p-2">الصلاحية</th>
                      <th className="text-center text-slate-400 p-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedRFQ.responses.sort((a, b) => a.total - b.total).map((response, idx) => (
                      <tr key={response.supplier} className={`border-b border-slate-800 ${idx === 0 ? 'bg-green-500/5' : ''}`}>
                        <td className="p-2">
                          <div className="flex items-center gap-2">
                            {idx === 0 && <Award className="w-4 h-4 text-amber-400" />}
                            <span className="text-white">{response.supplier}</span>
                          </div>
                        </td>
                        <td className="text-center p-2">
                          <span className={`font-bold ${idx === 0 ? 'text-green-400' : 'text-white'}`}>
                            {response.total.toLocaleString()} ر.س
                          </span>
                        </td>
                        <td className="text-center p-2 text-slate-300">{response.deliveryDays} أيام</td>
                        <td className="text-center p-2 text-slate-300">{response.validity}</td>
                        <td className="text-center p-2">
                          <Button
                            size="sm"
                            className={response.selected ? 'bg-green-600' : 'bg-cyan-600 hover:bg-cyan-700'}
                            onClick={() => selectQuote(selectedRFQ.id, response.supplier)}
                            disabled={response.selected}
                          >
                            {response.selected ? <CheckCircle className="w-3 h-3" /> : 'اختيار'}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white">{selectedRFQ?.rfqNumber}</DialogTitle>
          </DialogHeader>
          {selectedRFQ && (
            <div className="space-y-4 mt-4">
              <div className="p-3 bg-slate-800/50 rounded-lg">
                <h3 className="text-white font-bold">{selectedRFQ.title}</h3>
                <p className="text-slate-400 text-sm">{selectedRFQ.description}</p>
              </div>

              <div>
                <h4 className="text-slate-300 text-sm mb-2">الأصناف المطلوبة</h4>
                <div className="space-y-1">
                  {selectedRFQ.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between p-2 bg-slate-800/30 rounded">
                      <span className="text-white">{item.name}</span>
                      <span className="text-slate-400">{item.quantity} {item.unit}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-slate-300 text-sm mb-2">الموردون المدعوون</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedRFQ.suppliers.map((s, i) => (
                    <Badge key={i} variant="outline" className="border-slate-600">{s}</Badge>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}