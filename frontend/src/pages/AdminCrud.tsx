import React, { useCallback, useDeferredValue, useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Edit3, Plus, Search, Trash2, X } from 'lucide-react';
import {
  createCandidate,
  createJob,
  deleteCandidate,
  deleteJob,
  getCandidates,
  getJobs,
  updateCandidate,
  updateJob,
} from '../api/client';
import { useRecruiterStore } from '../store/useStore';

type CrudTab = 'jobs' | 'candidates';

type FieldConfig = {
  key: string;
  label: string;
  type?: 'text' | 'number' | 'textarea' | 'select';
  required?: boolean;
  disabledOnEdit?: boolean;
  options?: { label: string; value: string | number }[];
};

const emptyJob = {
  job_id: '',
  job_title: '',
  company_name: '',
  industry: '',
  location: '',
  years_of_experience: '',
  salary: '',
  job_type: '',
  career_level: '',
  job_requirements: '',
  job_description: '',
  benefits: '',
  job_address: '',
};

const emptyCandidate = {
  user_id: '',
  user_name: '',
  desired_job: '',
  industry: '',
  location: '',
  workplace_desired: '',
  work_experience: '',
  desired_salary: '',
  age: '',
  gender: '',
  marriage: '',
  degree: '',
  skills: '',
  target: '',
};

const tabLabels: Record<CrudTab, string> = {
  jobs: 'Jobs',
  candidates: 'Candidates',
};

const PAGE_SIZE = 75;

const toOptionalNumber = (value: unknown) => {
  if (value === '' || value === null || value === undefined) return undefined;
  const numeric = Number(value);
  return Number.isNaN(numeric) ? undefined : numeric;
};

const cleanPayload = (payload: Record<string, any>, numericKeys: string[] = []) => {
  return Object.fromEntries(
    Object.entries(payload)
      .map(([key, value]) => [key, numericKeys.includes(key) ? toOptionalNumber(value) : value])
      .filter(([, value]) => value !== undefined)
  );
};

const normalizeJobForForm = (job: any) => ({
  job_id: job.job_id ?? job.id ?? '',
  job_title: job.job_title ?? job.title ?? '',
  company_name: job.company_name ?? '',
  industry: job.industry ?? '',
  location: job.location ?? '',
  years_of_experience: job.years_of_experience ?? '',
  salary: job.salary ?? '',
  job_type: job.job_type ?? '',
  career_level: job.career_level ?? '',
  job_requirements: job.job_requirements ?? job.skills ?? '',
  job_description: job.job_description ?? job.description ?? '',
  benefits: job.benefits ?? '',
  job_address: job.job_address ?? '',
});

const normalizeCandidateForForm = (candidate: any) => ({
  user_id: candidate.user_id ?? candidate.candidate_id ?? candidate.id ?? '',
  user_name: candidate.user_name ?? candidate.name ?? '',
  desired_job: candidate.desired_job ?? candidate.title ?? '',
  industry: candidate.industry ?? '',
  location: candidate.location ?? '',
  workplace_desired: candidate.workplace_desired ?? '',
  work_experience: candidate.work_experience ?? candidate.experience ?? '',
  desired_salary: candidate.desired_salary ?? '',
  age: candidate.age ?? '',
  gender: candidate.gender ?? '',
  marriage: candidate.marriage ?? '',
  degree: candidate.degree ?? '',
  skills: candidate.skills ?? '',
  target: candidate.target ?? '',
});

const AdminCrud = () => {
  const queryClient = useQueryClient();
  const { selectedJobId, selectedCandidateId, setSelectedJobId, setSelectedCandidateId } = useRecruiterStore();

  const [activeTab, setActiveTab] = useState<CrudTab>('jobs');
  const [searchTerm, setSearchTerm] = useState('');
  const deferredSearchTerm = useDeferredValue(searchTerm);
  const [currentPage, setCurrentPage] = useState(1);
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [formState, setFormState] = useState<Record<string, any>>(emptyJob);
  const [feedback, setFeedback] = useState<string | null>(null);

  const jobsQuery = useQuery({ queryKey: ['adminJobs'], queryFn: getJobs });
  const candidatesQuery = useQuery({ queryKey: ['adminCandidates'], queryFn: getCandidates });

  const jobs = jobsQuery.data || [];
  const candidates = candidatesQuery.data || [];

  const activeData = activeTab === 'jobs' ? jobs : candidates;
  const isLoading = jobsQuery.isLoading || candidatesQuery.isLoading;
  const isError = jobsQuery.isError || candidatesQuery.isError;

  const fields: Record<CrudTab, FieldConfig[]> = {
    jobs: [
      { key: 'job_id', label: 'Job ID', type: 'number', disabledOnEdit: true },
      { key: 'job_title', label: 'Job Title', required: true },
      { key: 'company_name', label: 'Company' },
      { key: 'industry', label: 'Industry' },
      { key: 'location', label: 'Location' },
      { key: 'years_of_experience', label: 'Experience Required' },
      { key: 'salary', label: 'Salary' },
      { key: 'job_type', label: 'Job Type' },
      { key: 'career_level', label: 'Career Level' },
      { key: 'job_requirements', label: 'Required Skills', type: 'textarea', required: true },
      { key: 'job_description', label: 'Job Description', type: 'textarea' },
      { key: 'benefits', label: 'Benefits', type: 'textarea' },
      { key: 'job_address', label: 'Address' },
    ],
    candidates: [
      { key: 'user_id', label: 'Candidate ID', type: 'number', disabledOnEdit: true },
      { key: 'user_name', label: 'Full Name', required: true },
      { key: 'desired_job', label: 'Desired Job' },
      { key: 'industry', label: 'Industry' },
      { key: 'location', label: 'Location' },
      { key: 'workplace_desired', label: 'Desired Workplace' },
      { key: 'work_experience', label: 'Work Experience' },
      { key: 'desired_salary', label: 'Desired Salary' },
      { key: 'age', label: 'Age', type: 'number' },
      { key: 'gender', label: 'Gender' },
      { key: 'marriage', label: 'Marriage Status' },
      { key: 'degree', label: 'Degree' },
      { key: 'skills', label: 'Skills', type: 'textarea', required: true },
      { key: 'target', label: 'Career Target', type: 'textarea' },
    ],
  };

  const searchableData = useMemo(() => {
    return activeData.map((item: any) => ({
      item,
      searchText: Object.values(item)
        .map((value) => String(value ?? '').toLowerCase())
        .join(' '),
    }));
  }, [activeData]);

  const filteredData = useMemo(() => {
    const term = deferredSearchTerm.trim().toLowerCase();
    if (!term) return activeData;

    return searchableData
      .filter((entry: { item: any; searchText: string }) => entry.searchText.includes(term))
      .map((entry: { item: any; searchText: string }) => entry.item);
  }, [activeData, searchableData, deferredSearchTerm]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, deferredSearchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const pageStart = filteredData.length ? (safePage - 1) * PAGE_SIZE : 0;
  const paginatedData = useMemo(
    () => filteredData.slice(pageStart, pageStart + PAGE_SIZE),
    [filteredData, pageStart]
  );
  const isSearchPending = searchTerm !== deferredSearchTerm;

  const invalidateWorkflow = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['adminJobs'] }),
      queryClient.invalidateQueries({ queryKey: ['adminCandidates'] }),
      queryClient.invalidateQueries({ queryKey: ['jobs'] }),
      queryClient.invalidateQueries({ queryKey: ['dashboardSummary'] }),
      queryClient.invalidateQueries({ queryKey: ['jobRanking'] }),
      queryClient.invalidateQueries({ queryKey: ['jobDecisions'] }),
      queryClient.invalidateQueries({ queryKey: ['candidateDetail'] }),
    ]);
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (activeTab === 'jobs') {
        const payload = cleanPayload(formState, ['job_id']);
        return editingItem ? updateJob(editingItem.id, payload) : createJob(payload);
      }

      if (activeTab === 'candidates') {
        const payload = cleanPayload(formState, ['user_id', 'age']);
        return editingItem ? updateCandidate(editingItem.id, payload) : createCandidate(payload);
      }

      return null;
    },
    onSuccess: async () => {
      setFeedback(`${tabLabels[activeTab].slice(0, -1) || tabLabels[activeTab]} saved`);
      setDrawerOpen(false);
      setEditingItem(null);
      await invalidateWorkflow();
      window.setTimeout(() => setFeedback(null), 2500);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (item: any) => {
      if (activeTab === 'jobs') return deleteJob(item.id);
      return deleteCandidate(item.id);
    },
    onSuccess: async (_, item) => {
      if (activeTab === 'jobs' && selectedJobId === item.id) setSelectedJobId(null);
      if (activeTab === 'candidates' && selectedCandidateId === item.id) setSelectedCandidateId(null);
      setFeedback(`${tabLabels[activeTab].slice(0, -1) || tabLabels[activeTab]} deleted`);
      await invalidateWorkflow();
      window.setTimeout(() => setFeedback(null), 2500);
    },
  });
  const deleteItem = deleteMutation.mutate;

  const openCreate = () => {
    setEditingItem(null);
    setFormState(activeTab === 'jobs' ? emptyJob : emptyCandidate);
    setDrawerOpen(true);
  };

  const openEdit = useCallback((item: any) => {
    setEditingItem(item);
    setFormState(
      activeTab === 'jobs'
        ? normalizeJobForForm(item)
        : normalizeCandidateForForm(item)
    );
    setDrawerOpen(true);
  }, [activeTab]);

  const handleDelete = useCallback((item: any) => {
    const label =
      activeTab === 'jobs'
        ? item.title
        : item.name;
    if (window.confirm(`Delete ${label}? Related matches and decision records may be removed.`)) {
      deleteItem(item);
    }
  }, [activeTab, deleteItem]);

  const renderedRows = useMemo(() => {
    if (activeTab === 'jobs') {
      return paginatedData.map((job: any) => (
        <tr key={job.id} className="bg-neu-surface hover:shadow-neu-inner transition-all">
          <td className="px-5 py-4 font-black text-neu-primary font-mono">#{job.id}</td>
          <td className="px-5 py-4 font-black uppercase">{job.title || 'Untitled Job'}</td>
          <td className="px-5 py-4 text-neu-text/60">{job.company_name || '-'}</td>
          <td className="px-5 py-4 text-neu-text/60">{job.location || '-'}</td>
          <td className="px-5 py-4 text-neu-text/60 max-w-xs truncate" title={job.skills}>{job.skills || '-'}</td>
          <td className="px-5 py-4 text-right">
            <RowActions onEdit={() => openEdit(job)} onDelete={() => handleDelete(job)} />
          </td>
        </tr>
      ));
    }

    if (activeTab === 'candidates') {
      return paginatedData.map((candidate: any) => (
        <tr key={candidate.id} className="bg-neu-surface hover:shadow-neu-inner transition-all">
          <td className="px-5 py-4 font-black text-neu-primary font-mono">#{candidate.id}</td>
          <td className="px-5 py-4 font-black uppercase">{candidate.name || 'Unnamed Candidate'}</td>
          <td className="px-5 py-4 text-neu-text/60">{candidate.title || '-'}</td>
          <td className="px-5 py-4 text-neu-text/60">{candidate.location || '-'}</td>
          <td className="px-5 py-4 text-neu-text/60 max-w-xs truncate" title={candidate.skills}>{candidate.skills || '-'}</td>
          <td className="px-5 py-4 text-right">
            <RowActions onEdit={() => openEdit(candidate)} onDelete={() => handleDelete(candidate)} />
          </td>
        </tr>
      ));
    }

    return null;
  }, [activeTab, paginatedData, openEdit, handleDelete]);

  const submitForm = (event: React.FormEvent) => {
    event.preventDefault();
    saveMutation.mutate();
  };

  const renderField = (field: FieldConfig) => {
    const baseClass = "w-full bg-neu-surface shadow-neu-inner rounded-xl px-4 py-3 text-xs font-bold text-neu-text outline-none disabled:opacity-50";
    const disabled = Boolean(editingItem && field.disabledOnEdit);

    if (field.type === 'textarea') {
      return (
        <textarea
          value={formState[field.key] ?? ''}
          onChange={(event) => setFormState((current) => ({ ...current, [field.key]: event.target.value }))}
          className={`${baseClass} min-h-[110px] resize-y`}
          required={field.required}
          disabled={disabled}
        />
      );
    }

    if (field.type === 'select') {
      return (
        <select
          value={formState[field.key] ?? ''}
          onChange={(event) => setFormState((current) => ({ ...current, [field.key]: event.target.value }))}
          className={baseClass}
          required={field.required}
          disabled={disabled}
        >
          <option value="">Select...</option>
          {(field.options || []).map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      );
    }

    return (
      <input
        value={formState[field.key] ?? ''}
        onChange={(event) => setFormState((current) => ({ ...current, [field.key]: event.target.value }))}
        className={baseClass}
        type={field.type || 'text'}
        required={field.required}
        disabled={disabled}
      />
    );
  };

  const headers =
    activeTab === 'jobs'
      ? ['ID', 'Title', 'Company', 'Location', 'Skills', 'Actions']
      : ['ID', 'Name', 'Role', 'Location', 'Skills', 'Actions'];

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-neu-text uppercase">Data Management</h2>
          <p className="text-xs font-bold font-mono text-neu-text/40 uppercase tracking-widest mt-1">
            CRUD_CONTROL_PANEL
          </p>
        </div>
        {feedback && (
          <div className="bg-neu-surface shadow-neu-inner px-5 py-3 rounded-xl text-xs font-black text-neu-success uppercase tracking-widest">
            {feedback}
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 bg-neu-surface shadow-neu rounded-2xl p-4">
        <div className="flex gap-2">
          {(Object.keys(tabLabels) as CrudTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setSearchTerm('');
                setCurrentPage(1);
                setDrawerOpen(false);
              }}
              className={`px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                activeTab === tab ? 'bg-teal-600 text-white shadow-lg' : 'bg-neu-surface text-neu-text shadow-neu-sm'
              }`}
            >
              {tabLabels[tab]}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden xl:block text-[10px] font-black font-mono uppercase tracking-widest text-neu-text/40">
            {isSearchPending
              ? 'Filtering...'
              : `${filteredData.length.toLocaleString()} records`}
          </div>
          <div className="flex items-center gap-3 bg-neu-surface shadow-neu-inner rounded-xl px-4 py-3 min-w-[320px]">
            <Search className="w-4 h-4 text-neu-primary" />
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder={`Search ${tabLabels[activeTab].toLowerCase()}`}
              className="w-full bg-transparent outline-none text-xs font-bold text-neu-text placeholder:text-neu-text/30"
            />
          </div>
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 bg-teal-600 text-white shadow-lg hover:bg-teal-700 active:scale-95 transition-all rounded-xl px-5 py-3 text-[10px] font-black uppercase tracking-widest"
          >
            <Plus className="w-4 h-4" />
            New
          </button>
        </div>
      </div>

      <div className="bg-neu-surface shadow-neu rounded-2xl overflow-hidden flex-1 min-h-0">
        {isLoading ? (
          <div className="p-10 text-neu-text/50 font-bold animate-pulse">Loading data...</div>
        ) : isError ? (
          <div className="p-10 text-neu-danger font-bold">Failed to load CRUD data.</div>
        ) : (
          <div className="h-full flex flex-col">
            <div className="overflow-auto flex-1 min-h-0">
              <table className="w-full text-left text-sm">
                <thead className="sticky top-0 bg-neu-surface z-10 text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase font-mono shadow-sm">
                  <tr>
                    {headers.map((header) => (
                      <th key={header} className={`px-5 py-4 ${header === 'Actions' ? 'text-right' : ''}`}>
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>{renderedRows}</tbody>
              </table>
              {!filteredData.length && (
                <div className="p-12 text-center text-neu-text/40 font-bold">No records found.</div>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-300/60 px-5 py-3 bg-neu-surface">
              <div className="text-[10px] font-black font-mono uppercase tracking-widest text-neu-text/45">
                Showing {filteredData.length ? pageStart + 1 : 0}-{Math.min(pageStart + PAGE_SIZE, filteredData.length)} of {filteredData.length.toLocaleString()}
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentPage(Math.max(1, safePage - 1))}
                  disabled={safePage <= 1}
                  className="px-4 py-2 rounded-xl bg-neu-surface shadow-neu-sm disabled:opacity-40 text-[10px] font-black uppercase tracking-widest text-neu-text"
                >
                  Prev
                </button>
                <span className="min-w-24 text-center text-[10px] font-black font-mono uppercase tracking-widest text-neu-text/45">
                  Page {safePage} / {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setCurrentPage(Math.min(totalPages, safePage + 1))}
                  disabled={safePage >= totalPages}
                  className="px-4 py-2 rounded-xl bg-neu-surface shadow-neu-sm disabled:opacity-40 text-[10px] font-black uppercase tracking-widest text-neu-text"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/25 flex justify-end">
          <form onSubmit={submitForm} className="w-full max-w-xl h-full bg-neu-secondary shadow-2xl p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-black uppercase text-neu-text">
                  {editingItem ? 'Edit' : 'Create'} {tabLabels[activeTab].slice(0, -1)}
                </h3>
                <p className="text-[10px] font-black font-mono text-neu-text/40 uppercase tracking-widest">
                  {activeTab}_FORM
                </p>
              </div>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="w-10 h-10 rounded-xl bg-neu-surface shadow-neu-sm flex items-center justify-center text-neu-text"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {fields[activeTab].map((field) => (
                <label key={field.key} className={`${field.type === 'textarea' ? 'md:col-span-2' : ''} space-y-2`}>
                  <span className="block text-[10px] font-black uppercase tracking-widest text-neu-text/50 font-mono">
                    {field.label}{field.required ? ' *' : ''}
                  </span>
                  {renderField(field)}
                </label>
              ))}
            </div>

            <div className="flex gap-3 justify-end mt-8">
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="px-5 py-3 rounded-xl bg-neu-surface shadow-neu-sm text-[10px] font-black uppercase tracking-widest text-neu-text"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saveMutation.isPending}
                className="px-6 py-3 rounded-xl bg-teal-600 text-white shadow-lg hover:bg-teal-700 disabled:opacity-50 text-[10px] font-black uppercase tracking-widest"
              >
                {saveMutation.isPending ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

const RowActions = ({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) => (
  <div className="flex items-center justify-end gap-2">
    <button
      onClick={onEdit}
      className="w-9 h-9 inline-flex items-center justify-center rounded-xl bg-neu-surface shadow-neu-sm text-neu-primary hover:bg-teal-600 hover:text-white transition-all"
      title="Edit"
    >
      <Edit3 className="w-4 h-4" />
    </button>
    <button
      onClick={onDelete}
      className="w-9 h-9 inline-flex items-center justify-center rounded-xl bg-neu-surface shadow-neu-sm text-neu-danger hover:bg-neu-danger hover:text-white transition-all"
      title="Delete"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  </div>
);

export default AdminCrud;
