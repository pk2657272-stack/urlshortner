'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { AuthProvider } from '@/hooks/useAuth';
import Navbar from '@/components/Navbar';
import LoadingSpinner from '@/components/LoadingSpinner';
import api from '@/utils/api';
import { toast, Toaster } from 'react-hot-toast';
import { Link as LinkIcon, Copy, ExternalLink } from 'lucide-react';

function HomePage() {
  const { isAuthenticated, loading } = useAuth();
  const [longUrl, setLongUrl] = useState('');
  const [shortUrl, setShortUrl] = useState('');
  const [isShortening, setIsShortening] = useState(false);

  const handleShorten = async (e) => {
    e.preventDefault();
    
    if (!longUrl.trim()) {
      toast.error('Please enter a URL to shorten');
      return;
    }

    if (!isAuthenticated) {
      toast.error('Please login to shorten URLs');
      return;
    }

    setIsShortening(true);

    try {
      const response = await api.post('/api/shorten', { longUrl: longUrl.trim() });
      setShortUrl(response.data.shortUrl);
      toast.success('URL shortened successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to shorten URL');
    } finally {
      setIsShortening(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shortUrl);
      toast.success('Copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navbar />
      <Toaster position="top-right" />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <LinkIcon className="h-16 w-16 text-blue-600" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Shorten Your Links
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Transform long URLs into short, manageable links with detailed analytics 
            and user management features.
          </p>
        </div>

        {/* URL Shortener Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <form onSubmit={handleShorten} className="space-y-6">
            <div>
              <label htmlFor="longUrl" className="block text-sm font-medium text-gray-700 mb-2">
                Enter your long URL
              </label>
              <div className="relative">
                <input
                  type="url"
                  id="longUrl"
                  value={longUrl}
                  onChange={(e) => setLongUrl(e.target.value)}
                  placeholder="https://example.com/very-long-url-here"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-700"
                  required
                />
                <ExternalLink className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isShortening || !isAuthenticated}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
            >
              {isShortening ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span>Shortening...</span>
                </>
              ) : (
                <>
                  <LinkIcon className="h-5 w-5" />
                  <span>{isAuthenticated ? 'Shorten URL' : 'Login to Shorten'}</span>
                </>
              )}
            </button>

            {!isAuthenticated && (
              <div className="text-center">
                <p className="text-gray-600">
                  Need an account?{' '}
                  <a href="/register" className="text-blue-600 hover:text-blue-700 font-semibold">
                    Sign up for free
                  </a>
                </p>
              </div>
            )}
          </form>
        </div>

        {/* Shortened URL Result */}
        {shortUrl && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-8 mb-8">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-green-800 mb-4">
                Your shortened URL is ready!
              </h3>
              <div className="bg-white rounded-lg p-4 border border-green-200 flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-600 mb-1">Short URL:</p>
                  <p className="font-mono text-blue-600 break-all">{shortUrl}</p>
                </div>
                <button
                  onClick={copyToClipboard}
                  className="ml-4 bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors flex-shrink-0"
                  title="Copy to clipboard"
                >
                  <Copy className="h-5 w-5" />
                </button>
              </div>
              <div className="mt-4">
                <a
                  href="/my-urls"
                  className="text-blue-600 hover:text-blue-700 font-semibold"
                >
                  View all your URLs and analytics →
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-8 mt-12">
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <LinkIcon className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Easy Shortening</h3>
            <p className="text-gray-600">
              Quickly convert long URLs into short, shareable links with just one click.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Analytics</h3>
            <p className="text-gray-600">
              Track clicks, see referrers, and analyze your audience with detailed analytics.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <svg className="h-8 w-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Secure</h3>
            <p className="text-gray-600">
              Your URLs are protected with secure authentication and user management.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function Home() {
  return (
    <AuthProvider>
      <HomePage />
    </AuthProvider>
  );
}