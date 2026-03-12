const LoadingSpinner = ({ label = 'Loading...' }) => {
  return (
    <div className="app-panel flex items-center gap-3 rounded-[20px] px-4 py-3 text-[var(--accent-strong)]">
      <div className="h-4 w-4 animate-spin rounded-full border-2 border-brand-300 border-t-brand-700" />
      <span className="text-sm font-medium">{label}</span>
    </div>
  );
};

export default LoadingSpinner;
