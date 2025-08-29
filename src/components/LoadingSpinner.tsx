import React from "react";
import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  text?: string;
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = "md", 
  text = "Loading...", 
  className = "" 
}) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
    xl: "h-12 w-12"
  };

  return (
    <div className={`flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-600 via-blue-500 to-blue-700 ${className}`} style={{backgroundImage: 'url(/background.jpg)'}}>
      {/* Subtle overlay to ensure readability while preserving the NBSC imagery */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 via-blue-800/30 to-blue-900/50"></div>
      
      <div className="relative z-10 flex flex-col items-center space-y-4">
        {/* NBSC Logo */}
        <div className="flex justify-center mb-4">
          <img
            src="/NBSCLOGO.png"
            alt="NBSC Logo"
            className="w-24 h-24 object-contain drop-shadow-lg animate-pulse"
          />
        </div>
        
        {/* Spinner */}
        <Loader2 className={`${sizeClasses[size]} text-white animate-spin`} />
        
        {/* Loading Text */}
        <p className="text-white text-lg font-medium">{text}</p>
        
        {/* College Name */}
        <p className="text-white/80 text-center text-sm max-w-xs">
          Northern Bukidnon State College<br />
          Entity Extraction System
        </p>
      </div>
    </div>
  );
};

export default LoadingSpinner;
