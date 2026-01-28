import { Book, BookOpen, BookMarked, Tv, Film, Theater, Clapperboard, Gamepad2 } from 'lucide-react';
import { useState } from 'react';
import type { Category } from '../lib/database.types';
import AuthModal from './AuthModal';
import type { AuthUser } from '../lib/auth';

interface HomePageProps {
  categories: Category[];
  onCategorySelect: (categorySlug: string) => void;
  user: AuthUser | null;
  onAuthSuccess: () => void;
  onAdminClick: () => void;
  onHistoryClick: () => void;
  onSignOut: () => void;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Book,
  BookOpen,
  BookMarked,
  Tv,
  Film,
  Theater,
  Clapperboard,
  Gamepad2,
};

export default function HomePage({ categories, onCategorySelect, user, onAuthSuccess, onAdminClick, onHistoryClick, onSignOut }: HomePageProps) {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-7xl w-full">
        <div className="absolute top-4 right-4 flex items-center space-x-4">
          {user ? (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="text-white bg-slate-800/50 px-4 py-2 rounded-lg border border-slate-700 flex items-center transition-all hover:bg-slate-700 hover:border-blue-500 cursor-pointer"
              >
                <span className="text-slate-400 mr-2">Hola,</span>
                <span className="font-medium mr-2">{user.email?.split('@')[0]}</span>
                {user.profile?.is_admin && (
                  <span className="text-xs bg-blue-600 px-2 py-0.5 rounded text-white font-medium">
                    Admin
                  </span>
                )}
              </button>

              <div className="absolute right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-xl overflow-hidden z-50">
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    onHistoryClick();
                  }}
                  className="w-full text-left px-4 py-3 text-sm text-slate-300 hover:text-white hover:bg-slate-700 transition-colors border-b border-slate-700 flex items-center"
                >
                  <span>Historial</span>
                </button>
                {user.profile?.is_admin && (
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      onAdminClick();
                    }}
                    className="w-full text-left px-4 py-3 text-sm text-slate-300 hover:text-white hover:bg-slate-700 transition-colors border-b border-slate-700 flex items-center"
                  >
                    <span>Subir Contenido</span>
                  </button>
                )}
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    onSignOut();
                  }}
                  className="w-full text-left px-4 py-3 text-sm text-red-400 hover:text-red-300 hover:bg-slate-700 transition-colors"
                >
                  <span>Cerrar Sesión</span>
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowAuthModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Iniciar Sesión
            </button>
          )}
        </div>

        <div className="flex flex-col items-center mb-16">
          <div className="mb-8 transform hover:scale-105 transition-transform duration-300">
            <img
              src="/logo-trion.png"
              alt="TRION Logo"
              className="w-64 md:w-96 h-auto drop-shadow-2xl"
            />
          </div>
          <h2 className="text-2xl md:text-3xl text-slate-300 font-light tracking-wide">
            Selecciona tu entretenimiento
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {categories.map((category) => {
            const Icon = iconMap[category.icon] || Book;
            return (
              <button
                key={category.id}
                onClick={() => onCategorySelect(category.slug)}
                className="group relative bg-gradient-to-br from-slate-800 to-slate-900 hover:from-blue-900 hover:to-slate-900 rounded-2xl p-6 md:p-8 border border-slate-700 hover:border-blue-500 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/20"
              >
                <div className="flex flex-col items-center space-y-4">
                  <div className="bg-slate-700/50 group-hover:bg-blue-500/20 rounded-xl p-4 transition-colors duration-300">
                    <Icon className="w-8 h-8 md:w-10 md:h-10 text-slate-300 group-hover:text-blue-400 transition-colors duration-300" />
                  </div>
                  <span className="text-lg md:text-xl font-medium text-slate-200 group-hover:text-white transition-colors duration-300">
                    {category.name}
                  </span>
                </div>
                <div className="absolute inset-0 rounded-2xl bg-blue-500/0 group-hover:bg-blue-500/5 transition-colors duration-300" />
              </button>
            );
          })}
        </div>
      </div>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={onAuthSuccess}
      />
    </div >
  );
}
