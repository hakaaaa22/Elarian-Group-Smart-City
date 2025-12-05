import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Package, Truck, CheckCircle, Clock, AlertTriangle, Eye,
  Calendar, DollarSign, Star, ThumbsUp, ThumbsDown, Filter,
  Search, ChevronRight, MapPin, Phone, FileText
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import { toast } from 'sonner';

const mockOrders = [
  {
    id: 1,
    orderNumber: 'PO-2024-001',
    supplier: 'شركة المستلزمات الصناعية',
    items: [
      { name: 'فلتر مكيف', quantity: 50, unitPrice: 45, received: 50 },
      { name: 'حساس حرارة', quantity: 20, unitPrice: 85, received: 20 },
    ],
    total: 3950,
    status: 'delivered',
    orderDate: '2024-11-25',
    expectedDate: '2024-11-28',
    deliveryDate: '2024-11-27',
    rating: { quality: 5, delivery: 5, packaging: 4 },
    trackingSteps: [
      { status: 'ordered', date: '2024-11-25 09:00', completed: true },
      { status: 'confirmed', date: '2024-11-25 11:30', completed: true },
      { status: 'shipped', date: '2024-11-26 14:00', completed: true },
      { status: 'delivered', date: '2024-11-27 10:15', completed: true },
    ]
  },
  {
    id: 2,
    orderNumber: 'PO-2024-002',
    supplier: 'مؤسسة التقنية المتقدمة',
    items: [
      { name: 'كاميرا IP', quantity: 5, unitPrice: 850, received: 0 },
      { name: 'كابل شبكة', quantity: 200, unitPrice: 5, received: 0 },
    ],
    total: 5250,
    status: 'shipped',
    orderDate: '2024-12-01',
    expectedDate: '2024-12-06',
    deliveryDate: null,
    rating: null,
    trackingSteps: [
      { status: 'ordered', date: '2024-12-01 10:00', completed: true },
      { status: 'confirmed', date: '2024-12-01 14:00', completed: true },
      { status: 'shipped', date: '2024-12-03 09:00', completed: true },
      { status: 'delivered', date: null, completed: false },
    ]
  },
  {
    id: 3,
    orderNumber: 'PO-2024-003',
    supplier: 'مصنع قطع الغيار الوطني',
    items: [
      { name: 'بطارية 12V', quantity: 30, unitPrice: 120, received: 0 },
    ],
    total: 3600,
    status: 'pending',
    orderDate: '2024-12-03',
    expectedDate: '2024-12-10',
    deliveryDate: null,
    rating: null,
    trackingSteps: [
      { status: 'ordered', date: '2024-12-03 11:00', completed: true },
      { status: 'confirmed', date: null, completed: false },
      { status: 'shipped', date: null, completed: false },
      { status: 'delivered', date: null, completed: false },
    ]
  },
];

const statusConfig = {
  pending: { label: 'قيد الانتظار', color: 'bg-slate-500/20 text-slate-400', icon: Clock },
  confirmed: { label: 'تم التأكيد', color: 'bg-blue-500/20 text-blue-400', icon: CheckCircle },
  shipped: { label: 'قيد الشحن', color: 'bg-cyan-500/20 text-cyan-400', icon: Truck },
  delivered: { label: 'تم التسليم', color: 'bg-green-500/20 text-green-400', icon: CheckCircle },
  cancelled: { label: 'ملغي', color: 'bg-red-500/20 text-red-400', icon: AlertTriangle },
};

export default function SupplierOrderTracker({ onRateSupplier }) {
  const [orders, setOrders] = useState(mockOrders);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showRatingDialog, setShowRatingDialog] = useState(false);
  const [ratingOrder, setRatingOrder] = useState(null);
  const [ratings, setRatings] = useState({ quality: 0, delivery: 0, packaging: 0 });
  const [ratingNotes, setRatingNotes] = useState('');

  const filteredOrders = orders.filter(o => {
    const matchesSearch = o.orderNumber.includes(searchQuery) || o.supplier.includes(searchQuery);
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const submitRating = () => {
    if (ratings.quality === 0 || ratings.delivery === 0) {
      toast.error('يرجى إكمال التقييم');
      return;
    }
    setOrders(orders.map(o => o.id === ratingOrder.id ? { ...o, rating: ratings } : o));
    setShowRatingDialog(false);
    setRatingOrder(null);
    setRatings({ quality: 0, delivery: 0, packaging: 0 });
    setRatingNotes('');
    toast.success('تم حفظ التقييم');
  };

  const StarRating = ({ value, onChange, label }) => (
    <div className="flex items-center justify-between">
      <span className="text-slate-300 text-sm">{label}</span>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            onClick={() => onChange(star)}
            className="focus:outline-none"
          >
            <Star
              className={`w-5 h-5 ${star <= value ? 'text-amber-400 fill-amber-400' : 'text-slate-600'}`}
            />
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Search & Filter */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="بحث برقم الطلب أو المورد..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-10 bg-slate-800/50 border-slate-700 text-white"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40 bg-slate-800/50 border-slate-700 text-white">
            <SelectValue placeholder="الحالة" />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-700">
            <SelectItem value="all">جميع الحالات</SelectItem>
            <SelectItem value="pending">قيد الانتظار</SelectItem>
            <SelectItem value="confirmed">تم التأكيد</SelectItem>
            <SelectItem value="shipped">قيد الشحن</SelectItem>
            <SelectItem value="delivered">تم التسليم</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Orders List */}
      <div className="space-y-3">
        {filteredOrders.map((order) => {
          const StatusIcon = statusConfig[order.status].icon;
          return (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-white font-bold">{order.orderNumber}</h3>
                        <Badge className={statusConfig[order.status].color}>
                          <StatusIcon className="w-3 h-3 ml-1" />
                          {statusConfig[order.status].label}
                        </Badge>
                      </div>
                      <p className="text-slate-400 text-sm">{order.supplier}</p>
                    </div>
                    <div className="text-left">
                      <p className="text-xl font-bold text-white">{order.total.toLocaleString()} ر.س</p>
                      <p className="text-slate-500 text-xs">{order.items.length} أصناف</p>
                    </div>
                  </div>

                  {/* Tracking Progress */}
                  <div className="flex items-center justify-between mb-3 px-2">
                    {order.trackingSteps.map((step, idx) => (
                      <React.Fragment key={step.status}>
                        <div className="flex flex-col items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            step.completed ? 'bg-green-500/20' : 'bg-slate-700/50'
                          }`}>
                            {step.completed ? (
                              <CheckCircle className="w-4 h-4 text-green-400" />
                            ) : (
                              <div className="w-2 h-2 rounded-full bg-slate-500" />
                            )}
                          </div>
                          <span className={`text-[10px] mt-1 ${step.completed ? 'text-green-400' : 'text-slate-500'}`}>
                            {statusConfig[step.status]?.label}
                          </span>
                        </div>
                        {idx < order.trackingSteps.length - 1 && (
                          <div className={`flex-1 h-0.5 mx-1 ${
                            order.trackingSteps[idx + 1].completed ? 'bg-green-500' : 'bg-slate-700'
                          }`} />
                        )}
                      </React.Fragment>
                    ))}
                  </div>

                  {/* Dates */}
                  <div className="flex items-center gap-4 text-xs text-slate-400 mb-3">
                    <span><Calendar className="w-3 h-3 inline ml-1" />تاريخ الطلب: {order.orderDate}</span>
                    <span><Truck className="w-3 h-3 inline ml-1" />التسليم المتوقع: {order.expectedDate}</span>
                    {order.deliveryDate && (
                      <span className="text-green-400"><CheckCircle className="w-3 h-3 inline ml-1" />تم التسليم: {order.deliveryDate}</span>
                    )}
                  </div>

                  {/* Rating Display */}
                  {order.rating && (
                    <div className="flex items-center gap-4 p-2 bg-amber-500/10 rounded-lg mb-3">
                      <span className="text-amber-400 text-xs">التقييم:</span>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map(s => (
                          <Star key={s} className={`w-3 h-3 ${s <= order.rating.quality ? 'text-amber-400 fill-amber-400' : 'text-slate-600'}`} />
                        ))}
                      </div>
                      <span className="text-slate-400 text-xs">الجودة</span>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map(s => (
                          <Star key={s} className={`w-3 h-3 ${s <= order.rating.delivery ? 'text-amber-400 fill-amber-400' : 'text-slate-600'}`} />
                        ))}
                      </div>
                      <span className="text-slate-400 text-xs">التسليم</span>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-slate-600"
                      onClick={() => setSelectedOrder(order)}
                    >
                      <Eye className="w-3 h-3 ml-1" />
                      التفاصيل
                    </Button>
                    {order.status === 'delivered' && !order.rating && (
                      <Button
                        size="sm"
                        className="bg-amber-600 hover:bg-amber-700"
                        onClick={() => { setRatingOrder(order); setShowRatingDialog(true); }}
                      >
                        <Star className="w-3 h-3 ml-1" />
                        تقييم
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Order Detail Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white">تفاصيل الطلب {selectedOrder?.orderNumber}</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4 mt-4">
              <div className="p-3 bg-slate-800/50 rounded-lg">
                <p className="text-white font-medium">{selectedOrder.supplier}</p>
                <Badge className={statusConfig[selectedOrder.status].color + ' mt-2'}>
                  {statusConfig[selectedOrder.status].label}
                </Badge>
              </div>

              <div>
                <h4 className="text-slate-300 text-sm mb-2">الأصناف</h4>
                <div className="space-y-2">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-slate-800/30 rounded">
                      <div>
                        <p className="text-white text-sm">{item.name}</p>
                        <p className="text-slate-500 text-xs">{item.quantity} × {item.unitPrice} ر.س</p>
                      </div>
                      <p className="text-cyan-400 font-medium">{item.quantity * item.unitPrice} ر.س</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between p-3 bg-green-500/10 rounded-lg">
                <span className="text-white font-bold">الإجمالي</span>
                <span className="text-green-400 font-bold">{selectedOrder.total.toLocaleString()} ر.س</span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Rating Dialog */}
      <Dialog open={showRatingDialog} onOpenChange={setShowRatingDialog}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-400" />
              تقييم الطلب
            </DialogTitle>
          </DialogHeader>
          {ratingOrder && (
            <div className="space-y-4 mt-4">
              <div className="p-3 bg-slate-800/50 rounded-lg">
                <p className="text-slate-400 text-sm">{ratingOrder.orderNumber}</p>
                <p className="text-white">{ratingOrder.supplier}</p>
              </div>

              <div className="space-y-3">
                <StarRating
                  label="جودة المنتجات"
                  value={ratings.quality}
                  onChange={(v) => setRatings({ ...ratings, quality: v })}
                />
                <StarRating
                  label="الالتزام بالتسليم"
                  value={ratings.delivery}
                  onChange={(v) => setRatings({ ...ratings, delivery: v })}
                />
                <StarRating
                  label="جودة التغليف"
                  value={ratings.packaging}
                  onChange={(v) => setRatings({ ...ratings, packaging: v })}
                />
              </div>

              <div>
                <Label className="text-slate-300">ملاحظات</Label>
                <Textarea
                  value={ratingNotes}
                  onChange={(e) => setRatingNotes(e.target.value)}
                  className="bg-slate-800/50 border-slate-700 text-white mt-1"
                  placeholder="ملاحظات إضافية..."
                  rows={2}
                />
              </div>

              <Button className="w-full bg-amber-600 hover:bg-amber-700" onClick={submitRating}>
                <Star className="w-4 h-4 ml-2" />
                حفظ التقييم
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}