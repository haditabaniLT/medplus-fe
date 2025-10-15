import React, { useState, useEffect } from 'react';
import { Form, Alert } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { loginSuccess } from '../../store/slices/sessionSlice';
import TextInput from '../ui/TextInput';
import Button from '../ui/AntButton';
import Card from '../ui/AntCard';
import { cn } from '../../lib/utils';
import { loginUser, getUserProfile } from '@/supabase/auth';

const LoginForm: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
    }

    // Auth check removed - Supabase implementation removed
    // Replace with your authentication system's session check
  }, [location.state, navigate]);

  const handleSubmit = async (values: { email: string; password: string }) => {
    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const data = await loginUser(values.email, values.password);

      if (data?.user) {
        // Fetch user profile data from database
        const profile = await getUserProfile(data.user.id);
        
        if (profile) {
          dispatch(
            loginSuccess({
              id: data.user.id,
              username: profile.full_name || data.user.email?.split('@')[0] || 'User',
              email: data.user.email || '',
              fullName: profile.full_name || '',
              role: (profile.role?.toLowerCase() === 'admin' ? 'admin' : 'user') as 'admin' | 'user',
              plan: (profile.plan || 'BASE') as 'BASE' | 'PRO',
              isAuthenticated: true,
              onboarding: profile.onboarding || false,
            })
          );
        } else {
          // Fallback if profile fetch fails
          dispatch(
            loginSuccess({
              id: data.user.id,
              username: data.user.email?.split('@')[0] || 'User',
              email: data.user.email || '',
              fullName: data.user.user_metadata?.full_name || '',
              role: 'user' as 'admin' | 'user',
              plan: 'BASE' as 'BASE' | 'PRO',
              isAuthenticated: true,
              onboarding: false, // Default to false if no profile
            })
          );
        }
        navigate('/'); // Let Index.tsx handle onboarding redirect logic
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-dark flex items-center justify-center p-4">
      <Card
        className={cn(
          'w-full max-w-md mx-auto shadow-glow',
          'mobile:max-w-sm tablet:max-w-md desktop:max-w-lg'
        )}
        bordered={false}
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Welcome Back</h1>
          <p className="text-muted-foreground">Sign in to your account</p>
        </div>

        {successMessage && (
          <Alert
            message={successMessage}
            type="success"
            className="mb-6 bg-success/10 border-success text-success"
            showIcon
          />
        )}

        {error && (
          <Alert
            message={error}
            type="error"
            className="mb-6 bg-destructive/10 border-destructive text-destructive"
            showIcon
          />
        )}

        <Form
          form={form}
          onFinish={handleSubmit}
          layout="vertical"
          size="large"
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Please enter your email' },
              { type: 'email', message: 'Please enter a valid email' }
            ]}
          >
            <TextInput
              placeholder="Email"
              type="email"
              icon={<UserOutlined />}
              className="mb-4"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Please enter your password' }]}
          >
            <TextInput
              type="password"
              placeholder="Password"
              icon={<LockOutlined />}
              className="mb-4"
            />
          </Form.Item>

          <div className="text-right mb-6">
            <button
              type="button"
              onClick={() => navigate('/forgot-password')}
              className="text-sm text-primary hover:underline"
            >
              Forgot password?
            </button>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={loading}
            className="w-full"
          >
            Sign In
          </Button>
        </Form>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>
            Don't have an account?{' '}
            <button
              onClick={() => navigate('/signup')}
              className="text-primary hover:underline font-medium"
            >
              Sign Up
            </button>
          </p>
        </div>
      </Card>
    </div>
  );
};

export default LoginForm;