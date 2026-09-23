import React, { createContext, useContext, useState, useEffect } from 'react';

export interface AdminUser {
  id: string;
  email: string;
  username: string;
  name: string;
  role: 'SUPER_ADMIN' | 'ADMIN';
  lastLogin: string;
}

interface AdminAuthContextType {
  isAuthenticated: boolean;
  adminUser: AdminUser | null;
  login: (usernameOrEmail: string, password: string, remember?: boolean) => { success: boolean; error?: string };
  logout: () => void;
}

const STORAGE_KEY = 'tubingo_admin_session';

// Default authorized credentials
const VALID_CREDENTIALS = [
  {
    username: 'admin',
    email: 'admin@tubingo.com',
    password: 'admin',
    name: 'Administrador General',
    role: 'SUPER_ADMIN' as const,
  },
  {
    username: 'gerencia',
    email: 'gerencia@tubingo.com',
    password: 'admin',
    name: 'Gerencia de Lotería y Sorteos',
    role: 'ADMIN' as const,
  },
];

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) || sessionStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore
    }
    return null;
  });

  const isAuthenticated = !!adminUser;

  const login = (usernameOrEmail: string, password: string, remember: boolean = true) => {
    const cleanUser = usernameOrEmail.trim().toLowerCase();
    const cleanPass = password.trim();

    if (!cleanUser || !cleanPass) {
      return { success: false, error: 'Por favor complete todos los campos requeridos.' };
    }

    const matched = VALID_CREDENTIALS.find(
      (c) =>
        (c.username.toLowerCase() === cleanUser || c.email.toLowerCase() === cleanUser) &&
        c.password === cleanPass
    );

    if (!matched) {
      return {
        success: false,
        error: 'Credenciales inválidas. Verifique su usuario o contraseña de administrador.',
      };
    }

    const user: AdminUser = {
      id: `admin-${Date.now()}`,
      email: matched.email,
      username: matched.username,
      name: matched.name,
      role: matched.role,
      lastLogin: new Date().toISOString(),
    };

    setAdminUser(user);

    try {
      const payload = JSON.stringify(user);
      if (remember) {
        localStorage.setItem(STORAGE_KEY, payload);
      } else {
        sessionStorage.setItem(STORAGE_KEY, payload);
      }
    } catch {
      // ignore
    }

    return { success: true };
  };

  const logout = () => {
    setAdminUser(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  };

  return (
    <AdminAuthContext.Provider value={{ isAuthenticated, adminUser, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = (): AdminAuthContextType => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};
