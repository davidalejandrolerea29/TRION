import { useState } from 'react';
import { X, Crown, Check } from 'lucide-react';

interface PremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PremiumModal({ isOpen, onClose }: PremiumModalProps) {
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubscribe = async () => {
    setLoading(true);
    // Aquí integrarías con Stripe
    alert('Integración con Stripe pendiente. Contacta al administrador.');
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 rounded-2xl p-8 w-full max-w-md border border-slate-700">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Crown className="w-6 h-6 text-yellow-500" />
            <h2 className="text-2xl font-bold text-white">Trion Premium</h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="mb-6">
          <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-xl p-6 border border-yellow-500/30">
            <div className="text-center mb-4">
              <div className="text-2xl font-bold text-white mb-2">Desbloquear Contenido</div>
              <div className="text-slate-300">Pago único</div>
            </div>

            <ul className="space-y-3">
              <li className="flex items-center space-x-3">
                <Check className="w-5 h-5 text-green-400" />
                <span className="text-slate-300">Acceso ilimitado a este contenido</span>
              </li>
              <li className="flex items-center space-x-3">
                <Check className="w-5 h-5 text-green-400" />
                <span className="text-slate-300">Sin anuncios</span>
              </li>
              <li className="flex items-center space-x-3">
                <Check className="w-5 h-5 text-green-400" />
                <span className="text-slate-300">Alta definición</span>
              </li>
            </ul>
          </div>
        </div>

        <button
          onClick={handleSubscribe}
          disabled={loading}
          className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 disabled:opacity-50 text-white font-medium py-3 rounded-lg transition-all transform hover:scale-105"
        >
          {loading ? 'Procesando...' : 'Comprar Ahora'}
        </button>

        <p className="text-xs text-slate-400 text-center mt-4">
          Pago seguro y acceso inmediato.
        </p>
      </div>
    </div>
  );
}