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

/**
 * Custom hook for debouncing values
 */
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default function LoginForm({ 
  onForgotPassword = () => console.log("Navigate to forgot password"),
  onSignUp = () => console.log("Navigate to sign up"),
  onSocialLogin = (provider) => console.log(`Social login: ${provider}`)
} = {}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [touched, setTouched] = useState({ email: false, password: false });
  const emailInputRef = useRef(null);
  
  // Debounce password for strength feedback (500ms delay)
  const debouncedPassword = useDebounce(password, 500);

  // Track page view on mount
  const hasTrackedPageView = useRef(false);
  useEffect(() => {
    if (!hasTrackedPageView.current) {
      metricsTracker.trackPageView();
      hasTrackedPageView.current = true;
    }
    
    // Autofocus email field for better UX
    // This reduces the friction for users to start typing, which decreases bounce rate
    const timer = setTimeout(() => {
      if (emailInputRef.current) {
        emailInputRef.current.focus();
      }
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  // Track field focus
  function handleFocus(field) {
    metricsTracker.trackInteraction(`${field}_focus`);
  }

  // Validate field on blur for better UX feedback
  function handleBlur(field) {
    setTouched(prev => ({ ...prev, [field]: true }));
    metricsTracker.trackInteraction(`${field}_blur`);
    
    if (field === 'email' && !isValidEmail(email) && email.length > 0) {
      setErrors(prev => ({ ...prev, email: "Please enter a valid email address." }));
    }
    
    if (field === 'password' && !isValidPassword(password) && password.length > 0) {
      setErrors(prev => ({ ...prev, password: "Password must be at least 6 characters." }));
    }
  }

  async function handleLogin(e) {
    e.preventDefault();
    const nextErrors = { email: "", password: "", general: "" };

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
      metricsTracker.trackSubmission(false, nextErrors.email ? 'invalid_email' : 'invalid_password');
      return;
    }

    setIsLoading(true);
    metricsTracker.trackInteraction('login_attempt');
    
    try {
      // Simulate fast API call
      await new Promise((resolve) => setTimeout(resolve, 300));
      
      console.log("Login credentials:", { 
        email: email.trim(), 
        password,
        rememberMe 
      });
      
      metricsTracker.trackSubmission(true);
    } catch (err) {
      setErrors(prev => ({ ...prev, general: err.message }));
      metricsTracker.trackSubmission(false, 'api_error: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  }

  function handleInputChange(field, value) {
    if (field === 'email') {
      setEmail(value);
      if (errors.email || errors.general) {
        setErrors(prev => ({ ...prev, email: "", general: "" }));
      }
      metricsTracker.trackInteraction('email_input');
    } else if (field === 'password') {
      setPassword(value);
      if (errors.password || errors.general) {
        setErrors(prev => ({ ...prev, password: "", general: "" }));
      }
      metricsTracker.trackInteraction('password_input');
    }
  }

  function handleSocialLogin(provider) {
    metricsTracker.trackInteraction(`social_login_${provider.toLowerCase()}`);
    if (onSocialLogin) {
      onSocialLogin(provider);
    }
  }

  // Calculate password strength based on debounced value
  const passwordStrength = debouncedPassword.length >= 8 ? 'strong' : debouncedPassword.length >= 6 ? 'medium' : 'weak';
  const showPasswordStrength = password.length > 0 && debouncedPassword.length > 0;

  return (
    <form
      onSubmit={handleLogin}
      className="w-full max-w-md mx-auto p-6 sm:p-8 bg-white rounded-xl shadow-xl border border-gray-100"
      aria-label="Login form"
    >
      {/* Simplified header with welcoming tone */}
      <div className="mb-6 text-center animate-fade-in">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome back!</h1>
        <p className="text-sm text-gray-500">Sign in to continue your journey</p>
      </div>

      {/* Social login options - MOVED TO TOP for better conversion/lower bounce */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <button
          type="button"
          onClick={() => handleSocialLogin('Google')}
          className="flex items-center justify-center p-3 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          aria-label="Continue with Google"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
        </button>
        
        <button
          type="button"
          onClick={() => handleSocialLogin('Facebook')}
          className="flex items-center justify-center p-3 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          aria-label="Continue with Facebook"
        >
          <svg className="w-5 h-5" fill="#1877F2" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
        </button>
        
        <button
          type="button"
          onClick={() => handleSocialLogin('Apple')}
          className="flex items-center justify-center p-3 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          aria-label="Continue with Apple"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
          </svg>
        </button>
      </div>

      {/* Divider */}
      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200"></div>
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="px-2 bg-white text-gray-400 font-medium">Or continue with email</span>
        </div>
      </div>

      {errors.general && (
        <div 
          className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3 text-red-700 animate-in fade-in duration-300"
          role="alert"
        >
          <svg className="w-5 h-5 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-sm font-medium">{errors.general}</span>
        </div>
      )}

      <div className="mb-5">
        <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
          Email address
        </label>
        <input
          ref={emailInputRef}
          id="email"
          type="email"
          value={email}
          onChange={(e) => handleInputChange('email', e.target.value)}
          onFocus={() => handleFocus('email')}
          onBlur={() => handleBlur('email')}
          placeholder="you@example.com"
          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
            errors.email && touched.email ? "border-red-500 bg-red-50" : "border-gray-300 bg-gray-50 hover:bg-white"
          }`}
          autoComplete="email"
          aria-invalid={errors.email && touched.email ? "true" : "false"}
          aria-describedby={errors.email && touched.email ? "email-error" : undefined}
        />
        {errors.email && touched.email && (
          <p id="email-error" className="mt-2 text-sm text-red-600" role="alert">
            {errors.email}
          </p>
        )}
      </div>

      <div className="mb-5">
        <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
          Password
        </label>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => handleInputChange('password', e.target.value)}
            onFocus={() => handleFocus('password')}
            onBlur={() => handleBlur('password')}
            placeholder="Enter your password"
            className={`w-full px-4 py-3 pr-12 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
              errors.password && touched.password ? "border-red-500 bg-red-50" : "border-gray-300 bg-gray-50 hover:bg-white"
            }`}
            autoComplete="current-password"
            aria-invalid={errors.password && touched.password ? "true" : "false"}
            aria-describedby={errors.password && touched.password ? "password-error" : showPasswordStrength ? "password-strength" : undefined}
          />
          <button
            type="button"
            onClick={() => {
              setShowPassword(!showPassword);
              metricsTracker.trackInteraction('toggle_password_visibility');
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded p-1"
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
          <p id="password-error" className="mt-2 text-sm text-red-600" role="alert">
            {errors.password}
          </p>
        ) : showPasswordStrength ? (
          <p id="password-strength" className="mt-2 text-xs text-gray-600">
            <span className="text-gray-500">Password strength: </span>
            <span className={`font-semibold ${
              passwordStrength === 'strong' ? 'text-green-600' : 
              passwordStrength === 'medium' ? 'text-yellow-600' : 
              'text-red-600'
            }`}>
              {passwordStrength === 'strong' ? '✓ Strong' : 
               passwordStrength === 'medium' ? '○ Medium' : 
               '○ Weak'}
            </span>
          </p>
        ) : null}
      </div>

      <div className="mb-6 flex items-center justify-between">
        <label className="flex items-center cursor-pointer group">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => {
              setRememberMe(e.target.checked);
              metricsTracker.trackInteraction('toggle_remember_me');
            }}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
          />
          <span className="ml-2 text-sm text-gray-700 group-hover:text-gray-900">Remember me</span>
        </label>
        <button
          type="button"
          onClick={() => {
            metricsTracker.trackInteraction('forgot_password_click');
            onForgotPassword();
          }}
          className="text-sm text-blue-600 hover:text-blue-800 font-medium focus:outline-none focus:underline focus:ring-2 focus:ring-blue-500 rounded px-1"
          tabIndex={0}
        >
          Forgot password?
        </button>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-3.5 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all shadow-md hover:shadow-lg disabled:bg-blue-400 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center text-base"
      >
        {isLoading ? (
          <>
            <svg 
              className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" 
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
          'Sign in'
        )}
      </button>

      <div className="mt-8 text-center">
        <p className="text-sm text-gray-600">
          Don't have an account?{' '}
          <button
            type="button"
            onClick={() => {
              metricsTracker.trackInteraction('signup_click');
              onSignUp();
            }}
            className="text-blue-600 hover:text-blue-800 font-semibold focus:outline-none focus:underline focus:ring-2 focus:ring-blue-500 rounded px-1"
            tabIndex={0}
          >
            Sign up for free
          </button>
        </p>
      </div>

      {/* Trust badge */}
      <div className="mt-8 flex items-center justify-center gap-2 text-gray-400">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
        <span className="text-xs font-medium uppercase tracking-wider">Secure encrypted connection</span>
      </div>
    </form>
  );
}
