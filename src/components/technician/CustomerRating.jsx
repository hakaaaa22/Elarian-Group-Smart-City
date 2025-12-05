import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, Send, MessageSquare, ThumbsUp, ThumbsDown } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

const quickFeedback = [
  { id: 'fast', label: 'خدمة سريعة', icon: '⚡' },
  { id: 'professional', label: 'احترافي', icon: '👔' },
  { id: 'friendly', label: 'ودود', icon: '😊' },
  { id: 'clean', label: 'نظافة العمل', icon: '✨' },
  { id: 'expert', label: 'خبير', icon: '🎯' },
];

export default function CustomerRating({ task, onSubmit, onSkip }) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [selectedFeedback, setSelectedFeedback] = useState([]);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error('يرجى تحديد التقييم');
      return;
    }

    setIsSubmitting(true);
    
    // محاكاة إرسال التقييم
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    onSubmit?.({
      taskId: task.id,
      rating,
      feedback: selectedFeedback,
      comment,
      timestamp: new Date().toISOString()
    });

    toast.success('شكراً لتقييمك!');
    setIsSubmitting(false);
  };

  const toggleFeedback = (id) => {
    setSelectedFeedback(prev => 
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-4">
      {/* Task Info */}
      <div className="p-3 bg-slate-800/50 rounded-lg">
        <h3 className="text-white font-bold">{task?.title}</h3>
        <p className="text-slate-400 text-sm">{task?.customer}</p>
      </div>

      {/* Star Rating */}
      <div className="text-center py-4">
        <p className="text-slate-300 mb-3">كيف كانت الخدمة؟</p>
        <div className="flex justify-center gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <motion.button
              key={star}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              className="p-1"
            >
              <Star
                className={`w-10 h-10 transition-colors ${
                  star <= (hoveredRating || rating)
                    ? 'text-amber-400 fill-amber-400'
                    : 'text-slate-600'
                }`}
              />
            </motion.button>
          ))}
        </div>
        <p className="text-slate-400 text-sm mt-2">
          {rating === 1 ? 'سيء' :
           rating === 2 ? 'مقبول' :
           rating === 3 ? 'جيد' :
           rating === 4 ? 'جيد جداً' :
           rating === 5 ? 'ممتاز!' : 'اختر تقييمك'}
        </p>
      </div>

      {/* Quick Feedback */}
      {rating > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          <p className="text-slate-300 text-sm">ما الذي أعجبك؟</p>
          <div className="flex flex-wrap gap-2">
            {quickFeedback.map((item) => (
              <Button
                key={item.id}
                size="sm"
                variant={selectedFeedback.includes(item.id) ? "default" : "outline"}
                className={`${
                  selectedFeedback.includes(item.id)
                    ? 'bg-cyan-600 hover:bg-cyan-700'
                    : 'border-slate-600'
                }`}
                onClick={() => toggleFeedback(item.id)}
              >
                <span className="ml-1">{item.icon}</span>
                {item.label}
              </Button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Comment */}
      {rating > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <p className="text-slate-300 text-sm mb-2">ملاحظات إضافية (اختياري)</p>
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="شاركنا تجربتك..."
            className="bg-slate-800/50 border-slate-700 text-white"
            rows={3}
          />
        </motion.div>
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-2">
        <Button
          variant="outline"
          className="flex-1 border-slate-600"
          onClick={onSkip}
        >
          تخطي
        </Button>
        <Button
          className="flex-1 bg-green-600 hover:bg-green-700"
          onClick={handleSubmit}
          disabled={rating === 0 || isSubmitting}
        >
          {isSubmitting ? (
            <span className="animate-pulse">جاري الإرسال...</span>
          ) : (
            <>
              <Send className="w-4 h-4 ml-2" />
              إرسال التقييم
            </>
          )}
        </Button>
      </div>
    </div>
  );
}