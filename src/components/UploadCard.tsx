'use client';

import { Upload } from 'lucide-react';
import { motion } from 'motion/react';
import { useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useImageStore } from '@/store/useImageStore';

export default function UploadCard() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const setImageUrl = useImageStore((state) => state.setImageUrl);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      // Create blob URL for efficient browser preview
      const blobUrl = URL.createObjectURL(file);
      
      // Store in Zustand
      setImageUrl(blobUrl);
      
      // Navigate to editor
      router.push('/editor');
    }
  };

  return (
    <div className="relative w-full max-w-2xl">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
      
      <motion.div 
        className="relative backdrop-blur-xl bg-white/40 dark:bg-slate-800/40 rounded-3xl border border-white/50 dark:border-slate-700/50 shadow-2xl shadow-indigo-500/10 dark:shadow-indigo-500/5 overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        whileHover={{ scale: 1.02 }}
      >
        <div className="absolute inset-0 bg-linear-to-br from-indigo-100/30 via-transparent to-blue-100/30 dark:from-indigo-900/20 dark:to-blue-900/20" />
        
        <div className="relative z-10 p-12 text-center space-y-8">
          <motion.div 
            className="space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-slate-800 dark:text-white tracking-tight">
              Upload an Image to Start Editing
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-md mx-auto">
              Transform your images with powerful editing tools in seconds
            </p>
          </motion.div>

          <motion.div 
            className="flex justify-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <motion.button
              onClick={handleUploadClick}
              className="group relative px-8 py-4 bg-linear-to-r from-indigo-600 to-blue-500 text-white font-semibold rounded-full shadow-lg shadow-indigo-500/30 flex items-center gap-3"
              whileHover={{ 
                scale: 1.05,
                boxShadow: '0 20px 25px -5px rgba(99, 102, 241, 0.4), 0 10px 10px -5px rgba(99, 102, 241, 0.3)'
              }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              <motion.div
                whileHover={{ y: -2 }}
                transition={{ type: 'spring', stiffness: 300, damping: 15 }}
              >
                <Upload className="w-5 h-5" />
              </motion.div>
              <span>Upload Image</span>
            </motion.button>
          </motion.div>

          <motion.div 
            className="flex justify-center gap-8 pt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-800 dark:text-white">Fast</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Processing</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-800 dark:text-white">Simple</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Interface</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-800 dark:text-white">Free</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">To Use</div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
