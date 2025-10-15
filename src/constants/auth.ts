// Static credentials for demo purposes - stored users
export const DEMO_USERS: Record<string, {
  id: string;
  username: string;
  email: string;
  fullName: string;
  password: string;
  role: 'admin' | 'user';
  plan: 'BASE' | 'PRO';
}> = {
  'admin@example.com': {
    id: '1',
    username: 'admin',
    email: 'admin@example.com',
    fullName: 'Admin User',
    password: 'admin123',
    role: 'admin',
    plan: 'BASE',
  },
};

export const SESSION_TIMEOUT_MINUTES = 60;
export const SESSION_TIMEOUT_MS = SESSION_TIMEOUT_MINUTES * 60 * 1000;
export const IDLE_WARNING_MINUTES = 55; // Show warning 5 mins before timeout
export const IDLE_WARNING_MS = IDLE_WARNING_MINUTES * 60 * 1000;

// Password requirements
export const PASSWORD_REQUIREMENTS = [
  { regex: /.{8,}/, label: 'At least 8 characters' },
  { regex: /\d/, label: 'At least 1 number' },
  { regex: /[!@#$%^&*(),.?":{}|<>]/, label: 'At least 1 special character' },
];

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;