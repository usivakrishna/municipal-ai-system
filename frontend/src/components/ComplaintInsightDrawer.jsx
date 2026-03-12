import { useEffect, useState } from 'react';
import complaintService from '../services/complaintService';
import { getUploadUrl } from '../services/api';
import LoadingSpinner from './LoadingSpinner';
import StatusBadge from './StatusBadge';

const formatDate = (value) => {
  if (!value) {
    return 'Not available';
  }
  return new Date(value).toLocaleString();
};

const ComplaintInsightDrawer = ({ complaintId, open, onClose }) => {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open || !complaintId) {
      return undefined;
    }

    let active = true;
    setLoading(true);
    setError('');
    setDetail(null);

    complaintService
      .getComplaintById(complaintId)
      .then((response) => {
        if (active) {
          setDetail(response);
        }
      })
      .catch((apiError) => {
        if (active) {
          setError(apiError.response?.data?.message || 'Failed to load complaint details');
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [complaintId, open]);

  if (!open) {
    return null;
  }

  const complaint = detail?.complaint;
  const analysis = detail?.analysis;

  return (
    <div className="fixed inset-0 z-[60] flex justify-end">
      <button type="button" className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" onClick={onClose} />
      <aside className="relative h-full w-full max-w-2xl overflow-y-auto border-l border-[var(--panel-border)] bg-[var(--panel-bg)] px-5 py-5 shadow-soft sm:px-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--accent-strong)]">Complaint Intelligence</p>
            <h2 className="mt-2 text-2xl font-extrabold text-[var(--text-primary)]">
              {complaint?.title || 'Complaint details'}
            </h2>
          </div>
          <button
            type="button"
            className="rounded-full border border-[var(--panel-border)] px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]"
            onClick={onClose}
          >
            Close
          </button>
        </div>

        {loading ? <div className="mt-6"><LoadingSpinner label="Loading complaint details..." /></div> : null}
        {error ? <p className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p> : null}

        {!loading && complaint ? (
          <div className="mt-6 space-y-6">
            <section className="app-panel rounded-[24px] px-5 py-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-3">
                  <StatusBadge status={complaint.status} delayed={complaint.delayFlag} />
                  <p className="text-sm leading-7 text-[var(--text-primary)]">{complaint.description}</p>
                </div>
                <div className="grid gap-2 text-sm text-[var(--text-secondary)]">
                  <div><span className="font-semibold text-[var(--text-primary)]">Category:</span> {complaint.category}</div>
                  <div><span className="font-semibold text-[var(--text-primary)]">Location:</span> {complaint.location}</div>
                  <div><span className="font-semibold text-[var(--text-primary)]">Department:</span> {complaint.department || 'Unassigned'}</div>
                  <div><span className="font-semibold text-[var(--text-primary)]">Created:</span> {formatDate(complaint.createdAt)}</div>
                  <div><span className="font-semibold text-[var(--text-primary)]">Resolved:</span> {formatDate(complaint.resolvedAt)}</div>
                  <div><span className="font-semibold text-[var(--text-primary)]">Cluster:</span> {complaint.aiCluster >= 0 ? `#${complaint.aiCluster}` : 'Not clustered yet'}</div>
                </div>
              </div>
            </section>

            {complaint.image ? (
              <section className="app-panel rounded-[24px] px-5 py-5">
                <h3 className="text-lg font-bold text-[var(--text-primary)]">Evidence</h3>
                <img
                  src={getUploadUrl(complaint.image)}
                  alt={complaint.title}
                  className="mt-4 max-h-80 w-full rounded-2xl object-cover"
                />
              </section>
            ) : null}

            <section className="app-panel rounded-[24px] px-5 py-5">
              <h3 className="text-lg font-bold text-[var(--text-primary)]">AI Summary</h3>
              {analysis ? (
                <div className="mt-4 space-y-4">
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="rounded-2xl bg-[var(--panel-muted)] px-4 py-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]">Predicted</p>
                      <p className="mt-2 text-lg font-bold text-[var(--text-primary)]">{analysis.predictedCategory}</p>
                    </div>
                    <div className="rounded-2xl bg-[var(--panel-muted)] px-4 py-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]">Confidence</p>
                      <p className="mt-2 text-lg font-bold text-[var(--text-primary)]">{Math.round((analysis.confidence || 0) * 100)}%</p>
                    </div>
                    <div className="rounded-2xl bg-[var(--panel-muted)] px-4 py-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]">Cluster ID</p>
                      <p className="mt-2 text-lg font-bold text-[var(--text-primary)]">
                        {analysis.clusterId >= 0 ? `#${analysis.clusterId}` : 'Pending'}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-secondary)]">Keywords</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {(analysis.keywords || []).length > 0 ? (
                        analysis.keywords.map((keyword) => (
                          <span
                            key={keyword}
                            className="rounded-full border border-[var(--panel-border)] bg-[var(--panel-muted)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--accent-strong)]"
                          >
                            {keyword}
                          </span>
                        ))
                      ) : (
                        <span className="text-sm text-[var(--text-secondary)]">No keywords extracted yet.</span>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="mt-3 text-sm text-[var(--text-secondary)]">AI insights are not available for this complaint yet.</p>
              )}
            </section>
          </div>
        ) : null}
      </aside>
    </div>
  );
};

export default ComplaintInsightDrawer;
