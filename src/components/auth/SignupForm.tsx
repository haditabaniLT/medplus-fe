import React, { useState } from 'react';
import { Form, Alert, Checkbox } from 'antd';
import { UserOutlined, MailOutlined, LockOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { SignupFormData } from '../../types';
import { validateEmail, validatePassword, validateConfirmPassword, isPasswordValid } from '../../utils/validation';
import TextInput from '../ui/TextInput';
import Button from '../ui/AntButton';
import Card from '../ui/AntCard';
import FusingSpinner from '../ui/FusingSpinner';
import { cn } from '../../lib/utils';
import { signupUser } from '@/supabase/auth';

const SignupForm: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [formData, setFormData] = useState<Partial<SignupFormData>>({});

  const passwordRequirements = validatePassword(formData.password || '');

  const handleSubmit = async (values: SignupFormData) => {
    if (!values.consent) {
      setError('Please accept the terms and conditions');
      return;
    }

    if (!validateEmail(values.email)) {
      setError('Please enter a valid email address');
      return;
    }

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

    try {
      const response = await signupUser(values);
      if (response.error) {
        setError(response.error.message);
        return;
      }
      if (response.user) {
        // Success - navigate to verify email page
        navigate('/verify-email', {
          state: { email: values.email },
        });
      }
    } catch (err: any) {
      console.error('Signup error:', err);
      setError(err.message === 'Request timed out'
        ? 'Request timed out. Please try again.'
        : 'Failed to create account. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = () => {
    const values = form.getFieldsValue();
    setFormData(values);
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
          <h1 className="text-3xl font-bold text-foreground mb-2">Create Account</h1>
          <p className="text-muted-foreground">Join us today</p>
        </div>

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
          onValuesChange={handleFormChange}
          layout="vertical"
          size="large"
          initialValues={{ consent: false }}
        >
          <Form.Item
            name="fullName"
            // initialValue={"John Doe"}
            rules={[{ required: true, message: 'Please enter your full name' }]}
          >
            <TextInput
              placeholder="Full Name"
              icon={<UserOutlined />}
              className="mb-4"
            />
          </Form.Item>

          <Form.Item
            name="email"
            // initialValue={"johndoe@yopmail.com"}
            rules={[
              { required: true, message: 'Please enter your email' },
              { type: 'email', message: 'Please enter a valid email' }
            ]}
          >
            <TextInput
              placeholder="Email"
              type="email"
              icon={<MailOutlined />}
              className="mb-4"
            />
          </Form.Item>

          <Form.Item
            name="password"
            // initialValue={"@@Power2me"}
            rules={[{ required: true, message: 'Please enter your password' }]}
          >
            <TextInput
              type="password"
              placeholder="Password"
              icon={<LockOutlined />}
              className="mb-2"
            />
          </Form.Item>

          {/* Password Requirements Checklist */}
          <div className="mb-4 p-3 bg-muted rounded-lg">
            <p className="text-sm font-medium text-foreground mb-2">Password Requirements:</p>
            {passwordRequirements.map((req, index) => (
              <div key={index} className="flex items-center space-x-2 text-sm">
                {req.met ? (
                  <CheckOutlined className="text-success" />
                ) : (
                  <CloseOutlined className="text-muted-foreground" />
                )}
                <span className={req.met ? 'text-success' : 'text-muted-foreground'}>
                  {req.label}
                </span>
              </div>
            ))}
          </div>

          <Form.Item
            name="confirmPassword"
            // initialValue={"@@Power2me"}
            rules={[{ required: true, message: 'Please confirm your password' }]}
          >
            <TextInput
              type="password"
              placeholder="Confirm Password"
              icon={<LockOutlined />}
              className="mb-4"
            />
          </Form.Item>

          <Form.Item
            name="consent"
            valuePropName="checked"
            rules={[{ required: true, message: 'Please accept the terms and conditions' }]}
          >
            <Checkbox className="text-sm text-muted-foreground">
              I agree to the <a href="#" className="text-primary hover:underline">Terms of Service</a> and{' '}
              <a href="#" className="text-primary hover:underline">Privacy Policy</a>
            </Checkbox>
          </Form.Item>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={loading}
            className="w-full mb-4"
          >
            Create Account
          </Button>
        </Form>

        <div className="text-center text-sm text-muted-foreground">
          <p>
            Already have an account?{' '}
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

export default SignupForm;