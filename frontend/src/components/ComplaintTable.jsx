import StatusBadge from './StatusBadge';

const ComplaintTable = ({ complaints = [], showUser = false, actions }) => {
  if (complaints.length === 0) {
    return (
      <div className="app-panel rounded-[var(--radius-panel)] border-dashed p-8 text-center text-sm text-[var(--text-secondary)]">
        No complaints found.
      </div>
    );
  }

  return (
    <div className="app-panel overflow-hidden rounded-[var(--radius-panel)]">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-[var(--panel-muted)] text-xs uppercase tracking-wide text-[var(--accent-strong)]">
            <tr>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Location</th>
              <th className="px-4 py-3">Status</th>
              {showUser ? <th className="px-4 py-3">Citizen</th> : null}
              <th className="px-4 py-3">Department</th>
              <th className="px-4 py-3">Created</th>
              {actions ? <th className="px-4 py-3">Actions</th> : null}
            </tr>
          </thead>
          <tbody>
            {complaints.map((complaint) => (
              <tr key={complaint._id} className="border-t border-[var(--panel-border)]/80">
                <td className="px-4 py-3">
                  <p className="font-semibold text-[var(--text-primary)]">{complaint.title}</p>
                  <p className="mt-1 line-clamp-2 text-xs text-[var(--text-secondary)]">{complaint.description}</p>
                </td>
                <td className="px-4 py-3 text-[var(--text-primary)]">{complaint.category}</td>
                <td className="px-4 py-3 text-[var(--text-primary)]">{complaint.location}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={complaint.status} delayed={complaint.delayFlag} />
                </td>
                {showUser ? (
                  <td className="px-4 py-3 text-[var(--text-primary)]">{complaint.user?.name || 'Unknown'}</td>
                ) : null}
                <td className="px-4 py-3 text-[var(--text-primary)]">{complaint.department || 'Unassigned'}</td>
                <td className="px-4 py-3 text-[var(--text-primary)]">{new Date(complaint.createdAt).toLocaleDateString()}</td>
                {actions ? <td className="px-4 py-3">{actions(complaint)}</td> : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ComplaintTable;
