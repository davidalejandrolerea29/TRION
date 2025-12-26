import { useEffect, useState } from 'react';
import { X, Calendar, PlayCircle, FileText, Image as ImageIcon, ExternalLink } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Content } from '../lib/database.types';

interface HistoryModalProps {
    userId: string;
    onClose: () => void;
}

interface PurchaseWithContent {
    id: string;
    purchase_date: string;
    amount: number;
    content: Content;
}

export default function HistoryModal({ userId, onClose }: HistoryModalProps) {
    const [purchases, setPurchases] = useState<PurchaseWithContent[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadHistory();
    }, [userId]);

    const loadHistory = async () => {
        try {
            const { data, error } = await supabase
                .from('user_purchases')
                .select(`
          id,
          purchase_date,
          amount,
          content:content_id (*)
        `)
                .eq('user_id', userId)
                .order('purchase_date', { ascending: false });

            if (error) throw error;
            setPurchases(data as PurchaseWithContent[] || []);
        } catch (error) {
            console.error('Error loading history:', error);
        } finally {
            setLoading(false);
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'video': return <PlayCircle className="w-5 h-5 text-blue-400" />;
            case 'pdf': return <FileText className="w-5 h-5 text-red-400" />;
            case 'image': return <ImageIcon className="w-5 h-5 text-green-400" />;
            default: return <ExternalLink className="w-5 h-5 text-purple-400" />;
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-slate-900 rounded-2xl w-full max-w-4xl max-h-[80vh] flex flex-col border border-slate-700 shadow-2xl">
                <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50 rounded-t-2xl">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                        <Calendar className="w-6 h-6 text-indigo-400" />
                        Historial de Contenidos
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    {loading ? (
                        <div className="flex justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
                        </div>
                    ) : purchases.length === 0 ? (
                        <div className="text-center py-12 text-slate-400">
                            <p className="text-lg">No tienes contenidos en tu historial.</p>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {purchases.map((purchase) => (
                                <div
                                    key={purchase.id}
                                    className="bg-slate-800/50 rounded-xl p-4 flex items-center gap-4 border border-slate-700/50 hover:border-indigo-500/30 transition-all group"
                                >
                                    <div className="relative w-24 h-16 rounded-lg overflow-hidden bg-slate-900 shrink-0">
                                        <img
                                            src={purchase.content.image_url}
                                            alt={purchase.content.title}
                                            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                                        />
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                            {getTypeIcon(purchase.content.file_type)}
                                        </div>
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-white font-medium truncate mb-1">
                                            {purchase.content.title}
                                        </h3>
                                        <p className="text-sm text-slate-400 flex items-center gap-2">
                                            <span>Adquirido el {formatDate(purchase.purchase_date)}</span>
                                            {purchase.amount > 0 && (
                                                <span className="bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded text-xs">
                                                    ${purchase.amount}
                                                </span>
                                            )}
                                        </p>
                                    </div>

                                    <a
                                        href={purchase.content.content_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
                                    >
                                        Ver
                                        <ExternalLink className="w-4 h-4" />
                                    </a>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
