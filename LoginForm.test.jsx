import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import LoginForm from './LoginForm';

describe('LoginForm', () => {
  test('renders login form with all fields', () => {
    render(<LoginForm />);
    
    // Check for form title
    expect(screen.getByText('Log in')).toBeInTheDocument();
    
    // Check for email input
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument();
    
    // Check for password input
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
    
    // Check for Remember Me checkbox
    expect(screen.getByLabelText(/remember me/i)).toBeInTheDocument();
    
    // Check for submit button
    expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument();
  });

  test('renders show/hide password toggle button', () => {
    render(<LoginForm />);
    
    // Check for show/hide password button
    const toggleButton = screen.getByLabelText(/show password/i);
    expect(toggleButton).toBeInTheDocument();
  });

  test('toggles password visibility when clicking show/hide button', () => {
    render(<LoginForm />);
    
    const passwordInput = screen.getByLabelText(/password/i);
    const toggleButton = screen.getByLabelText(/show password/i);
    
    // Initially password should be hidden
    expect(passwordInput).toHaveAttribute('type', 'password');
    
    // Click to show password
    fireEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'text');
    expect(screen.getByLabelText(/hide password/i)).toBeInTheDocument();
    
    // Click again to hide password
    fireEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  test('displays clear error message for invalid email', () => {
    render(<LoginForm />);
    
    const emailInput = screen.getByLabelText(/email/i);
    const submitButton = screen.getByRole('button', { name: /log in/i });
    
    // Enter invalid email and submit
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.click(submitButton);
    
    // Check for clear error message
    expect(screen.getByText('Please enter a valid email address.')).toBeInTheDocument();
  });

  test('displays clear error message for short password', () => {
    render(<LoginForm />);
    
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /log in/i });
    
    // Enter valid email but short password
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: '12345' } });
    fireEvent.click(submitButton);
    
    // Check for clear error message
    expect(screen.getByText('Password must be at least 6 characters.')).toBeInTheDocument();
  });

  test('clears error messages when user starts typing', () => {
    render(<LoginForm />);
    
    const emailInput = screen.getByLabelText(/email/i);
    const submitButton = screen.getByRole('button', { name: /log in/i });
    
    // Trigger email error
    fireEvent.click(submitButton);
    expect(screen.getByText('Please enter a valid email address.')).toBeInTheDocument();
    
    // Start typing - error should clear
    fireEvent.change(emailInput, { target: { value: 't' } });
    expect(screen.queryByText('Please enter a valid email address.')).not.toBeInTheDocument();
  });

  test('remember me checkbox can be checked and unchecked', () => {
    render(<LoginForm />);
    
    const rememberMeCheckbox = screen.getByLabelText(/remember me/i);
    
    // Initially unchecked
    expect(rememberMeCheckbox).not.toBeChecked();
    
    // Check the checkbox
    fireEvent.click(rememberMeCheckbox);
    expect(rememberMeCheckbox).toBeChecked();
    
    // Uncheck the checkbox
    fireEvent.click(rememberMeCheckbox);
    expect(rememberMeCheckbox).not.toBeChecked();
  });

  test('submits form successfully with valid data', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    render(<LoginForm />);
    
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const rememberMeCheckbox = screen.getByLabelText(/remember me/i);
    const submitButton = screen.getByRole('button', { name: /log in/i });
    
    // Fill in valid data
    fireEvent.change(emailInput, { target: { value: 'user@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(rememberMeCheckbox);
    
    // Submit form
    fireEvent.click(submitButton);
    
    // No error messages should be displayed
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    
    // Console should log the credentials including rememberMe
    expect(consoleSpy).toHaveBeenCalledWith('Login credentials:', {
      email: 'user@example.com',
      password: 'password123',
      rememberMe: true
    });
    
    consoleSpy.mockRestore();
  });

  test('email field has proper autocomplete attribute', () => {
    render(<LoginForm />);
    const emailInput = screen.getByLabelText(/email/i);
    expect(emailInput).toHaveAttribute('autocomplete', 'email');
  });

  test('password field has proper autocomplete attribute', () => {
    render(<LoginForm />);
    const passwordInput = screen.getByLabelText(/password/i);
    expect(passwordInput).toHaveAttribute('autocomplete', 'current-password');
  });

  test('error styling is applied to invalid fields', () => {
    render(<LoginForm />);
    
    const emailInput = screen.getByLabelText(/email/i);
    const submitButton = screen.getByRole('button', { name: /log in/i });
    
    // Submit with empty email
    fireEvent.click(submitButton);
    
    // Email input should have error border styling
    expect(emailInput).toHaveClass('border-red-500');
  });
});
