import { useEffect, useState } from 'react';
import ComplaintInsightDrawer from '../components/ComplaintInsightDrawer';
import ComplaintTable from '../components/ComplaintTable';
import LoadingSpinner from '../components/LoadingSpinner';
import PageHeader from '../components/PageHeader';
import complaintService from '../services/complaintService';
import { useToast } from '../context/ToastContext';

const statusOptions = ['pending', 'in_progress', 'resolved', 'rejected'];

const ComplaintListPage = () => {
  const [complaints, setComplaints] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState('');
  const [error, setError] = useState('');
  const [selectedComplaintId, setSelectedComplaintId] = useState('');
  const [draft, setDraft] = useState({});
  const { notify } = useToast();

  const fetchComplaints = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await complaintService.getComplaints({
        search: search || undefined,
        status: statusFilter || undefined,
        limit: 100
      });

      setComplaints(data.complaints || []);
      const initialDraft = {};
      (data.complaints || []).forEach((item) => {
        initialDraft[item._id] = {
          status: item.status,
          department: item.department || ''
        };
      });
      setDraft(initialDraft);
    } catch (apiError) {
      const message = apiError.response?.data?.message || 'Failed to load complaints';
      setError(message);
      notify({ title: 'Complaint list unavailable', message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const updateDraft = (complaintId, field, value) => {
    setDraft((prev) => ({
      ...prev,
      [complaintId]: {
        ...prev[complaintId],
        [field]: value
      }
    }));
  };

  const applyUpdate = async (complaintId) => {
    const changes = draft[complaintId];
    if (!changes) return;

    setUpdatingId(complaintId);
    setError('');

    try {
      await complaintService.updateComplaint(complaintId, {
        status: changes.status,
        department: changes.department
      });
      notify({
        title: 'Complaint updated',
        message: 'Status and department changes have been saved.',
        type: 'success'
      });
      await fetchComplaints();
    } catch (apiError) {
      const message = apiError.response?.data?.message || 'Failed to update complaint';
      setError(message);
      notify({ title: 'Update failed', message, type: 'error' });
    } finally {
      setUpdatingId('');
    }
  };

  const exportCsv = () => {
    const header = ['Title', 'Category', 'Location', 'Status', 'Citizen', 'Department', 'Created'];
    const rows = complaints.map((item) => [
      item.title,
      item.category,
      item.location,
      item.status,
      item.user?.name || 'Unknown',
      item.department || 'Unassigned',
      new Date(item.createdAt).toLocaleString()
    ]);
    const csv = [header, ...rows]
      .map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'municipal-complaints.csv';
    anchor.click();
    URL.revokeObjectURL(url);

    notify({
      title: 'CSV exported',
      message: `${complaints.length} complaints were exported for reporting.`,
      type: 'success'
    });
  };

  const actions = (complaint) => {
    const complaintDraft = draft[complaint._id] || {
      status: complaint.status,
      department: complaint.department
    };

    return (
      <div className="space-y-2">
        <button
          type="button"
          onClick={() => setSelectedComplaintId(complaint._id)}
          className="w-full rounded-lg border border-[var(--panel-border)] bg-[var(--panel-muted)] px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent-strong)]"
        >
          View Insights
        </button>
        <select
          value={complaintDraft.status}
          onChange={(event) => updateDraft(complaint._id, 'status', event.target.value)}
          className="w-full rounded-lg border border-[var(--panel-border)] bg-white/70 px-2 py-2 text-xs"
        >
          {statusOptions.map((item) => (
            <option key={item} value={item}>
              {item.replace('_', ' ')}
            </option>
          ))}
        </select>

        <input
          value={complaintDraft.department}
          onChange={(event) => updateDraft(complaint._id, 'department', event.target.value)}
          placeholder="Department"
          className="w-full rounded-lg border border-[var(--panel-border)] bg-white/70 px-2 py-2 text-xs"
        />

        <button
          type="button"
          disabled={updatingId === complaint._id}
          onClick={() => applyUpdate(complaint._id)}
          className="w-full rounded-lg bg-[var(--accent-solid)] px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white disabled:opacity-60"
        >
          {updatingId === complaint._id ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    );
  };

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Authority Operations"
        title="Complaint Operations Desk"
        description="Search the full complaint stream, inspect AI analysis, assign departments, and export operational reports."
        badge={`${complaints.length} visible records`}
        actions={
          <>
            <button
              type="button"
              onClick={fetchComplaints}
              className="rounded-full border border-white/30 bg-white/10 px-4 py-2 text-sm font-semibold text-white"
            >
              Refresh
            </button>
            <button
              type="button"
              onClick={exportCsv}
              className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-[var(--accent-strong)]"
            >
              Export CSV
            </button>
          </>
        }
      />

      <section className="app-panel rounded-[var(--radius-panel)] p-5">
        <div className="grid gap-3 md:grid-cols-[1fr_220px_auto]">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by title, description, location"
            className="rounded-xl border border-[var(--panel-border)] bg-white/70 px-4 py-2.5 outline-none ring-brand-300 focus:ring"
          />
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="rounded-xl border border-[var(--panel-border)] bg-white/70 px-4 py-2.5 outline-none ring-brand-300 focus:ring"
          >
            <option value="">All statuses</option>
            {statusOptions.map((item) => (
              <option key={item} value={item}>
                {item.replace('_', ' ')}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={fetchComplaints}
            className="rounded-xl bg-[var(--accent-solid)] px-5 py-2.5 text-sm font-semibold text-white"
          >
            Search
          </button>
        </div>
      </section>

      {loading ? <LoadingSpinner label="Loading complaint list..." /> : null}
      {error ? <p className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</p> : null}
      {!loading ? <ComplaintTable complaints={complaints} showUser actions={actions} /> : null}

      <ComplaintInsightDrawer
        complaintId={selectedComplaintId}
        open={Boolean(selectedComplaintId)}
        onClose={() => setSelectedComplaintId('')}
      />
    </div>
  );
};

export default ComplaintListPage;
