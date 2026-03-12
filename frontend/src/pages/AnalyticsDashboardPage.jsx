import { useEffect, useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import LoadingSpinner from '../components/LoadingSpinner';
import PageHeader from '../components/PageHeader';
import StatCard from '../components/StatCard';
import adminService from '../services/adminService';
import { useToast } from '../context/ToastContext';

const palette = ['#2f9a74', '#ff7a18', '#0ea5e9', '#ef4444', '#0f766e', '#8b5cf6'];

const AnalyticsDashboardPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { notify } = useToast();

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await adminService.getDashboard();
      setData(response);
    } catch (apiError) {
      const message = apiError.response?.data?.message || 'Failed to load analytics';
      setError(message);
      notify({ title: 'Analytics unavailable', message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const insights = useMemo(() => {
    if (!data) {
      return [];
    }

    const dominantCategory = data.complaintsByCategory?.[0];
    const topMonth = [...(data.monthlyTrend || [])].sort((a, b) => b.count - a.count)[0];
    const biggestCluster = [...(data.clusteredIssues || [])].sort((a, b) => b.count - a.count)[0];

    return [
      dominantCategory
        ? `Highest complaint volume is in ${dominantCategory.category} with ${dominantCategory.count} complaints.`
        : 'No category trend available yet.',
      topMonth
        ? `Peak monthly demand occurred in ${topMonth.label} with ${topMonth.count} complaints.`
        : 'No monthly trend available yet.',
      biggestCluster
        ? `Largest AI cluster is #${biggestCluster.clusterId} with ${biggestCluster.count} related issues.`
        : 'No clustering insight available yet.'
    ];
  }, [data]);

  if (loading) {
    return <LoadingSpinner label="Loading analytics dashboard..." />;
  }

  if (!data) {
    return <p className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error || 'No analytics data found'}</p>;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Trend Intelligence"
        title="Analytics Dashboard"
        description="Use historical trend lines, category pressure, and cluster volume to drive resource allocation and strategic interventions."
        badge={`${data.totalComplaints} records analyzed`}
        actions={
          <button
            type="button"
            onClick={fetchAnalytics}
            className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-[var(--accent-strong)]"
          >
            Refresh Analytics
          </button>
        }
      />

      {error ? <p className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</p> : null}

      <section className="dashboard-grid">
        <StatCard title="Total Complaints" value={data.totalComplaints} accent="brand" />
        <StatCard title="Resolved" value={data.resolvedComplaints} accent="green" />
        <StatCard title="Delayed" value={data.delayedComplaints} accent="slate" />
        <StatCard title="Avg Resolution" value={`${data.averageResolutionHours} hrs`} accent="orange" />
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <article className="app-panel rounded-[var(--radius-panel)] p-5">
          <h3 className="text-lg font-bold text-[var(--text-primary)]">Category Distribution</h3>
          <p className="text-sm text-[var(--text-secondary)]">Which departments face the highest incoming load.</p>
          <div className="mt-4 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.complaintsByCategory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="category" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                  {(data.complaintsByCategory || []).map((item, index) => (
                    <Cell key={item.category} fill={palette[index % palette.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="app-panel rounded-[var(--radius-panel)] p-5">
          <h3 className="text-lg font-bold text-[var(--text-primary)]">Monthly Trend</h3>
          <p className="text-sm text-[var(--text-secondary)]">Complaint intake over the latest 12-month window.</p>
          <div className="mt-4 h-80">
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

      <section className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <article className="app-panel rounded-[var(--radius-panel)] p-5">
          <h3 className="text-lg font-bold text-[var(--text-primary)]">Trend Signals</h3>
          <div className="mt-4 space-y-3">
            {insights.map((item) => (
              <div key={item} className="rounded-xl border border-[var(--panel-border)] bg-[var(--panel-muted)] p-4 text-sm text-[var(--text-primary)]">
                {item}
              </div>
            ))}
          </div>
        </article>

        <article className="app-panel rounded-[var(--radius-panel)] p-5">
          <h3 className="text-lg font-bold text-[var(--text-primary)]">Cluster Load</h3>
          <p className="text-sm text-[var(--text-secondary)]">Issue group sizes detected by the AI service.</p>
          <div className="mt-4 h-72">
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
      </section>
    </div>
  );
};

export default AnalyticsDashboardPage;
