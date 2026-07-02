'use client';

import * as React from 'react';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { Hero } from '@/components/hero';
import { CategoriesGrid } from '@/components/categories-grid';
import { FeaturedMasters } from '@/components/featured-masters';
import { MastersSection } from '@/components/masters-section';
import { HowItWorks } from '@/components/how-it-works';
import { MasterDialog } from '@/components/master-dialog';
import { AiAssistant } from '@/components/ai-assistant';
import { OrdersPage } from '@/components/orders-page';
import { ReviewsPage } from '@/components/reviews-page';
import { AuthDialog } from '@/components/auth-dialog';
import { fetchCategories, fetchStats, fetchMasters } from '@/lib/api';
import type { CategoryDTO, ViewPage, MasterListItemDTO } from '@/lib/types';
import { LogIn } from 'lucide-react';

interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
  masterId?: string | null;
}

export default function Home() {
  const [currentPage, setCurrentPage] = React.useState<ViewPage>('home');
  const [search, setSearch] = React.useState('');
  const [category, setCategory] = React.useState<string | null>(null);
  const [categories, setCategories] = React.useState<CategoryDTO[]>([]);
  const [stats, setStats] = React.useState<{
    masters: number;
    categories: number;
    reviews: number;
    completedOrders: number;
  } | null>(null);

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [selectedMaster, setSelectedMaster] = React.useState<string | null>(null);
  const [dialogTab, setDialogTab] = React.useState<'about' | 'reviews' | 'order'>('about');
  const [prefilledJob, setPrefilledJob] = React.useState<string | undefined>(undefined);

  const [assistantOpen, setAssistantOpen] = React.useState(false);
  const [authDialogOpen, setAuthDialogOpen] = React.useState(false);

  // Auth state
  const [user, setUser] = React.useState<AuthUser | null>(null);

  // Real-time rating refresh key
  const [ratingRefreshKey, setRatingRefreshKey] = React.useState(0);

  // Load user from localStorage on mount
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem('masterok_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        setUser(parsed);
        // Verify session
        fetch('/api/auth/me', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: parsed.id }),
        })
          .then((r) => r.json())
          .then((data) => {
            if (data.user) setUser(data.user);
            else { localStorage.removeItem('masterok_user'); setUser(null); }
          })
          .catch(() => {});
      }
    } catch {}
  }, []);

  async function loadInitialData() {
    try {
      const [catRes, statsRes] = await Promise.all([fetchCategories(), fetchStats()]);
      setCategories(catRes.categories);
      setStats({
        masters: statsRes.masters,
        categories: statsRes.categories,
        reviews: statsRes.reviews,
        completedOrders: statsRes.completedOrders,
      });
    } catch {}
  }

  async function loadStats() {
    try {
      const s = await fetchStats();
      setStats({
        masters: s.masters,
        categories: s.categories,
        reviews: s.reviews,
        completedOrders: s.completedOrders,
      });
    } catch {}
  }

  React.useEffect(() => {
    loadInitialData();
  }, []);

  // Reload stats when rating changes or user logs in/out
  React.useEffect(() => {
    loadStats();
  }, [ratingRefreshKey, user]);

  function handleLogin(userData: AuthUser) {
    setUser(userData);
    localStorage.setItem('masterok_user', JSON.stringify(userData));
    // Refresh data to show new master/reviews
    loadStats();
    setRatingRefreshKey((k) => k + 1);
  }

  function handleLogout() {
    setUser(null);
    localStorage.removeItem('masterok_user');
    loadStats();
    setRatingRefreshKey((k) => k + 1);
  }

  function handleNavigate(page: ViewPage) {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function scrollTo(id: string) {
    if (currentPage !== 'home') {
      setCurrentPage('home');
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 150);
      return;
    }
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function requireAuth(): boolean {
    if (user) return true;
    setAuthDialogOpen(true);
    return false;
  }

  function openMaster(id: string, opts?: { tab?: 'about' | 'reviews' | 'order'; job?: string }) {
    // Allow viewing 'about' and 'reviews' tabs without auth, but 'order' requires auth
    if (opts?.tab === 'order' && !user) {
      setSelectedMaster(id);
      setDialogTab('about');
      setPrefilledJob(opts?.job);
      setDialogOpen(true);
      setAuthDialogOpen(true);
      return;
    }
    setSelectedMaster(id);
    setDialogTab(opts?.tab || 'about');
    setPrefilledJob(opts?.job);
    setDialogOpen(true);
  }

  function openAssistant() {
    setAssistantOpen(true);
  }

  function pickMasterFromAssistant(id: string, job?: string) {
    setAssistantOpen(false);
    openMaster(id, { tab: 'order', job });
  }

  function handleReviewSubmitted(_review: any, _rating: number, _count: number) {
    setRatingRefreshKey((k) => k + 1);
  }

  const categoryOptions = categories.map((c) => ({ id: c.id, name: c.name }));

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader
        onOpenAssistant={openAssistant}
        onOpenAuth={() => setAuthDialogOpen(true)}
        onLogout={handleLogout}
        onScrollTo={scrollTo}
        currentPage={currentPage}
        onNavigate={handleNavigate}
        user={user}
      />

      <main className="flex-1">
        {currentPage === 'home' && (
          <>
            <Hero
              search={search}
              onSearch={setSearch}
              onOpenAssistant={openAssistant}
              onScrollTo={scrollTo}
              stats={stats}
            />

            <CategoriesGrid
              categories={categories}
              selected={category}
              onSelect={(slug) => {
                setCategory(slug);
                setTimeout(() => scrollTo('masters'), 100);
              }}
            />

            <FeaturedMasters
              key={`featured-${ratingRefreshKey}`}
              onOpenMaster={(id) => openMaster(id)}
              onScrollToCatalog={() => scrollTo('masters')}
            />

            <MastersSection
              key={`masters-${ratingRefreshKey}`}
              search={search}
              category={category}
              onOpenMaster={(id) => openMaster(id)}
              registerRef={() => {}}
            />

            <HowItWorks />
          </>
        )}

        {currentPage === 'orders' && (
          <OrdersPage onBack={() => handleNavigate('home')} />
        )}

        {currentPage === 'reviews' && (
          <ReviewsPage onBack={() => handleNavigate('home')} />
        )}
      </main>

      <SiteFooter
        onOpenAssistant={openAssistant}
        onNavigate={handleNavigate}
        onScrollTo={scrollTo}
        currentPage={currentPage}
      />

      <MasterDialog
        masterId={selectedMaster}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        defaultTab={dialogTab}
        prefilledJob={prefilledJob}
        onReviewSubmitted={handleReviewSubmitted}
        isAuthed={!!user}
        onRequireAuth={() => setAuthDialogOpen(true)}
      />

      <AiAssistant
        open={assistantOpen}
        onOpenChange={setAssistantOpen}
        onPickMaster={pickMasterFromAssistant}
      />

      <AuthDialog
        open={authDialogOpen}
        onOpenChange={setAuthDialogOpen}
        onLogin={handleLogin}
        categories={categoryOptions}
      />

      {/* Floating AI button */}
      {!assistantOpen && (
        <button
          onClick={openAssistant}
          className="fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full bg-gradient-to-br from-primary to-amber-500 px-4 py-3 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/30 transition hover:scale-105 hover:shadow-xl"
          aria-label="Открыть AI-ассистент"
        >
          <SparklesIcon />
          <span className="hidden sm:inline">AI-подбор мастера</span>
        </button>
      )}
    </div>
  );
}

function SparklesIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
      <path d="M20 3v4" />
      <path d="M22 5h-4" />
      <path d="M4 17v2" />
      <path d="M5 18H3" />
    </svg>
  );
}