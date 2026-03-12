const StatusBadge = ({ status, delayed }) => {
  const statusStyles = {
    pending: 'bg-yellow-100 text-yellow-800',
    in_progress: 'bg-blue-100 text-blue-800',
    resolved: 'bg-emerald-100 text-emerald-800',
    rejected: 'bg-rose-100 text-rose-800'
  };

  const readableStatus = status ? status.replace('_', ' ') : 'unknown';

  return (
    <div className="flex flex-col gap-1">
      <span
        className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold capitalize ${
          statusStyles[status] || 'bg-slate-100 text-slate-700'
        }`}
      >
        {readableStatus}
      </span>
      {delayed ? (
        <span className="inline-flex w-fit rounded-full border border-rose-200 bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-700">
          Delayed
        </span>
      ) : null}
    </div>
  );
};

export default StatusBadge;
