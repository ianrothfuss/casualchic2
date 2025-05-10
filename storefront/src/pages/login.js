import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import Layout from '../components/Layout';
import { useAuth } from '../hooks/useAuth';

const Login = () => {
  const router = useRouter();
  const { login, isLoading, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');

  // Get redirect path from query params or default to '/account'
  const { redirect } = router.query;
  const redirectPath = redirect || '/account';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    // Validate form
    if (!email || !password) {
      setFormError('Email and password are required');
      return;
    }

    try {
      // Attempt login
      await login(email, password, redirectPath);
    } catch (err) {
      // Display user-friendly error message
      setFormError(
        err.message || 'Login failed. Please check your credentials and try again.'
      );
    }
  };

  return (
    <Layout title="Login | Casual Chic Boutique">
      <Head>
        <title>Login | Casual Chic Boutique</title>
      </Head>

      <div className="auth-page py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
            <h1 className="text-2xl font-serif font-bold text-center mb-6">Login</h1>

            {/* Form errors */}
            {(formError || error) && (
              <div className="error-alert bg-red-50 text-red-500 p-4 mb-6 rounded">
                {formError || error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div className="form-group">
                <label htmlFor="email" className="block mb-2 text-sm font-medium">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  className="block w-full px-4 py-2 border border-gray-300 rounded focus:ring-primary focus:border-primary"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  required
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
                  className="block w-full px-4 py-2 border border-gray-300 rounded focus:ring-primary focus:border-primary"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>

              {/* Forgot Password Link */}
              <div className="flex justify-end">
                <Link href="/forgot-password">
                  <a className="text-sm text-primary hover:underline">
                    Forgot your password?
                  </a>
                </Link>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="btn btn-primary w-full py-2"
                disabled={isLoading}
              >
                {isLoading ? 'Logging in...' : 'Log In'}
              </button>

              {/* Register Link */}
              <div className="text-center mt-4">
                <p className="text-gray-600">
                  Don't have an account?{' '}
                  <Link
                    href={
                      redirect ? `/register?redirect=${encodeURIComponent(redirect)}` : '/register'
                    }
                  >
                    <a className="text-primary hover:underline">Register here</a>
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

export default Login;