import React, { useState, useEffect, useRef } from "react";
import metricsTracker from './metrics.js';

/**
 * Simple email validation (basic format check).
 */
function isValidEmail(value) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(value?.trim() ?? "");
}

/**
 * Password validation: non-empty, minimum length 6.
 */
function isValidPassword(value) {
  return typeof value === "string" && value.length >= 6;
}

export default function LoginForm({ 
  onForgotPassword = () => console.log("Navigate to forgot password"),
  onSignUp = () => console.log("Navigate to sign up")
} = {}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [touched, setTouched] = useState({ email: false, password: false });
  const emailInputRef = useRef(null);

  // Track page view on mount
  useEffect(() => {
    metricsTracker.trackPageView();
    
    // Autofocus email field for better UX
    if (emailInputRef.current) {
      emailInputRef.current.focus();
    }
  }, []);

  // Validate field on blur for better UX feedback
  function handleBlur(field) {
    setTouched(prev => ({ ...prev, [field]: true }));
    
    if (field === 'email' && !isValidEmail(email) && email.length > 0) {
      setErrors(prev => ({ ...prev, email: "Please enter a valid email address." }));
    }
    
    if (field === 'password' && !isValidPassword(password) && password.length > 0) {
      setErrors(prev => ({ ...prev, password: "Password must be at least 6 characters." }));
    }
  }

  async function handleLogin(e) {
    e.preventDefault();
    const nextErrors = { email: "", password: "" };

    // Mark all fields as touched
    setTouched({ email: true, password: true });

    if (!isValidEmail(email)) {
      nextErrors.email = "Please enter a valid email address.";
    }
    if (!isValidPassword(password)) {
      nextErrors.password = "Password must be at least 6 characters.";
    }

    setErrors(nextErrors);

    if (nextErrors.email || nextErrors.password) {
      metricsTracker.trackInteraction('validation_error');
      return;
    }

    setIsLoading(true);
    metricsTracker.trackInteraction('login_attempt');
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 100));
    
    console.log("Login credentials:", { 
      email: email.trim(), 
      password,
      rememberMe 
    });
    
    metricsTracker.trackSubmission(true);
    setIsLoading(false);
  }

  function handleInputChange(field, value) {
    if (field === 'email') {
      setEmail(value);
      if (errors.email) setErrors(prev => ({ ...prev, email: "" }));
      metricsTracker.trackInteraction('email_input');
    } else if (field === 'password') {
      setPassword(value);
      if (errors.password) setErrors(prev => ({ ...prev, password: "" }));
      metricsTracker.trackInteraction('password_input');
    }
  }

  const passwordStrength = password.length >= 8 ? 'strong' : password.length >= 6 ? 'medium' : 'weak';

  return (
    <form
      onSubmit={handleLogin}
      className="w-full max-w-sm mx-auto p-6 bg-white rounded-lg shadow-md border border-gray-200"
      aria-label="Login form"
    >
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome back</h2>
        <p className="text-sm text-gray-600">
          Log in to access your account and continue where you left off
        </p>
      </div>

      <div className="mb-4">
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Email address
        </label>
        <input
          ref={emailInputRef}
          id="email"
          type="email"
          value={email}
          onChange={(e) => handleInputChange('email', e.target.value)}
          onBlur={() => handleBlur('email')}
          placeholder="you@example.com"
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
            errors.email && touched.email ? "border-red-500" : "border-gray-300"
          }`}
          autoComplete="email"
          aria-invalid={errors.email && touched.email ? "true" : "false"}
          aria-describedby={errors.email && touched.email ? "email-error" : undefined}
        />
        {errors.email && touched.email && (
          <p id="email-error" className="mt-1 text-sm text-red-600" role="alert">
            {errors.email}
          </p>
        )}
      </div>

      <div className="mb-4">
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
          Password
        </label>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => handleInputChange('password', e.target.value)}
            onBlur={() => handleBlur('password')}
            placeholder="••••••••"
            className={`w-full px-3 py-2 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
              errors.password && touched.password ? "border-red-500" : "border-gray-300"
            }`}
            autoComplete="current-password"
            aria-invalid={errors.password && touched.password ? "true" : "false"}
            aria-describedby={errors.password && touched.password ? "password-error" : "password-hint"}
          />
          <button
            type="button"
            onClick={() => {
              setShowPassword(!showPassword);
              metricsTracker.trackInteraction('toggle_password_visibility');
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
            aria-label={showPassword ? "Hide password" : "Show password"}
            tabIndex={0}
          >
            {showPassword ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        </div>
        {errors.password && touched.password ? (
          <p id="password-error" className="mt-1 text-sm text-red-600" role="alert">
            {errors.password}
          </p>
        ) : (
          <p id="password-hint" className="mt-1 text-xs text-gray-500">
            Minimum 6 characters required
            {password.length > 0 && (
              <span className={`ml-2 font-medium ${
                passwordStrength === 'strong' ? 'text-green-600' : 
                passwordStrength === 'medium' ? 'text-yellow-600' : 
                'text-red-600'
              }`}>
                {passwordStrength === 'strong' ? '✓ Strong' : 
                 passwordStrength === 'medium' ? '○ Medium' : 
                 '○ Weak'}
              </span>
            )}
          </p>
        )}
      </div>

      <div className="mb-6 flex items-center justify-between">
        <label className="flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => {
              setRememberMe(e.target.checked);
              metricsTracker.trackInteraction('toggle_remember_me');
            }}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
          />
          <span className="ml-2 text-sm text-gray-700">Remember me</span>
        </label>
        <button
          type="button"
          onClick={() => {
            metricsTracker.trackInteraction('forgot_password_click');
            onForgotPassword();
          }}
          className="text-sm text-blue-600 hover:text-blue-800 focus:outline-none focus:underline focus:ring-2 focus:ring-blue-500 rounded px-1"
          tabIndex={0}
        >
          Forgot password?
        </button>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-2.5 px-4 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center justify-center"
      >
        {isLoading ? (
          <>
            <svg 
              className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle 
                className="opacity-25" 
                cx="12" 
                cy="12" 
                r="10" 
                stroke="currentColor" 
                strokeWidth="4"
              />
              <path 
                className="opacity-75" 
                fill="currentColor" 
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Logging in...
          </>
        ) : (
          'Log in'
        )}
      </button>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Don't have an account?{' '}
          <button
            type="button"
            onClick={() => {
              metricsTracker.trackInteraction('signup_click');
              onSignUp();
            }}
            className="text-blue-600 hover:text-blue-800 font-medium focus:outline-none focus:underline focus:ring-2 focus:ring-blue-500 rounded px-1"
            tabIndex={0}
          >
            Sign up for free
          </button>
        </p>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          Secure login with end-to-end encryption
        </p>
      </div>
    </form>
  );
}
