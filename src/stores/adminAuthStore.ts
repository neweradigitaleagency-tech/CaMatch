import { useAuthStore } from "./authStore";

export const useAdminAuthStore = {
  get admin() { return useAuthStore.getState().admin },
  get permissions() { return useAuthStore.getState().permissions },
  get isAuthenticated() { return useAuthStore.getState().admin !== null },
  get isLoading() { return useAuthStore.getState().isLoading },
  get initialized() { return useAuthStore.getState().initialized },
  get error() { return useAuthStore.getState().error },

  initialize: () => useAuthStore.getState().initialize(),
  login: (email: string, password: string) => useAuthStore.getState().adminLogin(email, password),
  demoLogin: () => useAuthStore.getState().adminDemoLogin(),
  logout: () => useAuthStore.getState().adminLogout(),
  hasPermission: (perm: string) => useAuthStore.getState().hasPermission(perm),
  hasAnyPermission: (perms: string[]) => useAuthStore.getState().hasAnyPermission(perms),
  hasAllPermissions: (perms: string[]) => useAuthStore.getState().hasAllPermissions(perms),
};
