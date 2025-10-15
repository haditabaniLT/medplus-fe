import React, { useState } from 'react';
import { Form, Alert } from 'antd';
import { MailOutlined, LockOutlined, SafetyOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { ForgotPasswordFormData, ResetPasswordFormData } from '../../types';
import { validateEmail, validatePassword, validateConfirmPassword, isPasswordValid } from '../../utils/validation';
import TextInput from '../ui/TextInput';
import Button from '../ui/AntButton';
import Card from '../ui/AntCard';
import { cn } from '../../lib/utils';

type Step = 'email' | 'verify' | 'reset';

const ForgotPasswordForm: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState<string>('');

  const handleEmailSubmit = async (values: ForgotPasswordFormData) => {
    if (!validateEmail(values.email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setError('');

    // Simulate API call delay
    setTimeout(() => {
      setLoading(false);
      setEmail(values.email);
      setSuccess('If an account with that email exists, we\'ve sent a password reset code.');
      setStep('verify');
    }, 1000);
  };

  const handleVerifySubmit = async (values: { code: string }) => {
    if (values.code !== '123456') { // Mock verification
      setError('Invalid or expired code');
      return;
    }

    setError('');
    setSuccess('');
    setStep('reset');
  };

  const handleResetSubmit = async (values: ResetPasswordFormData) => {
    if (!isPasswordValid(values.password)) {
      setError('Password does not meet requirements');
      return;
    }

    if (!validateConfirmPassword(values.password, values.confirmPassword)) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError('');

    // Simulate API call delay
    setTimeout(() => {
      setLoading(false);
      setSuccess('Password reset successfully!');
      
      setTimeout(() => {
        navigate('/login', { state: { message: 'Password reset successfully. Please sign in with your new password.' } });
      }, 2000);
    }, 1000);
  };

  const renderEmailStep = () => (
    <>
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <MailOutlined className="text-3xl text-primary" />
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Reset Password</h1>
        <p className="text-muted-foreground">
          Enter your email address and we'll send you a reset code
        </p>
      </div>

      <Form
        form={form}
        onFinish={handleEmailSubmit}
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
            icon={<MailOutlined />}
            className="mb-6"
          />
        </Form.Item>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={loading}
          className="w-full mb-4"
        >
          Send Reset Code
        </Button>
      </Form>
    </>
  );

  const renderVerifyStep = () => (
    <>
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <SafetyOutlined className="text-3xl text-primary" />
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Enter Reset Code</h1>
        <p className="text-muted-foreground">
          Enter the 6-digit code sent to {email}
        </p>
      </div>

      <div className="mb-6 p-4 bg-muted rounded-lg">
        <p className="text-sm text-muted-foreground mb-2">Demo Code:</p>
        <p className="text-sm font-mono text-foreground">123456</p>
      </div>

      <Form
        form={form}
        onFinish={handleVerifySubmit}
        layout="vertical"
        size="large"
      >
        <Form.Item
          name="code"
          rules={[{ required: true, message: 'Please enter the verification code' }]}
        >
          <TextInput
            placeholder="000000"
            maxLength={6}
            className="mb-6 text-center text-2xl tracking-widest"
          />
        </Form.Item>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={loading}
          className="w-full mb-4"
        >
          Verify Code
        </Button>
      </Form>
    </>
  );

  const renderResetStep = () => {
    const passwordRequirements = validatePassword(form.getFieldValue('password') || '');

    return (
      <>
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <LockOutlined className="text-3xl text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">New Password</h1>
          <p className="text-muted-foreground">
            Create a strong password for your account
          </p>
        </div>

        <Form
          form={form}
          onFinish={handleResetSubmit}
          layout="vertical"
          size="large"
        >
          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Please enter your new password' }]}
          >
            <TextInput
              type="password"
              placeholder="New Password"
              icon={<LockOutlined />}
              className="mb-2"
            />
          </Form.Item>

          {/* Password Requirements Checklist */}
          <div className="mb-4 p-3 bg-muted rounded-lg">
            <p className="text-sm font-medium text-foreground mb-2">Password Requirements:</p>
            {passwordRequirements.map((req, index) => (
              <div key={index} className="flex items-center space-x-2 text-sm">
                <span className={req.met ? 'text-success' : 'text-muted-foreground'}>
                  {req.met ? '✓' : '○'} {req.label}
                </span>
              </div>
            ))}
          </div>

          <Form.Item
            name="confirmPassword"
            rules={[{ required: true, message: 'Please confirm your new password' }]}
          >
            <TextInput
              type="password"
              placeholder="Confirm New Password"
              icon={<LockOutlined />}
              className="mb-6"
            />
          </Form.Item>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={loading}
            className="w-full mb-4"
          >
            Reset Password
          </Button>
        </Form>
      </>
    );
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
        {error && (
          <Alert
            message={error}
            type="error"
            className="mb-6 bg-destructive/10 border-destructive text-destructive"
            showIcon
          />
        )}

        {success && (
          <Alert
            message={success}
            type="success"
            className="mb-6 bg-success/10 border-success text-success"
            showIcon
          />
        )}

        {step === 'email' && renderEmailStep()}
        {step === 'verify' && renderVerifyStep()}
        {step === 'reset' && renderResetStep()}

        <div className="text-center text-sm text-muted-foreground">
          <p>
            Remember your password?{' '}
            <button 
              onClick={() => navigate('/login')}
              className="text-primary hover:underline font-medium"
            >
              Sign In
            </button>
          </p>
        </div>
      </Card>
    </div>
  );
};

export default ForgotPasswordForm;