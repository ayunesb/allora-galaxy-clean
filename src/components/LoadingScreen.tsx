
import React from 'react';

const LoadingScreen: React.FC = () => {
  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="flex flex-col items-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="text-lg font-medium">Loading...</p>
      </div>
    </div>
  );
};

export default LoadingScreen;
