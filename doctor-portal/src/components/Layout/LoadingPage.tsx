import React from 'react';

export const LoadingPage: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-gray-200 rounded-full animate-spin border-t-blue-600 mx-auto" />
        </div>
        <p className="mt-4 text-sm text-gray-500 font-medium">Loading...</p>
      </div>
    </div>
  );
};