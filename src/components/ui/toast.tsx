import React from "react";

type ToastProps = {
  message: string;
  color?: string;
};

const Toast: React.FC<ToastProps> = ({ message, color = "bg-gray-200" }) => {
  const getColor = () => color;
  return (
    <div className={`px-4 py-2 rounded shadow-md ${getColor()}`}>
      {message}
    </div>
  );
};

export default Toast;
