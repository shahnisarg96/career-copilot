import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(email, password);
      if (!result?.success) {
        throw new Error(result?.error || 'Login failed');
      }

      // Keep backward-compat for any code still reading `role` from localStorage
      if (result.user?.role) localStorage.setItem('role', result.user.role);

      navigate(result.user?.role === 'ADMIN' ? '/admin' : '/dashboard');
    } catch (err) {
      setError(err.message || 'An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 items-center bg-gradient-to-br from-base-100 to-base-200">
      <div className="p-12 hidden lg:flex flex-col justify-center">
        <div className="max-w-lg">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-6">
            <span className="text-2xl">🚀</span>
            <span className="font-semibold">Portfolio Platform</span>
          </div>
          <h1 className="text-4xl font-black mb-4 leading-tight">Welcome back to your creative space</h1>
          <p className="text-lg text-base-content/70 mb-8">
            Manage your portfolio, edit sections, and publish updates to your live profile. Your work, your brand — beautifully presented.
          </p>
          <div className="space-y-4 mb-8">
            <div className="flex items-start gap-3">
              <div className="badge badge-primary badge-lg">✓</div>
              <div>
                <h3 className="font-bold">Edit across sections</h3>
                <p className="text-sm text-base-content/60">Intro, About, Skills, Projects & more</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="badge badge-secondary badge-lg">✓</div>
              <div>
                <h3 className="font-bold">One-click publish</h3>
                <p className="text-sm text-base-content/60">Instant updates to your public link</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="badge badge-accent badge-lg">✓</div>
              <div>
                <h3 className="font-bold">Shareable resume</h3>
                <p className="text-sm text-base-content/60">Professional PDF & live portfolio</p>
              </div>
            </div>
          </div>
          <div className="stats shadow border border-base-300">
            <div className="stat place-items-center">
              <div className="stat-value text-primary">8</div>
              <div className="stat-desc">Modular Sections</div>
            </div>
            <div className="stat place-items-center">
              <div className="stat-value text-secondary">1</div>
              <div className="stat-desc">Click Publish</div>
            </div>
          </div>
        </div>
      </div>
      <div className="card w-full max-w-md bg-base-100 shadow-xl mx-auto my-12 border border-base-300">
        <div className="card-body">
          <h2 className="card-title text-3xl font-bold text-center mb-6">Sign in</h2>

          {error && (
            <div className="alert alert-error mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Email</span>
              </label>
              <input
                type="email"
                placeholder="admin@example.com"
                className="input input-bordered w-full focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Password</span>
              </label>
              <input
                type="password"
                placeholder="••••••••"
                className="input input-bordered w-full focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="form-control mt-2">
              <button type="submit" className={`btn btn-primary ${loading ? 'loading' : ''} shadow-md hover:shadow-lg transition-shadow`} disabled={loading}>
                {loading ? 'Signing in…' : 'Continue'}
              </button>
            </div>
          </form>

          <div className="divider">OR</div>

          <div className="text-center">
            <p className="text-sm">
              New here?{' '}
              <button onClick={() => navigate('/register')} className="link link-primary">
                Create an account
              </button>
            </p>
            <button onClick={() => navigate('/')} className="link link-secondary mt-2">
              ← Back to Landing
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
