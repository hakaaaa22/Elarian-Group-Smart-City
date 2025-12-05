import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import {
  GripVertical, Pin, PinOff, ChevronRight, ChevronLeft, ChevronDown,
  Minimize2, Maximize2, Settings, Save, RotateCcw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

// ألوان اللوجو الموحدة - أكواد الألوان من الصور
export const BRAND_COLORS = {
  // الألوان الرئيسية من اللوجو
  primary: '#8B5CF6',      // بنفسجي فاتح (Violet-500)
  secondary: '#06B6D4',    // سماوي (Cyan-500)
  accent: '#EC4899',       // وردي (Pink-500)
  
  // تدرجات البنفسجي
  purple: {
    50: '#FAF5FF',
    100: '#F3E8FF',
    200: '#E9D5FF',
    300: '#D8B4FE',
    400: '#C084FC',
    500: '#A855F7',
    600: '#9333EA',
    700: '#7C3AED',
    800: '#6D28D9',
    900: '#5B21B6',
  },
  
  // تدرجات السماوي
  cyan: {
    50: '#ECFEFF',
    100: '#CFFAFE',
    200: '#A5F3FC',
    300: '#67E8F9',
    400: '#22D3EE',
    500: '#06B6D4',
    600: '#0891B2',
    700: '#0E7490',
    800: '#155E75',
    900: '#164E63',
  },
  
  // تدرجات الوردي
  pink: {
    50: '#FDF2F8',
    100: '#FCE7F3',
    200: '#FBCFE8',
    300: '#F9A8D4',
    400: '#F472B6',
    500: '#EC4899',
    600: '#DB2777',
    700: '#BE185D',
    800: '#9D174D',
    900: '#831843',
  },
  
  // الخلفيات
  background: {
    primary: '#0A0E1A',
    secondary: '#0F1629',
    card: 'rgba(15, 22, 41, 0.8)',
    hover: 'rgba(139, 92, 246, 0.1)',
  },
  
  // الحدود
  border: {
    primary: 'rgba(139, 92, 246, 0.2)',
    secondary: 'rgba(6, 182, 212, 0.2)',
    accent: 'rgba(236, 72, 153, 0.2)',
  },
  
  // التدرجات
  gradients: {
    primary: 'linear-gradient(135deg, #8B5CF6 0%, #06B6D4 100%)',
    secondary: 'linear-gradient(135deg, #06B6D4 0%, #EC4899 100%)',
    accent: 'linear-gradient(135deg, #EC4899 0%, #8B5CF6 100%)',
    full: 'linear-gradient(135deg, #8B5CF6 0%, #06B6D4 50%, #EC4899 100%)',
    sidebar: 'linear-gradient(180deg, rgba(139, 92, 246, 0.1) 0%, rgba(6, 182, 212, 0.05) 50%, transparent 100%)',
  }
};

export default function DraggableSidebar({ 
  menuItems, 
  currentPageName, 
  collapsed, 
  setCollapsed,
  expandedGroups,
  toggleGroup,
  isRTL,
  t 
}) {
  const [items, setItems] = useState(menuItems);
  const [isPinned, setIsPinned] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [userPreferences, setUserPreferences] = useState(null);

  // Load user preferences
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const user = await base44.auth.me();
        if (user?.sidebar_order) {
          // Reorder items based on saved order
          const orderedItems = user.sidebar_order
            .map(key => menuItems.find(item => item.nameKey === key))
            .filter(Boolean);
          // Add any new items not in the saved order
          const newItems = menuItems.filter(item => !user.sidebar_order.includes(item.nameKey));
          setItems([...orderedItems, ...newItems]);
        }
        if (user?.sidebar_pinned !== undefined) {
          setIsPinned(user.sidebar_pinned);
        }
        if (user?.sidebar_minimized !== undefined) {
          setIsMinimized(user.sidebar_minimized);
        }
        setUserPreferences(user);
      } catch (error) {
        console.log('No user preferences found');
      }
    };
    loadPreferences();
  }, [menuItems]);

  // Save preferences
  const savePreferences = async () => {
    try {
      await base44.auth.updateMe({
        sidebar_order: items.map(item => item.nameKey),
        sidebar_pinned: isPinned,
        sidebar_minimized: isMinimized
      });
      toast.success('تم حفظ تفضيلات القائمة');
    } catch (error) {
      toast.error('فشل في حفظ التفضيلات');
    }
  };

  // Reset to default
  const resetToDefault = () => {
    setItems(menuItems);
    setIsPinned(true);
    setIsMinimized(false);
    toast.success('تم إعادة الضبط للإعدادات الافتراضية');
  };

  // Handle drag end
  const handleDragEnd = (result) => {
    if (!result.destination || !isEditMode) return;
    
    const reorderedItems = Array.from(items);
    const [removed] = reorderedItems.splice(result.source.index, 1);
    reorderedItems.splice(result.destination.index, 0, removed);
    
    setItems(reorderedItems);
  };

  const isGroupActive = (group) => {
    return group.children?.some(child => child.page === currentPageName);
  };

  // Auto-hide when not pinned
  const sidebarWidth = isMinimized ? 72 : (collapsed ? 72 : 260);

  return (
    <motion.aside
      animate={{ width: sidebarWidth }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      onMouseEnter={() => !isPinned && !isMinimized && setCollapsed(false)}
      onMouseLeave={() => !isPinned && !isMinimized && setCollapsed(true)}
      className={`hidden lg:flex fixed ${isRTL ? 'right-0' : 'left-0'} top-0 h-screen flex-col backdrop-blur-2xl ${isRTL ? 'border-l' : 'border-r'} z-40 shadow-2xl`}
      style={{
        background: `linear-gradient(180deg, ${BRAND_COLORS.background.secondary}F8 0%, ${BRAND_COLORS.background.primary}F8 100%)`,
        borderColor: BRAND_COLORS.border.primary,
        boxShadow: `0 0 40px ${BRAND_COLORS.purple[500]}20`
      }}
    >
      {/* Sidebar Controls */}
      <div className="absolute top-2 left-2 right-2 flex justify-between z-10">
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-slate-500 hover:text-white"
            onClick={() => setIsPinned(!isPinned)}
            title={isPinned ? 'إلغاء التثبيت' : 'تثبيت'}
          >
            {isPinned ? <Pin className="w-3 h-3" /> : <PinOff className="w-3 h-3" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-slate-500 hover:text-white"
            onClick={() => setIsMinimized(!isMinimized)}
            title={isMinimized ? 'توسيع' : 'تصغير'}
          >
            {isMinimized ? <Maximize2 className="w-3 h-3" /> : <Minimize2 className="w-3 h-3" />}
          </Button>
        </div>
        {!collapsed && !isMinimized && (
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              className={`h-6 w-6 ${isEditMode ? 'text-purple-400' : 'text-slate-500'} hover:text-white`}
              onClick={() => setIsEditMode(!isEditMode)}
              title="تعديل الترتيب"
            >
              <Settings className="w-3 h-3" />
            </Button>
            {isEditMode && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-green-400 hover:text-green-300"
                  onClick={savePreferences}
                  title="حفظ"
                >
                  <Save className="w-3 h-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-amber-400 hover:text-amber-300"
                  onClick={resetToDefault}
                  title="إعادة ضبط"
                >
                  <RotateCcw className="w-3 h-3" />
                </Button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Logo */}
      <div 
        className="p-4 pt-10 flex items-center justify-center border-b"
        style={{ 
          borderColor: BRAND_COLORS.border.primary,
          background: BRAND_COLORS.gradients.sidebar
        }}
      >
        <motion.div
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 300 }}
          className="p-2 rounded-xl"
          style={{
            boxShadow: `0 0 20px ${BRAND_COLORS.purple[500]}40, 0 0 40px ${BRAND_COLORS.cyan[500]}20`
          }}
        >
          <img 
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6930def126e302f23b0b6e3d/1b5c014af_image.png" 
            alt="Logo" 
            className={`${isMinimized || collapsed ? 'h-10' : 'h-14'} w-auto transition-all duration-500`}
            style={{ filter: 'brightness(1.1) saturate(1.2)' }}
          />
        </motion.div>
      </div>

      {/* Navigation */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="sidebar-menu">
          {(provided) => (
            <nav 
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="flex-1 p-2 space-y-1 overflow-y-auto scrollbar-thin"
              style={{ 
                scrollbarColor: `${BRAND_COLORS.purple[500]}40 transparent`
              }}
            >
              {items.map((item, index) => (
                <Draggable 
                  key={item.nameKey} 
                  draggableId={item.nameKey} 
                  index={index}
                  isDragDisabled={!isEditMode}
                >
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={snapshot.isDragging ? 'opacity-80' : ''}
                    >
                      {item.isGroup ? (
                        <div>
                          <button
                            onClick={() => !collapsed && !isMinimized && toggleGroup(item.nameKey)}
                            className={`sidebar-item w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl transition-all ${
                              isGroupActive(item) ? 'active' : ''
                            }`}
                            style={{
                              background: isGroupActive(item) 
                                ? `linear-gradient(90deg, ${BRAND_COLORS.purple[500]}25 0%, ${BRAND_COLORS.cyan[500]}15 50%, transparent 100%)`
                                : 'transparent',
                              borderRight: isRTL && isGroupActive(item) ? `3px solid ${BRAND_COLORS.purple[500]}` : undefined,
                              borderLeft: !isRTL && isGroupActive(item) ? `3px solid ${BRAND_COLORS.purple[500]}` : undefined,
                            }}
                          >
                            <div className="flex items-center gap-3">
                              {isEditMode && (
                                <div {...provided.dragHandleProps}>
                                  <GripVertical className="w-4 h-4 text-slate-500 cursor-grab" />
                                </div>
                              )}
                              <motion.div
                                whileHover={{ scale: 1.15 }}
                                style={{ 
                                  color: isGroupActive(item) ? BRAND_COLORS.purple[400] : '#94A3B8',
                                  filter: isGroupActive(item) ? `drop-shadow(0 0 8px ${BRAND_COLORS.purple[500]})` : 'none'
                                }}
                              >
                                <item.icon className="w-5 h-5 flex-shrink-0" />
                              </motion.div>
                              {!collapsed && !isMinimized && (
                                <span 
                                  className="truncate font-medium"
                                  style={{ color: isGroupActive(item) ? BRAND_COLORS.purple[400] : '#E2E8F0' }}
                                >
                                  {t(item.nameKey)}
                                </span>
                              )}
                            </div>
                            {!collapsed && !isMinimized && (
                              <motion.div
                                animate={{ rotate: expandedGroups.includes(item.nameKey) ? 90 : 0 }}
                                transition={{ duration: 0.2 }}
                              >
                                <ChevronRight className="w-4 h-4 text-slate-500" />
                              </motion.div>
                            )}
                          </button>
                          
                          <AnimatePresence>
                            {!collapsed && !isMinimized && expandedGroups.includes(item.nameKey) && (
                              <motion.div 
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.3 }}
                                className={`${isRTL ? 'mr-4 pr-4 border-r' : 'ml-4 pl-4 border-l'} space-y-1 mt-1`}
                                style={{ borderColor: `${BRAND_COLORS.purple[500]}40` }}
                              >
                                {item.children.map(child => (
                                  <Link
                                    key={child.page}
                                    to={createPageUrl(child.page)}
                                    className={`sidebar-item flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition-all ${
                                      currentPageName === child.page ? 'active' : ''
                                    }`}
                                    style={{
                                      background: currentPageName === child.page 
                                        ? `linear-gradient(90deg, ${BRAND_COLORS.cyan[500]}20 0%, transparent 100%)`
                                        : 'transparent',
                                      color: currentPageName === child.page ? BRAND_COLORS.cyan[400] : '#94A3B8'
                                    }}
                                  >
                                    <motion.div
                                      whileHover={{ scale: 1.15 }}
                                      style={{ 
                                        filter: currentPageName === child.page ? `drop-shadow(0 0 6px ${BRAND_COLORS.cyan[500]})` : 'none'
                                      }}
                                    >
                                      <child.icon className="w-4 h-4 flex-shrink-0" />
                                    </motion.div>
                                    <span className="truncate font-medium">{t(child.nameKey)}</span>
                                  </Link>
                                ))}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      ) : (
                        <Link
                          to={createPageUrl(item.page)}
                          className={`sidebar-item flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                            currentPageName === item.page ? 'active' : ''
                          }`}
                          style={{
                            background: currentPageName === item.page 
                              ? `linear-gradient(90deg, ${BRAND_COLORS.purple[500]}25 0%, ${BRAND_COLORS.cyan[500]}15 50%, transparent 100%)`
                              : 'transparent',
                            borderRight: isRTL && currentPageName === item.page ? `3px solid ${BRAND_COLORS.purple[500]}` : undefined,
                            borderLeft: !isRTL && currentPageName === item.page ? `3px solid ${BRAND_COLORS.purple[500]}` : undefined,
                          }}
                        >
                          {isEditMode && (
                            <div {...provided.dragHandleProps}>
                              <GripVertical className="w-4 h-4 text-slate-500 cursor-grab" />
                            </div>
                          )}
                          <motion.div
                            whileHover={{ scale: 1.15 }}
                            style={{ 
                              color: currentPageName === item.page ? BRAND_COLORS.purple[400] : '#94A3B8',
                              filter: currentPageName === item.page ? `drop-shadow(0 0 8px ${BRAND_COLORS.purple[500]})` : 'none'
                            }}
                          >
                            <item.icon className="w-5 h-5 flex-shrink-0" />
                          </motion.div>
                          {!collapsed && !isMinimized && (
                            <span 
                              className="truncate font-medium"
                              style={{ color: currentPageName === item.page ? BRAND_COLORS.purple[400] : '#E2E8F0' }}
                            >
                              {t(item.nameKey)}
                            </span>
                          )}
                        </Link>
                      )}
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </nav>
          )}
        </Droppable>
      </DragDropContext>

      {/* Collapse Button */}
      {!isMinimized && (
        <div 
          className="p-4 border-t"
          style={{ 
            borderColor: BRAND_COLORS.border.primary,
            background: BRAND_COLORS.gradients.sidebar
          }}
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="w-full text-slate-400 hover:text-white"
            style={{ 
              background: `${BRAND_COLORS.purple[500]}10`,
              borderColor: BRAND_COLORS.border.primary
            }}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </Button>
        </div>
      )}
    </motion.aside>
  );
}