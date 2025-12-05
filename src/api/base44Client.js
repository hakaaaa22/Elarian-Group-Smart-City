import { createClient } from '@base44/sdk';
// import { getAccessToken } from '@base44/sdk/utils/auth-utils';

// Create a client with authentication required
export const base44 = createClient({
  appId: "6930def126e302f23b0b6e3d", 
  requiresAuth: true // Ensure authentication is required for all operations
});
