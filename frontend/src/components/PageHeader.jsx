const PageHeader = ({ eyebrow, title, description, actions, badge }) => {
  return (
    <section className="hero-banner overflow-hidden rounded-[30px] border border-white/10 px-6 py-6 shadow-soft sm:px-8 sm:py-8">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div className="max-w-3xl">
          {eyebrow ? <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[var(--accent-strong)]">{eyebrow}</p> : null}
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <h1 className="page-title text-3xl font-extrabold sm:text-4xl">{title}</h1>
            {badge ? (
              <span className="rounded-full border border-white/45 bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent-strong)]">
                {badge}
              </span>
            ) : null}
          </div>
          {description ? <p className="page-subtitle mt-3 max-w-2xl text-sm sm:text-base">{description}</p> : null}
        </div>
        {actions ? <div className="flex flex-wrap items-center gap-3">{actions}</div> : null}
      </div>
    </section>
  );
};

export default PageHeader;
