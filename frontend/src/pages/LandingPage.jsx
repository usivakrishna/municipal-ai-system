import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <main className="app-shell flex min-h-screen items-center justify-center px-4 py-12">
      <section className="w-full max-w-7xl overflow-hidden rounded-[34px] border border-[var(--panel-border)] shadow-soft">
        <div className="grid gap-0 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="hero-banner p-10 lg:p-14">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/70">Municipal AI System</p>
            <h1 className="mt-4 text-4xl font-extrabold leading-tight sm:text-5xl">
              Automated complaint monitoring with AI-assisted civic operations
            </h1>
            <p className="mt-5 max-w-2xl text-sm text-white/80 sm:text-base">
              Submit civic complaints with evidence, track every case transparently, and equip authorities with
              classification, clustering, trend analysis, SLA controls, and operational modes in one professional workspace.
            </p>
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/15 bg-white/10 p-4">
                <h3 className="text-lg font-bold">Citizen Portal</h3>
                <p className="text-xs text-white/75">Track complaints and inspect AI-backed case summaries.</p>
              </div>
              <div className="rounded-2xl border border-white/15 bg-white/10 p-4">
                <h3 className="text-lg font-bold">Admin Control Room</h3>
                <p className="text-xs text-white/75">Monitor delays, clusters, and performance signals.</p>
              </div>
              <div className="rounded-2xl border border-white/15 bg-white/10 p-4">
                <h3 className="text-lg font-bold">UI Modes</h3>
                <p className="text-xs text-white/75">Executive, compact, and high-contrast operating modes.</p>
              </div>
            </div>
          </div>

          <div className="app-panel border-0 p-10 lg:p-12">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent-strong)]">Get Started</p>
            <h2 className="mt-3 text-3xl font-extrabold text-[var(--text-primary)]">Run cleaner municipal operations</h2>
            <p className="mt-4 text-sm text-[var(--text-secondary)]">
              Create an account to register complaints, or sign in as admin to monitor SLA violations, trends, and clustered issues.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/register"
                className="rounded-xl bg-[var(--accent-solid)] px-6 py-3 text-center text-sm font-semibold text-white"
              >
                Register
              </Link>
              <Link
                to="/login"
                className="rounded-xl border border-[var(--panel-border)] px-6 py-3 text-center text-sm font-semibold text-[var(--accent-strong)]"
              >
                Login
              </Link>
            </div>

            <div className="mt-10 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-800">
              Seed users available after backend seeding: `admin@municipal.gov / Admin@123` and `citizen@example.com / Citizen@123`.
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default LandingPage;
