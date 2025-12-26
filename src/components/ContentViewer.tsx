import { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Play, Lock, Crown, Eye, FileText, Image as ImageIcon, Film, Download } from 'lucide-react';
import type { Content } from '../lib/database.types';
import type { AuthUser } from '../lib/auth';
import AuthModal from './AuthModal';
import PremiumModal from './PremiumModal';

interface ContentViewerProps {
  content: Content;
  onBack: () => void;
  user: AuthUser | null;
  purchasedContent: string[];
  onAuthSuccess: () => void;
}

export default function ContentViewer({ content, onBack, user, purchasedContent, onAuthSuccess }: ContentViewerProps) {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const canAccess = () => {
    if (user?.profile?.is_admin) return true;
    if (!content.is_premium) return true;
    return purchasedContent.includes(content.id);
  };

  const handleVideoTimeUpdate = () => {
    if (videoRef.current && !canAccess()) {
      const previewDuration = content.preview_duration || 30;
      if (videoRef.current.currentTime >= previewDuration) {
        videoRef.current.pause();
        videoRef.current.currentTime = previewDuration;
        setShowPremiumModal(true);
      }
    }
  };

  const renderContent = () => {
    if (!content.content_url) {
      return (
        <div className="p-8 text-center text-slate-400">
          <p>No hay contenido disponible para mostrar.</p>
        </div>
      );
    }

    // External Content
    if (content.is_external || content.file_type === 'external') {
      return (
        <div className="flex flex-col items-center justify-center p-12">
          <a
            href={content.content_url}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl flex items-center space-x-3 transition-colors text-lg font-medium"
          >
            <span>Ver Contenido Externo</span>
            <ArrowLeft className="w-5 h-5 rotate-180" />
          </a>
          <p className="mt-4 text-slate-400 text-sm">
            Este contenido se abrirá en una nueva pestaña
          </p>
        </div>
      );
    }

    // Video Content
    if (content.file_type === 'video') {
      return (
        <div className="aspect-video bg-black rounded-lg overflow-hidden relative group">
          <video
            ref={videoRef}
            src={content.content_url}
            controls
            className="w-full h-full"
            onTimeUpdate={handleVideoTimeUpdate}
            controlsList={!canAccess() ? "nodownload" : undefined}
          />
          {!canAccess() && (
            <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-lg flex items-center space-x-2 border border-yellow-500/30">
              <Eye className="w-4 h-4 text-yellow-500" />
              <span className="text-yellow-500 text-xs font-medium">Vista Previa: 30s</span>
            </div>
          )}
        </div>
      );
    }

    // PDF Content
    if (content.file_type === 'pdf') {
      if (!canAccess()) {
        return (
          <div className="bg-slate-900 rounded-xl border border-slate-700 p-8 text-center">
            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-yellow-500" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Documento PDF Protegido</h3>
            <p className="text-slate-400 mb-6 max-w-md mx-auto">
              Este documento está disponible solo para suscriptores premium.
              Suscríbete ahora para acceder a la biblioteca completa.
            </p>
            <button
              onClick={() => !user ? setShowAuthModal(true) : setShowPremiumModal(true)}
              className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-6 py-3 rounded-lg font-medium hover:from-yellow-600 hover:to-orange-600 transition-all"
            >
              {!user ? "Registrarse para Acceder" : "Suscribirse Ahora"}
            </button>
          </div>
        );
      }
      return (
        <div className="h-[80vh] w-full bg-slate-100 rounded-lg overflow-hidden">
          <iframe
            src={content.content_url}
            className="w-full h-full"
            title="PDF Viewer"
          />
        </div>
      );
    }

    // Image Content
    if (content.file_type === 'image') {
      return (
        <div className="relative rounded-xl overflow-hidden bg-slate-900">
          <img
            src={content.content_url}
            alt={content.title}
            className={`w-full h-auto max-h-[80vh] object-contain ${!canAccess() ? 'blur-xl scale-105 transition-all duration-700' : ''}`}
          />

          {!canAccess() && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-10">
              <div className="text-center p-6 bg-black/80 backdrop-blur-xl rounded-2xl border border-white/10 max-w-sm mx-4">
                <Lock className="w-10 h-10 text-yellow-500 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-white mb-2">Imagen Premium</h3>
                <button
                  onClick={() => !user ? setShowAuthModal(true) : setShowPremiumModal(true)}
                  className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-semibold py-2 rounded-lg transition-colors mt-4"
                >
                  Desbloquear
                </button>
              </div>
            </div>
          )}
        </div>
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={onBack}
              className="flex items-center space-x-2 text-slate-300 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Volver</span>
            </button>

            <div className="flex items-center space-x-4">
              {content.is_premium && (
                <div className="flex items-center space-x-2 bg-yellow-500/20 px-3 py-1 rounded-full border border-yellow-500/20">
                  <Crown className="w-4 h-4 text-yellow-500" />
                  <span className="text-yellow-500 text-sm font-medium">Premium</span>
                </div>
              )}

              {!user && (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
                >
                  Iniciar Sesión
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Title Section */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">{content.title}</h1>
          {content.description && (
            <p className="text-xl text-slate-300 leading-relaxed font-light">{content.description}</p>
          )}

          <div className="flex items-center space-x-4 mt-6 text-sm text-slate-500">
            {content.file_type && (
              <div className="flex items-center space-x-1 uppercase tracking-wider">
                {content.file_type === 'video' && <Film className="w-4 h-4" />}
                {content.file_type === 'pdf' && <FileText className="w-4 h-4" />}
                {content.file_type === 'image' && <ImageIcon className="w-4 h-4" />}
                <span>{content.file_type}</span>
              </div>
            )}
            {content.file_size && (
              <span>• {(content.file_size / (1024 * 1024)).toFixed(1)} MB</span>
            )}
            <span>• Publicado el {new Date(content.created_at).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 overflow-hidden shadow-2xl">
          {renderContent()}
        </div>

        {/* Helper Banner for Locked Content */}
        {!canAccess() && content.is_premium && !content.is_external && (
          <div className="mt-8 bg-gradient-to-r from-slate-800 to-slate-900 border border-slate-700 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-3 opacity-10 transform translate-x-1/3 -translate-y-1/3 group-hover:scale-110 transition-transform duration-700">
              <Crown className="w-64 h-64" />
            </div>

            <div className="relative z-10">
              <h3 className="text-2xl font-bold text-white mb-2">Este contenido es Premium</h3>
              <p className="text-slate-400 max-w-lg">
                Compra este contenido para acceder de forma ilimitada y disfrutar de la mejor calidad.
              </p>
            </div>

            <button
              onClick={() => !user ? setShowAuthModal(true) : setShowPremiumModal(true)}
              className="relative z-10 bg-yellow-500 hover:bg-yellow-400 text-black font-bold px-8 py-4 rounded-xl shadow-lg shadow-yellow-500/20 transition-all transform hover:scale-105 whitespace-nowrap"
            >
              {purchasedContent.includes(content.id) ? "Ya Comprado" : "Comprar Ahora"}
            </button>
          </div>
        )}
      </div>

      {/* Modals */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={onAuthSuccess}
      />

      <PremiumModal
        isOpen={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
      />
    </div>
  );
}