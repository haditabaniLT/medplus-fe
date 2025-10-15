import React, { useState, useEffect } from 'react';
import { Modal } from 'antd';
import { ClockCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { extendSession, logout, hideIdleModal } from '../../store/slices/sessionSlice';
import Button from '../ui/AntButton';

const IdleTimeoutModal: React.FC = () => {
  const dispatch = useDispatch();
  const { showIdleModal, sessionExpiry } = useSelector((state: RootState) => state.session);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (showIdleModal && sessionExpiry) {
      const updateCountdown = () => {
        const remaining = Math.max(0, Math.ceil((sessionExpiry - Date.now()) / 1000));
        setCountdown(remaining);
        
        if (remaining === 0) {
          dispatch(logout());
        }
      };

      updateCountdown();
      const interval = setInterval(updateCountdown, 1000);
      
      return () => clearInterval(interval);
    }
  }, [showIdleModal, sessionExpiry, dispatch]);

  const handleExtendSession = () => {
    dispatch(extendSession());
    dispatch(hideIdleModal());
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Modal
      open={showIdleModal}
      title={null}
      footer={null}
      closable={false}
      centered
      width={400}
      className="idle-timeout-modal"
    >
      <div className="text-center p-6">
        <div className="w-16 h-16 bg-warning/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <ExclamationCircleOutlined className="text-3xl text-warning" />
        </div>
        
        <h2 className="text-xl font-bold text-foreground mb-2">Still there?</h2>
        <p className="text-muted-foreground mb-4">
          Your session will expire due to inactivity
        </p>
        
        <div className="bg-muted rounded-lg p-4 mb-6">
          <div className="flex items-center justify-center space-x-2 text-warning">
            <ClockCircleOutlined />
            <span className="text-lg font-mono font-bold">
              {formatTime(countdown)}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Time remaining
          </p>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            size="lg"
            onClick={handleLogout}
            className="flex-1"
          >
            Logout
          </Button>
          <Button
            variant="primary"
            size="lg"
            onClick={handleExtendSession}
            className="flex-1"
          >
            Stay Signed In
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default IdleTimeoutModal;