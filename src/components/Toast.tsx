import React from 'react';

interface ToastProps {
  message: string | null;
}

export const Toast: React.FC<ToastProps> = ({ message }) => {
  if (!message) return null;

  return (
    <div className="fixed left-1/2 -translate-x-1/2 bottom-[86px] z-50 bg-[rgba(30,24,12,0.92)] text-[#FFFFFF] text-[13.5px] px-4 py-2.5 rounded-[10px] shadow-lg max-w-[calc(100%-40px)] text-center animate-in fade-in slide-in-from-bottom-2 duration-150">
      {message}
    </div>
  );
};
