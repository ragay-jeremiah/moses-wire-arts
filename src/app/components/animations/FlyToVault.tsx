import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface FlyingOrb {
  id: number;
  startX: number;
  startY: number;
}

export function FlyToVault() {
  const [orbs, setOrbs] = useState<FlyingOrb[]>([]);

  const triggerOrb = useCallback((e: any) => {
    const { x, y } = e.detail;
    const newOrb = { id: Date.now(), startX: x, startY: y };
    setOrbs(prev => [...prev, newOrb]);
  }, []);

  useEffect(() => {
    window.addEventListener('fly-to-vault', triggerOrb);
    return () => window.removeEventListener('fly-to-vault', triggerOrb);
  }, [triggerOrb]);

  const onAnimationComplete = (id: number) => {
    setOrbs(prev => prev.filter(orb => orb.id !== id));
    // Trigger the 'bump' on the target icon
    window.dispatchEvent(new CustomEvent('vault-bump'));
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-[999] overflow-hidden">
      <AnimatePresence>
        {orbs.map(orb => (
          <Orb 
            key={orb.id} 
            orb={orb} 
            onComplete={() => onAnimationComplete(orb.id)} 
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

function Orb({ orb, onComplete }: { orb: FlyingOrb; onComplete: () => void }) {
  const [targetPos, setTargetPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    const targetId = isMobile ? 'inquiry-bag-target-mobile' : 'inquiry-bag-target';
    const target = document.getElementById(targetId);
    
    if (target) {
      const rect = target.getBoundingClientRect();
      setTargetPos({ 
        x: rect.left + rect.width / 2, 
        y: rect.top + rect.height / 2 
      });
    } else {
      // Fallback
      setTargetPos({ x: window.innerWidth - 50, y: isMobile ? window.innerHeight - 50 : 50 });
    }
  }, []);

  if (targetPos.x === 0) return null;

  return (
    <motion.div
      initial={{ 
        x: orb.startX - 10, 
        y: orb.startY - 10, 
        scale: 0, 
        opacity: 0,
        filter: 'blur(0px)'
      }}
      animate={{ 
        x: [orb.startX, (orb.startX + targetPos.x) / 2, targetPos.x],
        y: [orb.startY, Math.min(orb.startY, targetPos.y) - 150, targetPos.y],
        scale: [0, 1.5, 0.2],
        opacity: [0, 1, 0.8, 0],
        filter: ['blur(0px)', 'blur(8px)', 'blur(15px)', 'blur(0px)']
      }}
      transition={{ 
        duration: 1.2, 
        ease: "easeInOut",
        times: [0, 0.4, 1]
      }}
      onAnimationComplete={onComplete}
      className="absolute w-5 h-5 bg-[#D4AF37] rounded-full shadow-[0_0_30px_#D4AF37]"
      style={{ 
        boxShadow: '0 0 40px #D4AF37, 0 0 100px rgba(212, 175, 55, 0.4)' 
      }}
    />
  );
}
