import { ArrowLeft, ExternalLink, Crown, Lock } from 'lucide-react';
import { useState } from 'react';
import type { Content } from '../lib/database.types';
import type { AuthUser } from '../lib/auth';
import PremiumModal from './PremiumModal';
import ContentViewer from './ContentViewer';

interface ContentSectionProps {
  categoryName: string;
  categoryId?: string;
  content: Content[];
  onBack: () => void;
  user: AuthUser | null;
  purchasedContent: string[];
  onAuthSuccess: () => void;
  onAddContent: () => void;
}

export default function ContentSection({ categoryName, categoryId, content, onBack, user, purchasedContent, onAuthSuccess, onAddContent }: ContentSectionProps) {
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [selectedContent, setSelectedContent] = useState<Content | null>(null);

  const handleContentClick = (item: Content) => {
    // Si es contenido interno (no externo), abrir el visor
    if (!item.is_external) {
      setSelectedContent(item);
      return;
    }

    // Para contenido externo, verificar acceso premium
    if (item.is_premium && !purchasedContent.includes(item.id) && !user?.profile?.is_admin) {
      setShowPremiumModal(true);
      return;
    }

    if (item.content_url) {
      window.open(item.content_url, '_blank');
    }
  };

  const canAccessContent = (item: Content) => {
    if (user?.profile?.is_admin) return true;
    if (!item.is_premium) return true;
    return purchasedContent.includes(item.id);
  };

  // Si hay contenido seleccionado, mostrar el visor
  if (selectedContent) {
    return (
      <ContentViewer
        content={selectedContent}
        onBack={() => setSelectedContent(null)}
        user={user}
        purchasedContent={purchasedContent}
        onAuthSuccess={onAuthSuccess}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-slate-300 hover:text-white transition-colors duration-300 group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300" />
            <span className="text-lg">Volver</span>
          </button>

          <div className="flex items-center space-x-4">
            <h1 className="text-3xl md:text-4xl font-bold text-white">{categoryName}</h1>
            {user?.profile?.is_admin && (
              <button
                onClick={onAddContent}
                className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full transition-colors shadow-lg hover:shadow-blue-500/25"
                title="Agregar contenido a esta categoría"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M8 12h8" /><path d="M12 8v8" /></svg>
              </button>
            )}
          </div>

          <div className="w-20" />
        </div>

        {content.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="bg-slate-800/50 rounded-2xl p-12 border border-slate-700">
              <p className="text-xl text-slate-400 text-center">
                No hay contenido disponible aún en esta categoría
              </p>
              <p className="text-sm text-slate-500 text-center mt-2">
                Próximamente agregaremos contenido nuevo
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {content.map((item) => (
              <div
                key={item.id}
                onClick={() => handleContentClick(item)}
                className="group relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl overflow-hidden border border-slate-700 hover:border-blue-500 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/20 cursor-pointer"
              >
                {item.is_premium && (
                  <div className="absolute top-2 right-2 z-10">
                    <div className="bg-yellow-500/90 text-black px-2 py-1 rounded-full flex items-center space-x-1 text-xs font-bold">
                      <Crown className="w-3 h-3" />
                      <span>PREMIUM</span>
                    </div>
                  </div>
                )}

                {item.is_external && !canAccessContent(item) && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10">
                    <div className="text-center">
                      <Lock className="w-12 h-12 text-white mx-auto mb-2" />
                      <p className="text-white font-medium">Contenido Premium</p>
                      <p className="text-slate-300 text-sm">Comprar para acceder</p>
                    </div>
                  </div>
                )}

                {item.image_url ? (
                  <div className="aspect-[3/4] overflow-hidden bg-slate-700">
                    <img
                      src={item.image_url}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                ) : (
                  <div className="aspect-[3/4] bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center">
                    <span className="text-6xl text-slate-600">🎬</span>
                  </div>
                )}

                <div className="p-4">
                  <h3 className="text-lg font-semibold text-white mb-2 line-clamp-1 group-hover:text-blue-400 transition-colors duration-300">
                    {item.title}
                    {item.is_external && (
                      <ExternalLink className="inline-block w-4 h-4 ml-2 opacity-70" />
                    )}
                    {!item.is_external && (
                      <span className="inline-block w-4 h-4 ml-2 opacity-70">📖</span>
                    )}
                  </h3>
                  {item.description && (
                    <p className="text-sm text-slate-400 line-clamp-2">
                      {item.description}
                    </p>
                  )}
                </div>

                <div className="absolute inset-0 bg-blue-500/0 group-hover:bg-blue-500/5 transition-colors duration-300 pointer-events-none" />
              </div>
            ))}
          </div>
        )}

        <PremiumModal
          isOpen={showPremiumModal}
          onClose={() => setShowPremiumModal(false)}
        />
      </div>
    </div>
  );
}
