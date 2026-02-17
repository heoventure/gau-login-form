import React, { useState } from "react";

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

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({ email: "", password: "" });

  function handleLogin(e) {
    e.preventDefault();
    const nextErrors = { email: "", password: "" };

    if (!isValidEmail(email)) {
      nextErrors.email = "Please enter a valid email address.";
    }
    if (!isValidPassword(password)) {
      nextErrors.password = "Password must be at least 6 characters.";
    }

    setErrors(nextErrors);

    if (nextErrors.email || nextErrors.password) {
      return;
    }

    console.log("Login credentials:", { email: email.trim(), password });
  }

  return (
    <form
      onSubmit={handleLogin}
      className="w-full max-w-sm mx-auto p-6 bg-white rounded-lg shadow-md border border-gray-200"
    >
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Log in</h2>

      <div className="mb-4">
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (errors.email) setErrors((prev) => ({ ...prev, email: "" }));
          }}
          placeholder="you@example.com"
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            errors.email ? "border-red-500" : "border-gray-300"
          }`}
          autoComplete="email"
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600" role="alert">
            {errors.email}
          </p>
        )}
      </div>

      <div className="mb-6">
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (errors.password) setErrors((prev) => ({ ...prev, password: "" }));
          }}
          placeholder="••••••••"
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            errors.password ? "border-red-500" : "border-gray-300"
          }`}
          autoComplete="current-password"
        />
        {errors.password && (
          <p className="mt-1 text-sm text-red-600" role="alert">
            {errors.password}
          </p>
        )}
      </div>

      <button
        type="submit"
        className="w-full py-2 px-4 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
      >
        Log in
      </button>
    </form>
  );
}
