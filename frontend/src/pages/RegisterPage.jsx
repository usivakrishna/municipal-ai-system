import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const RegisterPage = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'citizen',
    adminCode: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const { notify } = useToast();
  const navigate = useNavigate();

  const onChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = { ...form };
      if (payload.role !== 'admin') {
        delete payload.adminCode;
      }
      const data = await register(payload);
      notify({
        title: 'Account created',
        message: `Welcome ${data.user.name}. Your workspace is ready.`,
        type: 'success'
      });
      navigate(data.user.role === 'admin' ? '/admin' : '/citizen', { replace: true });
    } catch (apiError) {
      const message = apiError.response?.data?.message || 'Registration failed';
      setError(message);
      notify({ title: 'Registration failed', message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="app-shell flex min-h-screen items-center justify-center px-4 py-10">
      <div className="grid w-full max-w-6xl overflow-hidden rounded-[34px] border border-[var(--panel-border)] shadow-soft lg:grid-cols-[0.95fr_1.05fr]">
        <section className="hero-banner p-8 sm:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/70">Onboarding</p>
          <h1 className="mt-4 text-4xl font-extrabold leading-tight">Register for civic reporting or municipal operations</h1>
          <p className="mt-4 max-w-xl text-sm text-white/80">
            Citizens can submit and track complaints, while authorized administrators get control-room dashboards, clustering, and SLA visibility.
          </p>
        </section>

        <form onSubmit={onSubmit} className="app-panel border-0 p-8 sm:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent-strong)]">Account Setup</p>
          <h2 className="mt-2 text-3xl font-extrabold text-[var(--text-primary)]">Register</h2>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-medium text-[var(--text-primary)] sm:col-span-2">
              Full Name
              <input
                name="name"
                required
                value={form.name}
                onChange={onChange}
                className="mt-1 w-full rounded-xl border border-[var(--panel-border)] bg-white/70 px-4 py-2.5 outline-none ring-brand-300 focus:ring"
              />
            </label>

            <label className="block text-sm font-medium text-[var(--text-primary)] sm:col-span-2">
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
                minLength={6}
                value={form.password}
                onChange={onChange}
                className="mt-1 w-full rounded-xl border border-[var(--panel-border)] bg-white/70 px-4 py-2.5 outline-none ring-brand-300 focus:ring"
              />
            </label>

            <label className="block text-sm font-medium text-[var(--text-primary)]">
              Role
              <select
                name="role"
                value={form.role}
                onChange={onChange}
                className="mt-1 w-full rounded-xl border border-[var(--panel-border)] bg-white/70 px-4 py-2.5 outline-none ring-brand-300 focus:ring"
              >
                <option value="citizen">Citizen</option>
                <option value="admin">Admin</option>
              </select>
            </label>

            {form.role === 'admin' ? (
              <label className="block text-sm font-medium text-[var(--text-primary)] sm:col-span-2">
                Admin Registration Code
                <input
                  name="adminCode"
                  required
                  value={form.adminCode}
                  onChange={onChange}
                  className="mt-1 w-full rounded-xl border border-[var(--panel-border)] bg-white/70 px-4 py-2.5 outline-none ring-brand-300 focus:ring"
                />
              </label>
            ) : null}
          </div>

          {error ? <p className="mt-4 text-sm text-rose-600">{error}</p> : null}

          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full rounded-xl bg-[var(--accent-solid)] px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>

          <p className="mt-4 text-sm text-[var(--text-secondary)]">
            Have an account?{' '}
            <Link to="/login" className="font-semibold text-[var(--accent-strong)]">
              Login
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
};

export default RegisterPage;
