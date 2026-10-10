import React, { forwardRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export const Input = forwardRef(({ label, type = 'text', error, ...props }, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword && showPassword ? 'text' : type;

  return (
    <div className="flex flex-col space-y-1.5 w-full mb-4">
      {label && (
        <label className="text-sm font-semibold text-navy-900">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          ref={ref}
          type={inputType}
          className={`w-full px-4 py-3 bg-white border ${error ? 'border-red-500 focus:ring-red-500/20' : 'border-cream-200 focus:ring-sage-500/20'} rounded-xl text-sm focus:outline-none focus:border-sage-500 focus:ring-4 transition-all`}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-navy-900 focus:outline-none"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex="-1"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        )}
      </div>
      {error && <span className="text-xs text-red-500 font-medium">{error}</span>}
    </div>
  );
});

Input.displayName = 'Input';
