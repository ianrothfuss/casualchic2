import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import Layout from '../components/Layout';
import { useAuth } from '../hooks/useAuth';

const Register = () => {
  const router = useRouter();
  const { register, isLoading, error } = useAuth();
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirm_password: '',
    phone: '',
  });
  const [formError, setFormError] = useState('');

  // Get redirect path from query params or default to '/account'
  const { redirect } = router.query;
  const redirectPath = redirect || '/account';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    // Validate form
    if (!formData.email || !formData.password) {
      setFormError('Email and password are required');
      return;
    }

    if (formData.password !== formData.confirm_password) {
      setFormError('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      setFormError('Password must be at least 8 characters long');
      return;
    }

    try {
      // Create user data object
      const userData = {
        email: formData.email,
        password: formData.password,
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone: formData.phone || undefined,
      };

      // Attempt registration
      await register(userData, redirectPath);
    } catch (err) {
      // Display user-friendly error message
      setFormError(
        err.message || 'Registration failed. Please check your information and try again.'
      );
    }
  };

  return (
    <Layout title="Register | Casual Chic Boutique">
      <Head>
        <title>Register | Casual Chic Boutique</title>
      </Head>

      <div className="auth-page py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-lg mx-auto bg-white p-8 rounded-lg shadow-md">
            <h1 className="text-2xl font-serif font-bold text-center mb-6">Create an Account</h1>

            {/* Form errors */}
            {(formError || error) && (
              <div className="error-alert bg-red-50 text-red-500 p-4 mb-6 rounded">
                {formError || error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                  <label htmlFor="first_name" className="block mb-2 text-sm font-medium">
                    First Name
                  </label>
                  <input
                    type="text"
                    id="first_name"
                    name="first_name"
                    className="block w-full px-4 py-2 border border-gray-300 rounded focus:ring-primary focus:border-primary"
                    value={formData.first_name}
                    onChange={handleChange}
                    disabled={isLoading}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="last_name" className="block mb-2 text-sm font-medium">
                    Last Name
                  </label>
                  <input
                    type="text"
                    id="last_name"
                    name="last_name"
                    className="block w-full px-4 py-2 border border-gray-300 rounded focus:ring-primary focus:border-primary"
                    value={formData.last_name}
                    onChange={handleChange}
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div className="form-group">
                <label htmlFor="email" className="block mb-2 text-sm font-medium">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="block w-full px-4 py-2 border border-gray-300 rounded focus:ring-primary focus:border-primary"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={isLoading}
                  required
                />
              </div>

              {/* Phone (Optional) */}
              <div className="form-group">
                <label htmlFor="phone" className="block mb-2 text-sm font-medium">
                  Phone (Optional)
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  className="block w-full px-4 py-2 border border-gray-300 rounded focus:ring-primary focus:border-primary"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>

              {/* Password */}
              <div className="form-group">
                <label htmlFor="password" className="block mb-2 text-sm font-medium">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  className="block w-full px-4 py-2 border border-gray-300 rounded focus:ring-primary focus:border-primary"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={isLoading}
                  required
                  minLength={8}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Password must be at least 8 characters long
                </p>
              </div>

              {/* Confirm Password */}
              <div className="form-group">
                <label htmlFor="confirm_password" className="block mb-2 text-sm font-medium">
                  Confirm Password
                </label>
                <input
                  type="password"
                  id="confirm_password"
                  name="confirm_password"
                  className="block w-full px-4 py-2 border border-gray-300 rounded focus:ring-primary focus:border-primary"
                  value={formData.confirm_password}
                  onChange={handleChange}
                  disabled={isLoading}
                  required
                />
              </div>

              {/* Privacy Policy */}
              <div className="form-check">
                <input
                  type="checkbox"
                  id="privacy_policy"
                  className="mr-2"
                  required
                />
                <label htmlFor="privacy_policy" className="text-sm">
                  I agree to the{' '}
                  <Link href="/privacy-policy">
                    <a className="text-primary hover:underline">Privacy Policy</a>
                  </Link>{' '}
                  and{' '}
                  <Link href="/terms-of-service">
                    <a className="text-primary hover:underline">Terms of Service</a>
                  </Link>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="btn btn-primary w-full py-2"
                disabled={isLoading}
              >
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </button>

              {/* Login Link */}
              <div className="text-center mt-4">
                <p className="text-gray-600">
                  Already have an account?{' '}
                  <Link
                    href={
                      redirect ? `/login?redirect=${encodeURIComponent(redirect)}` : '/login'
                    }
                  >
                    <a className="text-primary hover:underline">Log in here</a>
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Register;