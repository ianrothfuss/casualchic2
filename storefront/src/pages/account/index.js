import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import Layout from '../../components/Layout';
import { useAuth } from '../../hooks/useAuth';
import * as api from '../../services/api';

const Account = () => {
  const router = useRouter();
  const { user, isLoading: authLoading, logout, isAuthenticated } = useAuth();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login?redirect=/account');
    }
  }, [authLoading, isAuthenticated, router]);

  // Fetch user orders
  useEffect(() => {
    const fetchOrders = async () => {
      if (!isAuthenticated) return;

      try {
        setIsLoading(true);
        const userOrders = await api.getOrders();
        setOrders(userOrders);
        setError(null);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('Failed to load orders');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [isAuthenticated]);

  // Handle logout
  const handleLogout = () => {
    logout();
  };

  // If authentication is loading, show loading indicator
  if (authLoading) {
    return (
      <Layout title="My Account | Casual Chic Boutique">
        <div className="container mx-auto px-4 py-12">
          <div className="flex justify-center items-center h-64">
            <div className="loading">Loading...</div>
          </div>
        </div>
      </Layout>
    );
  }

  // If not authenticated, don't render anything (redirect will happen)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <Layout title="My Account | Casual Chic Boutique">
      <Head>
        <title>My Account | Casual Chic Boutique</title>
      </Head>

      <div className="account-page py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-serif font-bold mb-8">My Account</h1>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Sidebar */}
            <div className="account-sidebar md:col-span-1">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="user-info mb-6">
                  <h2 className="text-xl font-medium mb-2">
                    {user.first_name} {user.last_name}
                  </h2>
                  <p className="text-gray-600">{user.email}</p>
                </div>

                <nav className="account-nav">
                  <ul className="space-y-2">
                    <li>
                      <Link href="/account">
                        <a className="block py-2 px-3 bg-primary text-white rounded">Dashboard</a>
                      </Link>
                    </li>
                    <li>
                      <Link href="/account/orders">
                        <a className="block py-2 px-3 hover:bg-gray-100 rounded">Orders</a>
                      </Link>
                    </li>
                    <li>
                      <Link href="/account/measurements">
                        <a className="block py-2 px-3 hover:bg-gray-100 rounded">My Measurements</a>
                      </Link>
                    </li>
                    <li>
                      <Link href="/account/style-profile">
                        <a className="block py-2 px-3 hover:bg-gray-100 rounded">Style Profile</a>
                      </Link>
                    </li>
                    <li>
                      <Link href="/account/virtual-try-on">
                        <a className="block py-2 px-3 hover:bg-gray-100 rounded">
                          Virtual Try-On History
                        </a>
                      </Link>
                    </li>
                    <li>
                      <Link href="/account/wishlist">
                        <a className="block py-2 px-3 hover:bg-gray-100 rounded">Wishlist</a>
                      </Link>
                    </li>
                    <li>
                      <Link href="/account/settings">
                        <a className="block py-2 px-3 hover:bg-gray-100 rounded">Account Settings</a>
                      </Link>
                    </li>
                    <li>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left py-2 px-3 hover:bg-gray-100 rounded text-red-500"
                      >
                        Logout
                      </button>
                    </li>
                  </ul>
                </nav>
              </div>
            </div>

            {/* Main Content */}
            <div className="account-content md:col-span-2">
              {/* Account Overview */}
              <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                <h2 className="text-xl font-medium mb-4">Account Overview</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="overview-card p-4 border rounded">
                    <h3 className="text-lg font-medium mb-2">Personal Information</h3>
                    <p>
                      <strong>Name:</strong> {user.first_name} {user.last_name}
                    </p>
                    <p>
                      <strong>Email:</strong> {user.email}
                    </p>
                    <p>
                      <strong>Phone:</strong> {user.phone || 'Not provided'}
                    </p>
                    <div className="mt-3">
                      <Link href="/account/settings">
                        <a className="text-primary hover:underline">Edit</a>
                      </Link>
                    </div>
                  </div>
                  <div className="overview-card p-4 border rounded">
                    <h3 className="text-lg font-medium mb-2">Shipping Address</h3>
                    {user.shipping_addresses && user.shipping_addresses.length > 0 ? (
                      <div>
                        <p>{user.shipping_addresses[0].address_1}</p>
                        {user.shipping_addresses[0].address_2 && (
                          <p>{user.shipping_addresses[0].address_2}</p>
                        )}
                        <p>
                          {user.shipping_addresses[0].city}, {user.shipping_addresses[0].province}{' '}
                          {user.shipping_addresses[0].postal_code}
                        </p>
                        <p>{user.shipping_addresses[0].country_code}</p>
                      </div>
                    ) : (
                      <p>No shipping address provided</p>
                    )}
                    <div className="mt-3">
                      <Link href="/account/settings">
                        <a className="text-primary hover:underline">Edit</a>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Orders */}
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-medium mb-4">Recent Orders</h2>
                
                {isLoading ? (
                  <div className="loading">Loading orders...</div>
                ) : error ? (
                  <div className="error text-red-500">{error}</div>
                ) : orders.length === 0 ? (
                  <div className="empty-state text-center py-8">
                    <p className="text-gray-500 mb-4">You haven't placed any orders yet</p>
                    <Link href="/products">
                      <a className="btn btn-primary">Start Shopping</a>
                    </Link>
                  </div>
                ) : (
                  <div className="orders-list">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="py-2 px-4 text-left">Order ID</th>
                            <th className="py-2 px-4 text-left">Date</th>
                            <th className="py-2 px-4 text-left">Status</th>
                            <th className="py-2 px-4 text-left">Total</th>
                            <th className="py-2 px-4 text-left">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {orders.slice(0, 5).map((order) => (
                            <tr key={order.id} className="border-b">
                              <td className="py-3 px-4">{order.display_id}</td>
                              <td className="py-3 px-4">
                                {new Date(order.created_at).toLocaleDateString()}
                              </td>
                              <td className="py-3 px-4">
                                <span className="order-status">{order.status}</span>
                              </td>
                              <td className="py-3 px-4">${(order.total / 100).toFixed(2)}</td>
                              <td className="py-3 px-4">
                                <Link href={`/account/orders/${order.id}`}>
                                  <a className="text-primary hover:underline">View</a>
                                </Link>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    
                    {orders.length > 5 && (
                      <div className="text-center mt-4">
                        <Link href="/account/orders">
                          <a className="text-primary hover:underline">View All Orders</a>
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Account;