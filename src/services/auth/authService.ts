import {
  AuthSession,
  ChangePasswordInput,
  CreateAccountByAdminInput,
  LoginInput,
  MigrationPayload,
  ResetPasswordInput,
  SignupInput,
  UserProfile,
  AccountStatus,
} from '../../types/auth';

const TOKEN_KEY = 'rds_auth_token_v1';
const USER_CACHE_KEY = 'rds_auth_user_cache_v1';

export function getAuthToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch (e) {
    return null;
  }
}

export function setAuthSession(session: AuthSession): void {
  try {
    localStorage.setItem(TOKEN_KEY, session.token);
    localStorage.setItem(USER_CACHE_KEY, JSON.stringify(session.user));
  } catch (e) {
    console.error('Failed to save auth session to localStorage:', e);
  }
}

export function clearAuthSession(): void {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_CACHE_KEY);
  } catch (e) {
    console.error('Failed to clear auth session:', e);
  }
}

export function getCachedUserProfile(): UserProfile | null {
  try {
    const raw = localStorage.getItem(USER_CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

export function getAuthHeaders(): Record<string, string> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export async function signupStudent(input: SignupInput): Promise<AuthSession> {
  const res = await fetch('/api/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Signup failed. Please try again.');
  }

  const session: AuthSession = {
    token: data.token,
    user: data.user,
    expiresAt: data.expiresAt,
  };
  setAuthSession(session);
  return session;
}

export async function loginUser(input: LoginInput): Promise<AuthSession> {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

  const data = await res.json();
  if (!res.ok) {
    const err: any = new Error(data.error || 'Login failed. Please try again.');
    err.status = data.status;
    throw err;
  }

  const session: AuthSession = {
    token: data.token,
    user: data.user,
    expiresAt: data.expiresAt,
  };
  setAuthSession(session);
  return session;
}

export async function logoutUser(): Promise<void> {
  try {
    const token = getAuthToken();
    if (token) {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: getAuthHeaders(),
      });
    }
  } catch (e) {
    console.warn('Logout request warning:', e);
  } finally {
    clearAuthSession();
  }
}

export async function getCurrentUser(): Promise<UserProfile | null> {
  const token = getAuthToken();
  if (!token) return null;

  try {
    const res = await fetch('/api/auth/me', {
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        clearAuthSession();
      }
      return null;
    }

    const data = await res.json();
    if (data.user) {
      localStorage.setItem(USER_CACHE_KEY, JSON.stringify(data.user));
      return data.user;
    }
    return null;
  } catch (err) {
    console.error('Failed to get current user:', err);
    return getCachedUserProfile();
  }
}

export async function updateUserProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
  const res = await fetch('/api/auth/profile', {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(updates),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to update profile.');
  }

  localStorage.setItem(USER_CACHE_KEY, JSON.stringify(data.user));
  return data.user;
}

export async function requestForgotPassword(email: string): Promise<{ success: boolean; message: string; resetToken?: string }> {
  const res = await fetch('/api/auth/forgot-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to send reset instructions.');
  }
  return data;
}

export async function resetPassword(input: ResetPasswordInput): Promise<{ success: boolean; message: string }> {
  const res = await fetch('/api/auth/reset-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to reset password.');
  }
  return data;
}

export async function changePassword(input: ChangePasswordInput): Promise<{ success: boolean; message: string }> {
  const res = await fetch('/api/auth/change-password', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(input),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to change password.');
  }
  return data;
}

export async function adminCreateAccount(input: CreateAccountByAdminInput): Promise<{ success: boolean; user: UserProfile; message: string }> {
  const res = await fetch('/api/admin/create-account', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(input),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to create account.');
  }
  return data;
}

export async function adminListAccounts(role?: string): Promise<UserProfile[]> {
  const url = role ? `/api/admin/accounts?role=${encodeURIComponent(role)}` : '/api/admin/accounts';
  const res = await fetch(url, {
    headers: getAuthHeaders(),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to list accounts.');
  }
  return data.accounts || [];
}

export async function adminUpdateAccountStatus(userId: string, status: AccountStatus): Promise<UserProfile> {
  const res = await fetch('/api/admin/account-status', {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ userId, status }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to update account status.');
  }
  return data.user;
}

export async function importLocalProgress(payload: MigrationPayload): Promise<{ success: boolean; message: string; migrated: any }> {
  const res = await fetch('/api/migrate/import-progress', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to migrate progress.');
  }
  return data;
}
