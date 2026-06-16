import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { authService } from '../services/authService';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import { fadeInUp, scaleIn } from '../utils/animations';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await authService.login(data);
      login(res.data.token, res.data.user);
      toast.success(`Welcome back, ${res.data.user.name}!`);
      navigate(res.data.user.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!forgotEmail) return toast.error('Please enter your email');
    setForgotLoading(true);
    try {
      await authService.forgotPassword(forgotEmail);
      toast.success('Reset link sent to your email');
      setForgotOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send reset email');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-primary flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent-purple/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-cyan/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <motion.div variants={fadeInUp} initial="initial" animate="animate" className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-6">
            <span className="font-display text-xl font-bold text-white">VolunteerSphere</span>
          </Link>
          <h1 className="text-3xl font-display font-bold text-white">Welcome back</h1>
          <p className="text-white/50 font-body mt-2">Sign in to continue your journey</p>
        </motion.div>

        {/* Form Card */}
        <motion.div variants={scaleIn} initial="initial" animate="animate">
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <Input
                label="Email Address"
                type="email"
                placeholder="you@example.com"
                icon={<Mail size={16} />}
                error={errors.email?.message}
                {...register('email')}
                id="login-email"
              />

              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                icon={<Lock size={16} />}
                error={errors.password?.message}
                rightElement={
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-white/40 hover:text-white/80 transition-colors">
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                }
                {...register('password')}
                id="login-password"
              />

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="rounded border-white/20 bg-white/5 text-accent-purple focus:ring-accent-purple/50" />
                  <span className="text-sm text-white/50 font-body">Remember me</span>
                </label>
                <button
                  type="button"
                  onClick={() => setForgotOpen(true)}
                  className="text-sm text-accent-purple hover:text-accent-cyan transition-colors font-body"
                >
                  Forgot password?
                </button>
              </div>

              <Button type="submit" variant="primary" fullWidth size="lg" loading={loading} id="login-submit">
                Sign In
              </Button>
            </form>

            {/* Divider */}
            <div className="my-6 flex items-center gap-4">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-white/30 text-xs font-body">Demo accounts</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            {/* Demo credentials hint */}
            <div className="space-y-2 text-xs font-mono text-white/40 bg-white/5 rounded-xl p-4 border border-white/5">
              <div>👑 Admin: admin@volunteersphere.com / Admin@1234</div>
              <div>👤 Volunteer: priya@demo.com / Demo@1234</div>
            </div>
          </div>
        </motion.div>

        <motion.p variants={fadeInUp} initial="initial" animate="animate" className="text-center mt-6 text-white/50 font-body text-sm">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="text-accent-purple hover:text-accent-cyan transition-colors font-semibold">
            Sign up free
          </Link>
        </motion.p>
      </div>

      {/* Forgot Password Modal */}
      <Modal isOpen={forgotOpen} onClose={() => setForgotOpen(false)} title="Reset Password" size="sm">
        <div className="p-6 space-y-4">
          <p className="text-white/60 text-sm font-body">
            Enter your email address and we&apos;ll send you a link to reset your password.
          </p>
          <Input
            label="Email Address"
            type="email"
            placeholder="you@example.com"
            value={forgotEmail}
            onChange={(e) => setForgotEmail(e.target.value)}
            id="forgot-email"
          />
          <Button
            variant="primary"
            fullWidth
            loading={forgotLoading}
            onClick={handleForgotPassword}
            id="forgot-submit"
          >
            Send Reset Link
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default Login;
