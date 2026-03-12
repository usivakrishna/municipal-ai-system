import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import complaintService from '../services/complaintService';
import { useToast } from '../context/ToastContext';

const categories = [
  'Sanitation',
  'Water Supply',
  'Road',
  'Drainage',
  'Streetlight',
  'Public Safety',
  'Other'
];

const operationalTips = [
  'Use a location with a landmark or ward identifier.',
  'Explain when the issue started and how severe it is.',
  'Attach a clear image if public safety or infrastructure is affected.'
];

const SubmitComplaintPage = () => {
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: categories[0],
    location: '',
    image: null
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const { notify } = useToast();

  const onChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onFileChange = (event) => {
    const file = event.target.files?.[0] || null;
    setForm((prev) => ({ ...prev, image: file }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const payload = new FormData();
      payload.append('title', form.title);
      payload.append('description', form.description);
      payload.append('category', form.category);
      payload.append('location', form.location);
      if (form.image) {
        payload.append('image', form.image);
      }

      await complaintService.createComplaint(payload);
      setSuccess('Complaint submitted successfully');
      notify({
        title: 'Complaint submitted',
        message: 'Your complaint has been registered and queued for AI analysis.',
        type: 'success'
      });
      setTimeout(() => navigate('/citizen/complaints'), 900);
    } catch (apiError) {
      const message = apiError.response?.data?.message || 'Failed to submit complaint';
      setError(message);
      notify({ title: 'Submission failed', message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Submission Desk"
        title="Submit Municipal Complaint"
        description="Provide clear operational detail so the issue can be routed accurately, scored by AI, and resolved faster."
        badge="Citizen intake"
      />

      <div className="grid gap-6 xl:grid-cols-[1.8fr_1fr]">
        <section className="app-panel rounded-[var(--radius-panel)] p-6 sm:p-8">
          <form onSubmit={onSubmit} className="grid gap-4">
            <label className="text-sm font-medium text-[var(--text-primary)]">
              Complaint Title
              <input
                name="title"
                required
                minLength={5}
                value={form.title}
                onChange={onChange}
                className="mt-1 w-full rounded-xl border border-[var(--panel-border)] bg-white/70 px-4 py-2.5 outline-none ring-brand-300 focus:ring"
                placeholder="Ex: Street light not working in Ward 5"
              />
            </label>

            <label className="text-sm font-medium text-[var(--text-primary)]">
              Description
              <textarea
                name="description"
                required
                minLength={10}
                rows={5}
                value={form.description}
                onChange={onChange}
                className="mt-1 w-full rounded-xl border border-[var(--panel-border)] bg-white/70 px-4 py-2.5 outline-none ring-brand-300 focus:ring"
                placeholder="Describe the issue with exact details..."
              />
            </label>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="text-sm font-medium text-[var(--text-primary)]">
                Category
                <select
                  name="category"
                  value={form.category}
                  onChange={onChange}
                  className="mt-1 w-full rounded-xl border border-[var(--panel-border)] bg-white/70 px-4 py-2.5 outline-none ring-brand-300 focus:ring"
                >
                  {categories.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>

              <label className="text-sm font-medium text-[var(--text-primary)]">
                Location
                <input
                  name="location"
                  required
                  minLength={3}
                  value={form.location}
                  onChange={onChange}
                  className="mt-1 w-full rounded-xl border border-[var(--panel-border)] bg-white/70 px-4 py-2.5 outline-none ring-brand-300 focus:ring"
                  placeholder="Ward number / nearest landmark"
                />
              </label>
            </div>

            <label className="text-sm font-medium text-[var(--text-primary)]">
              Upload Image Evidence
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={onFileChange}
                className="mt-1 w-full rounded-xl border border-[var(--panel-border)] bg-white/70 px-4 py-2.5 text-sm"
              />
            </label>

            {error ? <p className="text-sm text-rose-600">{error}</p> : null}
            {success ? <p className="text-sm text-emerald-700">{success}</p> : null}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full rounded-xl bg-[var(--accent-solid)] px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
            >
              {loading ? 'Submitting...' : 'Submit Complaint'}
            </button>
          </form>
        </section>

        <section className="app-panel rounded-[var(--radius-panel)] p-6">
          <h3 className="text-lg font-bold text-[var(--text-primary)]">Operational Tips</h3>
          <div className="mt-4 space-y-3">
            {operationalTips.map((tip) => (
              <div key={tip} className="rounded-2xl border border-[var(--panel-border)] bg-[var(--panel-muted)] p-4 text-sm text-[var(--text-primary)]">
                {tip}
              </div>
            ))}
          </div>
          <div className="mt-6 rounded-2xl border border-[var(--panel-border)] bg-[var(--panel-muted)] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent-strong)]">AI Workflow</p>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">
              Submitted text is classified, clustered, and linked into admin dashboards automatically.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default SubmitComplaintPage;
