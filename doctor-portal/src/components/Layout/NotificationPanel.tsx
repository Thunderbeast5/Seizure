import React from 'react';
import { XMarkIcon, BellIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';

interface Notification {
  id: string;
  patientName: string;
  type: string;
  date: string;
  severity?: string;
  patientId: string;
  seizureId?: string;
}

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  notifications?: Notification[];
}

export const NotificationPanel: React.FC<NotificationPanelProps> = ({
  isOpen,
  onClose,
  notifications = [],
}) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-30" onClick={onClose} />
      <div className="fixed right-4 top-16 z-40 w-96 bg-white rounded-lg shadow-xl border border-gray-200 max-h-[70vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div className="flex items-center space-x-2">
            <BellIcon className="w-5 h-5 text-gray-600" />
            <h3 className="font-semibold text-gray-900">Notifications</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Notifications List */}
        <div className="overflow-y-auto flex-1">
          {notifications.length === 0 ? (
            <div className="p-8 text-center">
              <BellIcon className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500">No recent notifications</p>
              <p className="text-xs text-gray-400 mt-1">
                Seizure alerts will appear here in real time
              </p>
            </div>
          ) : (
            notifications.map((n) => (
              <button
                key={n.id}
                onClick={() => {
                  onClose();
                  navigate(
                    `/patients/${n.patientId}?tab=seizures${n.seizureId ? `&seizureId=${encodeURIComponent(n.seizureId)}` : ''}`
                  );
                }}
                className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-50 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 mt-2 bg-red-500 rounded-full flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {n.patientName}
                    </p>
                    <p className="text-xs text-gray-600 mt-0.5">
                      {n.type} seizure{n.severity ? ` • ${n.severity}` : ''}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(n.date).toLocaleString()}
                    </p>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </>
  );
};