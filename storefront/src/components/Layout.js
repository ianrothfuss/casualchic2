import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import DrawerCart from './DrawerCart';

const Layout = ({ children, title = 'Casual Chic Boutique' }) => {
  const router = useRouter();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Toggle cart drawer
  const toggleCart = () => {
    setIsCartOpen(!isCartOpen);
  };

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Navigation links
  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Shop', path: '/products' },
    { name: 'Outfits', path: '/outfits' },
    { name: 'Virtual Try-On', path: '/virtual-try-on' },
    { name: 'Style Quiz', path: '/style-quiz' },
    { name: 'Blog', path: '/blog' },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Head>
        <title>{title}</title>
        <meta charSet="utf-8" />
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>

      {/* Header */}
      <header className="header sticky top-0 bg-white shadow-sm z-10">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="logo">
              <Link href="/">
                <a className="font-serif text-xl font-bold text-primary">
                  Casual Chic
                </a>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-6">
              {navLinks.map((link) => (
                <Link key={link.path} href={link.path}>
                  <a
                    className={`nav-link ${
                      router.pathname === link.path ? 'active' : ''
                    }`}
                  >
                    {link.name}
                  </a>
                </Link>
              ))}
            </nav>

            {/* Header Actions */}
            <div className="flex items-center space-x-4">
              {/* Search Button */}
              <button
                className="header-action-btn"
                aria-label="Search"
                onClick={() => router.push('/search')}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </button>

              {/* Account Button */}
              <button
                className="header-action-btn"
                aria-label="Account"
                onClick={() => router.push('/account')}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </button>

              {/* Wishlist Button */}
              <button
                className="header-action-btn"
                aria-label="Wishlist"
                onClick={() => router.push('/wishlist')}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              </button>

              {/* Cart Button */}
              <button
                className="header-action-btn cart-btn flex items-center"
                aria-label="Cart"
                onClick={toggleCart}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  />
                </svg>
                <span className="cart-count ml-1">0</span>
              </button>

              {/* Mobile Menu Button */}
              <button
                className="header-action-btn md:hidden"
                aria-label="Menu"
                onClick={toggleMobileMenu}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={`mobile-menu md:hidden ${
            isMobileMenuOpen ? 'open' : 'hidden'
          }`}
        >
          <div className="container mx-auto px-4 py-4 border-t">
            {navLinks.map((link) => (
              <Link key={link.path} href={link.path}>
                <a
                  className={`block py-2 ${
                    router.pathname === link.path
                      ? 'text-primary font-medium'
                      : ''
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.name}
                </a>
              </Link>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow">{children}</main>

      {/* Footer */}
      <footer className="footer bg-dark text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* About Column */}
            <div className="footer-column">
              <h3 className="footer-title text-lg font-medium mb-4">
                About Casual Chic
              </h3>
              <p className="mb-4 text-sm text-gray-300">
                Casual Chic Boutique offers the latest fashion trends with
                innovative shopping features for a personalized experience.
              </p>
              <div className="social-links flex space-x-3">
                <a href="#" className="social-link" aria-label="Facebook">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
                  </svg>
                </a>
                <a href="#" className="social-link" aria-label="Instagram">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>
                <a href="#" className="social-link" aria-label="Twitter">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                  </svg>
                </a>
                <a href="#" className="social-link" aria-label="Pinterest">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 0c-6.627 0-12 5.372-12 12 0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146 1.124.347 2.317.535 3.554.535 6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Shop Links */}
            <div className="footer-column">
              <h3 className="footer-title text-lg font-medium mb-4">Shop</h3>
              <ul className="footer-links space-y-2">
                <li>
                  <Link href="/categories/new-arrivals">
                    <a className="footer-link">New Arrivals</a>
                  </Link>
                </li>
                <li>
                  <Link href="/categories/bestsellers">
                    <a className="footer-link">Bestsellers</a>
                  </Link>
                </li>
                <li>
                  <Link href="/categories/tops">
                    <a className="footer-link">Tops</a>
                  </Link>
                </li>
                <li>
                  <Link href="/categories/bottoms">
                    <a className="footer-link">Bottoms</a>
                  </Link>
                </li>
                <li>
                  <Link href="/categories/dresses">
                    <a className="footer-link">Dresses</a>
                  </Link>
                </li>
                <li>
                  <Link href="/categories/accessories">
                    <a className="footer-link">Accessories</a>
                  </Link>
                </li>
              </ul>
            </div>

            {/* Help Links */}
            <div className="footer-column">
              <h3 className="footer-title text-lg font-medium mb-4">Help</h3>
              <ul className="footer-links space-y-2">
                <li>
                  <Link href="/customer-service">
                    <a className="footer-link">Customer Service</a>
                  </Link>
                </li>
                <li>
                  <Link href="/shipping">
                    <a className="footer-link">Shipping & Returns</a>
                  </Link>
                </li>
                <li>
                  <Link href="/size-guide">
                    <a className="footer-link">Size Guide</a>
                  </Link>
                </li>
                <li>
                  <Link href="/faq">
                    <a className="footer-link">FAQ</a>
                  </Link>
                </li>
                <li>
                  <Link href="/contact">
                    <a className="footer-link">Contact Us</a>
                  </Link>
                </li>
              </ul>
            </div>

            {/* Company Links */}
            <div className="footer-column">
              <h3 className="footer-title text-lg font-medium mb-4">Company</h3>
              <ul className="footer-links space-y-2">
                <li>
                  <Link href="/about">
                    <a className="footer-link">About Us</a>
                  </Link>
                </li>
                <li>
                  <Link href="/careers">
                    <a className="footer-link">Careers</a>
                  </Link>
                </li>
                <li>
                  <Link href="/sustainability">
                    <a className="footer-link">Sustainability</a>
                  </Link>
                </li>
                <li>
                  <Link href="/privacy-policy">
                    <a className="footer-link">Privacy Policy</a>
                  </Link>
                </li>
                <li>
                  <Link href="/terms-of-service">
                    <a className="footer-link">Terms of Service</a>
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; {new Date().getFullYear()} Casual Chic Boutique. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Cart Drawer */}
      <DrawerCart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  );
};

export default Layout;