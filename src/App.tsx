import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';
import { authService, type AuthUser } from './lib/auth';
import type { Category, Content } from './lib/database.types';
import HomePage from './components/HomePage';
import ContentSection from './components/ContentSection';
import AdminPanel from './components/AdminPanel';
import HistoryModal from './components/HistoryModal';

function App() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [content, setContent] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [preSelectedCategoryId, setPreSelectedCategoryId] = useState<string | null>(null);
  const [purchasedContent, setPurchasedContent] = useState<string[]>([]);

  useEffect(() => {
    initializeAuth();
    loadCategories();
  }, []);

  useEffect(() => {
    if (user) {
      loadUserPurchases();
    } else {
      setPurchasedContent([]);
    }
  }, [user]);

  const loadUserPurchases = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('user_purchases')
        .select('content_id')
        .eq('user_id', user.id);

      if (error) throw error;
      const purchases = data as { content_id: string }[] | null;
      setPurchasedContent(purchases?.map(p => p.content_id) || []);
    } catch (error) {
      console.error('Error loading purchases:', error);
    }
  };

  useEffect(() => {
    if (selectedCategory) {
      loadContent(selectedCategory);
    }
  }, [selectedCategory]);

  const initializeAuth = async () => {
    const currentUser = await authService.getCurrentUser();
    setUser(currentUser);

    authService.onAuthStateChange((user) => {
      setUser(user);
    });
  };


  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadContent = async (categorySlug: string) => {
    try {
      setLoading(true);
      const category = categories.find((c) => c.slug === categorySlug);
      if (!category) return;

      const { data, error } = await supabase
        .from('content')
        .select('*')
        .eq('category_id', category.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setContent(data || []);
    } catch (error) {
      console.error('Error loading content:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySelect = (categorySlug: string) => {
    setSelectedCategory(categorySlug);
    setPreSelectedCategoryId(null);
  };

  const handleBack = () => {
    setSelectedCategory(null);
    setShowAdmin(false);
    setShowHistory(false);
    setContent([]);
    setPreSelectedCategoryId(null);
  };

  const handleAuthSuccess = () => {
    initializeAuth();
  };

  const handleAdminAccess = (categoryId?: string) => {
    if (user) {
      if (categoryId) {
        setPreSelectedCategoryId(categoryId);
      }
      setShowAdmin(true);
      // If coming from a section, close the section view
      setSelectedCategory(null);
    } else {
      alert('Debes iniciar sesión para acceder al panel.');
    }
  };

  const handleHistoryAccess = () => {
    if (user) {
      setShowHistory(true);
      setSelectedCategory(null);
    }
  };

  const handleSignOut = async () => {
    try {
      await authService.signOut();
      setUser(null);
      setShowAdmin(false);
      setShowHistory(false);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (loading && categories.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Cargando...</div>
      </div>
    );
  }

  if (showAdmin) {
    return <AdminPanel onBack={handleBack} categories={categories} initialCategoryId={preSelectedCategoryId} />;
  }

  return (
    <div className="relative">
      <HomePage
        categories={categories}
        onCategorySelect={handleCategorySelect}
        user={user}
        onAuthSuccess={handleAuthSuccess}
        onAdminClick={() => handleAdminAccess()}
        onHistoryClick={handleHistoryAccess}
        onSignOut={handleSignOut}
      />


      {showHistory && user && (
        <HistoryModal userId={user.id} onClose={() => setShowHistory(false)} />
      )}

      {selectedCategory && (
        <div className="fixed inset-0 z-40 bg-slate-900">
          <ContentSection
            categoryName={categories.find((c) => c.slug === selectedCategory)?.name || ''}
            categoryId={categories.find((c) => c.slug === selectedCategory)?.id}
            content={content}
            onBack={handleBack}
            user={user}
            purchasedContent={purchasedContent}
            onAuthSuccess={handleAuthSuccess}
            onAddContent={() => handleAdminAccess(categories.find((c) => c.slug === selectedCategory)?.id)}
          />
        </div>
      )}
    </div>
  );
}

export default App;
