import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  UserProfile,
  UserRole,
  AccountStatus,
  LoginInput,
  SignupInput,
} from '../types/auth';
import {
  getCurrentUser,
  loginUser,
  logoutUser,
  signupStudent,
  updateUserProfile,
  importLocalProgress,
  getCachedUserProfile,
  getAuthToken,
} from '../services/auth/authService';
import { collectLocalLegacyProgress } from '../services/cloud/cloudDataService';

interface AuthContextType {
  user: UserProfile | null;
  profile: UserProfile | null;
  role: UserRole | null;
  status: AccountStatus | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (input: LoginInput) => Promise<UserProfile>;
  signup: (input: SignupInput) => Promise<UserProfile>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<UserProfile>;
  refreshProfile: () => Promise<void>;
  showMigrationPrompt: boolean;
  migrationDataCount: { mcqs: number; written: number; chats: number };
  dismissMigrationPrompt: () => void;
  executeMigration: () => Promise<{ success: boolean; message: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => getCachedUserProfile());
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showMigrationPrompt, setShowMigrationPrompt] = useState<boolean>(false);
  const [migrationDataCount, setMigrationDataCount] = useState({ mcqs: 0, written: 0, chats: 0 });

  const checkMigrationEligibility = useCallback((currentUserId: string) => {
    try {
      const migrationFlagKey = `rds_migrated_user_${currentUserId}`;
      const alreadyMigrated = localStorage.getItem(migrationFlagKey);
      if (alreadyMigrated === 'true' || alreadyMigrated === 'dismissed') {
        return;
      }

      const legacy = collectLocalLegacyProgress();
      if (legacy.hasData && (legacy.mcqAttempts.length > 0 || legacy.writtenAttempts.length > 0 || legacy.aiConversations.length > 0)) {
        setMigrationDataCount({
          mcqs: legacy.mcqAttempts.length,
          written: legacy.writtenAttempts.length,
          chats: legacy.aiConversations.length,
        });
        setShowMigrationPrompt(true);
      }
    } catch (e) {
      console.warn('Error checking migration eligibility:', e);
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    const token = getAuthToken();
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const remoteUser = await getCurrentUser();
      setUser(remoteUser);
      if (remoteUser && remoteUser.role === 'student') {
        checkMigrationEligibility(remoteUser.id);
      }
    } catch (err) {
      console.error('Failed to refresh user profile:', err);
    } finally {
      setIsLoading(false);
    }
  }, [checkMigrationEligibility]);

  // Initial load
  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  const login = async (input: LoginInput): Promise<UserProfile> => {
    setIsLoading(true);
    try {
      const session = await loginUser(input);
      setUser(session.user);
      if (session.user.role === 'student') {
        checkMigrationEligibility(session.user.id);
      }
      return session.user;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (input: SignupInput): Promise<UserProfile> => {
    setIsLoading(true);
    try {
      const session = await signupStudent(input);
      setUser(session.user);
      checkMigrationEligibility(session.user.id);
      return session.user;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setIsLoading(true);
    try {
      await logoutUser();
      setUser(null);
      setShowMigrationPrompt(false);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>): Promise<UserProfile> => {
    const updated = await updateUserProfile(updates);
    setUser(updated);
    return updated;
  };

  const dismissMigrationPrompt = () => {
    setShowMigrationPrompt(false);
    if (user) {
      localStorage.setItem(`rds_migrated_user_${user.id}`, 'dismissed');
    }
  };

  const executeMigration = async (): Promise<{ success: boolean; message: string }> => {
    if (!user) {
      return { success: false, message: 'Please sign in first.' };
    }

    try {
      const legacy = collectLocalLegacyProgress();
      const res = await importLocalProgress({
        studentProfile: legacy.studentProfile,
        mcqAttempts: legacy.mcqAttempts,
        writtenAttempts: legacy.writtenAttempts,
        aiConversations: legacy.aiConversations,
      });

      localStorage.setItem(`rds_migrated_user_${user.id}`, 'true');
      setShowMigrationPrompt(false);
      return { success: true, message: res.message };
    } catch (err: any) {
      console.error('Migration failed:', err);
      return { success: false, message: err.message || 'Failed to migrate data.' };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile: user,
        role: user?.role || null,
        status: user?.status || null,
        isAuthenticated: !!user && user.status === 'active',
        isLoading,
        login,
        signup,
        logout,
        updateProfile,
        refreshProfile,
        showMigrationPrompt,
        migrationDataCount,
        dismissMigrationPrompt,
        executeMigration,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
