import { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { getCroppedImg } from '../../utils/cropImage';
import { X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ImageCropperModalProps {
  imageSrc: string;
  onClose: () => void;
  onCropCompleteAction: (croppedFile: File) => void;
  aspectRatio?: number;
}

export function ImageCropperModal({ imageSrc, onClose, onCropCompleteAction, aspectRatio = 3 / 4 }: ImageCropperModalProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const onCropComplete = useCallback((croppedArea: any, croppedPixels: any) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const handleSave = async () => {
    if (!croppedAreaPixels) return;
    setIsProcessing(true);
    try {
      const croppedFile = await getCroppedImg(imageSrc, croppedAreaPixels);
      onCropCompleteAction(croppedFile);
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[400] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-[#030303] w-full max-w-lg rounded-2xl border border-white/10 overflow-hidden shadow-2xl relative flex flex-col"
        >
          <div className="flex items-center justify-between p-5 border-b border-white/5 bg-black z-10">
            <div>
              <h3 className="font-serif text-lg text-white">Frame Artifact</h3>
              <p className="text-[10px] text-white/40 uppercase tracking-widest mt-1">Drag and Zoom to compose</p>
            </div>
            <button onClick={onClose} disabled={isProcessing} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/60">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="relative w-full h-[60vh] bg-black">
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={aspectRatio}
              onCropChange={setCrop}
              onCropComplete={onCropComplete}
              onZoomChange={setZoom}
              classes={{ containerClassName: 'cropper-container' }}
            />
          </div>

          <div className="p-5 border-t border-white/5 bg-black z-10 space-y-5">
             <div className="flex items-center gap-4">
                <span className="text-[10px] uppercase text-white/40 tracking-widest min-w-[40px]">Zoom</span>
                <input
                  type="range"
                  value={zoom}
                  min={1}
                  max={3}
                  step={0.1}
                  aria-labelledby="Zoom"
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="w-full accent-[#D4AF37] h-1 bg-white/20 rounded-full appearance-none outline-none"
                />
             </div>
             <div className="flex gap-4">
               <button
                 onClick={onClose}
                 disabled={isProcessing}
                 className="flex-1 py-3 bg-white/5 text-white/80 uppercase tracking-widest text-xs font-bold rounded-lg hover:bg-white/10 transition-colors border border-white/5"
               >
                 Cancel
               </button>
               <button
                 onClick={handleSave}
                 disabled={isProcessing}
                 className="flex-1 py-3 bg-[#D4AF37] text-black uppercase tracking-widest text-xs font-bold rounded-lg hover:bg-[#FDFBF7] transition-colors flex items-center justify-center gap-2"
               >
                 {isProcessing ? 'Processing...' : <><Check className="w-4 h-4" /> Finalize</>}
               </button>
             </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
