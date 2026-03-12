import { Link, useLocation } from 'react-router-dom';
import ModeSwitcher from './ModeSwitcher';

const Topbar = ({ title, user, workspace, onToggleSidebar, onLogout }) => {
  const location = useLocation();
  const workspacePill = workspace === 'admin' ? 'Authority Workspace' : 'Citizen Workspace';

  return (
    <header className="sticky top-0 z-20 border-b border-[var(--panel-border)] bg-[var(--panel-bg)]/90 backdrop-blur">
      <div className="flex items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-10">
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="rounded-lg border border-[var(--panel-border)] px-3 py-2 text-xs font-semibold uppercase tracking-wide text-[var(--accent-strong)] lg:hidden"
            onClick={onToggleSidebar}
          >
            Menu
          </button>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-bold text-[var(--text-primary)] sm:text-xl">{title}</h2>
              <span className="rounded-full border border-[var(--panel-border)] bg-[var(--panel-muted)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--accent-strong)]">
                {workspacePill}
              </span>
            </div>
            <p className="text-xs text-[var(--text-secondary)]">AI-backed complaint monitoring with live operational modes</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-3">
          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-2 xl:flex">
              {user?.role === 'admin' ? (
                <>
                  <Link
                    to="/admin"
                    className={`rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] ${
                      location.pathname.startsWith('/admin')
                        ? 'bg-[var(--accent-solid)] text-white'
                        : 'border border-[var(--panel-border)] bg-[var(--panel-muted)] text-[var(--text-secondary)]'
                    }`}
                  >
                    Admin
                  </Link>
                  <Link
                    to="/citizen"
                    className={`rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] ${
                      location.pathname.startsWith('/citizen')
                        ? 'bg-[var(--accent-solid)] text-white'
                        : 'border border-[var(--panel-border)] bg-[var(--panel-muted)] text-[var(--text-secondary)]'
                    }`}
                  >
                    Citizen
                  </Link>
                </>
              ) : null}
            </div>
            <ModeSwitcher />
          </div>
          <div className="hidden rounded-full border border-[var(--panel-border)] bg-[var(--panel-muted)] px-4 py-2 text-sm font-medium text-[var(--accent-strong)] sm:block">
            {user?.name} ({user?.role})
          </div>
          <button
            type="button"
            className="rounded-lg bg-[var(--accent-solid)] px-4 py-2 text-sm font-semibold text-white shadow-sm"
            onClick={onLogout}
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
