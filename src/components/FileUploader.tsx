import { useState, useRef } from 'react';
import { Upload, X, File, Image as ImageIcon, Film, Music } from 'lucide-react';

interface FileUploaderProps {
    label: string;
    accept: string;
    maxSizeMB: number;
    currentValue?: string;
    onFileSelect: (file: File | null) => void;
    onClear: () => void;
    helperText?: string;
}

export default function FileUploader({
    label,
    accept,
    maxSizeMB,
    currentValue,
    onFileSelect,
    onClear,
    helperText
}: FileUploaderProps) {
    const [dragActive, setDragActive] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [error, setError] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const validateFile = (file: File) => {
        // Check size
        if (file.size > maxSizeMB * 1024 * 1024) {
            setError(`El archivo excede el tamaño máximo de ${maxSizeMB}MB`);
            return false;
        }

        // Check type (basic check based on accept prop)
        // accept format: "image/*,video/*" or ".pdf,.doc"
        // simplistic validation here, reliance on input accept mostly
        return true;
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };

    const handleFile = (file: File) => {
        setError(null);
        if (validateFile(file)) {
            setSelectedFile(file);
            onFileSelect(file);
        }
    };

    const handleClear = () => {
        setSelectedFile(null);
        if (inputRef.current) {
            inputRef.current.value = '';
        }
        onClear();
    };

    const getFileIcon = (type: string) => {
        if (type.startsWith('image/')) return <ImageIcon className="w-8 h-8 text-blue-400" />;
        if (type.startsWith('video/')) return <Film className="w-8 h-8 text-purple-400" />;
        if (type.startsWith('audio/')) return <Music className="w-8 h-8 text-pink-400" />;
        return <File className="w-8 h-8 text-slate-400" />;
    };

    return (
        <div className="mb-4">
            <label className="block text-sm font-medium text-slate-300 mb-2">{label}</label>

            {!selectedFile && !currentValue ? (
                <div
                    className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${dragActive
                            ? 'border-blue-500 bg-blue-500/10'
                            : 'border-slate-600 hover:border-slate-500 bg-slate-700/50'
                        }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                >
                    <input
                        ref={inputRef}
                        type="file"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        accept={accept}
                        onChange={handleChange}
                    />
                    <div className="flex flex-col items-center pointer-events-none">
                        <Upload className="w-8 h-8 text-slate-400 mb-2" />
                        <p className="text-sm text-slate-300 font-medium">
                            Arrastra un archivo o haz clic para seleccionar
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                            Máximo {maxSizeMB}MB {helperText ? `• ${helperText}` : ''}
                        </p>
                    </div>
                </div>
            ) : (
                <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-4 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        {selectedFile
                            ? getFileIcon(selectedFile.type)
                            : <File className="w-8 h-8 text-slate-400" />
                        }
                        <div>
                            <p className="text-sm font-medium text-white truncate max-w-[200px]">
                                {selectedFile ? selectedFile.name : 'Archivo actual'}
                            </p>
                            <p className="text-xs text-slate-400">
                                {selectedFile
                                    ? `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB`
                                    : 'Archivo subido previamente'
                                }
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={handleClear}
                        className="p-1 hover:bg-slate-600 rounded-full transition-colors text-slate-400 hover:text-white"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
            )}

            {error && (
                <p className="text-red-400 text-xs mt-2">{error}</p>
            )}

            {currentValue && !selectedFile && (
                <p className="text-xs text-blue-400 mt-2">
                    Actualmente existe un archivo subido. Sube uno nuevo para reemplazarlo.
                </p>
            )}
        </div>
    );
}
