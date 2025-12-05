import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Eye, Circle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

// Simulated active users for demo
const simulatedUsers = [
  { id: '1', name: 'أحمد محمد', email: 'ahmed@example.com', avatar: 'أ', color: 'bg-cyan-500', status: 'viewing', lastActive: new Date() },
  { id: '2', name: 'سارة علي', email: 'sara@example.com', avatar: 'س', color: 'bg-purple-500', status: 'editing', lastActive: new Date() },
  { id: '3', name: 'خالد العريان', email: 'khaled@example.com', avatar: 'خ', color: 'bg-green-500', status: 'viewing', lastActive: new Date() },
];

export default function PresenceIndicator({ dashboardId, currentUser }) {
  const [activeUsers, setActiveUsers] = useState([]);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    // Simulate real-time presence updates
    const filteredUsers = simulatedUsers.filter(u => u.email !== currentUser?.email);
    setActiveUsers(filteredUsers);

    // Simulate user activity changes
    const interval = setInterval(() => {
      setActiveUsers(prev => prev.map(user => ({
        ...user,
        status: Math.random() > 0.5 ? 'viewing' : 'editing',
        lastActive: new Date()
      })));
    }, 10000);

    return () => clearInterval(interval);
  }, [currentUser, dashboardId]);

  const displayUsers = showAll ? activeUsers : activeUsers.slice(0, 3);
  const remainingCount = activeUsers.length - 3;

  return (
    <TooltipProvider>
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 px-3 py-1.5 bg-slate-800/50 rounded-lg border border-slate-700/50">
          <Users className="w-4 h-4 text-cyan-400" />
          <span className="text-slate-300 text-sm">{activeUsers.length + 1} نشط</span>
        </div>

        <div className="flex items-center -space-x-2 rtl:space-x-reverse">
          <AnimatePresence>
            {displayUsers.map((user, index) => (
              <Tooltip key={user.id}>
                <TooltipTrigger asChild>
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`relative w-8 h-8 rounded-full ${user.color} flex items-center justify-center text-white text-sm font-bold border-2 border-[#0a0e1a] cursor-pointer hover:z-10 hover:scale-110 transition-transform`}
                  >
                    {user.avatar}
                    <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#0a0e1a] ${
                      user.status === 'editing' ? 'bg-green-500 animate-pulse' : 'bg-cyan-500'
                    }`} />
                  </motion.div>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="bg-slate-800 border-slate-700">
                  <div className="text-center">
                    <p className="text-white font-medium">{user.name}</p>
                    <p className="text-slate-400 text-xs flex items-center gap-1 justify-center">
                      {user.status === 'editing' ? (
                        <>
                          <Circle className="w-2 h-2 fill-green-500 text-green-500" />
                          يقوم بالتحرير
                        </>
                      ) : (
                        <>
                          <Eye className="w-3 h-3" />
                          يشاهد
                        </>
                      )}
                    </p>
                  </div>
                </TooltipContent>
              </Tooltip>
            ))}
          </AnimatePresence>

          {remainingCount > 0 && !showAll && (
            <motion.button
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              onClick={() => setShowAll(true)}
              className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-white text-xs font-bold border-2 border-[#0a0e1a] hover:bg-slate-600 transition-colors"
            >
              +{remainingCount}
            </motion.button>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}