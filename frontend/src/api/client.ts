import axios from 'axios';

export const AUTH_TOKEN_KEY = 'recruit_dss_token';

const api = axios.create({
  baseURL: '/api' // Proxied via Vite to localhost:8000
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const login = async (username: string, password: string) => {
  const { data } = await api.post('/auth/login', { username, password });
  return data;
};

export const getMe = async () => {
  const { data } = await api.get('/auth/me');
  return data;
};

export const changePassword = async (currentPassword: string, newPassword: string) => {
  const { data } = await api.post('/auth/change-password', {
    current_password: currentPassword,
    new_password: newPassword,
  });
  return data;
};

export const getDashboardSummary = async () => {
  const { data } = await api.get('/dashboard/summary');
  return data;
};

export const getJobs = async () => {
  const { data } = await api.get('/jobs');
  return data;
};

export const createJob = async (payload: any) => {
  const { data } = await api.post('/jobs', payload);
  return data;
};

export const updateJob = async (jobId: number, payload: any) => {
  const { data } = await api.put(`/jobs/${jobId}`, payload);
  return data;
};

export const deleteJob = async (jobId: number) => {
  const { data } = await api.delete(`/jobs/${jobId}`);
  return data;
};

export const getCandidates = async () => {
  const { data } = await api.get('/candidates');
  return data;
};

export const createCandidate = async (payload: any) => {
  const { data } = await api.post('/candidates', payload);
  return data;
};

export const updateCandidate = async (candidateId: number, payload: any) => {
  const { data } = await api.put(`/candidates/${candidateId}`, payload);
  return data;
};

export const deleteCandidate = async (candidateId: number) => {
  const { data } = await api.delete(`/candidates/${candidateId}`);
  return data;
};

export const getJobRanking = async (jobId: number, topK: number = 10) => {
  const { data } = await api.get(`/jobs/${jobId}/ranking?top_k=${topK}`);
  return data;
};

export const getCandidateDetail = async (jobId: number, candidateId: number) => {
  const { data } = await api.get(`/jobs/${jobId}/candidates/${candidateId}`);
  return data;
};

export const saveCandidateDecision = async (jobId: number, candidateId: number, action: string, notes: string = "") => {
  const { data } = await api.post(`/jobs/${jobId}/candidates/${candidateId}/decisions`, {
    action,
    notes
  });
  return data;
};

export const saveBulkDecision = async (jobId: number, candidateIds: number[], action: string, notes: string = "") => {
  const { data } = await api.post(`/jobs/${jobId}/bulk-decisions`, {
    candidate_ids: candidateIds,
    action,
    notes
  });
  return data;
};

export const getJobDecisions = async (jobId: number) => {
  const { data } = await api.get(`/jobs/${jobId}/decisions`);
  return data;
};

export const getDecisions = async () => {
  const { data } = await api.get('/decisions');
  return data;
};

export const createDecision = async (payload: any) => {
  const { data } = await api.post('/decisions', payload);
  return data;
};

export const updateDecision = async (actionId: number, payload: any) => {
  const { data } = await api.put(`/decisions/${actionId}`, payload);
  return data;
};

export const deleteDecision = async (actionId: number) => {
  const { data } = await api.delete(`/decisions/${actionId}`);
  return data;
};
