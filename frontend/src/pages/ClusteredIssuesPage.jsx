import { useEffect, useState } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import LoadingSpinner from '../components/LoadingSpinner';
import PageHeader from '../components/PageHeader';
import adminService from '../services/adminService';
import { useToast } from '../context/ToastContext';

const ClusteredIssuesPage = () => {
  const [clusters, setClusters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { notify } = useToast();

  const fetchClusters = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await adminService.getDashboard();
      setClusters(response.clusteredIssues || []);
    } catch (apiError) {
      const message = apiError.response?.data?.message || 'Failed to load clustered issues';
      setError(message);
      notify({ title: 'Cluster feed unavailable', message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClusters();
  }, []);

  if (loading) {
    return <LoadingSpinner label="Loading clustered issues..." />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="AI Grouping"
        title="Clustered Issue Monitor"
        description="Review AI-grouped complaint families to coordinate bulk actions, street-level campaigns, and department-level interventions."
        badge={`${clusters.length} active clusters`}
        actions={
          <button
            type="button"
            onClick={fetchClusters}
            className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-[var(--accent-strong)]"
          >
            Refresh Clusters
          </button>
        }
      />

      {error ? <p className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</p> : null}

      <section className="app-panel rounded-[var(--radius-panel)] p-5">
        <h3 className="text-lg font-bold text-[var(--text-primary)]">Cluster Volume</h3>
        <p className="text-sm text-[var(--text-secondary)]">Grouped complaints that can be addressed with one coordinated response.</p>
        <div className="mt-4 h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={clusters}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="clusterId" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#2f9a74" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        {clusters.length === 0 ? (
          <div className="app-panel rounded-[var(--radius-panel)] border-dashed p-8 text-center text-sm text-[var(--text-secondary)]">
            No clustered issues available yet.
          </div>
        ) : (
          clusters.map((cluster) => (
            <article key={cluster.clusterId} className="app-panel rounded-[var(--radius-panel)] p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent-strong)]">
                    Cluster #{cluster.clusterId}
                  </p>
                  <h3 className="mt-2 text-xl font-bold text-[var(--text-primary)]">{cluster.sampleTitle || 'Grouped issue set'}</h3>
                </div>
                <div className="rounded-full bg-[var(--panel-muted)] px-4 py-2 text-sm font-semibold text-[var(--accent-strong)]">
                  {cluster.count} issues
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {(cluster.keywords || []).length > 0 ? (
                  cluster.keywords.map((keyword) => (
                    <span
                      key={`${cluster.clusterId}-${keyword}`}
                      className="rounded-full border border-[var(--panel-border)] bg-[var(--panel-muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--accent-strong)]"
                    >
                      {keyword}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-[var(--text-secondary)]">No keywords extracted for this cluster.</span>
                )}
              </div>
            </article>
          ))
        )}
      </section>
    </div>
  );
};

export default ClusteredIssuesPage;
