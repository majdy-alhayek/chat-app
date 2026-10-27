import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import './Notification.css';

export default function Notification({ message, type = 'success', onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onClose) onClose();
    }, 4000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle2 style={{ width: '1.25rem', height: '1.25rem' }} />;
      case 'error':
        return <AlertCircle style={{ width: '1.25rem', height: '1.25rem' }} />;
      default:
        return <Info style={{ width: '1.25rem', height: '1.25rem' }} />;
    }
  };

  return (
    <div className="notification-container">
      <div className={`notification-item ${type}`}>
        <div className="notification-content">
          <div className="notification-icon">{getIcon()}</div>
          <p className="notification-message">{message}</p>
        </div>
        <button onClick={onClose} className="notification-close-btn">
          <X style={{ width: '1rem', height: '1rem' }} />
        </button>
      </div>
    </div>
  );
}