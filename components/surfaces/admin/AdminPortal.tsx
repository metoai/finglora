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
  UserCheck,
  CreditCard,
  Camera,
  CheckCircle2,
  Calendar,
  X,
  Crown,
  Edit3,
  Save,
  Check,
} from 'lucide-react';
import Link from 'next/link';
import { NailCanvasPreview } from '@/components/visuals/NailCanvasPreview';
import { Finger } from '@/types/nail';

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
  avatar_url?: string | null;
  custom_hand_url?: string | null;
  hand_orientation?: string;
  skin_tone_id?: string;
  created_at: string;
  updated_at?: string;
  preferred_shape?: string;
  preferred_length?: string;
  is_pro?: boolean;
  credits?: number;
  setsCount?: number;
  sets?: any[];
  tryOnsCount?: number;
  tryOns?: any[];
  favoritesCount?: number;
  favorites?: any[];
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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
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

  // Selected user for full detail modal/drawer
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [loadingUserDetail, setLoadingUserDetail] = useState(false);
  const [isEditingUser, setIsEditingUser] = useState(false);
  const [editCredits, setEditCredits] = useState<number>(10);
  const [editIsPro, setEditIsPro] = useState<boolean>(false);
  const [isSavingUser, setIsSavingUser] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

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

  // Check server-verified httpOnly admin session on load
  useEffect(() => {
    try {
      localStorage.removeItem('finglora_admin_token');
      localStorage.removeItem('finglora_admin_email');
    } catch {}

    let mounted = true;
    fetch('/api/admin/auth')
      .then(async (res) => {
        if (!mounted) return;
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated) {
            setIsAuthenticated(true);
            if (data.email) setAdminEmail(data.email);
            fetchDashboardData();
          }
        }
      })
      .catch(() => {})
      .finally(() => {
        if (mounted) setCheckingAuth(false);
      });

    return () => {
      mounted = false;
    };
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
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Authentication failed');
      }

      setIsAuthenticated(true);
      setAdminEmail(data.email || authEmail || 'admin@finglora.com');
      setAuthKey('');
      fetchDashboardData();
    } catch (err: any) {
      setAuthError(err.message || 'Invalid key or unauthorized email');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/auth', { method: 'DELETE' });
    } catch {}
    setIsAuthenticated(false);
    setAdminEmail('');
    setStats(null);
    setUsers([]);
    setSets([]);
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, setsRes, emailRes, sysRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/admin/users'),
        fetch('/api/admin/sets'),
        fetch('/api/admin/email'),
        fetch('/api/admin/system'),
      ]);

      if ([statsRes, usersRes, setsRes, emailRes, sysRes].some((r) => r.status === 401)) {
        setIsAuthenticated(false);
        return;
      }

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

  const handleViewUserDetail = async (user: UserProfile) => {
    setSelectedUser(user);
    setEditCredits(user.credits !== undefined ? user.credits : (user.is_pro ? 999999 : 10));
    setEditIsPro(!!user.is_pro);
    setIsEditingUser(false);
    setSaveSuccessMsg(null);
    if (!isAuthenticated) return;

    setLoadingUserDetail(true);
    try {
      const res = await fetch(`/api/admin/users?userId=${encodeURIComponent(user.id)}`);
      if (res.status === 401) {
        setIsAuthenticated(false);
        return;
      }
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          setSelectedUser(data.user);
          setEditCredits(data.user.credits !== undefined ? data.user.credits : (data.user.is_pro ? 999999 : 10));
          setEditIsPro(!!data.user.is_pro);
        }
      }
    } catch (err) {
      console.error('Failed to load user details:', err);
    } finally {
      setLoadingUserDetail(false);
    }
  };

  const handleSaveUserEdits = async () => {
    if (!selectedUser || !isAuthenticated) return;
    setIsSavingUser(true);
    setSaveSuccessMsg(null);

    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: selectedUser.id,
          isPro: editIsPro,
          credits: editIsPro ? 999999 : editCredits,
        }),
      });

      if (res.status === 401) {
        setIsAuthenticated(false);
        return;
      }

      if (res.ok) {
        const updatedUser = {
          ...selectedUser,
          is_pro: editIsPro,
          credits: editIsPro ? 999999 : editCredits,
        };
        setSelectedUser(updatedUser);
        setUsers((prev) =>
          prev.map((u) => (u.id === selectedUser.id ? { ...u, is_pro: editIsPro, credits: editIsPro ? 999999 : editCredits } : u))
        );
        setIsEditingUser(false);
        setSaveSuccessMsg('Tier and credits updated successfully!');
        setTimeout(() => setSaveSuccessMsg(null), 3000);
      } else {
        alert('Failed to save user tier/credits');
      }
    } catch (err) {
      console.error('Failed to update user profile:', err);
    } finally {
      setIsSavingUser(false);
    }
  };

  const handleCreateSet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newPhotoUrl || !isAuthenticated) return;

    setIsSubmittingSet(true);
    try {
      const res = await fetch('/api/admin/sets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: newTitle,
          category: newCategory,
          photoUrl: newPhotoUrl,
          likesCount: newLikes,
          isCurated: true,
        }),
      });

      if (res.status === 401) {
        setIsAuthenticated(false);
        return;
      }

      if (res.ok) {
        setIsCreateSetOpen(false);
        setNewTitle('');
        setNewPhotoUrl('');
        const setsRes = await fetch('/api/admin/sets');
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
    if (!isAuthenticated) return;
    if (!confirm('Are you sure you want to remove this manicure set?')) return;

    try {
      const res = await fetch(`/api/admin/sets?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });

      if (res.status === 401) {
        setIsAuthenticated(false);
        return;
      }

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

  // Loading state while verifying httpOnly admin session
  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center p-4">
        <Loader2 className="w-6 h-6 animate-spin text-[#E0246A]" />
      </div>
    );
  }

  // If not logged in, render minimal login screen
  if (!isAuthenticated) {
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
              Sign in with your master security key.
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
                placeholder="alazartesema1@gmail.com"
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
            onClick={() => isAuthenticated && fetchDashboardData()}
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
                      <th className="py-3 px-4">Membership / Credits</th>
                      <th className="py-3 px-4">Silhouette Preference</th>
                      <th className="py-3 px-4">Created Sets</th>
                      <th className="py-3 px-4">Registered Date</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {filteredUsers.map((u) => (
                      <tr
                        key={u.id}
                        onClick={() => handleViewUserDetail(u)}
                        className="hover:bg-rose-50/30 transition cursor-pointer group"
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-stone-100 overflow-hidden border border-stone-200 shrink-0 flex items-center justify-center font-serif text-xs font-bold text-stone-700">
                              {u.avatar_url ? (
                                <img src={u.avatar_url} alt="" className="w-full h-full object-cover" />
                              ) : (
                                (u.display_name || 'C').charAt(0).toUpperCase()
                              )}
                            </div>
                            <span className="font-semibold text-stone-900 group-hover:text-[#E0246A] transition-colors">
                              {u.display_name || 'Client'}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-stone-600 font-mono text-[11px]">
                          {u.email || '—'}
                        </td>
                        <td className="py-3 px-4">
                          {u.is_pro ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-100 text-[#E0246A] font-semibold text-[10px]">
                              Pro (Unlimited)
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 font-medium text-[10px]">
                              Free ({u.credits !== undefined ? u.credits : 10} credits)
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 capitalize text-stone-700">
                          {u.preferred_shape ? `${u.preferred_shape} (${u.preferred_length || 'med'})` : 'Default'}
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-mono text-xs font-semibold text-stone-800 bg-stone-100 px-2 py-0.5 rounded">
                            {u.setsCount || 0}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-stone-400">
                          {new Date(u.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              onClick={() => handleViewUserDetail(u)}
                              className="text-xs font-semibold text-stone-700 hover:text-stone-900 px-2 py-1 rounded-md hover:bg-stone-100 transition"
                            >
                              Details
                            </button>
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
                              Email
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredUsers.length === 0 && (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-stone-400 text-xs">
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
      {/* USER DETAIL MODAL / DRAWER */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl border border-stone-200/90 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl space-y-5 p-5 sm:p-7">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-stone-100">
              <div className="flex items-center gap-3.5">
                <div className="w-13 h-13 sm:w-15 sm:h-15 rounded-2xl bg-stone-100 overflow-hidden border border-stone-200 shrink-0 flex items-center justify-center font-serif text-xl font-bold text-stone-800">
                  {selectedUser.avatar_url ? (
                    <img src={selectedUser.avatar_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    (selectedUser.display_name || 'C').charAt(0).toUpperCase()
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-serif text-xl sm:text-2xl font-semibold text-stone-900">
                      {selectedUser.display_name || 'Client Profile'}
                    </h3>
                    {selectedUser.is_pro ? (
                      <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-[#E0246A] text-[10px] font-bold uppercase tracking-wider">
                        Pro Member
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-600 text-[10px] font-semibold uppercase tracking-wider">
                        Free Client
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-mono text-stone-500 mt-0.5">
                    {selectedUser.email || 'No email registered'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-500 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {loadingUserDetail && (
              <div className="py-8 flex items-center justify-center gap-2 text-stone-400 text-xs">
                <Loader2 className="w-4 h-4 animate-spin text-[#E0246A]" />
                <span>Loading complete user activity & creations...</span>
              </div>
            )}

            {!loadingUserDetail && (
              <div className="space-y-5">
                {/* Client Tier & Credit Controls (Admin Override) */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-stone-50 via-rose-50/30 to-stone-50 border border-stone-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-stone-900 flex items-center gap-1.5">
                      <CreditCard className="w-4 h-4 text-[#E0246A]" />
                      Membership Tier & Credits Allocation
                    </span>
                    {!isEditingUser ? (
                      <button
                        type="button"
                        onClick={() => setIsEditingUser(true)}
                        className="text-xs font-semibold text-[#E0246A] hover:underline inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit Tier / Credits</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setIsEditingUser(false)}
                        className="text-xs font-semibold text-stone-500 hover:text-stone-800"
                      >
                        Cancel
                      </button>
                    )}
                  </div>

                  {saveSuccessMsg && (
                    <p className="text-xs text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 font-medium">
                      ✓ {saveSuccessMsg}
                    </p>
                  )}

                  {!isEditingUser ? (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      <div className="p-2.5 rounded-xl bg-white border border-stone-200/70 space-y-0.5">
                        <span className="text-[10px] text-stone-400 font-semibold uppercase tracking-wider block">
                          Current Tier
                        </span>
                        <span className="text-sm font-semibold text-stone-900">
                          {selectedUser.is_pro ? 'Pro Member' : 'Free Plan'}
                        </span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-white border border-stone-200/70 space-y-0.5">
                        <span className="text-[10px] text-stone-400 font-semibold uppercase tracking-wider block">
                          Available Credits
                        </span>
                        <span className="text-sm font-semibold text-[#E0246A]">
                          {selectedUser.is_pro ? 'Unlimited (999,999)' : `${selectedUser.credits !== undefined ? selectedUser.credits : 10}`}
                        </span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-white border border-stone-200/70 space-y-0.5">
                        <span className="text-[10px] text-stone-400 font-semibold uppercase tracking-wider block">
                          Preferred Shape
                        </span>
                        <span className="text-sm font-semibold text-stone-900 capitalize">
                          {selectedUser.preferred_shape || 'Almond'}
                        </span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-white border border-stone-200/70 space-y-0.5">
                        <span className="text-[10px] text-stone-400 font-semibold uppercase tracking-wider block">
                          Registered Date
                        </span>
                        <span className="text-sm font-semibold text-stone-900">
                          {new Date(selectedUser.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3 p-3 bg-white rounded-xl border border-stone-200 shadow-2xs">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                            Plan Level
                          </label>
                          <select
                            value={editIsPro ? 'pro' : 'free'}
                            onChange={(e) => {
                              const isP = e.target.value === 'pro';
                              setEditIsPro(isP);
                              if (isP) setEditCredits(999999);
                              else if (editCredits > 100) setEditCredits(10);
                            }}
                            className="w-full h-9 px-2.5 rounded-lg border border-stone-300 text-xs focus:outline-none focus:border-[#E0246A]"
                          >
                            <option value="free">Free Tier (Credit Based)</option>
                            <option value="pro">Pro Member (Unlimited Credits)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                            Credits Allocation
                          </label>
                          <input
                            type="number"
                            disabled={editIsPro}
                            value={editIsPro ? 999999 : editCredits}
                            onChange={(e) => setEditCredits(parseInt(e.target.value, 10) || 0)}
                            className="w-full h-9 px-2.5 rounded-lg border border-stone-300 text-xs focus:outline-none focus:border-[#E0246A] disabled:bg-stone-100 disabled:text-stone-400 font-mono"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setIsEditingUser(false)}
                          className="h-8 px-3 rounded-lg text-xs font-semibold text-stone-600 hover:bg-stone-100"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleSaveUserEdits}
                          disabled={isSavingUser}
                          className="h-8 px-4 rounded-lg bg-[#E0246A] hover:bg-[#BE185D] text-white text-xs font-semibold inline-flex items-center gap-1.5 shadow-xs disabled:opacity-50 cursor-pointer"
                        >
                          {isSavingUser ? (
                            <>
                              <Loader2 className="w-3 h-3 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save className="w-3 h-3" />
                              Save Changes
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Client's Hand Photo & Live Calibration */}
                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-stone-800 flex items-center gap-1.5">
                      <Camera className="w-4 h-4 text-[#E0246A]" />
                      Uploaded Hand Viewfinder
                    </span>
                    <span className="text-[11px] text-stone-500 font-mono">
                      Orientation: {selectedUser.hand_orientation || 'right'} • Skin: {selectedUser.skin_tone_id || 'warm-ivory'}
                    </span>
                  </div>

                  {selectedUser.custom_hand_url ? (
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-1">
                      <div className="relative group shrink-0">
                        <img
                          src={selectedUser.custom_hand_url}
                          alt="Client Hand"
                          className="w-24 h-32 sm:w-28 sm:h-36 rounded-2xl object-cover border border-stone-200 shadow-sm"
                        />
                        <a
                          href={selectedUser.custom_hand_url}
                          target="_blank"
                          rel="noreferrer"
                          className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition text-white text-xs font-medium"
                        >
                          View Full Size ↗
                        </a>
                      </div>
                      <div className="space-y-1.5">
                        <span className="inline-block text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                          ✓ Verified Custom Hand Active
                        </span>
                        <p className="text-xs text-stone-600 leading-relaxed">
                          This client has completed step 1 of onboarding. Their hand is saved and calibrated for virtual manicure try-ons.
                        </p>
                        <p className="text-[11px] text-stone-400 font-mono break-all">
                          {selectedUser.custom_hand_url}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl bg-white border border-dashed border-stone-200 text-center space-y-1">
                      <p className="text-xs text-stone-500 font-medium">
                        No custom hand photo uploaded yet
                      </p>
                      <p className="text-[11px] text-stone-400">
                        Client is currently using Finglora's default editorial model hand ({selectedUser.skin_tone_id || 'Warm Honey'}).
                      </p>
                    </div>
                  )}
                </div>

                {/* AI Applied Manicure Try-On Photos Stored in Supabase */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-600 flex items-center gap-1.5">
                      <Camera className="w-3.5 h-3.5 text-[#E0246A]" />
                      AI Applied Hand Photos ({selectedUser.tryOns?.length || 0})
                    </h4>
                  </div>

                  {selectedUser.tryOns && selectedUser.tryOns.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-72 overflow-y-auto pr-1">
                      {selectedUser.tryOns.map((t: any) => (
                        <div
                          key={t.id}
                          className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-2xs group relative"
                        >
                          <div className="relative aspect-[3/4] bg-stone-100 overflow-hidden">
                            <img
                              src={t.image_url}
                              alt="Applied Try-On"
                              className="w-full h-full object-cover group-hover:scale-103 transition duration-200"
                            />
                            <a
                              href={t.image_url}
                              target="_blank"
                              rel="noreferrer"
                              className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition text-white text-[11px] font-medium"
                            >
                              Inspect Full Size ↗
                            </a>
                            <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/60 text-white text-[9px] font-mono">
                              {t.mode || 'AI Try-On'}
                            </span>
                          </div>
                          <div className="p-2 space-y-0.5">
                            <p className="text-[10px] text-stone-500">
                              Applied: {new Date(t.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl bg-stone-50 border border-dashed border-stone-200 text-center text-xs text-stone-400">
                      No AI applied try-on photos stored for this client yet.
                    </div>
                  )}
                </div>

                {/* Action Bar */}
                <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-stone-100">
                  <div className="text-[11px] text-stone-400 font-mono">
                    User UUID: {selectedUser.id}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (selectedUser.email) {
                          setTestEmailAddress(selectedUser.email);
                          setSelectedUser(null);
                          setActiveTab('email');
                        }
                      }}
                      className="h-9 px-4 rounded-xl bg-[#E0246A] hover:bg-[#BE185D] text-white text-xs font-semibold inline-flex items-center gap-1.5 transition active:scale-95 shadow-xs cursor-pointer"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>Send Direct Email</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
