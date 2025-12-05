import React, { createContext, useContext, useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

// User Roles Definition
export const USER_ROLES = {
  ADMIN: 'admin',
  DEPARTMENT_HEAD: 'department_head',
  SUPERVISOR: 'supervisor',
  OPERATOR: 'operator',
  VIEWER: 'viewer',
};

// Role Names in Arabic
export const ROLE_NAMES = {
  admin: 'مدير النظام',
  department_head: 'رئيس قسم',
  supervisor: 'مشرف',
  operator: 'مشغل',
  viewer: 'مشاهد',
};

// Permission Modules
export const MODULES = {
  DASHBOARD: 'dashboard',
  AI_VISION: 'ai_vision',
  FLEET: 'fleet',
  WASTE: 'waste',
  UTILITIES: 'utilities',
  SECURITY: 'security',
  HOSPITAL: 'hospital',
  REPORTS: 'reports',
  SETTINGS: 'settings',
  USERS: 'users',
  ALERTS: 'alerts',
  MAPS: 'maps',
  IOT: 'iot',
  ASSETS: 'assets',
};

// Permission Actions
export const ACTIONS = {
  VIEW: 'view',
  CREATE: 'create',
  EDIT: 'edit',
  DELETE: 'delete',
  EXPORT: 'export',
  AI_SUGGESTIONS: 'ai_suggestions',
  MANAGE: 'manage',
};

// Role Permissions Matrix
const ROLE_PERMISSIONS = {
  [USER_ROLES.ADMIN]: {
    // Admin has full access to everything
    [MODULES.DASHBOARD]: [ACTIONS.VIEW, ACTIONS.EDIT, ACTIONS.MANAGE],
    [MODULES.AI_VISION]: [ACTIONS.VIEW, ACTIONS.CREATE, ACTIONS.EDIT, ACTIONS.DELETE, ACTIONS.AI_SUGGESTIONS, ACTIONS.MANAGE],
    [MODULES.FLEET]: [ACTIONS.VIEW, ACTIONS.CREATE, ACTIONS.EDIT, ACTIONS.DELETE, ACTIONS.EXPORT, ACTIONS.AI_SUGGESTIONS],
    [MODULES.WASTE]: [ACTIONS.VIEW, ACTIONS.CREATE, ACTIONS.EDIT, ACTIONS.DELETE, ACTIONS.EXPORT, ACTIONS.AI_SUGGESTIONS],
    [MODULES.UTILITIES]: [ACTIONS.VIEW, ACTIONS.CREATE, ACTIONS.EDIT, ACTIONS.DELETE, ACTIONS.EXPORT, ACTIONS.AI_SUGGESTIONS],
    [MODULES.SECURITY]: [ACTIONS.VIEW, ACTIONS.CREATE, ACTIONS.EDIT, ACTIONS.DELETE, ACTIONS.MANAGE],
    [MODULES.HOSPITAL]: [ACTIONS.VIEW, ACTIONS.CREATE, ACTIONS.EDIT, ACTIONS.DELETE, ACTIONS.AI_SUGGESTIONS],
    [MODULES.REPORTS]: [ACTIONS.VIEW, ACTIONS.CREATE, ACTIONS.EDIT, ACTIONS.DELETE, ACTIONS.EXPORT],
    [MODULES.SETTINGS]: [ACTIONS.VIEW, ACTIONS.EDIT, ACTIONS.MANAGE],
    [MODULES.USERS]: [ACTIONS.VIEW, ACTIONS.CREATE, ACTIONS.EDIT, ACTIONS.DELETE, ACTIONS.MANAGE],
    [MODULES.ALERTS]: [ACTIONS.VIEW, ACTIONS.CREATE, ACTIONS.EDIT, ACTIONS.DELETE, ACTIONS.MANAGE],
    [MODULES.MAPS]: [ACTIONS.VIEW, ACTIONS.EDIT, ACTIONS.MANAGE],
    [MODULES.IOT]: [ACTIONS.VIEW, ACTIONS.CREATE, ACTIONS.EDIT, ACTIONS.DELETE, ACTIONS.MANAGE],
    [MODULES.ASSETS]: [ACTIONS.VIEW, ACTIONS.CREATE, ACTIONS.EDIT, ACTIONS.DELETE, ACTIONS.EXPORT],
  },
  [USER_ROLES.DEPARTMENT_HEAD]: {
    [MODULES.DASHBOARD]: [ACTIONS.VIEW, ACTIONS.EDIT],
    [MODULES.AI_VISION]: [ACTIONS.VIEW, ACTIONS.AI_SUGGESTIONS],
    [MODULES.FLEET]: [ACTIONS.VIEW, ACTIONS.CREATE, ACTIONS.EDIT, ACTIONS.EXPORT, ACTIONS.AI_SUGGESTIONS],
    [MODULES.WASTE]: [ACTIONS.VIEW, ACTIONS.CREATE, ACTIONS.EDIT, ACTIONS.EXPORT, ACTIONS.AI_SUGGESTIONS],
    [MODULES.UTILITIES]: [ACTIONS.VIEW, ACTIONS.CREATE, ACTIONS.EDIT, ACTIONS.EXPORT, ACTIONS.AI_SUGGESTIONS],
    [MODULES.SECURITY]: [ACTIONS.VIEW, ACTIONS.CREATE, ACTIONS.EDIT],
    [MODULES.HOSPITAL]: [ACTIONS.VIEW, ACTIONS.CREATE, ACTIONS.EDIT, ACTIONS.AI_SUGGESTIONS],
    [MODULES.REPORTS]: [ACTIONS.VIEW, ACTIONS.CREATE, ACTIONS.EXPORT],
    [MODULES.SETTINGS]: [ACTIONS.VIEW],
    [MODULES.USERS]: [ACTIONS.VIEW],
    [MODULES.ALERTS]: [ACTIONS.VIEW, ACTIONS.CREATE, ACTIONS.EDIT],
    [MODULES.MAPS]: [ACTIONS.VIEW],
    [MODULES.IOT]: [ACTIONS.VIEW, ACTIONS.CREATE, ACTIONS.EDIT],
    [MODULES.ASSETS]: [ACTIONS.VIEW, ACTIONS.CREATE, ACTIONS.EDIT, ACTIONS.EXPORT],
  },
  [USER_ROLES.SUPERVISOR]: {
    [MODULES.DASHBOARD]: [ACTIONS.VIEW],
    [MODULES.AI_VISION]: [ACTIONS.VIEW],
    [MODULES.FLEET]: [ACTIONS.VIEW, ACTIONS.CREATE, ACTIONS.EDIT, ACTIONS.AI_SUGGESTIONS],
    [MODULES.WASTE]: [ACTIONS.VIEW, ACTIONS.CREATE, ACTIONS.EDIT, ACTIONS.AI_SUGGESTIONS],
    [MODULES.UTILITIES]: [ACTIONS.VIEW, ACTIONS.CREATE, ACTIONS.EDIT],
    [MODULES.SECURITY]: [ACTIONS.VIEW, ACTIONS.CREATE],
    [MODULES.HOSPITAL]: [ACTIONS.VIEW, ACTIONS.CREATE],
    [MODULES.REPORTS]: [ACTIONS.VIEW, ACTIONS.CREATE],
    [MODULES.SETTINGS]: [],
    [MODULES.USERS]: [],
    [MODULES.ALERTS]: [ACTIONS.VIEW, ACTIONS.CREATE],
    [MODULES.MAPS]: [ACTIONS.VIEW],
    [MODULES.IOT]: [ACTIONS.VIEW, ACTIONS.CREATE],
    [MODULES.ASSETS]: [ACTIONS.VIEW, ACTIONS.CREATE, ACTIONS.EDIT],
  },
  [USER_ROLES.OPERATOR]: {
    [MODULES.DASHBOARD]: [ACTIONS.VIEW],
    [MODULES.AI_VISION]: [ACTIONS.VIEW],
    [MODULES.FLEET]: [ACTIONS.VIEW, ACTIONS.CREATE],
    [MODULES.WASTE]: [ACTIONS.VIEW, ACTIONS.CREATE],
    [MODULES.UTILITIES]: [ACTIONS.VIEW],
    [MODULES.SECURITY]: [ACTIONS.VIEW],
    [MODULES.HOSPITAL]: [ACTIONS.VIEW],
    [MODULES.REPORTS]: [ACTIONS.VIEW],
    [MODULES.SETTINGS]: [],
    [MODULES.USERS]: [],
    [MODULES.ALERTS]: [ACTIONS.VIEW],
    [MODULES.MAPS]: [ACTIONS.VIEW],
    [MODULES.IOT]: [ACTIONS.VIEW],
    [MODULES.ASSETS]: [ACTIONS.VIEW],
  },
  [USER_ROLES.VIEWER]: {
    [MODULES.DASHBOARD]: [ACTIONS.VIEW],
    [MODULES.AI_VISION]: [],
    [MODULES.FLEET]: [ACTIONS.VIEW],
    [MODULES.WASTE]: [ACTIONS.VIEW],
    [MODULES.UTILITIES]: [ACTIONS.VIEW],
    [MODULES.SECURITY]: [],
    [MODULES.HOSPITAL]: [],
    [MODULES.REPORTS]: [ACTIONS.VIEW],
    [MODULES.SETTINGS]: [],
    [MODULES.USERS]: [],
    [MODULES.ALERTS]: [ACTIONS.VIEW],
    [MODULES.MAPS]: [ACTIONS.VIEW],
    [MODULES.IOT]: [],
    [MODULES.ASSETS]: [ACTIONS.VIEW],
  },
};

// Permission Context
const PermissionContext = createContext(null);

export function PermissionProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(USER_ROLES.VIEWER);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
        // Get role from user data or default to viewer
        setUserRole(currentUser?.custom_role || currentUser?.role || USER_ROLES.VIEWER);
      } catch (error) {
        console.log('User not authenticated');
      }
      setLoading(false);
    };
    loadUser();
  }, []);

  // Check if user has permission
  const hasPermission = (module, action) => {
    const permissions = ROLE_PERMISSIONS[userRole]?.[module] || [];
    return permissions.includes(action);
  };

  // Check if user can access module
  const canAccessModule = (module) => {
    const permissions = ROLE_PERMISSIONS[userRole]?.[module] || [];
    return permissions.length > 0;
  };

  // Check if user is admin
  const isAdmin = () => userRole === USER_ROLES.ADMIN;

  // Check if user is at least department head
  const isDepartmentHead = () => 
    [USER_ROLES.ADMIN, USER_ROLES.DEPARTMENT_HEAD].includes(userRole);

  // Check if user can use AI features
  const canUseAI = (module) => hasPermission(module, ACTIONS.AI_SUGGESTIONS);

  // Get all accessible modules for current user
  const getAccessibleModules = () => {
    return Object.keys(MODULES).filter(key => 
      canAccessModule(MODULES[key])
    ).map(key => MODULES[key]);
  };

  const value = {
    user,
    userRole,
    loading,
    hasPermission,
    canAccessModule,
    isAdmin,
    isDepartmentHead,
    canUseAI,
    getAccessibleModules,
    MODULES,
    ACTIONS,
    ROLE_PERMISSIONS,
  };

  return (
    <PermissionContext.Provider value={value}>
      {children}
    </PermissionContext.Provider>
  );
}

// Hook to use permissions
export function usePermissions() {
  const context = useContext(PermissionContext);
  if (!context) {
    throw new Error('usePermissions must be used within a PermissionProvider');
  }
  return context;
}

// HOC for protected components
export function withPermission(WrappedComponent, module, action = ACTIONS.VIEW) {
  return function ProtectedComponent(props) {
    const { hasPermission, loading } = usePermissions();
    
    if (loading) return null;
    if (!hasPermission(module, action)) {
      return (
        <div className="p-8 text-center">
          <p className="text-slate-400">ليس لديك صلاحية للوصول إلى هذا المحتوى</p>
        </div>
      );
    }
    
    return <WrappedComponent {...props} />;
  };
}

// Component for conditional rendering based on permissions
export function PermissionGate({ module, action = ACTIONS.VIEW, children, fallback = null }) {
  const { hasPermission, loading } = usePermissions();
  
  if (loading) return null;
  if (!hasPermission(module, action)) return fallback;
  
  return children;
}

// Component for role-based rendering
export function RoleGate({ roles, children, fallback = null }) {
  const { userRole, loading } = usePermissions();
  
  if (loading) return null;
  if (!roles.includes(userRole)) return fallback;
  
  return children;
}

export default PermissionProvider;