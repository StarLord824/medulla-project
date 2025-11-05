'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useImageStore } from '@/store/useImageStore';
import ImageEditor from './ImageEditor';
import { motion } from 'motion/react';
import { ArrowLeft } from 'lucide-react';

export default function EditorClientWrapper() {
  const router = useRouter();
  const { imageUrl, setImageUrl } = useImageStore();

  useEffect(() => {
    // If no image is loaded, redirect to home after a brief moment
    if (!imageUrl) {
      const timeout = setTimeout(() => {
        router.push('/');
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [imageUrl, router]);

  const handleBack = () => {
    // Clean up blob URL to prevent memory leaks
    if (imageUrl) {
      URL.revokeObjectURL(imageUrl);
    }
    setImageUrl(null);
    router.push('/');
  };

  if (!imageUrl) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-900 via-indigo-900 to-slate-900 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-12 text-center space-y-6 max-w-md"
        >
          <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto">
            <span className="text-4xl">⚠️</span>
          </div>
          <h2 className="text-2xl font-bold text-white">No Image Selected</h2>
          <p className="text-white/70">
            You need to upload an image first. Redirecting you back...
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/')}
            className="bg-linear-to-r from-indigo-500 to-blue-600 text-white px-6 py-3 rounded-xl font-medium flex items-center gap-2 mx-auto"
          >
            <ArrowLeft size={18} />
            Go Back
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return <ImageEditor imageUrl={imageUrl} onBack={handleBack} />;
}