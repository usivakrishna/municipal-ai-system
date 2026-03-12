import { useEffect, useMemo, useState } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { Link } from 'react-router-dom';
import ComplaintInsightDrawer from '../components/ComplaintInsightDrawer';
import ComplaintTable from '../components/ComplaintTable';
import LoadingSpinner from '../components/LoadingSpinner';
import PageHeader from '../components/PageHeader';
import StatCard from '../components/StatCard';
import complaintService from '../services/complaintService';
import { useToast } from '../context/ToastContext';

const CitizenDashboardPage = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedComplaintId, setSelectedComplaintId] = useState('');
  const { notify } = useToast();

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await complaintService.getComplaints({ limit: 100 });
      setComplaints(data.complaints || []);
    } catch (apiError) {
      const message = apiError.response?.data?.message || 'Failed to load complaints';
      setError(message);
      notify({ title: 'Dashboard unavailable', message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const stats = useMemo(() => {
    const total = complaints.length;
    const resolved = complaints.filter((item) => item.status === 'resolved').length;
    const pending = complaints.filter((item) => ['pending', 'in_progress'].includes(item.status)).length;
    const delayed = complaints.filter((item) => item.delayFlag).length;

    return { total, resolved, pending, delayed };
  }, [complaints]);

  const statusData = useMemo(
    () => [
      { name: 'Resolved', value: stats.resolved, color: '#22c55e' },
      { name: 'Pending', value: stats.pending, color: '#f59e0b' },
      { name: 'Delayed', value: stats.delayed, color: '#ef4444' }
    ],
    [stats]
  );

  const topCategories = useMemo(() => {
    const categoryMap = complaints.reduce((accumulator, complaint) => {
      accumulator[complaint.category] = (accumulator[complaint.category] || 0) + 1;
      return accumulator;
    }, {});

    return Object.entries(categoryMap)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);
  }, [complaints]);

  if (loading) {
    return <LoadingSpinner label="Loading citizen dashboard..." />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Citizen Workspace"
        title="Personal Complaint Overview"
        description="Track open issues, inspect AI-generated insights, and move quickly between submission and follow-up actions."
        badge={`${stats.total} tracked complaints`}
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
              Submit Issue
            </Link>
          </>
        }
      />

      {error ? <p className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</p> : null}

      <section className="dashboard-grid">
        <StatCard title="Total Complaints" value={stats.total} accent="brand" />
        <StatCard title="Resolved" value={stats.resolved} accent="green" />
        <StatCard title="Pending" value={stats.pending} accent="orange" />
        <StatCard title="Delayed" value={stats.delayed} accent="slate" subtitle="SLA flagged" />
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <div className="app-panel rounded-[var(--radius-panel)] p-5 xl:col-span-2">
          <h3 className="text-lg font-bold text-[var(--text-primary)]">Recent Complaints</h3>
          <p className="mb-4 text-sm text-[var(--text-secondary)]">Track latest status updates and inspect case intelligence.</p>
          <ComplaintTable
            complaints={complaints.slice(0, 5)}
            actions={(complaint) => (
              <button
                type="button"
                onClick={() => setSelectedComplaintId(complaint._id)}
                className="rounded-lg border border-[var(--panel-border)] bg-[var(--panel-muted)] px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent-strong)]"
              >
                View
              </button>
            )}
          />
        </div>

        <div className="app-panel rounded-[var(--radius-panel)] p-5">
          <h3 className="text-lg font-bold text-[var(--text-primary)]">Status Distribution</h3>
          <p className="mb-4 text-sm text-[var(--text-secondary)]">Interactive overview of your complaints.</p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusData} dataKey="value" nameKey="name" outerRadius={95} innerRadius={45}>
                  {statusData.map((item) => (
                    <Cell key={item.name} fill={item.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      <section className="app-panel rounded-[var(--radius-panel)] p-5">
        <h3 className="text-lg font-bold text-[var(--text-primary)]">Priority Themes</h3>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {topCategories.length === 0 ? (
            <p className="text-sm text-[var(--text-secondary)]">No category distribution available yet.</p>
          ) : (
            topCategories.map((item) => (
              <div key={item.category} className="rounded-[22px] border border-[var(--panel-border)] bg-[var(--panel-muted)] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]">{item.category}</p>
                <p className="mt-2 text-3xl font-extrabold text-[var(--text-primary)]">{item.count}</p>
              </div>
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

export default CitizenDashboardPage;
