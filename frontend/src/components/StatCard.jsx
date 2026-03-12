const StatCard = ({ title, value, accent = 'brand', subtitle }) => {
  const accentClasses = {
    brand: 'from-brand-500/15 to-brand-100/40 border-brand-200',
    orange: 'from-accent-500/15 to-orange-100/40 border-orange-200',
    slate: 'from-slate-400/10 to-slate-100/50 border-slate-200',
    green: 'from-emerald-500/15 to-emerald-100/40 border-emerald-200'
  };

  return (
    <article
      className={`app-panel rounded-[var(--radius-panel)] border bg-gradient-to-br p-5 transition hover:-translate-y-0.5 ${
        accentClasses[accent] || accentClasses.brand
      }`}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-secondary)]">{title}</p>
      <h3 className="mt-2 text-3xl font-extrabold text-[var(--text-primary)]">{value}</h3>
      {subtitle ? <p className="mt-1 text-sm text-[var(--text-secondary)]">{subtitle}</p> : null}
    </article>
  );
};

export default StatCard;
