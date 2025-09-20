'use client';

import { useState, useEffect } from 'react';
import { useAuth, AuthProvider } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import LoadingSpinner from '@/components/LoadingSpinner';
import api from '@/utils/api';
import { toast, Toaster } from 'react-hot-toast';
import { 
  Copy, 
  ExternalLink, 
  Trash2, 
  BarChart3, 
  Calendar,
  Globe,
  Monitor,
  Smartphone,
  Eye,
  TrendingUp
} from 'lucide-react';

function MyURLsPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [urls, setUrls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUrl, setSelectedUrl] = useState(null);
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchUrls();
    }
  }, [isAuthenticated]);

  const fetchUrls = async () => {
    try {
      const response = await api.get('/api/user/urls');
      setUrls(response.data.urls);
    } catch (error) {
      toast.error('Failed to fetch URLs');
      console.error('Error fetching URLs:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (url) => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const deleteUrl = async (shortId) => {
    if (!confirm('Are you sure you want to delete this URL?')) {
      return;
    }

    try {
      await api.delete(`/api/${shortId}`);
      setUrls(urls.filter(url => url.shortId !== shortId));
      toast.success('URL deleted successfully');
    } catch (error) {
      toast.error('Failed to delete URL');
      console.error('Error deleting URL:', error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getAnalyticsSummary = (analytics) => {
    const browsers = {};
    const devices = {};
    const referrers = {};

    analytics.forEach(click => {
      browsers[click.browser] = (browsers[click.browser] || 0) + 1;
      devices[click.device] = (devices[click.device] || 0) + 1;
      referrers[click.referrer] = (referrers[click.referrer] || 0) + 1;
    });

    return { browsers, devices, referrers };
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navbar />
      <Toaster position="top-right" />
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <BarChart3 className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">My URLs</h1>
          </div>
          <p className="text-gray-600">Manage your shortened URLs and view analytics</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : urls.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No URLs yet</h3>
            <p className="text-gray-600 mb-6">
              Start by shortening your first URL to see it appear here with analytics
            </p>
            <a
              href="/"
              className="inline-flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <ExternalLink className="h-5 w-5" />
              <span>Create Short URL</span>
            </a>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* URLs List */}
            <div className="lg:col-span-2 space-y-4">
              {urls.map((url) => (
                <div key={url.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                  {/* URL Info */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 mb-1 truncate" title={url.longUrl}>
                        {url.longUrl}
                      </h3>
                      <div className="flex items-center space-x-2 mb-2">
                        <code className="bg-blue-50 text-blue-600 px-2 py-1 rounded text-sm font-mono">
                          {url.shortUrl}
                        </code>
                        <button
                          onClick={() => copyToClipboard(url.shortUrl)}
                          className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                          title="Copy URL"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                        <a
                          href={url.shortUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                          title="Open URL"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </div>
                      <div className="flex items-center text-sm text-gray-500 space-x-4">
                        <span className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(url.createdAt)}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Eye className="h-4 w-4" />
                          <span>{url.clicks} clicks</span>
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => setSelectedUrl(selectedUrl?.id === url.id ? null : url)}
                        className="bg-blue-50 text-blue-600 p-2 rounded-lg hover:bg-blue-100 transition-colors"
                        title="View analytics"
                      >
                        <TrendingUp className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => deleteUrl(url.shortId)}
                        className="bg-red-50 text-red-600 p-2 rounded-lg hover:bg-red-100 transition-colors"
                        title="Delete URL"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  {url.clicks > 0 && (
                    <div className="border-t pt-4">
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <p className="text-2xl font-bold text-blue-600">{url.clicks}</p>
                          <p className="text-xs text-gray-500">Total Clicks</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-green-600">
                            {new Set(url.analytics.map(a => a.referrer)).size}
                          </p>
                          <p className="text-xs text-gray-500">Referrers</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-purple-600">
                            {new Set(url.analytics.map(a => a.device)).size}
                          </p>
                          <p className="text-xs text-gray-500">Device Types</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Analytics Panel */}
            <div className="lg:col-span-1">
              {selectedUrl ? (
                <div className="bg-white rounded-xl shadow-lg p-6 sticky top-4">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                    <span>Analytics</span>
                  </h3>
                  
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm font-mono text-gray-600 truncate" title={selectedUrl.longUrl}>
                      {selectedUrl.longUrl}
                    </p>
                  </div>

                  {selectedUrl.clicks === 0 ? (
                    <p className="text-gray-500 text-center py-8">
                      No clicks yet. Share your link to start collecting data!
                    </p>
                  ) : (
                    <div className="space-y-6">
                      {/* Overview */}
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Overview</h4>
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <p className="text-2xl font-bold text-blue-600">{selectedUrl.clicks}</p>
                          <p className="text-sm text-blue-600">Total Clicks</p>
                        </div>
                      </div>

                      {(() => {
                        const { browsers, devices, referrers } = getAnalyticsSummary(selectedUrl.analytics);
                        
                        return (
                          <>
                            {/* Top Browsers */}
                            <div>
                              <h4 className="font-medium text-gray-900 mb-2 flex items-center space-x-1">
                                <Monitor className="h-4 w-4" />
                                <span>Top Browsers</span>
                              </h4>
                              <div className="space-y-2">
                                {Object.entries(browsers).slice(0, 3).map(([browser, count]) => (
                                  <div key={browser} className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">{browser}</span>
                                    <span className="text-sm font-semibold text-gray-900">{count}</span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Device Types */}
                            <div>
                              <h4 className="font-medium text-gray-900 mb-2 flex items-center space-x-1">
                                <Smartphone className="h-4 w-4" />
                                <span>Device Types</span>
                              </h4>
                              <div className="space-y-2">
                                {Object.entries(devices).map(([device, count]) => (
                                  <div key={device} className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">{device}</span>
                                    <span className="text-sm font-semibold text-gray-900">{count}</span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Top Referrers */}
                            <div>
                              <h4 className="font-medium text-gray-900 mb-2 flex items-center space-x-1">
                                <Globe className="h-4 w-4" />
                                <span>Top Referrers</span>
                              </h4>
                              <div className="space-y-2">
                                {Object.entries(referrers).slice(0, 3).map(([referrer, count]) => (
                                  <div key={referrer} className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600 truncate" title={referrer}>
                                      {referrer === 'Direct' ? 'Direct' : new URL(referrer).hostname}
                                    </span>
                                    <span className="text-sm font-semibold text-gray-900">{count}</span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Recent Clicks */}
                            <div>
                              <h4 className="font-medium text-gray-900 mb-2">Recent Clicks</h4>
                              <div className="space-y-2 max-h-32 overflow-y-auto">
                                {selectedUrl.analytics.slice(0, 5).reverse().map((click, index) => (
                                  <div key={index} className="text-xs text-gray-500 border-b pb-1">
                                    <div>{formatDate(click.timestamp)}</div>
                                    <div className="flex justify-between">
                                      <span>{click.browser} • {click.device}</span>
                                      <span>{click.referrer === 'Direct' ? 'Direct' : 'Referral'}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                  <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="font-medium text-gray-900 mb-2">Select a URL</h3>
                  <p className="text-gray-500 text-sm">
                    Click on the analytics button next to any URL to view detailed statistics
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function MyURLs() {
  return (
    <AuthProvider>
      <MyURLsPage />
    </AuthProvider>
  );
}