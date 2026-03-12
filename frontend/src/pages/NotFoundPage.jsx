import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <main className="app-shell flex min-h-screen items-center justify-center px-4">
      <div className="app-panel rounded-[30px] p-10 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent-strong)]">Error 404</p>
        <h1 className="mt-2 text-3xl font-extrabold text-[var(--text-primary)]">Page not found</h1>
        <p className="mt-3 text-sm text-[var(--text-secondary)]">The page you are looking for does not exist.</p>
        <Link
          to="/"
          className="mt-6 inline-flex rounded-xl bg-[var(--accent-solid)] px-5 py-2.5 text-sm font-semibold text-white"
        >
          Go to Home
        </Link>
      </div>
    </main>
  );
};

export default NotFoundPage;
