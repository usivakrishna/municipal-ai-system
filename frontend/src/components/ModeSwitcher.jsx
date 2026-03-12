import { useUi } from '../context/UiContext';

const ModeSwitcher = () => {
  const { mode, modes, setMode } = useUi();

  return (
    <div className="flex items-center gap-2">
      <select
        value={mode}
        onChange={(event) => setMode(event.target.value)}
        className="rounded-full border border-[var(--panel-border)] bg-[var(--panel-muted)] px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-primary)] xl:hidden"
      >
        {modes.map((item) => (
          <option key={item.id} value={item.id}>
            {item.label}
          </option>
        ))}
      </select>
      <div className="hidden items-center gap-2 rounded-full border border-[var(--panel-border)] bg-[var(--panel-muted)] px-2 py-1 xl:flex">
        {modes.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setMode(item.id)}
            className={`rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] transition ${
              mode === item.id
                ? 'bg-[var(--accent-solid)] text-white shadow-sm'
                : 'text-[var(--text-secondary)] hover:bg-white/70'
            }`}
            title={item.description}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ModeSwitcher;
