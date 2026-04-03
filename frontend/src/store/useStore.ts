import { create } from 'zustand';

interface RecruiterState {
  selectedJobId: number | null;
  selectedCandidateId: number | null;
  setSelectedJobId: (id: number | null) => void;
  setSelectedCandidateId: (id: number | null) => void;
}

export const useRecruiterStore = create<RecruiterState>((set) => ({
  selectedJobId: null,
  selectedCandidateId: null,
  setSelectedJobId: (id) => set({ selectedJobId: id }),
  setSelectedCandidateId: (id) => set({ selectedCandidateId: id }),
}));
