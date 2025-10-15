import React, { useState, useEffect } from 'react';
import { Alert } from 'antd';
import { MailOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import Button from '../ui/AntButton';
import Card from '../ui/AntCard';
import { cn } from '../../lib/utils';

const resendVerificationEmail = async (email: string) => { }

const VerifyEmailForm: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || 'your email';

  const [resendCooldown, setResendCooldown] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [resendCooldown]);

  const handleResend = async () => {
    if (!canResend || !email || email === 'your email') return;

    setResendLoading(true);
    setShowSuccess(false);

    try {
      const error = await resendVerificationEmail(email);

      if (error) {
        // Show error message
        console.error('Resend error:', error.message);
      } else {
        setShowSuccess(true);
        setCanResend(false);
        setResendCooldown(30);

        // Hide success message after 3 seconds
        setTimeout(() => setShowSuccess(false), 3000);
      }
    } catch (error) {
      console.error('Resend error:', error);
    } finally {
      setResendLoading(false);
    }
  };

  const openEmailApp = (provider: 'gmail' | 'outlook') => {
    const urls = {
      gmail: 'https://mail.google.com',
      outlook: 'https://outlook.live.com',
    };
    window.open(urls[provider], '_blank');
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
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <MailOutlined className="text-3xl text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Check Your Inbox</h1>
          <p className="text-muted-foreground">
            We've sent a verification link to{' '}
            <span className="font-medium text-foreground">{email}</span>
          </p>
        </div>

        <div className="space-y-4 mb-8">
          <Alert
            message="Verify your email to complete registration"
            description="Click the link in your email to verify your account and get started."
            type="info"
            className="bg-info/10 border-info text-info"
            showIcon
          />

          {showSuccess && (
            <Alert
              message="Verification email sent!"
              description="Check your inbox for the new verification email."
              type="success"
              className="bg-success/10 border-success text-success"
              showIcon
            />
          )}
        </div>

        <div className="space-y-4">
          <div className="flex gap-3">
            <Button
              variant="outline"
              size="lg"
              onClick={() => openEmailApp('gmail')}
              className="flex-1"
            >
              Open Gmail
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => openEmailApp('outlook')}
              className="flex-1"
            >
              Open Outlook
            </Button>
          </div>

          <Button
            variant="ghost"
            size="lg"
            onClick={handleResend}
            loading={resendLoading}
            disabled={!canResend}
            className="w-full"
          >
            {canResend ? (
              'Resend verification email'
            ) : (
              <>
                <ClockCircleOutlined className="mr-2" />
                Resend in {resendCooldown}s
              </>
            )}
          </Button>
        </div>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>
            Wrong email?{' '}
            <button
              onClick={() => navigate('/signup')}
              className="text-primary hover:underline font-medium"
            >
              Go back
            </button>
          </p>
          <p className="mt-2">
            Already verified?{' '}
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

export default VerifyEmailForm;