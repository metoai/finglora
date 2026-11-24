'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  Sparkles,
  Mail,
  Activity,
  Plus,
  Trash2,
  RefreshCw,
  Search,
  ExternalLink,
  ChevronRight,
  LogOut,
  Send,
  Loader2,
  Database,
  ArrowUpRight,
  Layers,
  Heart,
  Sliders,
  DollarSign,
  Lock,
} from 'lucide-react';
import Link from 'next/link';

interface AdminStats {
  totalUsers: number;
  totalSets: number;
  curatedSets: number;
  customSets: number;
  totalTryOns: number;
  resend: {
    domain: string;
    status: string;
    sender: string;
  };
  categoryCounts: Record<string, number>;
  recentUsers: any[];
}

interface UserProfile {
  id: string;
  display_name: string;
  email: string | null;
  created_at: string;
  preferred_shape?: string;
  preferred_length?: string;
}

interface ManicureSet {
  id: string;
  title: string;
  category: string;
  photo_url: string;
  passport_code: string;
  is_curated: boolean;
  likes_count: number;
  created_at: string;
}

export default function AdminPortal() {
  const [token, setToken] = useState<string | null>(null);
  const [adminEmail, setAdminEmail] = useState<string>('');
  const [authKey, setAuthKey] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Active view tab
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'sets' | 'email' | 'system'>('overview');

  // Data states
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [sets, setSets] = useState<ManicureSet[]>([]);
  const [emailConfig, setEmailConfig] = useState<any>(null);
  const [systemInfo, setSystemInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // New set modal state
  const [isCreateSetOpen, setIsCreateSetOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('glazed');
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [newLikes, setNewLikes] = useState(150);
  const [isSubmittingSet, setIsSubmittingSet] = useState(false);

  // Email test modal
  const [testEmailAddress, setTestEmailAddress] = useState('');
  const [testEmailType, setTestEmailType] = useState<'welcome' | 'passport' | 'low-credits' | 'receipt'>('welcome');
  const [sendingTestEmail, setSendingTestEmail] = useState(false);
  const [emailSuccessMsg, setEmailSuccessMsg] = useState<string | null>(null);

  // Check stored auth on load
  useEffect(() => {
    const savedToken = localStorage.getItem('finglora_admin_token');
    const savedEmail = localStorage.getItem('finglora_admin_email');
    if (savedToken) {
      setToken(savedToken);
      if (savedEmail) setAdminEmail(savedEmail);
      fetchDashboardData(savedToken);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthenticating(true);
    setAuthError(null);

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: authKey, email: authEmail }),
      });

      const data = await res.json();
      if (!res.ok || !data.token) {
        throw new Error(data.error || 'Authentication failed');
      }

      setToken(data.token);
      setAdminEmail(data.email || authEmail || 'admin@finglora.com');
      localStorage.setItem('finglora_admin_token', data.token);
      localStorage.setItem('finglora_admin_email', data.email || authEmail || 'admin@finglora.com');
      fetchDashboardData(data.token);
    } catch (err: any) {
      setAuthError(err.message || 'Invalid key or unauthorized email');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('finglora_admin_token');
    localStorage.removeItem('finglora_admin_email');
    setToken(null);
    setStats(null);
  };

  const fetchDashboardData = async (authToken: string) => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${authToken}` };

      // Parallel fetch
      const [statsRes, usersRes, setsRes, emailRes, sysRes] = await Promise.all([
        fetch('/api/admin/stats', { headers }),
        fetch('/api/admin/users', { headers }),
        fetch('/api/admin/sets', { headers }),
        fetch('/api/admin/email', { headers }),
        fetch('/api/admin/system', { headers }),
      ]);

      if (statsRes.ok) {
        const s = await statsRes.json();
        setStats(s.stats);
      }
      if (usersRes.ok) {
        const u = await usersRes.json();
        setUsers(u.users || []);
      }
      if (setsRes.ok) {
        const st = await setsRes.json();
        setSets(st.sets || []);
      }
      if (emailRes.ok) {
        const em = await emailRes.json();
        setEmailConfig(em.emailConfig);
      }
      if (sysRes.ok) {
        const sy = await sysRes.json();
        setSystemInfo(sy.system);
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newPhotoUrl || !token) return;

    setIsSubmittingSet(true);
    try {
      const res = await fetch('/api/admin/sets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: newTitle,
          category: newCategory,
          photoUrl: newPhotoUrl,
          likesCount: newLikes,
          isCurated: true,
        }),
      });

      if (res.ok) {
        setIsCreateSetOpen(false);
        setNewTitle('');
        setNewPhotoUrl('');
        // Refresh sets
        const setsRes = await fetch('/api/admin/sets', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (setsRes.ok) {
          const s = await setsRes.json();
          setSets(s.sets || []);
        }
      }
    } catch (err) {
      console.error('Error creating set:', err);
    } finally {
      setIsSubmittingSet(false);
    }
  };

  const handleDeleteSet = async (id: string) => {
    if (!token) return;
    if (!confirm('Are you sure you want to remove this manicure set?')) return;

    try {
      const res = await fetch(`/api/admin/sets?id=${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setSets((prev) => prev.filter((s) => s.id !== id));
      }
    } catch (err) {
      console.error('Error deleting set:', err);
    }
  };

  const handleSendTestEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testEmailAddress || !testEmailAddress.includes('@')) return;

    setSendingTestEmail(true);
    setEmailSuccessMsg(null);

    try {
      let endpoint = '/api/email/welcome';
      let payload: any = { email: testEmailAddress, name: 'Admin Test' };

      if (testEmailType === 'passport') {
        endpoint = '/api/email/passport';
        payload = {
          email: testEmailAddress,
          passportCode: '#FGL-9999',
          designName: 'Admin Diagnostic Look',
          shape: 'almond',
          length: 'medium',
          colors: ['#FAF0EA', '#E0246A'],
        };
      } else if (testEmailType === 'low-credits') {
        endpoint = '/api/email/low-credits';
        payload = {
          email: testEmailAddress,
          name: 'Finglora Client',
          remainingCredits: 1,
        };
      } else if (testEmailType === 'receipt') {
        endpoint = '/api/email/receipt';
        payload = {
          email: testEmailAddress,
          name: 'Finglora Pro Member',
          planName: '6 Months Plan',
          amountPaid: '$29.00',
          period: 'Billed every 6 months',
        };
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setEmailSuccessMsg(`Email dispatched successfully! ID: ${data.id}`);
      } else {
        setEmailSuccessMsg(`Error: ${data.error || 'Failed to dispatch'}`);
      }
    } catch (err: any) {
      setEmailSuccessMsg(`Dispatch error: ${err.message}`);
    } finally {
      setSendingTestEmail(false);
    }
  };

  // Filtered sets
  const filteredSets = sets.filter((s) => {
    const matchesSearch = s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.passport_code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = categoryFilter === 'all' || s.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  // Filtered users
  const filteredUsers = users.filter((u) => {
    const nameMatch = (u.display_name || '').toLowerCase().includes(searchQuery.toLowerCase());
    const emailMatch = (u.email || '').toLowerCase().includes(searchQuery.toLowerCase());
    return nameMatch || emailMatch;
  });

  // If not logged in, render minimal login screen
  if (!token) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-white rounded-2xl border border-stone-200/80 p-7 shadow-sm space-y-6">
          <div className="text-center space-y-1">
            <span className="text-xs font-mono font-bold tracking-widest text-[#E0246A] uppercase">
              Finglora Command
            </span>
            <h1 className="font-serif text-2xl text-stone-900 font-normal">
              Admin Access
            </h1>
            <p className="text-xs text-stone-500">
              Sign in with your master key or authorized admin email.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Admin Email (Optional)
              </label>
              <input
                type="email"
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
                placeholder="metoaipr@gmail.com"
                className="w-full h-10 px-3 rounded-xl border border-stone-300 text-sm focus:outline-none focus:border-[#E0246A] focus:ring-1 focus:ring-[#E0246A]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Master Security Key
              </label>
              <input
                type="password"
                required
                value={authKey}
                onChange={(e) => setAuthKey(e.target.value)}
                placeholder="Enter admin security key"
                className="w-full h-10 px-3 rounded-xl border border-stone-300 text-sm focus:outline-none focus:border-[#E0246A] focus:ring-1 focus:ring-[#E0246A]"
              />
            </div>

            {authError && (
              <p className="text-xs text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-100">
                {authError}
              </p>
            )}

            <button
              type="submit"
              disabled={isAuthenticating}
              className="w-full h-11 rounded-xl bg-[#E0246A] hover:bg-[#BE185D] text-white text-xs font-semibold transition active:scale-95 shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isAuthenticating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5" />
                  Enter Admin Console
                </>
              )}
            </button>
          </form>

          <div className="pt-2 text-center">
            <Link
              href="/"
              className="text-xs text-stone-400 hover:text-stone-700 transition"
            >
              ← Back to Finglora Public Studio
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-stone-900 flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200/80 px-4 sm:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <span className="font-serif font-bold text-lg tracking-wider text-[#E0246A]">
              FINGLORA
            </span>
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 font-semibold border border-stone-200">
              Admin
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => token && fetchDashboardData(token)}
            disabled={loading}
            className="h-8.5 px-3 rounded-lg border border-stone-200 hover:bg-stone-50 text-xs font-semibold text-stone-700 inline-flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="h-8.5 px-3 rounded-lg bg-stone-100 hover:bg-stone-200 text-xs font-semibold text-stone-700 inline-flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Navigation Tabs (Mobile-Friendly Horizontal Scroll) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar border-b border-stone-200/80">
          {[
            { id: 'overview', label: 'Overview', icon: Activity },
            { id: 'users', label: 'Users', icon: Users, badge: users.length },
            { id: 'sets', label: 'Manicures', icon: Sparkles, badge: sets.length },
            { id: 'email', label: 'Email Center', icon: Mail },
            { id: 'system', label: 'Health & System', icon: Database },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveTab(tab.id as any);
                  setSearchQuery('');
                }}
                className={`h-9 px-3.5 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 shrink-0 transition cursor-pointer ${
                  active
                    ? 'bg-[#E0246A] text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span
                    className={`ml-1 text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      active ? 'bg-white/20 text-white' : 'bg-stone-200 text-stone-700'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && stats && (
          <div className="space-y-6">
            {/* Top Metric Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="bg-white rounded-2xl border border-stone-200/80 p-4 space-y-1 shadow-2xs">
                <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider block">
                  Total Users
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-serif text-stone-900 font-semibold">
                    {stats.totalUsers}
                  </span>
                  <span className="text-[11px] text-green-600 font-medium">Live Auth</span>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-stone-200/80 p-4 space-y-1 shadow-2xs">
                <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider block">
                  Curated Catalog
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-serif text-stone-900 font-semibold">
                    {stats.curatedSets}
                  </span>
                  <span className="text-[11px] text-[#E0246A] font-medium">Sets</span>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-stone-200/80 p-4 space-y-1 shadow-2xs">
                <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider block">
                  Custom User Looks
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-serif text-stone-900 font-semibold">
                    {stats.customSets}
                  </span>
                  <span className="text-[11px] text-purple-600 font-medium">Created</span>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-stone-200/80 p-4 space-y-1 shadow-2xs">
                <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider block">
                  Email Service
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-base sm:text-lg font-mono text-emerald-600 font-semibold">
                    Verified
                  </span>
                  <span className="text-[10px] text-stone-400 truncate max-w-[100px]">
                    {stats.resend.domain}
                  </span>
                </div>
              </div>
            </div>

            {/* Middle Section: Quick Actions & Category Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Category Breakdown */}
              <div className="bg-white rounded-2xl border border-stone-200/80 p-5 space-y-3 lg:col-span-2 shadow-2xs">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif text-base text-stone-900 font-semibold">
                    Manicure Style Categories
                  </h3>
                  <span className="text-xs text-stone-400">{sets.length} total looks</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
                  {Object.entries(stats.categoryCounts).map(([cat, count]) => (
                    <div
                      key={cat}
                      className="p-3 rounded-xl bg-stone-50 border border-stone-100 flex items-center justify-between"
                    >
                      <span className="text-xs font-medium text-stone-700 capitalize">
                        {cat}
                      </span>
                      <span className="text-xs font-mono font-bold text-[#E0246A] bg-white px-2 py-0.5 rounded-md border border-stone-200/60">
                        {count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pricing & Business Rule Card */}
              <div className="bg-white rounded-2xl border border-stone-200/80 p-5 space-y-3 shadow-2xs flex flex-col justify-between">
                <div>
                  <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider block mb-1">
                    Membership Tiers
                  </span>
                  <h3 className="font-serif text-base text-stone-900 font-semibold mb-3">
                    Active Pricing Rules
                  </h3>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1.5 border-b border-stone-100">
                      <span className="text-stone-600">Free Tier</span>
                      <span className="font-semibold text-stone-900">10 Try-On Credits</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-stone-100">
                      <span className="text-stone-600">Pro (Monthly)</span>
                      <span className="font-semibold text-stone-900">$7 / month</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-stone-100">
                      <span className="text-stone-600">Pro (6 Months)</span>
                      <span className="font-semibold text-[#E0246A]">$29 ($4.83/mo)</span>
                    </div>
                    <div className="flex justify-between py-1.5">
                      <span className="text-stone-600">Pro (Yearly)</span>
                      <span className="font-semibold text-stone-900">$49 ($4.08/mo)</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-stone-100">
                  <span className="text-[11px] text-stone-400">
                    Billed via Stripe / Apple Pay with instant unlimited unlock.
                  </span>
                </div>
              </div>
            </div>

            {/* Recent Registered Users */}
            <div className="bg-white rounded-2xl border border-stone-200/80 p-5 space-y-3 shadow-2xs">
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-base text-stone-900 font-semibold">
                  Recent Clients
                </h3>
                <button
                  type="button"
                  onClick={() => setActiveTab('users')}
                  className="text-xs font-semibold text-[#E0246A] hover:underline"
                >
                  View All ({users.length}) →
                </button>
              </div>

              <div className="divide-y divide-stone-100">
                {stats.recentUsers.map((u: any) => (
                  <div key={u.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div className="space-y-0.5">
                      <p className="font-semibold text-stone-800">
                        {u.display_name || 'Client'}
                      </p>
                      <p className="text-stone-400 font-mono text-[11px]">
                        {u.email || 'No email associated'}
                      </p>
                    </div>
                    <span className="text-[11px] text-stone-400">
                      {new Date(u.created_at).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: USERS */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="font-serif text-xl text-stone-900 font-normal">
                  Registered Clients ({users.length})
                </h2>
                <p className="text-xs text-stone-500">
                  Clients authenticated via Google OAuth or Email signup.
                </p>
              </div>

              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-stone-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search clients..."
                  className="w-full sm:w-64 h-9 pl-8 pr-3 rounded-xl border border-stone-200 bg-white text-xs focus:outline-none focus:border-[#E0246A]"
                />
              </div>
            </div>

            {/* Users Table / Mobile Cards */}
            <div className="bg-white rounded-2xl border border-stone-200/80 overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-50 border-b border-stone-100 text-stone-500 font-medium">
                    <tr>
                      <th className="py-3 px-4">Client</th>
                      <th className="py-3 px-4">Email</th>
                      <th className="py-3 px-4">Silhouette Preference</th>
                      <th className="py-3 px-4">Registered Date</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {filteredUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-stone-50/50">
                        <td className="py-3 px-4 font-semibold text-stone-900">
                          {u.display_name || 'Client'}
                        </td>
                        <td className="py-3 px-4 text-stone-600 font-mono text-[11px]">
                          {u.email || '—'}
                        </td>
                        <td className="py-3 px-4 capitalize text-stone-700">
                          {u.preferred_shape ? `${u.preferred_shape} (${u.preferred_length || 'med'})` : 'Default'}
                        </td>
                        <td className="py-3 px-4 text-stone-400">
                          {new Date(u.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => {
                              if (u.email) {
                                setTestEmailAddress(u.email);
                                setActiveTab('email');
                              }
                            }}
                            className="text-xs font-semibold text-[#E0246A] hover:underline cursor-pointer"
                          >
                            Send Email
                          </button>
                        </td>
                      </tr>
                    ))}
                    {filteredUsers.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-stone-400 text-xs">
                          No users matched your search.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: MANICURES & CATALOG */}
        {activeTab === 'sets' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="font-serif text-xl text-stone-900 font-normal">
                  Manicure Catalog ({sets.length})
                </h2>
                <p className="text-xs text-stone-500">
                  Manage featured designs, curated styles, and user creations.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateSetOpen(true)}
                  className="h-9 px-3.5 rounded-xl bg-[#E0246A] hover:bg-[#BE185D] text-white text-xs font-semibold inline-flex items-center gap-1.5 transition active:scale-95 shadow-xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Look</span>
                </button>
              </div>
            </div>

            {/* Filters Row */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-stone-200/80 shadow-2xs">
              <div className="relative w-full sm:w-72">
                <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-stone-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search sets by title or code..."
                  className="w-full h-9 pl-8 pr-3 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-[#E0246A]"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
                {['all', 'glazed', 'velvet', 'french', 'minimal', 'Custom'].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategoryFilter(cat)}
                    className={`h-8 px-3 rounded-lg text-xs font-medium capitalize shrink-0 transition cursor-pointer ${
                      categoryFilter === cat
                        ? 'bg-stone-900 text-white'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Sets Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5">
              {filteredSets.map((s) => (
                <div
                  key={s.id}
                  className="bg-white rounded-2xl border border-stone-200/80 overflow-hidden shadow-2xs flex flex-col justify-between group"
                >
                  <div className="relative aspect-[3/4] bg-stone-100 overflow-hidden">
                    {s.photo_url ? (
                      <img
                        src={s.photo_url}
                        alt={s.title}
                        className="w-full h-full object-cover group-hover:scale-102 transition duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-stone-400 text-xs">
                        No image
                      </div>
                    )}
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-xs text-white text-[10px] font-mono">
                      {s.passport_code}
                    </span>
                    {s.is_curated && (
                      <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-[#E0246A] text-white text-[10px] font-semibold">
                        Curated
                      </span>
                    )}
                  </div>

                  <div className="p-3 space-y-2">
                    <div>
                      <h4 className="font-semibold text-xs text-stone-900 truncate">
                        {s.title}
                      </h4>
                      <p className="text-[11px] text-stone-400 capitalize">
                        {s.category} • {s.likes_count} likes
                      </p>
                    </div>

                    <div className="pt-1 flex items-center justify-between border-t border-stone-100">
                      <Link
                        href="/"
                        target="_blank"
                        className="text-[11px] text-stone-500 hover:text-stone-900 inline-flex items-center gap-1"
                      >
                        Preview <ArrowUpRight className="w-3 h-3" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDeleteSet(s.id)}
                        className="text-stone-400 hover:text-red-600 transition p-1 cursor-pointer"
                        title="Delete look"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredSets.length === 0 && (
              <div className="bg-white rounded-2xl p-8 text-center text-stone-400 text-xs border border-stone-200">
                No manicures found matching your filters.
              </div>
            )}
          </div>
        )}

        {/* TAB 4: EMAIL CENTER */}
        {activeTab === 'email' && (
          <div className="space-y-6">
            <div>
              <h2 className="font-serif text-xl text-stone-900 font-normal">
                Email Dispatch & Deliverability
              </h2>
              <p className="text-xs text-stone-500">
                Manage transactional templates, verify sender configurations, and test live emails.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Test Email Dispatch Card */}
              <div className="bg-white rounded-2xl border border-stone-200/80 p-5 space-y-4 shadow-2xs">
                <h3 className="font-serif text-base text-stone-900 font-semibold">
                  Send Test Transactional Email
                </h3>

                <form onSubmit={handleSendTestEmail} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Recipient Address
                    </label>
                    <input
                      type="email"
                      required
                      value={testEmailAddress}
                      onChange={(e) => setTestEmailAddress(e.target.value)}
                      placeholder="metoaipr@gmail.com"
                      className="w-full h-10 px-3.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:border-[#E0246A]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Template Type
                    </label>
                    <select
                      value={testEmailType}
                      onChange={(e) => setTestEmailType(e.target.value as any)}
                      className="w-full h-10 px-3 rounded-xl border border-stone-300 text-xs focus:outline-none focus:border-[#E0246A]"
                    >
                      <option value="welcome">Welcome Email (10 Free Credits)</option>
                      <option value="passport">Salon Recipe / Nail Tech Sheet</option>
                      <option value="low-credits">Low Credits Alert (1 Remaining)</option>
                      <option value="receipt">Pro Subscription Receipt ($29 / 6mo)</option>
                    </select>
                  </div>

                  {emailSuccessMsg && (
                    <p className="text-xs p-2.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-800 font-mono">
                      {emailSuccessMsg}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={sendingTestEmail}
                    className="w-full h-10 rounded-xl bg-[#E0246A] hover:bg-[#BE185D] text-white text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition active:scale-95 shadow-xs cursor-pointer disabled:opacity-50"
                  >
                    {sendingTestEmail ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Dispatching via Resend...
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        Send Test Email
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Email Configuration Details */}
              <div className="bg-white rounded-2xl border border-stone-200/80 p-5 space-y-4 shadow-2xs flex flex-col justify-between">
                <div>
                  <h3 className="font-serif text-base text-stone-900 font-semibold mb-3">
                    Active Email Infrastructure
                  </h3>

                  <div className="space-y-2.5 text-xs">
                    <div className="p-3 rounded-xl bg-stone-50 border border-stone-100 flex justify-between items-center">
                      <span className="text-stone-600 font-medium">Default Sender</span>
                      <span className="font-mono text-stone-900 font-semibold text-[11px]">
                        {emailConfig?.currentFromEmail || 'Finglora <onboarding@resend.dev>'}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-stone-50 border border-stone-100 flex justify-between items-center">
                      <span className="text-stone-600 font-medium">Resend Status</span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-semibold text-[10px]">
                        Connected & Live
                      </span>
                    </div>

                    {emailConfig?.domains?.map((d: any) => (
                      <div
                        key={d.id}
                        className="p-3 rounded-xl bg-stone-50 border border-stone-100 flex justify-between items-center"
                      >
                        <div>
                          <span className="font-semibold text-stone-900 block">{d.name}</span>
                          <span className="text-[10px] text-stone-400">Region: {d.region}</span>
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-semibold text-[10px] capitalize">
                          {d.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-stone-100 text-[11px] text-stone-400">
                  Deliverability tips: Sandbox mode delivers to registered Resend account owner (`metoaipr@gmail.com`). Add DNS records for custom domains to send to any third-party recipient.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: SYSTEM HEALTH */}
        {activeTab === 'system' && systemInfo && (
          <div className="space-y-4">
            <div>
              <h2 className="font-serif text-xl text-stone-900 font-normal">
                System Diagnostics & Endpoints
              </h2>
              <p className="text-xs text-stone-500">
                Live health indicators for AI vision models, database connectivity, and environment keys.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-white rounded-2xl border border-stone-200/80 p-5 space-y-2 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-stone-700">Supabase DB</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                </div>
                <p className="font-serif text-lg text-stone-900 font-medium">
                  {systemInfo.services.supabaseDb.status}
                </p>
                <p className="text-[11px] text-stone-400 font-mono truncate">
                  {systemInfo.services.supabaseDb.url}
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-stone-200/80 p-5 space-y-2 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-stone-700">Google Gemini Vision</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                </div>
                <p className="font-serif text-lg text-stone-900 font-medium">
                  Configured
                </p>
                <p className="text-[11px] text-stone-400">
                  {systemInfo.services.geminiVision.model}
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-stone-200/80 p-5 space-y-2 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-stone-700">Environment</span>
                  <span className="text-[10px] font-mono uppercase bg-stone-100 px-2 py-0.5 rounded text-stone-600 font-semibold">
                    {systemInfo.nodeEnv}
                  </span>
                </div>
                <p className="font-serif text-lg text-stone-900 font-medium">
                  Next.js App Router
                </p>
                <p className="text-[11px] text-stone-400">
                  Timestamp: {new Date(systemInfo.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CREATE SET MODAL */}
      {isCreateSetOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-stone-200 max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-lg text-stone-900 font-semibold">
                Add Curated Manicure
              </h3>
              <button
                type="button"
                onClick={() => setIsCreateSetOpen(false)}
                className="text-stone-400 hover:text-stone-700 p-1 font-semibold text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSet} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Design Title
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Vanilla Glazed Chrome French"
                  className="w-full h-10 px-3 rounded-xl border border-stone-300 text-xs focus:outline-none focus:border-[#E0246A]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Style Category
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-stone-300 text-xs focus:outline-none focus:border-[#E0246A]"
                >
                  <option value="glazed">Glazed</option>
                  <option value="velvet">Velvet</option>
                  <option value="french">French</option>
                  <option value="minimal">Minimal</option>
                  <option value="cat-eye">Cat Eye</option>
                  <option value="cherry-mocha">Cherry Mocha</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  High-Resolution Photo URL
                </label>
                <input
                  type="url"
                  required
                  value={newPhotoUrl}
                  onChange={(e) => setNewPhotoUrl(e.target.value)}
                  placeholder="https://xwfazcaxniogiyyaovau.supabase.co/..."
                  className="w-full h-10 px-3 rounded-xl border border-stone-300 text-xs focus:outline-none focus:border-[#E0246A]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Initial Likes Count
                </label>
                <input
                  type="number"
                  value={newLikes}
                  onChange={(e) => setNewLikes(parseInt(e.target.value, 10) || 150)}
                  className="w-full h-10 px-3 rounded-xl border border-stone-300 text-xs focus:outline-none focus:border-[#E0246A]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateSetOpen(false)}
                  className="h-10 px-4 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingSet}
                  className="h-10 px-5 rounded-xl bg-[#E0246A] hover:bg-[#BE185D] text-white text-xs font-semibold inline-flex items-center gap-1.5 shadow-xs disabled:opacity-50"
                >
                  {isSubmittingSet ? 'Saving...' : 'Add to Catalog'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
