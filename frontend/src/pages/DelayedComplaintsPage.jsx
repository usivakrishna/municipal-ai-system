import { useEffect, useMemo, useState } from 'react';
import ComplaintInsightDrawer from '../components/ComplaintInsightDrawer';
import ComplaintTable from '../components/ComplaintTable';
import LoadingSpinner from '../components/LoadingSpinner';
import PageHeader from '../components/PageHeader';
import StatCard from '../components/StatCard';
import adminService from '../services/adminService';
import complaintService from '../services/complaintService';
import { useToast } from '../context/ToastContext';

const statusOptions = ['pending', 'in_progress', 'resolved', 'rejected'];

const DelayedComplaintsPage = () => {
  const [complaints, setComplaints] = useState([]);
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState('');
  const [error, setError] = useState('');
  const [draft, setDraft] = useState({});
  const [selectedComplaintId, setSelectedComplaintId] = useState('');
  const { notify } = useToast();

  const fetchComplaints = async () => {
    setLoading(true);
    setError('');

    try {
      const data = await adminService.getDelayedComplaints({
        department: departmentFilter || undefined,
        category: categoryFilter || undefined
      });

      setComplaints(data.complaints || []);
      const nextDraft = {};
      (data.complaints || []).forEach((item) => {
        nextDraft[item._id] = {
          status: item.status,
          department: item.department || ''
        };
      });
      setDraft(nextDraft);
    } catch (apiError) {
      const message = apiError.response?.data?.message || 'Failed to load delayed complaints';
      setError(message);
      notify({ title: 'Delayed queue unavailable', message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const summary = useMemo(() => {
    const delayed = complaints.length;
    const escalated = complaints.filter((item) => (item.escalationLevel || 0) > 0).length;
    const oldestHours = complaints.reduce((max, item) => {
      const age = Math.floor((Date.now() - new Date(item.createdAt).getTime()) / 3600000);
      return Math.max(max, age);
    }, 0);

    return { delayed, escalated, oldestHours };
  }, [complaints]);

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
    if (!changes) {
      return;
    }

    setUpdatingId(complaintId);
    setError('');

    try {
      await complaintService.updateComplaint(complaintId, {
        status: changes.status,
        department: changes.department
      });
      notify({
        title: 'Delayed complaint updated',
        message: 'The delayed record has been reassigned or advanced successfully.',
        type: 'success'
      });
      await fetchComplaints();
    } catch (apiError) {
      const message = apiError.response?.data?.message || 'Failed to update delayed complaint';
      setError(message);
      notify({ title: 'SLA action failed', message, type: 'error' });
    } finally {
      setUpdatingId('');
    }
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
          View Case
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
          placeholder="Assign department"
          className="w-full rounded-lg border border-[var(--panel-border)] bg-white/70 px-2 py-2 text-xs"
        />
        <button
          type="button"
          disabled={updatingId === complaint._id}
          onClick={() => applyUpdate(complaint._id)}
          className="w-full rounded-lg bg-rose-500 px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white disabled:opacity-60"
        >
          {updatingId === complaint._id ? 'Saving...' : 'Resolve / Reassign'}
        </button>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="SLA Control"
        title="Delayed Complaint Command"
        description="Prioritize overdue complaints, inspect AI context, and reassign or resolve cases before escalations compound."
        badge={`${summary.delayed} delayed cases`}
        actions={
          <button
            type="button"
            onClick={fetchComplaints}
            className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-[var(--accent-strong)]"
          >
            Refresh Queue
          </button>
        }
      />

      <section className="dashboard-grid">
        <StatCard title="Delayed Complaints" value={summary.delayed} accent="slate" />
        <StatCard title="Escalated" value={summary.escalated} accent="orange" />
        <StatCard title="Oldest Delay" value={`${summary.oldestHours} hrs`} accent="brand" />
        <StatCard title="SLA Watch" value={summary.delayed - summary.escalated} accent="green" subtitle="Pending intervention" />
      </section>

      <section className="app-panel rounded-[var(--radius-panel)] p-5">
        <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
          <input
            value={categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value)}
            placeholder="Filter by category"
            className="rounded-xl border border-[var(--panel-border)] bg-white/70 px-4 py-2.5 outline-none ring-brand-300 focus:ring"
          />
          <input
            value={departmentFilter}
            onChange={(event) => setDepartmentFilter(event.target.value)}
            placeholder="Filter by department"
            className="rounded-xl border border-[var(--panel-border)] bg-white/70 px-4 py-2.5 outline-none ring-brand-300 focus:ring"
          />
          <button
            type="button"
            onClick={fetchComplaints}
            className="rounded-xl bg-[var(--accent-solid)] px-5 py-2.5 text-sm font-semibold text-white"
          >
            Apply Filters
          </button>
        </div>
      </section>

      {loading ? <LoadingSpinner label="Loading delayed complaints..." /> : null}
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

export default DelayedComplaintsPage;
