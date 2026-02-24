import { useState, useEffect } from 'react';
import { uploadImage } from '../services/cloudinaryService';

const ImageUpload = ({ onUploadSuccess, defaultImage, label = "Upload Image" }) => {
    const [preview, setPreview] = useState(defaultImage);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        setPreview(defaultImage);
    }, [defaultImage]);

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validation: Maksimal 2MB sesuai rencana di cloudinary.md
        if (file.size > 2 * 1024 * 1024) {
            setError("Max size 2MB");
            return;
        }

        setUploading(true);
        setError(null);

        // Preview local
        const reader = new FileReader();
        reader.onloadend = () => setPreview(reader.result);
        reader.readAsDataURL(file);

        try {
            const url = await uploadImage(file);
            onUploadSuccess(url);
        } catch (err) {
            setError(err.message || "Upload failed. Try again.");
            setPreview(defaultImage);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="space-y-2">
            <label className="text-[10px] font-extrabold text-gray-400 dark:text-gray-500 uppercase tracking-widest block">
                {label}
            </label>
            <div className="relative group w-full h-40 bg-gray-50 dark:bg-white/[0.04] border-2 border-dashed border-black/10 dark:border-white/10 rounded-2xl overflow-hidden transition-all hover:border-primary/40">
                {preview ? (
                    <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                        <span className="material-symbols-outlined text-3xl mb-2">add_photo_alternate</span>
                        <span className="text-[11px] font-bold">PNG, JPG up to 2MB</span>
                    </div>
                )}

                {uploading && (
                    <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-2">
                        <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-white text-[10px] font-bold uppercase tracking-widest animate-pulse">Uploading...</span>
                    </div>
                )}

                <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    disabled={uploading}
                />

                {preview && !uploading && (
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="flex flex-col items-center gap-1">
                            <span className="material-symbols-outlined text-white">sync</span>
                            <span className="text-white text-[10px] font-bold uppercase tracking-widest">Change Photo</span>
                        </div>
                    </div>
                )}
            </div>
            {error && <p className="text-[10px] text-red-500 font-bold uppercase text-center">{error}</p>}
        </div>
    );
};

export default ImageUpload;
