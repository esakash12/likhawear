import React from 'react';
import { X, ZoomIn } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const ImageZoomModal: React.FC = () => {
  const { zoomedImageUrl, setZoomedImageUrl } = useStore();

  if (!zoomedImageUrl) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-backdrop"
      onClick={() => setZoomedImageUrl(null)}
    >
      {/* Close Button */}
      <button
        onClick={() => setZoomedImageUrl(null)}
        className="absolute top-5 right-5 z-20 w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 text-white flex items-center justify-center transition-colors focus:outline-none cursor-pointer"
        aria-label="Close image zoom"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Image Container */}
      <div 
        onClick={(e) => e.stopPropagation()}
        className="relative max-w-4xl max-h-[90vh] flex items-center justify-center overflow-hidden animate-modal-pop"
      >
        <img
          src={zoomedImageUrl}
          alt="Zoomed product preview"
          className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl transition-transform duration-300"
        />
      </div>
    </div>
  );
};
