import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const result = await register(formData.email, formData.password, formData.name);
      if (!result?.success) {
        throw new Error(result?.error || 'Registration failed');
      }

      if (result.user?.role) localStorage.setItem('role', result.user.role);
      navigate(result.user?.role === 'ADMIN' ? '/admin' : '/dashboard');
    } catch (err) {
      setError(err.message || 'An error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 items-center bg-gradient-to-br from-base-100 to-base-200">
      <div className="p-12 hidden lg:flex flex-col justify-center">
        <div className="max-w-lg">
          <div className="inline-flex items-center gap-2 bg-success/10 text-success px-4 py-2 rounded-full mb-6">
            <span className="text-2xl">✨</span>
            <span className="font-semibold">Start Building Today</span>
          </div>
          <h1 className="text-4xl font-black mb-4 leading-tight">Create your developer portfolio in minutes</h1>
          <p className="text-lg text-base-content/70 mb-8">
            Set up your profile to start building and publishing a stunning portfolio and resume. Secure, modular, and instant.
          </p>
          <div className="space-y-4 mb-8">
            <div className="flex items-start gap-3">
              <div className="badge badge-primary badge-lg">🔒</div>
              <div>
                <h3 className="font-bold">Secure authentication</h3>
                <p className="text-sm text-base-content/60">JWT-protected with role-based access</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="badge badge-secondary badge-lg">🧩</div>
              <div>
                <h3 className="font-bold">Modular sections</h3>
                <p className="text-sm text-base-content/60">8 customizable portfolio sections</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="badge badge-accent badge-lg">⚡</div>
              <div>
                <h3 className="font-bold">Instant publishing</h3>
                <p className="text-sm text-base-content/60">Go live with a single click</p>
              </div>
            </div>
          </div>
          <div className="card bg-base-100 border border-base-300 shadow-md">
            <div className="card-body">
              <div className="flex items-center gap-3">
                <div className="avatar placeholder">
                  <div className="bg-primary text-primary-content rounded-full w-12">
                    <span className="text-xl">👤</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm italic text-base-content/70">"Setup took 5 minutes. My portfolio looks amazing!"</p>
                  <p className="text-xs text-base-content/50 mt-1">— Developer using this platform</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="card w-full max-w-md bg-base-100 shadow-xl mx-auto my-12 border border-base-300">
        <div className="card-body">
          <h2 className="card-title text-3xl font-bold text-center mb-6">Create account</h2>

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
                <span className="label-text font-medium">Name</span>
              </label>
              <input
                type="text"
                name="name"
                placeholder="John Doe"
                className="input input-bordered w-full focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Email</span>
              </label>
              <input
                type="email"
                name="email"
                placeholder="admin@example.com"
                className="input input-bordered w-full focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Password</span>
              </label>
              <input
                type="password"
                name="password"
                placeholder="••••••••"
                className="input input-bordered w-full focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Confirm Password</span>
              </label>
              <input
                type="password"
                name="confirmPassword"
                placeholder="••••••••"
                className="input input-bordered w-full focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                minLength={6}
              />
            </div>

            <div className="form-control mt-2">
              <button type="submit" className={`btn btn-primary ${loading ? 'loading' : ''} shadow-md hover:shadow-lg transition-shadow`} disabled={loading}>
                {loading ? 'Creating…' : 'Continue'}
              </button>
            </div>
          </form>

          <div className="divider">OR</div>

          <div className="text-center">
            <p className="text-sm">
              Already have an account?{' '}
              <button onClick={() => navigate('/login')} className="link link-primary">
                Sign in
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

export default Register;
