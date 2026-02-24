import { useState, useRef } from 'react';
import { uploadImage } from '../services/cloudinaryService';

const AvatarUpload = ({ onUploadSuccess, currentImage, name, size = "w-32 h-32" }) => {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);
    const fileInputRef = useRef(null);

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) {
            setError("Max 2MB");
            return;
        }

        setUploading(true);
        setError(null);

        try {
            const url = await uploadImage(file);
            onUploadSuccess(url);
        } catch (err) {
            setError(err.message || "Upload failed");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="relative inline-block group">
            <div
                onClick={() => !uploading && fileInputRef.current.click()}
                className={`${size} rounded-full overflow-hidden bg-[#242424] dark:bg-[#1a1a1a] flex items-center justify-center ring-4 ring-primary/10 transition-all hover:ring-primary/30 hover:scale-[1.02] shadow-2xl relative cursor-pointer`}
            >
                {currentImage && currentImage !== '' && !currentImage.includes('pravatar.cc') ? (
                    <img src={currentImage} alt={name} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-b from-primary/10 to-transparent">
                        <span className="text-primary font-display font-black text-5xl drop-shadow-[0_0_10px_rgba(244,192,37,0.3)]">{name?.charAt(0) || 'U'}</span>
                    </div>
                )}

                {uploading && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
                    </div>
                )}

                {!uploading && (
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="material-symbols-outlined text-white/50 text-4xl">add_a_photo</span>
                    </div>
                )}
            </div>

            <button
                type="button"
                onClick={() => fileInputRef.current.click()}
                disabled={uploading}
                className="absolute bottom-1 right-1 bg-primary p-2.5 rounded-full shadow-lg hover:scale-110 active:scale-95 transition-all border-4 border-white dark:border-surface-dark z-10"
            >
                <span className="material-symbols-outlined text-black text-sm font-bold">
                    photo_camera
                </span>
            </button>

            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
            />

            {error && (
                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap">
                    <span className="text-[9px] text-red-500 font-black uppercase tracking-widest bg-white dark:bg-surface-dark px-2 py-0.5 rounded shadow-sm border border-red-500/20">
                        {error}
                    </span>
                </div>
            )}
        </div>
    );
};

export default AvatarUpload;
