// BackgroundBlobs.tsx
import React from 'react';

export const BackgroundBlobs = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Pink Glow */}
      <div className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] bg-[#FF5C8A] rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[100px] opacity-15 dark:opacity-20 animate-float"></div>
      {/* Mint Green Glow */}
      <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-[#3ED598] rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[100px] opacity-15 dark:opacity-20 animate-float-delayed"></div>
      {/* Primary Yellow Touch for Theme Consistency */}
      <div className="absolute top-[30%] right-[20%] w-[30vw] h-[30vw] bg-primary rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[120px] opacity-10 dark:opacity-10 animate-pulse-slow"></div>
    </div>
  );
};
