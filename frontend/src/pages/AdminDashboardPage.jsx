import { useEffect, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { Link } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import PageHeader from '../components/PageHeader';
import StatCard from '../components/StatCard';
import adminService from '../services/adminService';
import { useToast } from '../context/ToastContext';

const piePalette = ['#2f9a74', '#ff7a18', '#0ea5e9', '#ef4444', '#8b5cf6', '#f59e0b'];

const AdminDashboardPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { notify } = useToast();

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await adminService.getDashboard();
      setData(response);
    } catch (apiError) {
      const message = apiError.response?.data?.message || 'Failed to load dashboard';
      setError(message);
      notify({ title: 'Dashboard unavailable', message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return <LoadingSpinner label="Loading admin dashboard..." />;
  }

  if (!data) {
    return <p className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error || 'No dashboard data found'}</p>;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Authority Dashboard"
        title="Municipal Control Room"
        description="Oversee complaint velocity, SLA exposure, and AI-detected issue clusters from one operational surface."
        badge={`${data.totalComplaints} total complaints`}
        actions={
          <>
            <button
              type="button"
              onClick={fetchDashboard}
              className="rounded-full border border-white/30 bg-white/10 px-4 py-2 text-sm font-semibold text-white"
            >
              Refresh
            </button>
            <Link
              to="/admin/delayed"
              className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-[var(--accent-strong)]"
            >
              Open SLA Queue
            </Link>
          </>
        }
      />

      {error ? <p className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</p> : null}

      <section className="dashboard-grid">
        <StatCard title="Total Complaints" value={data.totalComplaints} accent="brand" />
        <StatCard title="Resolved" value={data.resolvedComplaints} accent="green" />
        <StatCard title="Pending" value={data.pendingComplaints} accent="orange" />
        <StatCard title="Delayed" value={data.delayedComplaints} accent="slate" subtitle="SLA violations" />
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <article className="app-panel rounded-[var(--radius-panel)] p-5">
          <h3 className="text-lg font-bold text-[var(--text-primary)]">Complaints by Category</h3>
          <p className="text-sm text-[var(--text-secondary)]">Identify dominant issue types across wards.</p>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data.complaintsByCategory} dataKey="count" nameKey="category" outerRadius={100} innerRadius={45}>
                  {data.complaintsByCategory.map((item, index) => (
                    <Cell key={item.category} fill={piePalette[index % piePalette.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="app-panel rounded-[var(--radius-panel)] p-5">
          <h3 className="text-lg font-bold text-[var(--text-primary)]">Monthly Complaint Trend</h3>
          <p className="text-sm text-[var(--text-secondary)]">Monitor complaint volume growth over time.</p>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="label" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#2f9a74" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </article>
      </section>

      <section className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <article className="app-panel rounded-[var(--radius-panel)] p-5">
          <h3 className="text-lg font-bold text-[var(--text-primary)]">Clustered Issues</h3>
          <p className="mb-4 text-sm text-[var(--text-secondary)]">AI grouped similar complaints for mass resolution strategy.</p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.clusteredIssues}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="clusterId" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#ff7a18" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="app-panel rounded-[var(--radius-panel)] p-5">
          <h3 className="text-lg font-bold text-[var(--text-primary)]">Performance</h3>
          <div className="mt-4 space-y-4 text-sm">
            <div className="rounded-xl bg-[var(--panel-muted)] p-4">
              <p className="text-[var(--text-secondary)]">SLA Violations</p>
              <p className="text-2xl font-extrabold text-[var(--accent-strong)]">{data.slaViolations}</p>
            </div>
            <div className="rounded-xl bg-[var(--panel-muted)] p-4">
              <p className="text-[var(--text-secondary)]">Avg Resolution Time</p>
              <p className="text-2xl font-extrabold text-[var(--text-primary)]">{data.averageResolutionHours} hrs</p>
            </div>
          </div>
        </article>
      </section>
    </div>
  );
};

export default AdminDashboardPage;
