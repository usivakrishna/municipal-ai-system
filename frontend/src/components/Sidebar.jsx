import { NavLink } from 'react-router-dom';

const Sidebar = ({ links, open, setOpen, mode }) => {
  return (
    <aside
      className={`fixed left-0 top-0 z-40 h-screen w-72 transform border-r border-[var(--panel-border)] bg-[var(--panel-bg)]/95 p-6 shadow-soft backdrop-blur transition-transform duration-300 lg:translate-x-0 ${
        open ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="mb-8 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--accent-strong)]">Municipal AI</p>
          <h1 className="text-xl font-extrabold text-[var(--text-primary)]">Command Center</h1>
          <p className="mt-2 text-xs text-[var(--text-secondary)]">
            {mode === 'admin' ? 'Operational oversight and SLA control.' : 'Citizen reporting and follow-up workspace.'}
          </p>
        </div>
        <button
          className="rounded-md border border-[var(--panel-border)] px-2 py-1 text-sm text-[var(--text-secondary)] lg:hidden"
          onClick={() => setOpen(false)}
          type="button"
        >
          Close
        </button>
      </div>

      <nav className="space-y-2">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) =>
              `block rounded-xl border px-4 py-3 text-sm font-medium transition ${
                isActive
                  ? 'border-transparent bg-[var(--accent-solid)] text-white shadow-lg'
                  : 'border-transparent text-[var(--text-secondary)] hover:border-[var(--panel-border)] hover:bg-[var(--panel-muted)] hover:text-[var(--accent-strong)]'
              }`
            }
            onClick={() => setOpen(false)}
          >
            {link.label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-8 rounded-[22px] border border-[var(--panel-border)] bg-[var(--panel-muted)] p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent-strong)]">Automation</p>
        <p className="mt-2 text-sm font-semibold text-[var(--text-primary)]">AI analysis and hourly SLA worker active</p>
        <p className="mt-2 text-xs leading-6 text-[var(--text-secondary)]">
          Category detection, clustering, delay flagging, and escalation monitoring are integrated into this workspace.
        </p>
      </div>
    </aside>
  );
};

export default Sidebar;
