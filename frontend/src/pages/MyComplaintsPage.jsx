import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import ComplaintInsightDrawer from '../components/ComplaintInsightDrawer';
import ComplaintTable from '../components/ComplaintTable';
import LoadingSpinner from '../components/LoadingSpinner';
import PageHeader from '../components/PageHeader';
import complaintService from '../services/complaintService';
import { getUploadUrl } from '../services/api';
import { useToast } from '../context/ToastContext';

const MyComplaintsPage = () => {
  const [complaints, setComplaints] = useState([]);
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedComplaintId, setSelectedComplaintId] = useState('');
  const [deletingId, setDeletingId] = useState('');
  const { notify } = useToast();

  const fetchComplaints = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await complaintService.getComplaints({ status: status || undefined, search: search || undefined, limit: 100 });
      setComplaints(data.complaints || []);
    } catch (apiError) {
      const message = apiError.response?.data?.message || 'Failed to load complaints';
      setError(message);
      notify({ title: 'Unable to load complaints', message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [status]);

  const imageComplaints = useMemo(
    () => complaints.filter((complaint) => complaint.image).slice(0, 4),
    [complaints]
  );

  const summary = useMemo(() => {
    const total = complaints.length;
    const delayed = complaints.filter((item) => item.delayFlag).length;
    const resolved = complaints.filter((item) => item.status === 'resolved').length;
    return { total, delayed, resolved };
  }, [complaints]);

  const handleDelete = async (complaintId) => {
    setDeletingId(complaintId);
    setError('');
    try {
      await complaintService.deleteComplaint(complaintId);
      notify({
        title: 'Complaint removed',
        message: 'The pending complaint has been deleted from your queue.',
        type: 'success'
      });
      await fetchComplaints();
    } catch (apiError) {
      const message = apiError.response?.data?.message || 'Failed to delete complaint';
      setError(message);
      notify({ title: 'Delete failed', message, type: 'error' });
    } finally {
      setDeletingId('');
    }
  };

  const actions = (complaint) => (
    <div className="space-y-2">
      <button
        type="button"
        onClick={() => setSelectedComplaintId(complaint._id)}
        className="w-full rounded-lg border border-[var(--panel-border)] bg-[var(--panel-muted)] px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent-strong)]"
      >
        View Insights
      </button>
      {complaint.status === 'pending' ? (
        <button
          type="button"
          disabled={deletingId === complaint._id}
          onClick={() => handleDelete(complaint._id)}
          className="w-full rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-rose-700 disabled:opacity-60"
        >
          {deletingId === complaint._id ? 'Deleting...' : 'Delete Pending'}
        </button>
      ) : null}
    </div>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Citizen Tracking"
        title="Complaint Portfolio"
        description="Review every complaint, inspect AI analysis, and remove pending reports before assignment."
        badge={`${summary.total} active records`}
        actions={
          <>
            <button
              type="button"
              onClick={fetchComplaints}
              className="rounded-full border border-white/30 bg-white/10 px-4 py-2 text-sm font-semibold text-white"
            >
              Refresh
            </button>
            <Link
              to="/citizen/submit"
              className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-[var(--accent-strong)]"
            >
              New Complaint
            </Link>
          </>
        }
      />

      <section className="dashboard-grid">
        <div className="app-panel rounded-[var(--radius-panel)] p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]">Tracked</p>
          <p className="mt-2 text-3xl font-extrabold text-[var(--text-primary)]">{summary.total}</p>
        </div>
        <div className="app-panel rounded-[var(--radius-panel)] p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]">Resolved</p>
          <p className="mt-2 text-3xl font-extrabold text-[var(--text-primary)]">{summary.resolved}</p>
        </div>
        <div className="app-panel rounded-[var(--radius-panel)] p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]">Delayed</p>
          <p className="mt-2 text-3xl font-extrabold text-[var(--text-primary)]">{summary.delayed}</p>
        </div>
      </section>

      <section className="app-panel rounded-[var(--radius-panel)] p-5">
        <div className="grid gap-4 md:grid-cols-[1fr_220px_auto]">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search complaints..."
            className="rounded-xl border border-[var(--panel-border)] bg-white/70 px-4 py-2.5 outline-none ring-brand-300 focus:ring"
          />
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="rounded-xl border border-[var(--panel-border)] bg-white/70 px-4 py-2.5 outline-none ring-brand-300 focus:ring"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="rejected">Rejected</option>
          </select>
          <button
            type="button"
            onClick={fetchComplaints}
            className="rounded-xl bg-[var(--accent-solid)] px-5 py-2.5 text-sm font-semibold text-white"
          >
            Apply Filters
          </button>
        </div>
      </section>

      {loading ? <LoadingSpinner label="Loading complaints..." /> : null}
      {error ? <p className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</p> : null}
      {!loading ? <ComplaintTable complaints={complaints} actions={actions} /> : null}

      <section className="app-panel rounded-[var(--radius-panel)] p-5">
        <h3 className="text-lg font-bold text-[var(--text-primary)]">Evidence Gallery</h3>
        <p className="mb-4 text-sm text-[var(--text-secondary)]">Recently attached complaint images.</p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {imageComplaints.length === 0 ? (
            <p className="text-sm text-[var(--text-secondary)]">No evidence images uploaded yet.</p>
          ) : (
            imageComplaints.map((item) => (
              <figure key={item._id} className="overflow-hidden rounded-xl border border-[var(--panel-border)] bg-[var(--panel-muted)]">
                <img src={getUploadUrl(item.image)} alt={item.title} className="h-32 w-full object-cover" />
                <figcaption className="p-2 text-xs text-[var(--text-secondary)]">{item.title}</figcaption>
              </figure>
            ))
          )}
        </div>
      </section>

      <ComplaintInsightDrawer
        complaintId={selectedComplaintId}
        open={Boolean(selectedComplaintId)}
        onClose={() => setSelectedComplaintId('')}
      />
    </div>
  );
};

export default MyComplaintsPage;
