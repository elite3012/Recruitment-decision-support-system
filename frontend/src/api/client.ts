import axios from 'axios';

const api = axios.create({
  baseURL: '/api' // Proxied via Vite to localhost:8000
});

export const getDashboardSummary = async () => {
  const { data } = await api.get('/dashboard/summary');
  return data;
};

export const getJobs = async () => {
  const { data } = await api.get('/jobs');
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
    notes,
    recruiter_name: "Admin"
  });
  return data;
};

export const getJobDecisions = async (jobId: number) => {
  const { data } = await api.get(`/jobs/${jobId}/decisions`);
  return data;
};
