import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const LoginPage = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated, user } = useAuth();
  const { notify } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(user.role === 'admin' ? '/admin' : '/citizen', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const onChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await login(form);
      notify({
        title: 'Welcome back',
        message: `Signed in as ${data.user.name}.`,
        type: 'success'
      });
      navigate(data.user.role === 'admin' ? '/admin' : '/citizen', { replace: true });
    } catch (apiError) {
      const message = apiError.response?.data?.message || 'Login failed';
      setError(message);
      notify({ title: 'Login failed', message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="app-shell flex min-h-screen items-center justify-center px-4 py-10">
      <div className="grid w-full max-w-6xl overflow-hidden rounded-[34px] border border-[var(--panel-border)] shadow-soft lg:grid-cols-[1.1fr_0.9fr]">
        <section className="hero-banner p-8 sm:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/70">Secure Access</p>
          <h1 className="mt-4 text-4xl font-extrabold leading-tight">Municipal intelligence for citizens and authorities</h1>
          <p className="mt-4 max-w-xl text-sm text-white/80">
            Sign in to track complaint progress, inspect AI summaries, monitor SLA exposure, and operate in executive, compact, or high-contrast modes.
          </p>
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {['AI insights', 'SLA monitoring', 'Operational modes'].map((item) => (
              <div key={item} className="rounded-2xl border border-white/15 bg-white/10 p-4 text-sm font-semibold">
                {item}
              </div>
            ))}
          </div>
        </section>

        <form onSubmit={onSubmit} className="app-panel border-0 p-8 sm:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent-strong)]">Account Login</p>
          <h2 className="mt-2 text-3xl font-extrabold text-[var(--text-primary)]">Sign In</h2>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">Citizen and admin users can sign in here.</p>

          <div className="mt-6 space-y-4">
            <label className="block text-sm font-medium text-[var(--text-primary)]">
              Email
              <input
                name="email"
                type="email"
                required
                value={form.email}
                onChange={onChange}
                className="mt-1 w-full rounded-xl border border-[var(--panel-border)] bg-white/70 px-4 py-2.5 outline-none ring-brand-300 focus:ring"
              />
            </label>

            <label className="block text-sm font-medium text-[var(--text-primary)]">
              Password
              <input
                name="password"
                type="password"
                required
                value={form.password}
                onChange={onChange}
                className="mt-1 w-full rounded-xl border border-[var(--panel-border)] bg-white/70 px-4 py-2.5 outline-none ring-brand-300 focus:ring"
              />
            </label>
          </div>

          {error ? <p className="mt-4 text-sm text-rose-600">{error}</p> : null}

          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full rounded-xl bg-[var(--accent-solid)] px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

          <p className="mt-4 text-sm text-[var(--text-secondary)]">
            No account?{' '}
            <Link to="/register" className="font-semibold text-[var(--accent-strong)]">
              Register
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
};

export default LoginPage;
