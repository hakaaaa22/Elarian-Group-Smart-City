import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Send, X, Reply, ThumbsUp, MoreVertical, Trash2, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const sampleComments = [
  {
    id: '1',
    user: { name: 'أحمد محمد', avatar: 'أ', color: 'bg-cyan-500' },
    text: 'هذا الشذوذ يبدو مرتبطًا بتحديث النظام الأخير. نحتاج لمراجعة السجلات.',
    timestamp: new Date(Date.now() - 300000),
    likes: 3,
    replies: [
      {
        id: '1-1',
        user: { name: 'سارة علي', avatar: 'س', color: 'bg-purple-500' },
        text: 'صحيح، لاحظت نفس الشيء. سأفحص سجلات الخادم.',
        timestamp: new Date(Date.now() - 200000),
        likes: 1,
      }
    ]
  },
  {
    id: '2',
    user: { name: 'خالد العريان', avatar: 'خ', color: 'bg-green-500' },
    text: 'تم حل المشكلة. كان السبب هو تعارض في إعدادات الشبكة.',
    timestamp: new Date(Date.now() - 100000),
    likes: 5,
    replies: []
  }
];

export default function CommentSystem({ entityType, entityId, entityTitle, isOpen, onClose }) {
  const [comments, setComments] = useState(sampleComments);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');

  const formatTime = (date) => {
    const diff = Math.floor((Date.now() - date.getTime()) / 1000);
    if (diff < 60) return 'الآن';
    if (diff < 3600) return `منذ ${Math.floor(diff / 60)} دقيقة`;
    if (diff < 86400) return `منذ ${Math.floor(diff / 3600)} ساعة`;
    return `منذ ${Math.floor(diff / 86400)} يوم`;
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    
    const comment = {
      id: Date.now().toString(),
      user: { name: 'أنت', avatar: 'أ', color: 'bg-indigo-500' },
      text: newComment,
      timestamp: new Date(),
      likes: 0,
      replies: []
    };
    
    setComments([comment, ...comments]);
    setNewComment('');
  };

  const handleAddReply = (commentId) => {
    if (!replyText.trim()) return;
    
    const reply = {
      id: `${commentId}-${Date.now()}`,
      user: { name: 'أنت', avatar: 'أ', color: 'bg-indigo-500' },
      text: replyText,
      timestamp: new Date(),
      likes: 0,
    };
    
    setComments(comments.map(c => 
      c.id === commentId 
        ? { ...c, replies: [...c.replies, reply] }
        : c
    ));
    setReplyingTo(null);
    setReplyText('');
  };

  const handleLike = (commentId, replyId = null) => {
    setComments(comments.map(c => {
      if (replyId && c.id === commentId) {
        return {
          ...c,
          replies: c.replies.map(r => 
            r.id === replyId ? { ...r, likes: r.likes + 1 } : r
          )
        };
      }
      if (c.id === commentId && !replyId) {
        return { ...c, likes: c.likes + 1 };
      }
      return c;
    }));
  };

  const handleDelete = (commentId, replyId = null) => {
    if (replyId) {
      setComments(comments.map(c => 
        c.id === commentId 
          ? { ...c, replies: c.replies.filter(r => r.id !== replyId) }
          : c
      ));
    } else {
      setComments(comments.filter(c => c.id !== commentId));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#0f1629] border-slate-700 max-w-lg max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-cyan-400" />
            التعليقات والمناقشة
          </DialogTitle>
          {entityTitle && (
            <Badge variant="outline" className="w-fit border-slate-600 text-slate-300 text-xs mt-1">
              {entityType}: {entityTitle}
            </Badge>
          )}
        </DialogHeader>

        <div className="space-y-4">
          {/* New Comment Input */}
          <div className="flex gap-2">
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="اكتب تعليقك..."
              className="bg-slate-800/50 border-slate-700 text-white resize-none h-20"
            />
            <Button 
              onClick={handleAddComment}
              className="bg-cyan-600 hover:bg-cyan-700 h-20"
              disabled={!newComment.trim()}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>

          {/* Comments List */}
          <ScrollArea className="h-[400px] pr-2">
            <div className="space-y-4">
              <AnimatePresence>
                {comments.map((comment) => (
                  <motion.div
                    key={comment.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-2"
                  >
                    {/* Main Comment */}
                    <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className={`w-8 h-8 rounded-full ${comment.user.color} flex items-center justify-center text-white text-sm font-bold`}>
                            {comment.user.avatar}
                          </div>
                          <div>
                            <p className="text-white text-sm font-medium">{comment.user.name}</p>
                            <p className="text-slate-500 text-xs">{formatTime(comment.timestamp)}</p>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-400">
                              <MoreVertical className="w-3 h-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="bg-slate-800 border-slate-700">
                            <DropdownMenuItem className="text-slate-300 hover:text-white">
                              <Edit2 className="w-3 h-3 ml-2" />
                              تعديل
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-red-400 hover:text-red-300"
                              onClick={() => handleDelete(comment.id)}
                            >
                              <Trash2 className="w-3 h-3 ml-2" />
                              حذف
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      
                      <p className="text-slate-300 text-sm mb-2">{comment.text}</p>
                      
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => handleLike(comment.id)}
                          className="flex items-center gap-1 text-slate-400 hover:text-cyan-400 text-xs transition-colors"
                        >
                          <ThumbsUp className="w-3 h-3" />
                          {comment.likes}
                        </button>
                        <button 
                          onClick={() => setReplyingTo(comment.id)}
                          className="flex items-center gap-1 text-slate-400 hover:text-cyan-400 text-xs transition-colors"
                        >
                          <Reply className="w-3 h-3" />
                          رد
                        </button>
                      </div>

                      {/* Reply Input */}
                      {replyingTo === comment.id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="mt-3 flex gap-2"
                        >
                          <Input
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder="اكتب ردك..."
                            className="bg-slate-900/50 border-slate-600 text-white text-sm"
                          />
                          <Button 
                            size="sm" 
                            onClick={() => handleAddReply(comment.id)}
                            className="bg-cyan-600 hover:bg-cyan-700"
                          >
                            <Send className="w-3 h-3" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => setReplyingTo(null)}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </motion.div>
                      )}
                    </div>

                    {/* Replies */}
                    {comment.replies.length > 0 && (
                      <div className="mr-6 space-y-2">
                        {comment.replies.map((reply) => (
                          <motion.div
                            key={reply.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="p-2 bg-slate-900/50 rounded-lg border border-slate-700/30"
                          >
                            <div className="flex items-start justify-between mb-1">
                              <div className="flex items-center gap-2">
                                <div className={`w-6 h-6 rounded-full ${reply.user.color} flex items-center justify-center text-white text-xs font-bold`}>
                                  {reply.user.avatar}
                                </div>
                                <div>
                                  <p className="text-white text-xs font-medium">{reply.user.name}</p>
                                  <p className="text-slate-500 text-[10px]">{formatTime(reply.timestamp)}</p>
                                </div>
                              </div>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-5 w-5 text-slate-400"
                                onClick={() => handleDelete(comment.id, reply.id)}
                              >
                                <Trash2 className="w-2 h-2" />
                              </Button>
                            </div>
                            <p className="text-slate-300 text-xs">{reply.text}</p>
                            <button 
                              onClick={() => handleLike(comment.id, reply.id)}
                              className="flex items-center gap-1 text-slate-400 hover:text-cyan-400 text-[10px] mt-1 transition-colors"
                            >
                              <ThumbsUp className="w-2 h-2" />
                              {reply.likes}
                            </button>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}