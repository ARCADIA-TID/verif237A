import React, { createContext, useContext, useState } from 'react';
import { AuthUser, UserRole } from '../types';

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  role: UserRole;
  isAdmin: boolean;
  isStaff: boolean;
  login: (user: AuthUser, redirectTarget?: string) => void;
  logout: () => void;
  switchRole: (role: UserRole) => void;
  redirectAfterLogin: string | null;
  setRedirectAfterLogin: (route: string | null) => void;
}

const PRESET_USERS: Record<Exclude<UserRole, 'visitor'>, AuthUser> = {
  citoyen: {
    id: 'usr-citoyen-01',
    name: 'Ahmed Tidjani',
    email: 'ahmed.tidjani@citoyen.cm',
    phone: '+237 670 12 34 56',
    role: 'citoyen',
    roleLabel: 'Citoyen Veilleur',
    region: 'Centre (Yaoundé)',
    badgeCode: '#VRF-9824',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    twoFactorEnabled: true
  },
  verificateur: {
    id: 'usr-rev-014',
    name: 'Emmanuel Mballa',
    email: 'e.mballa@verif237.cm',
    phone: '+237 690 99 88 77',
    role: 'verificateur',
    roleLabel: 'Réviseur Sénior & Juriste',
    region: 'Centre (Yaoundé Hub)',
    badgeCode: '#REV-014',
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAjhSY8a389bT3wqKUGoKhQLq5xkFngaxrcbWF-IUtflM8Tu6GJhKskzcaGMcYGfGbzD3C2cIlnsYzoly0wE7wBwcYqj34lv4V-zUQ411FEq_pr_2acfFmlbQe0wKSPS4S7y1jzmbX9BBOOvgZ6VXOm9xMdaGuS6f2jn-PVeYiT4sgzZxjl4WRaLbjm2MENFfvZS5N9xB2z4MO5DdYc3_mfRgxegYDp-9PaAtUyquidNkMBga16zyCbsw',
    twoFactorEnabled: true
  },
  admin: {
    id: 'usr-adm-001',
    name: 'Dr. François Kamga',
    email: 'f.kamga@verif237.cm',
    phone: '+237 699 00 11 22',
    role: 'admin',
    roleLabel: 'Super-Administrateur Républicain',
    region: 'National (Présidence & MINFI)',
    badgeCode: '#ADM-001',
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDrndTEp_20Sq33hxNopGO3aiW1LKL-Yox2XTqgw-FUpWdqdh2kmtHt1jyVo2CtwMlpXZ0_k1xdeCudIBb44qAP6s3Qh9bNGb4UglEd1OQMnIc6HtaehfwrgTlNTc8vim0NTtUZN5SX49-YtnQYHrvgkuuEcxrldj8wZmCCFFx89o5tXlqBf3xLHjFFa0PR0uNgpyTXA_6vP0v12Rb9TPtRZuT8ysuRwYO94l4nhICxLftwEpL-B2Rzrw',
    twoFactorEnabled: true
  },
  super_admin: {
    id: 'usr-adm-001',
    name: 'Dr. François Kamga',
    email: 'f.kamga@verif237.cm',
    phone: '+237 699 00 11 22',
    role: 'super_admin',
    roleLabel: 'Super-Administrateur Républicain',
    region: 'National (Présidence & MINFI)',
    badgeCode: '#ADM-001',
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDrndTEp_20Sq33hxNopGO3aiW1LKL-Yox2XTqgw-FUpWdqdh2kmtHt1jyVo2CtwMlpXZ0_k1xdeCudIBb44qAP6s3Qh9bNGb4UglEd1OQMnIc6HtaehfwrgTlNTc8vim0NTtUZN5SX49-YtnQYHrvgkuuEcxrldj8wZmCCFFx89o5tXlqBf3xLHjFFa0PR0uNgpyTXA_6vP0v12Rb9TPtRZuT8ysuRwYO94l4nhICxLftwEpL-B2Rzrw',
    twoFactorEnabled: true
  }
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const saved = localStorage.getItem('verif237_auth_user');
      if (saved) return JSON.parse(saved);
    } catch {
      // Ignore
    }
    return null; // Public visitor by default
  });

  const [redirectAfterLogin, setRedirectAfterLogin] = useState<string | null>(null);

  const login = (newUser: AuthUser, redirectTarget?: string) => {
    setUser(newUser);
    try {
      localStorage.setItem('verif237_auth_user', JSON.stringify(newUser));
    } catch {
      // Ignore
    }
    if (redirectTarget) {
      setRedirectAfterLogin(redirectTarget);
    }
  };

  const logout = () => {
    setUser(null);
    try {
      localStorage.removeItem('verif237_auth_user');
    } catch {
      // Ignore
    }
    setRedirectAfterLogin(null);
  };

  const switchRole = (newRole: UserRole) => {
    if (newRole === 'visitor') {
      logout();
    } else {
      login(PRESET_USERS[newRole]);
    }
  };

  const role: UserRole = user ? user.role : 'visitor';
  const isAuthenticated = user !== null;
  const isAdmin = role === 'admin' || role === 'super_admin';
  const isStaff = isAdmin || role === 'verificateur';

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        role,
        isAdmin,
        isStaff,
        login,
        logout,
        switchRole,
        redirectAfterLogin,
        setRedirectAfterLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
