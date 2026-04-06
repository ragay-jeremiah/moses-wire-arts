import { useState } from 'react';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../../firebase';
import { motion, AnimatePresence } from 'motion/react';
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
  const [resetMode, setResetMode] = useState(false);
  const [resetSent, setResetSent] = useState(false);

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

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setResetSent(true);
      toast.success('Reset link sent — check your inbox.');
    } catch (err: any) {
      const msg = err.message || 'Failed to send reset email.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 backdrop-blur-xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#030303] border border-white/5 w-full max-w-sm mx-4 rounded-none shadow-[0_40px_100px_rgba(0,0,0,1)] p-10 text-white relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#D4AF37]/40 to-transparent" />

        {/* Logo / Title */}
        <div className="text-center mb-10">
          <p className="font-serif text-3xl tracking-tighter mb-2 italic">
            {resetMode ? 'Restore Access' : 'Vault Access'}
          </p>
          <p className="text-[8px] uppercase tracking-[0.4em] text-[#D4AF37] font-bold">Moses Wire Arts Console</p>
        </div>

        <AnimatePresence mode="wait">
          {/* ── RESET MODE ── */}
          {resetMode ? (
            <motion.div
              key="reset"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {resetSent ? (
                <div className="text-center space-y-6">
                  <div className="w-12 h-12 rounded-full border border-[#D4AF37]/40 flex items-center justify-center mx-auto">
                    <span className="text-[#D4AF37] text-xl">✓</span>
                  </div>
                  <p className="text-[11px] uppercase tracking-[0.2em] text-white/60 leading-relaxed">
                    A reset link has been dispatched to<br />
                    <span className="text-[#D4AF37]">{email}</span>
                  </p>
                  <p className="text-[10px] text-white/30 tracking-wider">Check your inbox and spam folder.</p>
                  <button
                    onClick={() => { setResetMode(false); setResetSent(false); }}
                    className="w-full text-[9px] text-white/30 hover:text-white/60 transition-colors uppercase tracking-[0.3em] pt-2"
                  >
                    Back to Login
                  </button>
                </div>
              ) : (
                <form onSubmit={handleResetPassword} className="space-y-6">
                  <p className="text-[10px] text-white/30 uppercase tracking-[0.2em] text-center leading-relaxed">
                    Enter your registered email and we'll send a reset link.
                  </p>
                  <div>
                    <label className="block text-[9px] uppercase tracking-[0.3em] font-bold text-white/30 mb-3">
                      Identity (Email)
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoFocus
                      className="w-full bg-white/[0.03] border border-white/5 rounded-none px-4 py-4 text-sm text-white focus:outline-none focus:border-[#D4AF37]/50 transition-colors placeholder:text-white/10"
                    />
                  </div>

                  {error && (
                    <p className="text-red-500 text-[10px] uppercase tracking-widest text-center">{error}</p>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#D4AF37] text-black py-4 text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-[#FDFBF7] transition-all disabled:opacity-50 shadow-lg"
                  >
                    {loading ? 'Dispatching…' : 'Send Reset Link'}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setResetMode(false); setError(''); }}
                    className="w-full text-[9px] text-white/20 hover:text-white/60 transition-colors uppercase tracking-[0.3em] pt-2"
                  >
                    Back to Login
                  </button>
                </form>
              )}
            </motion.div>
          ) : (
            /* ── LOGIN MODE ── */
            <motion.form
              key="login"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              onSubmit={handleSubmit}
              className="space-y-6"
            >
              <div>
                <label className="block text-[9px] uppercase tracking-[0.3em] font-bold text-white/30 mb-3">
                  Identity (Email)
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-white/[0.03] border border-white/5 rounded-none px-4 py-4 text-sm text-white focus:outline-none focus:border-[#D4AF37]/50 transition-colors placeholder:text-white/10"
                />
              </div>

              <div>
                <label className="block text-[9px] uppercase tracking-[0.3em] font-bold text-white/30 mb-3">
                  Cipher (Password)
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-white/[0.03] border border-white/5 rounded-none px-4 py-4 text-sm text-white focus:outline-none focus:border-[#D4AF37]/50 transition-colors placeholder:text-white/10"
                />
                {/* Forgot Password */}
                <button
                  type="button"
                  onClick={() => { setResetMode(true); setError(''); }}
                  className="mt-2 text-[8px] uppercase tracking-[0.3em] text-white/20 hover:text-[#D4AF37] transition-colors float-right"
                >
                  Forgot Cipher?
                </button>
              </div>

              {error && (
                <p className="text-red-500 text-[10px] uppercase tracking-widest text-center">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#D4AF37] text-black py-4 text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-[#FDFBF7] transition-all disabled:opacity-50 shadow-lg"
              >
                {loading ? 'Authenticating…' : 'Enter Console'}
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-full text-[9px] text-white/20 hover:text-white/60 transition-colors uppercase tracking-[0.3em] pt-2"
              >
                Return to Gallery
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

