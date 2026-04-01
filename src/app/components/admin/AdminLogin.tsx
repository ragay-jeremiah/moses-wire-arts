import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../../firebase';
import { motion } from 'motion/react';
import { toast } from 'react-hot-toast';

interface AdminLoginProps {
  onClose: () => void;
  onSuccess?: () => void;
}

export function AdminLogin({ onClose, onSuccess }: AdminLoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success('Admin login successful');
      if (onSuccess) onSuccess();
      else onClose();
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/operation-not-allowed') {
        const msg = 'Email/Password login is not enabled in Firebase Console.';
        setError(msg);
        toast.error(msg);
      } else {
        const msg = err.message || 'Invalid email or password.';
        setError(msg);
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', damping: 24, stiffness: 300 }}
        className="bg-[#111] border border-white/10 w-full max-w-sm mx-4 rounded-2xl shadow-2xl p-10 text-white"
      >
        {/* Logo / Title */}
        <div className="text-center mb-8">
          <p className="font-serif text-2xl tracking-wide mb-1">Moses Wire Arts</p>
          <p className="text-[10px] uppercase tracking-[0.3em] text-white/40 font-medium">Admin Access</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-[10px] uppercase tracking-[0.2em] font-medium text-white/50 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="admin@example.com"
              className="w-full bg-black border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-white/50 transition-colors placeholder:text-white/20"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-[0.2em] font-medium text-white/50 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full bg-black border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-white/50 transition-colors placeholder:text-white/20"
            />
          </div>

          {error && (
            <p className="text-red-500 text-xs text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-black py-3.5 rounded-lg text-xs uppercase tracking-[0.2em] font-medium hover:bg-white/80 transition-colors disabled:opacity-50"
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full text-xs text-white/40 hover:text-white/70 transition-colors uppercase tracking-[0.2em] pt-1"
          >
            Cancel
          </button>
        </form>
      </motion.div>
    </div>
  );
}
