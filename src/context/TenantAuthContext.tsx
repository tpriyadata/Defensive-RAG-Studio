import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Tenant, 
  AuthUser, 
  ApiKey, 
  UserRole 
} from '../types';
import { 
  INITIAL_TENANTS, 
  INITIAL_USERS, 
  INITIAL_API_KEYS 
} from '../data/multiTenantData';

interface TenantAuthContextType {
  tenants: Tenant[];
  activeTenant: Tenant;
  currentUser: AuthUser;
  apiKeys: ApiKey[];
  switchTenant: (tenantId: string) => void;
  switchUserRole: (role: UserRole) => void;
  updateTenantSettings: (tenantId: string, updates: Partial<Tenant>) => void;
  createApiKey: (name: string, scopes: ApiKey['scopes'], rateLimitPerMin: number) => { key: ApiKey; rawSecretToken: string };
  revokeApiKey: (keyId: string) => void;
  recordQueryUsage: (tokens: number) => void;
  addQuotaTopUp: (amount: number) => void;
}

const TenantAuthContext = createContext<TenantAuthContextType | undefined>(undefined);

export const TenantAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tenants, setTenants] = useState<Tenant[]>(() => {
    const saved = localStorage.getItem('rag_tenants_store');
    return saved ? JSON.parse(saved) : INITIAL_TENANTS;
  });

  const [activeTenantId, setActiveTenantId] = useState<string>(() => {
    return localStorage.getItem('rag_active_tenant_id') || 'tenant_mayo_health';
  });

  const [users, setUsers] = useState<AuthUser[]>(INITIAL_USERS);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>(() => {
    const saved = localStorage.getItem('rag_api_keys');
    return saved ? JSON.parse(saved) : INITIAL_API_KEYS;
  });

  // Save changes to local storage
  useEffect(() => {
    localStorage.setItem('rag_tenants_store', JSON.stringify(tenants));
  }, [tenants]);

  useEffect(() => {
    localStorage.setItem('rag_active_tenant_id', activeTenantId);
  }, [activeTenantId]);

  useEffect(() => {
    localStorage.setItem('rag_api_keys', JSON.stringify(apiKeys));
  }, [apiKeys]);

  const activeTenant = tenants.find(t => t.id === activeTenantId) || tenants[0];
  const currentUser = users.find(u => u.tenantId === activeTenantId) || users[0];

  const switchTenant = (tenantId: string) => {
    const target = tenants.find(t => t.id === tenantId);
    if (target) {
      setActiveTenantId(tenantId);
      // Sync to backend if running
      fetch('/api/auth/switch-tenant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantId })
      }).catch(() => {});
    }
  };

  const switchUserRole = (role: UserRole) => {
    setUsers(prev => prev.map(u => {
      if (u.id === currentUser.id) {
        const roleLabels: Record<UserRole, string> = {
          ORG_ADMIN: 'Organization Admin & Security Officer',
          MLOPS_ENGINEER: 'Lead MLOps Architect',
          CLINICAL_REVIEWER: 'Chief Medical Reviewer',
          AUDITOR: 'Compliance & SEC Auditor'
        };
        return {
          ...u,
          role,
          roleLabel: roleLabels[role] || role
        };
      }
      return u;
    }));
  };

  const updateTenantSettings = (tenantId: string, updates: Partial<Tenant>) => {
    setTenants(prev => prev.map(t => {
      if (t.id === tenantId) {
        return { ...t, ...updates };
      }
      return t;
    }));
  };

  const createApiKey = (name: string, scopes: ApiKey['scopes'], rateLimitPerMin: number) => {
    const randSuffix = Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10);
    const rawSecretToken = `sk_live_${activeTenant.slug.slice(0, 4)}_${randSuffix}`;
    const newKey: ApiKey = {
      id: `key_${Date.now()}`,
      name,
      prefix: rawSecretToken.slice(0, 12),
      fullKeyMasked: `${rawSecretToken.slice(0, 14)}...${rawSecretToken.slice(-4)}`,
      tenantId: activeTenant.id,
      createdBy: currentUser.email,
      createdAt: new Date().toISOString(),
      lastUsedAt: 'Just now',
      expiresAt: new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString(),
      scopes,
      rateLimitPerMin,
      status: 'active'
    };

    setApiKeys(prev => [newKey, ...prev]);
    return { key: newKey, rawSecretToken };
  };

  const revokeApiKey = (keyId: string) => {
    setApiKeys(prev => prev.map(k => {
      if (k.id === keyId) {
        return { ...k, status: 'revoked' as const };
      }
      return k;
    }));
  };

  const recordQueryUsage = (tokens: number) => {
    setTenants(prev => prev.map(t => {
      if (t.id === activeTenantId) {
        return {
          ...t,
          tokensUsedThisMonth: t.tokensUsedThisMonth + tokens,
          queriesThisMonth: t.queriesThisMonth + 1
        };
      }
      return t;
    }));
  };

  const addQuotaTopUp = (amount: number) => {
    setTenants(prev => prev.map(t => {
      if (t.id === activeTenantId) {
        return {
          ...t,
          monthlyTokenQuota: t.monthlyTokenQuota + (amount * 20000)
        };
      }
      return t;
    }));
  };

  return (
    <TenantAuthContext.Provider
      value={{
        tenants,
        activeTenant,
        currentUser,
        apiKeys: apiKeys.filter(k => k.tenantId === activeTenantId),
        switchTenant,
        switchUserRole,
        updateTenantSettings,
        createApiKey,
        revokeApiKey,
        recordQueryUsage,
        addQuotaTopUp
      }}
    >
      {children}
    </TenantAuthContext.Provider>
  );
};

export const useTenantAuth = () => {
  const context = useContext(TenantAuthContext);
  if (!context) {
    throw new Error('useTenantAuth must be used within a TenantAuthProvider');
  }
  return context;
};
